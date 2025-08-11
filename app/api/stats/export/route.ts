import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { mockDb } from "@/lib/mock-db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all study logs for the user
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Generate CSV content
    const csvHeader = "Data,Trilha,Lição,Minutos,Horas\n"
    const csvRows = enrichedStudyLogs
      .map((log) => {
        const date = new Date(log.createdAt).toLocaleDateString("pt-BR")
        const track = log.lesson.track?.name || "Unknown"
        const lesson = log.lesson.title || "Unknown"
        const minutes = log.minutes
        const hours = (minutes / 60).toFixed(2)

        return `"${date}","${track}","${lesson}",${minutes},${hours}`
      })
      .join("\n")

    const csvContent = csvHeader + csvRows

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="study-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
