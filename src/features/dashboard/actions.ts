'use server'

import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function getDashboardData(userId: string) {
    // Get user with XP and level
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            xp: true,
            level: true
        }
    })

    if (!user) {
        throw new Error('User not found')
    }

    // Get active study cycle
    const activeCycle = await prisma.studyCycle.findFirst({
        where: {
            userId,
            isActive: true
        }
    })

    // Get next topic from cycle
    let nextTopic = null
    if (activeCycle) {
        const config = activeCycle.config as { topicIds: string[] }
        const topicIds = config.topicIds || []

        if (topicIds.length > 0) {
            // Get first topic (in a real implementation, track progress)
            const topic = await prisma.topic.findUnique({
                where: { id: topicIds[0] },
                include: {
                    subject: {
                        select: {
                            name: true
                        }
                    }
                }
            })

            if (topic) {
                nextTopic = {
                    id: topic.id,
                    name: topic.name,
                    subjectName: topic.subject.name,
                    estimatedMinutes: 25 // Default Pomodoro
                }
            }
        }
    }

    // Get weekly stats
    const weekStart = startOfWeek(new Date())
    const weekEnd = endOfWeek(new Date())

    const weeklySessions = await prisma.studySession.findMany({
        where: {
            userId,
            completedAt: {
                gte: weekStart,
                lte: weekEnd
            }
        }
    })

    const weeklyStats = {
        minutesStudied: weeklySessions.reduce((sum: number, s) => sum + s.minutes, 0),
        sessionsCompleted: weeklySessions.length,
        xpEarned: weeklySessions.reduce((sum: number, s) => sum + s.xpEarned, 0)
    }

    // Get recent sessions
    const recentSessions = await prisma.studySession.findMany({
        where: { userId },
        take: 5,
        orderBy: { completedAt: 'desc' },
        include: {
            topic: {
                select: {
                    name: true
                }
            }
        }
    })

    return {
        user,
        nextTopic,
        weeklyStats,
        recentSessions: recentSessions.map(s => ({
            id: s.id,
            topicName: s.topic.name,
            minutes: s.minutes,
            xpEarned: s.xpEarned,
            completedAt: s.completedAt
        }))
    }
}
