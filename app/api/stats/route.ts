import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { mockDb } from "@/lib/mock-db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studyLogs = mockDb.findStudyLogsByUserId(user.id)
    const tracks = mockDb.findTracksByUserId(user.id)
    const lessons = mockDb.getTable<any>("lessons")

    // Enrich study logs with lesson and track data
    const enrichedStudyLogs = studyLogs
      .map((log) => {
        const lesson = lessons.find((l: any) => l.id === log.lessonId)
        const track = tracks.find((t) => t.id === lesson?.trackId)
        return {
          ...log,
          lesson: {
            ...lesson,
            track,
          },
        }
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    // Calculate weekly stats (last 12 weeks)
    const weeklyStats = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7 - now.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekLogs = enrichedStudyLogs.filter(
        (log) => new Date(log.createdAt) >= weekStart && new Date(log.createdAt) <= weekEnd,
      )

      const totalMinutes = weekLogs.reduce((sum, log) => sum + log.minutes, 0)
      const hours = Math.round((totalMinutes / 60) * 10) / 10 // Round to 1 decimal

      weeklyStats.push({
        week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        hours,
        minutes: totalMinutes,
      })
    }

    // Calculate track distribution
    const trackStats = new Map<string, { name: string; minutes: number; hours: number }>()

    enrichedStudyLogs.forEach((log) => {
      const trackName = log.lesson.track?.name || "Unknown"
      const existing = trackStats.get(trackName) || { name: trackName, minutes: 0, hours: 0 }
      existing.minutes += log.minutes
      existing.hours = Math.round((existing.minutes / 60) * 10) / 10
      trackStats.set(trackName, existing)
    })

    const trackDistribution = Array.from(trackStats.values()).sort((a, b) => b.minutes - a.minutes)

    // Calculate overall stats
    const totalMinutes = enrichedStudyLogs.reduce((sum, log) => sum + log.minutes, 0)
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10
    const totalSessions = enrichedStudyLogs.length

    // Get current week stats
    const currentWeekStart = new Date(now)
    currentWeekStart.setDate(now.getDate() - now.getDay())
    currentWeekStart.setHours(0, 0, 0, 0)

    const currentWeekLogs = enrichedStudyLogs.filter((log) => new Date(log.createdAt) >= currentWeekStart)
    const currentWeekMinutes = currentWeekLogs.reduce((sum, log) => sum + log.minutes, 0)
    const currentWeekHours = Math.round((currentWeekMinutes / 60) * 10) / 10

    return NextResponse.json({
      weeklyStats,
      trackDistribution,
      totalHours,
      totalMinutes,
      totalSessions,
      currentWeekHours,
      currentWeekMinutes,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
