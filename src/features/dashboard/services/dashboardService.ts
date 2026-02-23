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

/**
 * Busca todos os dados necessários para o dashboard
 */


/**
 * Busca todos os dados necessários para o dashboard
 */
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

    // Filter random topic by contest - FIXED: added id selection to subject
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
 */
function calculateStreak(sessions: Array<{ completedAt: Date }>): number {
    if (sessions.length === 0) return 0

    // Ordenar sessões da mais recente para a mais antiga (garantir)
    const sortedSessions = [...sessions].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())

    let streak = 0
    const currentDay = new Date()

    // Verificar se estudou hoje (senão o streak pode ser 0 ou manter o de ontem)
    // Se a última sessão foi hoje, começa a contar. Se foi ontem, também conta.
    // Se foi antes de ontem, o streak quebrou.

    const lastSessionDate = sortedSessions[0].completedAt
    const daysSinceLastSession = differenceInCalendarDays(currentDay, lastSessionDate)

    if (daysSinceLastSession > 1) {
        return 0 // Streak quebrou
    }

    // Usar um Set para garantir dias únicos
    const uniqueDays = new Set<string>()
    sortedSessions.forEach(s => {
        uniqueDays.add(s.completedAt.toISOString().split('T')[0])
    })

    const daysList = Array.from(uniqueDays).sort((a, b) => b.localeCompare(a)) // ['2023-10-05', '2023-10-04'...]

    // Validar consecutividade a partir do dia mais recente
    // Se o dia mais recente não for hoje nem ontem, já retornamos 0 acima.

    let previousDate = new Date(daysList[0])
    streak = 1 // Contamos o primeiro dia da lista (que é hoje ou ontem)

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
