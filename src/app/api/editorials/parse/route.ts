import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePdfWithGemini } from '@/features/ai/services/editalParserService'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const contestId = formData.get('contestId') as string | null

    if (!file || !contestId) {
      return NextResponse.json(
        { error: 'File and contestId are required' },
        { status: 400 }
      )
    }

    // Verify ownership of contest
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    })

    if (!contest || contest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    const buffer = await file.arrayBuffer()
    const base64Data = Buffer.from(buffer).toString('base64')
    const mimeType = file.type || 'application/pdf'

    // 1. Ask Gemini to extract Subjects and Topics from PDF
    const parsedData = await parsePdfWithGemini(base64Data, mimeType)

    // 2. Wrap everything in a Prisma transaction to maintain data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 2a. Create the EditorialItem
      const editorial = await tx.editorialItem.create({
        data: {
          userId: session.user.id,
          contestId: contestId,
          title: parsedData.title || `Edital Extraído (${file.name})`,
          description: "Mapeamento automático via Inteligência Artificial.",
        },
      })

      // 2b. Insert Subjects, Topics and ContentMappings
      for (const parsedSubject of parsedData.subjects) {
        // Find existing subject in this contest, or create a new one
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
        }

        for (const parsedTopic of parsedSubject.topics) {
          // Find or create topic
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
          }

          // Create mapping link for the Alchemist feature
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
      timeout: 30000 // Give the transaction plenty of time for large insert batches
    })

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
