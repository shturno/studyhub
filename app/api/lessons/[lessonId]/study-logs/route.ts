import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mockDb } from "@/lib/mock-db"

export async function POST(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { minutes } = await request.json()

    if (!minutes || minutes <= 0) {
      return NextResponse.json({ error: "Minutes must be greater than 0" }, { status: 400 })
    }

    const lesson = mockDb.findLessonById(params.lessonId)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const track = mockDb.findTrackById(lesson.trackId, session.user.id)
    if (!track) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const studyLog = mockDb.createStudyLog({
      minutes,
      lessonId: params.lessonId,
    })

    if (lesson.status === "NOT_STARTED") {
      mockDb.updateLesson(params.lessonId, { status: "IN_PROGRESS" })
    }

    return NextResponse.json(studyLog)
  } catch (error) {
    console.error("Error creating study log:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
