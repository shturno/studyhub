import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePdfWithGemini } from '@/features/ai/services/editalParserService'
import { extractSyllabusContent } from '@/features/ai/services/textPreprocessor'

export const maxDuration = 60

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log(`[PDF Extract] Starting text extraction from buffer (${(arrayBuffer.byteLength / 1024).toFixed(2)} KB)`)
  const { extractText } = await import('unpdf')
  const result = await extractText(new Uint8Array(arrayBuffer))
  const extractedText = result.text.join('\n')
  console.log(`[PDF Extract] Successfully extracted text: ${extractedText.length} characters from ${result.totalPages} pages`)
  return extractedText
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Editorial Parse] Iniciando processamento de edital')

    const session = await auth()
    if (!session?.user?.id) {
      console.warn('[Editorial Parse] Requisição não autenticada')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log(`[Editorial Parse] User ID: ${session.user.id}`)

    const formData = await request.formData()
    const fileUrl = formData.get('fileUrl') as string | null
    const fileName = formData.get('fileName') as string | null
    const contestId = formData.get('contestId') as string | null

    console.log(`[Editorial Parse] fileName: ${fileName}, contestId: ${contestId}`)

    if (!fileUrl || !contestId) {
      console.error('[Editorial Parse] Parâmetros obrigatórios faltando')
      return NextResponse.json(
        { error: 'fileUrl and contestId are required' },
        { status: 400 }
      )
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    })

    if (contest?.userId !== session.user.id) {
      console.warn(`[Editorial Parse] Acesso negado ao concurso ${contestId}`)
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }
    console.log(`[Editorial Parse] Contest encontrado: ${contest.name}`)

    console.log(`[Editorial Parse] Buscando arquivo da URL`)
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
        throw new Error(`Falha ao obter arquivo: status ${fileResponse.status}`)
    }
    const arrayBuffer = await fileResponse.arrayBuffer()
    const fileSizeKB = arrayBuffer.byteLength / 1024
    console.log(`[Editorial Parse] Arquivo obtido com sucesso: ${fileSizeKB.toFixed(2)} KB`)

    // Validar tamanho do arquivo (limite: 50MB)
    const MAX_FILE_SIZE_MB = 50
    if (fileSizeKB > MAX_FILE_SIZE_MB * 1024) {
      console.warn(`[Editorial Parse] Arquivo excede limite: ${fileSizeKB.toFixed(2)} KB > ${MAX_FILE_SIZE_MB * 1024} KB`)
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB` },
        { status: 413 }
      )
    }

    // Extrair texto do PDF usando unpdf
    const pdfText = await extractPdfText(arrayBuffer)

    // Preprocessar texto: extrair apenas conteúdo do edital relevante
    console.log('[Editorial Parse] Iniciando preprocessamento de texto')
    const preprocessed = await extractSyllabusContent(pdfText)
    const cleanedText = preprocessed.content

    if (preprocessed.wasFiltered) {
      console.log(
        `[Editorial Parse] ✓ Texto filtrado: ${preprocessed.originalSize} → ${preprocessed.filteredSize} bytes (${preprocessed.reductionPercentage.toFixed(1)}% redução)`
      )
    } else {
      console.log('[Editorial Parse] ⚠ Preprocessamento: nenhum marcador encontrado, usando texto completo')
    }

    // Validar tamanho do texto extraído após filtragem (Gemini 1.5 Flash: ~1M tokens, estimando ~4 chars = 1 token)
    const MAX_TEXT_SIZE_KB = 500
    let textForGemini = cleanedText
    const textSizeKB = cleanedText.length / 1024

    if (textSizeKB > MAX_TEXT_SIZE_KB) {
      // Tentar truncar para manter a primeira parte (onde o conteúdo programático geralmente está)
      textForGemini = cleanedText.substring(0, MAX_TEXT_SIZE_KB * 1024)
      console.warn(
        `[Editorial Parse] Texto excede limite (${textSizeKB.toFixed(2)} KB), truncando para ${(textForGemini.length / 1024).toFixed(2)} KB`
      )
    }

    console.log(`[Editorial Parse] Enviando texto para Gemini para parsing (${(textForGemini.length / 1024).toFixed(2)} KB)`)
    const parsedData = await parsePdfWithGemini(textForGemini)
    console.log(`[Editorial Parse] Gemini parsing completo: ${parsedData.subjects.length} subjects encontrados`)

    console.log(`[Editorial Parse] Iniciando transação de banco de dados`)
    const result = await prisma.$transaction(async (tx) => {
      const editorial = await tx.editorialItem.create({
        data: {
          userId: session.user.id,
          contestId: contestId,
          title: parsedData.title || `Edital Extraído (${fileName || 'document'})`,
          description: "Mapeamento automático via Inteligência Artificial.",
        },
      })
      console.log(`[Editorial Parse] EditorialItem criado: ${editorial.id}`)

      let totalTopicsCreated = 0
      for (const parsedSubject of parsedData.subjects) {
        let subject = await tx.subject.findFirst({
          where: { contestId, name: parsedSubject.name },
        })

        if (!subject) {
          subject = await tx.subject.create({
            data: {
              contestId,
              name: parsedSubject.name,
              weight: 1,
            },
          })
          console.log(`[Editorial Parse] Subject criado: ${subject.name}`)
        } else {
          console.log(`[Editorial Parse] Subject encontrado: ${subject.name}`)
        }

        for (const parsedTopic of parsedSubject.topics) {
          let topic = await tx.topic.findFirst({
            where: { subjectId: subject.id, name: parsedTopic.name },
          })

          if (!topic) {
            topic = await tx.topic.create({
              data: {
                subjectId: subject.id,
                name: parsedTopic.name,
              },
            })
            console.log(`[Editorial Parse] Topic criado: ${parsedTopic.name}`)
          } else {
            console.log(`[Editorial Parse] Topic encontrado: ${parsedTopic.name}`)
          }

          await tx.contentMapping.create({
            data: {
              editorialItemId: editorial.id,
              topicId: topic.id,
              contentSummary: "Mapeamento automático extraído do fluxo AI.",
              relevance: 50,
            },
          })
          totalTopicsCreated++
        }
      }
      console.log(`[Editorial Parse] Transação concluída: ${totalTopicsCreated} topics processados`)

      return editorial
    }, {
      timeout: 30000
    })

    // Invalidar cache da página de detalhes do concurso
    console.log(`[Editorial Parse] Invalidando cache`)
    revalidatePath(`/[locale]/(authenticated)/contests/[slug]`)
    revalidatePath('/')

    console.log(`[Editorial Parse] ✅ Sucesso! Editorial ID: ${result.id}`)
    return NextResponse.json({
      success: true,
      editorialId: result.id,
      title: parsedData.title,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse edital'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'

    console.error('[Editorial Parse] ❌ ERRO:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
