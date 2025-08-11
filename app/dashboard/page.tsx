import { redirect } from "next/navigation"
import { getCustomSession } from "@/lib/auth-helpers"
import { mockDb } from "@/lib/mock-db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardContent } from "@/components/dashboard-content"

async function getDashboardData(userId: string) {
  const tracks = mockDb.getTracksWithLessonsAndLogs(userId)

  const allStudyLogs = mockDb.findStudyLogsByUserId(userId)
  const recentLogs = allStudyLogs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const totalMinutes = allStudyLogs.reduce((sum, log) => sum + log.minutes, 0)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyMinutes = allStudyLogs
    .filter((log) => new Date(log.createdAt) >= weekAgo)
    .reduce((sum, log) => sum + log.minutes, 0)

  const nextLessons = tracks
    .flatMap((track) =>
      track.lessons
        .filter((lesson) => lesson.status !== "DONE")
        .map((lesson) => ({
          ...lesson,
          trackName: track.name,
          trackId: track.id,
        })),
    )
    .slice(0, 5)

  const trackTimeDistribution = tracks
    .map((track) => {
      const trackMinutes = track.lessons.reduce(
        (sum, lesson) => sum + lesson.studyLogs.reduce((logSum, log) => logSum + log.minutes, 0),
        0,
      )
      return {
        name: track.name,
        value: trackMinutes,
        id: track.id,
      }
    })
    .filter((track) => track.value > 0)

  return {
    tracks,
    totalMinutes,
    weeklyMinutes,
    nextLessons,
    recentLogs,
    trackTimeDistribution,
  }
}

export default async function DashboardPage() {
  const session = await getCustomSession()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const data = await getDashboardData(session.user.id)

  return (
    <DashboardLayout>
      <DashboardContent data={data} />
    </DashboardLayout>
  )
}
