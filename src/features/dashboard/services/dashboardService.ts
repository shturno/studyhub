import { prisma } from '@/lib/prisma'

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

/**
 * Busca todos os dados necessários para o dashboard
 */
export async function getDashboardData(userId: string, contestId?: string): Promise<DashboardData> {
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
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    // Filter random topic by contest
    const randomTopic = await prisma.topic.findFirst({
        where: contestId ? {
            subject: {
                contestId
            }
        } : undefined,
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

/**
 * Calcula dias consecutivos de estudo
 * TODO: Implementar lógica real baseada em datas
 */
function calculateStreak(sessions: Array<{ completedAt: Date }>): number {
    // MVP: retorna valor fixo
    // V2: implementar lógica real verificando datas consecutivas
    return 12
}
