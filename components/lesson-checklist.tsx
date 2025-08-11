"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Circle, Play, Clock, ExternalLink, Timer, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LessonPanel } from "@/components/lesson-panel"

interface Lesson {
  id: string
  title: string
  description: string | null
  externalUrl: string | null
  estimated: number | null
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
  studyLogs: Array<{
    minutes: number
  }>
}

interface LessonChecklistProps {
  lessons: Lesson[]
  trackId: string
}

export function LessonChecklist({ lessons, trackId }: LessonChecklistProps) {
  const [updatingLessons, setUpdatingLessons] = useState<Set<string>>(new Set())
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const updateLessonStatus = async (lessonId: string, newStatus: "NOT_STARTED" | "IN_PROGRESS" | "DONE") => {
    setUpdatingLessons((prev) => new Set(prev).add(lessonId))

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
        toast({
          title: "Status atualizado!",
          description: "O status da lição foi atualizado com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da lição",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da lição",
        variant: "destructive",
      })
    } finally {
      setUpdatingLessons((prev) => {
        const newSet = new Set(prev)
        newSet.delete(lessonId)
        return newSet
      })
    }
  }

  // Added function to open lesson panel
  const openLessonPanel = (lessonId: string) => {
    setSelectedLessonId(lessonId)
    setPanelOpen(true)
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma lição encontrada</h3>
        <p className="text-gray-600 dark:text-gray-400">Adicione lições para começar a estudar esta trilha</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {lessons.map((lesson) => {
          const totalStudyTime = lesson.studyLogs.reduce((sum, log) => sum + log.minutes, 0)
          const isUpdating = updatingLessons.has(lesson.id)

          return (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox
                      checked={lesson.status === "DONE"}
                      onCheckedChange={(checked) => {
                        updateLessonStatus(lesson.id, checked ? "DONE" : "NOT_STARTED")
                      }}
                      disabled={isUpdating}
                    />
                    {lesson.status === "DONE" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : lesson.status === "IN_PROGRESS" ? (
                      <Play className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lesson.description}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {lesson.estimated && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {lesson.estimated}min
                          </Badge>
                        )}

                        <Badge
                          variant={
                            lesson.status === "DONE"
                              ? "default"
                              : lesson.status === "IN_PROGRESS"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {lesson.status === "DONE"
                            ? "Concluída"
                            : lesson.status === "IN_PROGRESS"
                              ? "Em andamento"
                              : "Não iniciada"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {totalStudyTime > 0 && (
                          <div className="flex items-center space-x-1">
                            <Timer className="h-4 w-4" />
                            <span>
                              {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m estudados
                            </span>
                          </div>
                        )}
                        {lesson.externalUrl && (
                          <a
                            href={lesson.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Link externo</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Updated buttons to open lesson panel instead of navigating */}
                        <Button size="sm" variant="outline" onClick={() => openLessonPanel(lesson.id)}>
                          <Timer className="h-4 w-4 mr-1" />
                          Timer
                        </Button>
                        <Button size="sm" onClick={() => openLessonPanel(lesson.id)}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Added LessonPanel component */}
      <LessonPanel lessonId={selectedLessonId} trackId={trackId} open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  )
}
