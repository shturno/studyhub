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

    const tracks = []
    const availableLessons = []

    for (const contest of contests) {
        for (const subject of contest.subjects) {
            const trackLessons = subject.topics.map(topic => ({
                id: topic.id,
                title: topic.name,
                trackName: subject.name,
                trackId: subject.id,
                status: "NOT_STARTED" as const, // TODO: Check study sessions to determine status
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

    // TODO: Implement PlannedSessions persistence
    const plannedSessions: any[] = []

    return {
        tracks,
        availableLessons,
        plannedSessions
    }
}
