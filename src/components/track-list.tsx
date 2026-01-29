"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, CheckCircle, Play } from "lucide-react"

interface Track {
  id: string
  name: string
  description: string | null
  lessons: Array<{
    id: string
    title: string
    status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
    estimated: number | null
    studyLogs: Array<{
      minutes: number
    }>
  }>
}

interface TrackListProps {
  tracks: Track[]
}

export function TrackList({ tracks }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma trilha encontrada</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Crie sua primeira trilha de estudos para começar</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tracks.map((track) => {
        const totalLessons = track.lessons.length
        const completedLessons = track.lessons.filter((lesson) => lesson.status === "DONE").length
        const inProgressLessons = track.lessons.filter((lesson) => lesson.status === "IN_PROGRESS").length
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

        const totalStudyTime = track.lessons.reduce(
          (sum, lesson) => sum + lesson.studyLogs.reduce((logSum, log) => logSum + log.minutes, 0),
          0,
        )

        return (
          <Card key={track.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{track.name}</CardTitle>
                  {track.description && <CardDescription className="mt-2">{track.description}</CardDescription>}
                </div>
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                  <span className="font-medium">
                    {completedLessons}/{totalLessons} lições
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                    </span>
                  </div>
                  {inProgressLessons > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      {inProgressLessons} em andamento
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{completedLessons} concluídas</span>
                </div>
                <Button asChild size="sm">
                  <Link href={`/tracks/${track.id}`}>Ver Trilha</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
