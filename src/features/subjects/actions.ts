'use server'

import { prisma } from '@/lib/prisma'
import { SubjectStats, TopicWithStatus } from './types'

export async function getUserSubjects(): Promise<SubjectStats[]> {
    // MVP: Get first contest found (assuming user has one)
    // V2: Filter by active contest
    const contest = await prisma.contest.findFirst({
        include: {
            subjects: {
                include: {
                    topics: {
                        include: {
                            studySessions: true
                        }
                    }
                }
            }
        }
    })

    if (!contest) return []

    return contest.subjects.map(subject => {
        const totalTopics = subject.topics.length

        // Count topics that have at least one study session
        const completedTopics = subject.topics.filter(t => t.studySessions.length > 0).length

        const totalMinutes = subject.topics.reduce((acc, t) => {
            return acc + t.studySessions.reduce((sAcc, s) => sAcc + s.minutes, 0)
        }, 0)

        const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

        return {
            id: subject.id,
            name: subject.name,
            topicsCount: totalTopics,
            completedTopics,
            progress,
            totalMinutesStudied: totalMinutes
        }
    })
}

export async function getSubjectDetails(subjectId: string): Promise<{ subjectName: string, topics: TopicWithStatus[] } | null> {
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
            topics: {
                include: {
                    studySessions: {
                        orderBy: { completedAt: 'desc' },
                        take: 1
                    }
                }
            }
        }
    })

    if (!subject) return null

    const topics: TopicWithStatus[] = subject.topics.map(topic => {
        const hasStudied = topic.studySessions.length > 0
        // Simple logic for mastery: > 60 mins studied (refine later)
        const totalMinutes = topic.studySessions.reduce((acc, s) => acc + s.minutes, 0)
        const isMastered = totalMinutes > 60

        let status: 'pending' | 'studied' | 'mastered' = 'pending'
        if (isMastered) status = 'mastered'
        else if (hasStudied) status = 'studied'

        return {
            id: topic.id,
            name: topic.name,
            status,
            lastStudiedAt: topic.studySessions[0]?.completedAt,
            xpEarned: topic.studySessions.reduce((acc, s) => acc + s.xpEarned, 0),
            parentId: topic.parentId
        }
    })

    return {
        subjectName: subject.name,
        topics
    }
}
