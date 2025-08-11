import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mockDb } from "@/lib/mock-db"

export async function POST(request: NextRequest, { params }: { params: { trackId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, externalUrl, estimated } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Verify track ownership
    const track = mockDb.findTrackById(params.trackId, session.user.id)

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    const lesson = mockDb.createLesson({
      title,
      description,
      externalUrl,
      estimated: estimated ? Number.parseInt(estimated) : null,
      status: "NOT_STARTED",
      trackId: params.trackId,
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
