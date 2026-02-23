import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { differenceInCalendarDays } from 'date-fns'

export interface DashboardData {
    user: {
        id: string
        name: string | null
        email: string
        xp: number
        level: number
    } | null
    randomTopic: {
        id: string
        name: string
        subject: {
            id: string
            name: string
        }
    } | null
    recentSessions: Array<{
        id: string
        xpEarned: number
        completedAt: Date
        topic: {
            name: string
            subject: {
                name: string
            }
        }
    }>
    streak: number
}

export async function getDashboardData(contestId?: string): Promise<DashboardData> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    const userId = session.user.id

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            xp: true,
            level: true,
            studySessions: {
                orderBy: { completedAt: 'desc' },
                take: 5,
                where: contestId ? {
                    topic: {
                        subject: {
                            contestId
                        }
                    }
                } : undefined,
                select: {
                    id: true,
                    xpEarned: true,
                    completedAt: true,
                    topic: {
                        select: {
                            name: true,
                            subject: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    const randomTopic = await prisma.topic.findFirst({
        where: contestId ? {
            subject: {
                contestId
            }
        } : {
            subject: {
                contest: {
                    userId
                }
            }
        },
        select: {
            id: true,
            name: true,
            subject: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    const streak = calculateStreak(user?.studySessions || [])

    return {
        user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            xp: user.xp,
            level: user.level
        } : null,
        randomTopic,
        recentSessions: user?.studySessions || [],
        streak
    }
}

function calculateStreak(sessions: Array<{ completedAt: Date }>): number {
    if (sessions.length === 0) return 0

    const sortedSessions = [...sessions].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())

    let streak = 0
    const currentDay = new Date()

    const lastSessionDate = sortedSessions[0].completedAt
    const daysSinceLastSession = differenceInCalendarDays(currentDay, lastSessionDate)

    if (daysSinceLastSession > 1) {
        return 0
    }

    const uniqueDays = new Set<string>()
    sortedSessions.forEach(s => {
        uniqueDays.add(s.completedAt.toISOString().split('T')[0])
    })

    const daysList = Array.from(uniqueDays).sort((a, b) => b.localeCompare(a))

    let previousDate = new Date(daysList[0])
    streak = 1

    for (let i = 1; i < daysList.length; i++) {
        const date = new Date(daysList[i])
        const diff = differenceInCalendarDays(previousDate, date)

        if (diff === 1) {
            streak++
            previousDate = date
        } else {
            break
        }
    }

    return streak
}
