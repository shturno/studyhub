import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { mockDb } from "@/lib/mock-db"

export async function GET(request: NextRequest, { params }: { params: { trackId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const track = mockDb.getTrackWithLessonsAndLogs(params.trackId, user.id)

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error("Error fetching track:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { trackId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    const success = mockDb.updateTrack(params.trackId, user.id, { name, description })

    if (!success) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Track updated successfully" })
  } catch (error) {
    console.error("Error updating track:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { trackId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = mockDb.deleteTrack(params.trackId, user.id)

    if (!success) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Track deleted successfully" })
  } catch (error) {
    console.error("Error deleting track:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
