"use client"

import { useState, useEffect, Key } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { StudyTimer } from "@/features/timer/components/StudyTimer"
import { ExternalLink, Clock, Calendar, Timer } from "lucide-react"

interface StudyLog {
  id: string
  minutes: number
  createdAt: string
}

interface Lesson {
  id: string
  title: string
  description: string | null
  externalUrl: string | null
  estimated: number | null
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
  studyLogs: StudyLog[]
  track: {
    name: string
  }
}

interface LessonPanelProps {
  lessonId: string | null
  trackId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LessonPanel({ lessonId, trackId, open, onOpenChange }: LessonPanelProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lessonId && open) {
      setLoading(true)
      fetch(`/api/lessons/${lessonId}`)
        .then((res) => res.json())
        .then((data) => {
          setLesson(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [lessonId, open])

  if (!lesson && !loading) {
    return null
  }

  const totalStudyTime = lesson?.studyLogs.reduce((sum: number, log: { minutes: number }) => sum + log.minutes, 0) || 0
  const studySessionsCount = lesson?.studyLogs.length || 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando lição...</p>
            </div>
          </div>
        ) : lesson ? (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-2xl font-bold text-left">{lesson.title}</SheetTitle>
                  {lesson.description && (
                    <SheetDescription className="text-left mt-2 text-base">{lesson.description}</SheetDescription>
                  )}
                </div>
                <Badge
                  variant={
                    lesson.status === "DONE" ? "default" : lesson.status === "IN_PROGRESS" ? "secondary" : "outline"
                  }
                  className="ml-4"
                >
                  {lesson.status === "DONE"
                    ? "Concluída"
                    : lesson.status === "IN_PROGRESS"
                      ? "Em andamento"
                      : "Não iniciada"}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              { }
              <div>
                <StudyTimer
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                  onSessionComplete={() => {

                    if (lessonId) {
                      fetch(`/api/lessons/${lessonId}`)
                        .then((res) => res.json())
                        .then((data) => setLesson(data))
                    }
                  }}
                />
              </div>

              { }
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Lição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tempo Estimado</p>
                        <p className="font-medium">{lesson.estimated ? `${lesson.estimated} min` : "Não definido"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tempo Estudado</p>
                        <p className="font-medium">
                          {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                        </p>
                      </div>
                    </div>
                  </div>

                  {lesson.externalUrl && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Link Externo</p>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <a href={lesson.externalUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir Link
                          </a>
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              { }
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Estudos</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.studyLogs.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {studySessionsCount} sessões • {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m total
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {lesson.studyLogs.map((log: { id: Key | null | undefined; createdAt: string | number | Date; minutes: number }) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {new Date(log.createdAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <Badge variant="secondary">{log.minutes} min</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">Nenhuma sessão de estudo registrada ainda</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
