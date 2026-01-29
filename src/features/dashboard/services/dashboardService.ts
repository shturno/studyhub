import { prisma } from '@/lib/prisma'

export interface DashboardData {
    user: {
        id: string
        name: string | null
        email: string | null
        level: number
        xp: number
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
 * Service para buscar dados do dashboard
 */
export async function getDashboardData(): Promise<DashboardData> {
    // Buscar usuário com sessões recentes
    const user = await prisma.user.findFirst({
        select: {
            id: true,
            name: true,
            email: true,
            level: true,
            xp: true,
            studySessions: {
                orderBy: { completedAt: 'desc' },
                take: 5,
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

    if (!user) {
        return {
            user: null,
            randomTopic: null,
            recentSessions: [],
            streak: 0
        }
    }

    // Buscar tópico aleatório
    const randomTopic = await prisma.topic.findFirst({
        where: { subject: { contest: { userId: user.id } } },
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

    // Calcular streak (TODO: implementar lógica real)
    const streak = await calculateStreak(user.id)

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            level: user.level,
            xp: user.xp
        },
        randomTopic,
        recentSessions: user.studySessions,
        streak
    }
}

/**
 * Calcula o streak de dias consecutivos de estudo
 * TODO: Implementar lógica real baseada em studySessions
 */
async function calculateStreak(userId: string): Promise<number> {
    // Por enquanto retorna valor fixo
    // TODO: Implementar lógica real que conta dias consecutivos
    return 12
}
