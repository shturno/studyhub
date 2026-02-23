"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Circle, Play, Clock, ExternalLink, Timer, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LessonPanel } from "@/features/study-cycle/components/LessonPanel"

interface Lesson {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly externalUrl: string | null
  readonly estimated: number | null
  readonly status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
  readonly studyLogs: Array<{
    readonly minutes: number
  }>
}

interface LessonChecklistProps {
  readonly lessons: Lesson[]
  readonly trackId: string
}

export function LessonChecklist({ lessons, trackId }: LessonChecklistProps) {
  const [updatingLessons, setUpdatingLessons] = useState<Set<string>>(new Set())
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const updateLessonStatus = async (lessonId: string, newStatus: "NOT_STARTED" | "IN_PROGRESS" | "DONE") => {
    setUpdatingLessons((prev) => new Set(prev).add(lessonId))

    await fetch(`/api/lessons/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao atualizar")
        router.refresh()
        toast({ title: "Status atualizado!" })
      })
      .catch(() => {
        toast({ title: "Erro ao atualizar status", variant: "destructive" })
      })
      .finally(() => {
        setUpdatingLessons((prev) => {
          const newSet = new Set(prev)
          newSet.delete(lessonId)
          return newSet
        })
      })
  }

  const openLessonPanel = (lessonId: string) => {
    setSelectedLessonId(lessonId)
    setPanelOpen(true)
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12" style={{ border: '2px dashed rgba(0,255,65,0.2)', background: '#04000a' }}>
        <BookOpen className="h-10 w-10 text-[#333] mx-auto mb-3" />
        <div className="font-pixel text-[8px] text-[#555] mb-2">NENHUMA LICAO ENCONTRADA</div>
        <div className="font-mono text-base text-[#444]">Adicione lições para estudar esta trilha</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {lessons.map((lesson) => {
          const totalStudyTime = lesson.studyLogs.reduce((sum, log) => sum + log.minutes, 0)
          const isUpdating = updatingLessons.has(lesson.id)
          const statusVariant = lesson.status === "DONE" ? "default" : lesson.status === "IN_PROGRESS" ? "secondary" : "outline"
          const statusLabel = lesson.status === "DONE" ? "CONCLUIDA" : lesson.status === "IN_PROGRESS" ? "EM ANDAMENTO" : "NAO INICIADA"

          return (
            <div key={lesson.id} className="p-4 hover:-translate-y-0.5 transition-transform"
              style={{ border: '1px solid rgba(0,255,65,0.3)', background: '#04000a' }}>
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 mt-1">
                  <Checkbox
                    checked={lesson.status === "DONE"}
                    onCheckedChange={(checked) => {
                      void updateLessonStatus(lesson.id, checked ? "DONE" : "NOT_STARTED")
                    }}
                    disabled={isUpdating}
                  />
                  {lesson.status === "DONE" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  ) : lesson.status === "IN_PROGRESS" ? (
                    <Play className="h-4 w-4 text-[#7b61ff]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[#333]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="font-mono text-base text-[#e0e0ff]">{lesson.title}</div>
                      {lesson.description && (
                        <div className="font-mono text-sm text-[#7f7f9f] mt-0.5">{lesson.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lesson.estimated && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.estimated}m
                        </Badge>
                      )}
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono text-sm text-[#555]">
                      {totalStudyTime > 0 && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-3.5 w-3.5" />
                          <span>{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</span>
                        </div>
                      )}
                      {lesson.externalUrl && (
                        <a
                          href={lesson.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#00ff41] hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Link
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openLessonPanel(lesson.id)}>
                        <Timer className="h-4 w-4 mr-1" />
                        TIMER
                      </Button>
                      <Button size="sm" onClick={() => openLessonPanel(lesson.id)}>
                        VER
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <LessonPanel lessonId={selectedLessonId} trackId={trackId} open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  )
}
