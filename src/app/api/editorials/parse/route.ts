import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePdfWithGemini } from '@/features/ai/services/editalParserService'
import * as pdfjsLib from 'pdfjs-dist'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const fileUrl = formData.get('fileUrl') as string | null
    const fileName = formData.get('fileName') as string | null
    const contestId = formData.get('contestId') as string | null

    if (!fileUrl || !contestId) {
      return NextResponse.json(
        { error: 'fileUrl and contestId are required' },
        { status: 400 }
      )
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    })

    if (contest?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
        throw new Error('Falha ao obter o arquivo da Vercel Blob.')
    }
    const arrayBuffer = await fileResponse.arrayBuffer()

    // Extrair texto do PDF usando pdfjs-dist
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let pdfText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      pdfText += textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str
          }
          return ''
        })
        .join(' ') + '\n'
    }

    const parsedData = await parsePdfWithGemini(pdfText)

    const result = await prisma.$transaction(async (tx) => {
      const editorial = await tx.editorialItem.create({
        data: {
          userId: session.user.id,
          contestId: contestId,
          title: parsedData.title || `Edital Extraído (${fileName || 'document'})`,
          description: "Mapeamento automático via Inteligência Artificial.",
        },
      })

      for (const parsedSubject of parsedData.subjects) {
        let subject = await tx.subject.findFirst({
          where: { contestId, name: parsedSubject.name },
        })

        subject ??= await tx.subject.create({
          data: {
            contestId,
            name: parsedSubject.name,
            weight: 1,
          },
        })

        for (const parsedTopic of parsedSubject.topics) {
          let topic = await tx.topic.findFirst({
            where: { subjectId: subject.id, name: parsedTopic.name },
          })

          topic ??= await tx.topic.create({
            data: {
              subjectId: subject.id,
              name: parsedTopic.name,
            },
          })

          await tx.contentMapping.create({
            data: {
              editorialItemId: editorial.id,
              topicId: topic.id,
              contentSummary: "Mapeamento automático extraído do fluxo AI.",
              relevance: 50,
            },
          })
        }
      }

      return editorial
    }, {
      timeout: 30000
    })

    // Invalidar cache da página de detalhes do concurso
    revalidatePath(`/[locale]/(authenticated)/contests/[slug]`)
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      editorialId: result.id,
      title: parsedData.title,
    })
  } catch (error) {
    console.error('Error in /api/editorials/parse:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to parse edital',
      },
      { status: 500 }
    )
  }
}
