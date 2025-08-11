import { type NextRequest, NextResponse } from "next/server"
import { getCustomSession } from "@/lib/auth-helpers"
import { mockDb } from "@/lib/mock-db"

export async function GET() {
  try {
    const session = await getCustomSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tracks = mockDb.getTracksWithLessonsAndLogs(session.user.id)

    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Error fetching tracks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const track = mockDb.createTrack({
      name,
      description,
      userId: session.user.id,
    })

    return NextResponse.json(track)
  } catch (error) {
    console.error("Error creating track:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
