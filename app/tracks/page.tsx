import { redirect } from "next/navigation"
import { getCustomSession } from "@/lib/auth-helpers"
import { mockDb } from "@/lib/mock-db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TrackList } from "@/components/track-list"
import { CreateTrackDialog } from "@/components/create-track-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

async function getTracks(userId: string) {
  return mockDb.getTracksWithLessonsAndLogs(userId)
}

export default async function TracksPage() {
  const session = await getCustomSession()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const tracks = await getTracks(session.user.id)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trilhas de Estudo</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie suas trilhas de aprendizado</p>
          </div>
          <CreateTrackDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Trilha
            </Button>
          </CreateTrackDialog>
        </div>

        <TrackList tracks={tracks} />
      </div>
    </DashboardLayout>
  )
}
