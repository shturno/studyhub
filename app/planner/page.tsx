import { redirect } from "next/navigation"
import { getCustomSession } from "@/lib/auth-helpers"
import { mockDb } from "@/lib/mock-db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PlannerContent } from "@/components/planner-content"

async function getPlannerData(userId: string) {
  const tracks = mockDb.getTracksWithLessonsAndLogs(userId)

  // Get available lessons (not completed)
  const availableLessons = tracks.flatMap((track) =>
    track.lessons
      .filter((lesson) => lesson.status !== "DONE")
      .map((lesson) => ({
        ...lesson,
        trackName: track.name,
        trackId: track.id,
      })),
  )

  // Mock planned sessions (in a real app, these would come from the database)
  const plannedSessions = [
    {
      id: "session-1",
      lessonId: "lesson-1",
      lessonTitle: "Introdução ao Spring Boot",
      trackName: "Java & Spring Boot",
      duration: 25,
      scheduledDate: new Date().toISOString().split("T")[0],
      draft: true,
    },
  ]

  return {
    tracks,
    availableLessons,
    plannedSessions,
  }
}

export default async function PlannerPage() {
  const session = await getCustomSession()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const data = await getPlannerData(session.user.id)

  return (
    <DashboardLayout>
      <PlannerContent data={data} />
    </DashboardLayout>
  )
}
