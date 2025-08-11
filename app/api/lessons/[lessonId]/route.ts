import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mockDb } from "@/lib/mock-db"

export async function PUT(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, externalUrl, estimated, status } = await request.json()

    const lesson = mockDb.findLessonById(params.lessonId)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const track = mockDb.findTrackById(lesson.trackId, session.user.id)
    if (!track) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const success = mockDb.updateLesson(params.lessonId, {
      title,
      description,
      externalUrl,
      estimated: estimated ? Number.parseInt(estimated) : null,
      status,
    })

    if (!success) {
      return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
    }

    const updatedLesson = mockDb.findLessonById(params.lessonId)
    return NextResponse.json(updatedLesson)
  } catch (error) {
    console.error("Error updating lesson:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lesson = mockDb.findLessonById(params.lessonId)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const track = mockDb.findTrackById(lesson.trackId, session.user.id)
    if (!track) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const success = mockDb.deleteLesson(params.lessonId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
    }

    return NextResponse.json({ message: "Lesson deleted successfully" })
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
