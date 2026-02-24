import { prisma } from '@/lib/prisma'

export interface StudySessionData {
    topicId: string
    userId: string
    minutes: number
    difficulty?: number
}

export async function createStudySession(data: StudySessionData) {
    const { topicId, userId, minutes, difficulty } = data

    const xpEarned = Math.floor(minutes * 2)

    const session = await prisma.studySession.create({
        data: {
            topicId,
            userId,
            minutes,
            xpEarned,
            difficulty,
            completedAt: new Date()
        },
        include: {
            topic: {
                include: {
                    subject: true
                }
            }
        }
    })

    return session
}

export async function getRecentSessions(userId: string, limit: number = 10) {
    return prisma.studySession.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: limit,
        include: {
            topic: {
                include: {
                    subject: true
                }
            }
        }
    })
}

export async function getTotalStudyTime(userId: string): Promise<number> {
    const result = await prisma.studySession.aggregate({
        where: { userId },
        _sum: {
            minutes: true
        }
    })

    return result._sum?.minutes || 0
}
