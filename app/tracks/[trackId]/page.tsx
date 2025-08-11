import { getCurrentUser } from "@/lib/auth-helpers"
import { redirect, notFound } from "next/navigation"
import { mockDb } from "@/lib/mock-db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LessonChecklist } from "@/components/lesson-checklist"
import { CreateLessonDialog } from "@/components/create-lesson-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Clock, Target } from "lucide-react"

async function getTrack(trackId: string, userId: string) {
  return mockDb.getTrackById(trackId, userId)
}

export default async function TrackPage({ params }: { params: { trackId: string } }) {
  const user = await getCurrentUser()

  if (!user?.id) {
    redirect("/auth/signin")
  }

  const track = await getTrack(params.trackId, user.id)

  if (!track) {
    notFound()
  }

  const totalLessons = track.lessons.length
  const completedLessons = track.lessons.filter((lesson) => lesson.status === "DONE").length
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const totalStudyTime = track.lessons.reduce(
    (sum, lesson) => sum + lesson.studyLogs.reduce((logSum, log) => logSum + log.minutes, 0),
    0,
  )

  const estimatedTime = track.lessons.reduce((sum, lesson) => sum + (lesson.estimated || 0), 0)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{track.name}</h1>
              {track.description && <p className="text-gray-600 dark:text-gray-400 mt-1">{track.description}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                <Progress value={progress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completedLessons} de {totalLessons} lições
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Estudado</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.floor(totalStudyTime / 60)}h</div>
                <p className="text-xs text-muted-foreground">{totalStudyTime % 60}min adicionais</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Estimado</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.floor(estimatedTime / 60)}h</div>
                <p className="text-xs text-muted-foreground">{estimatedTime % 60}min estimados</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Lições</h2>
          <CreateLessonDialog trackId={track.id}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Lição
            </Button>
          </CreateLessonDialog>
        </div>

        <LessonChecklist lessons={track.lessons} trackId={track.id} />
      </div>
    </DashboardLayout>
  )
}
