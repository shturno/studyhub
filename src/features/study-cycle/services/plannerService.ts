import { prisma } from "@/lib/prisma"

export interface PlannerData {
    tracks: Array<{
        id: string
        name: string
        lessons: Array<{
            id: string
            title: string
            trackName: string
            trackId: string
            status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
            estimated: number | null
        }>
    }>
    availableLessons: Array<{
        id: string
        title: string
        trackName: string
        trackId: string
        status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
        estimated: number | null
    }>
    plannedSessions: Array<{
        id: string
        lessonId: string
        lessonTitle: string
        trackName: string
        duration: number
        scheduledDate: string
        draft: boolean
    }>
}

import { auth } from "@/lib/auth"

export async function getPlannerData(): Promise<PlannerData> {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    const userId = session.user.id

    const contests = await prisma.contest.findMany({
        where: { userId },
        include: {
            subjects: {
                include: {
                    topics: true
                }
            }
        }
    })

    const [plannedSessionsDb, studySessions] = await Promise.all([
        prisma.plannedSession.findMany({
            where: { userId },
            include: { topic: { include: { subject: true } } }
        }),
        prisma.studySession.findMany({
            where: { userId },
            select: { topicId: true }
        })
    ])

    const completedTopicIds = new Set(studySessions.map(s => s.topicId))

    const tracks = []
    const availableLessons = []

    for (const contest of contests) {
        for (const subject of contest.subjects) {
            const trackLessons = subject.topics.map(topic => ({
                id: topic.id,
                title: topic.name,
                trackName: subject.name,
                trackId: subject.id,
                status: completedTopicIds.has(topic.id) ? "DONE" as const : "NOT_STARTED" as const,
                estimated: 30 // Default estimate
            }))

            tracks.push({
                id: subject.id,
                name: subject.name,
                lessons: trackLessons
            })

            availableLessons.push(...trackLessons)
        }
    }

    const plannedSessions = plannedSessionsDb.map(session => ({
        id: session.id,
        lessonId: session.topicId,
        lessonTitle: session.topic.name,
        trackName: session.topic.subject.name,
        duration: session.durationMinutes,
        scheduledDate: session.scheduledDate.toISOString().split('T')[0],
        draft: false
    }))

    return {
        tracks,
        availableLessons,
        plannedSessions
    }
}
