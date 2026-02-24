"use client"

import { useState } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSessionModal } from "@/features/timer/context/SessionModalContext"
import { useToast } from "@/hooks/use-toast"
import { DraggableLesson } from "@/features/study-cycle/components/DraggableLesson"
import { DroppableArea } from "@/features/study-cycle/components/DroppableArea"
import { SmartScheduleGenerator } from "@/features/study-cycle/components/SmartScheduleGenerator"
import { Calendar, Clock, BookOpen, Plus, Target, Brain } from "lucide-react"
import { savePlannedSession, removePlannedSession } from "@/features/study-cycle/actions"

interface Lesson {
  readonly id: string
  readonly title: string
  readonly trackName: string
  readonly trackId: string
  readonly status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
  readonly estimated: number | null
}

interface PlannedSession {
  readonly id: string
  readonly lessonId: string
  readonly lessonTitle: string
  readonly trackName: string
  readonly duration: number
  readonly scheduledDate: string
  readonly draft: boolean
}

interface PlannerData {
  readonly tracks: Array<{
    readonly id: string
    readonly name: string
    readonly lessons: Lesson[]
  }>
  readonly availableLessons: Lesson[]
  readonly plannedSessions: PlannedSession[]
}

interface PlannerContentProps {
  readonly data: PlannerData
  readonly contestId?: string
}

export function PlannerContent({ data, contestId }: PlannerContentProps) {
  const [availableLessons] = useState(data.availableLessons)
  const [plannedSessions, setPlannedSessions] = useState(data.plannedSessions)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [isScheduleGeneratorOpen, setIsScheduleGeneratorOpen] = useState(false)
  const { openModal } = useSessionModal()
  const { toast } = useToast()

  const handleDragStart = (event: DragStartEvent) => {
    const lesson = availableLessons.find((l) => l.id === event.active.id)
    setActiveLesson(lesson ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLesson(null)
    if (!over) return

    if (over.id === "planner-area") {
      const lesson = availableLessons.find((l) => l.id === active.id)
      if (!lesson) return

      const tempId = `temp-${Date.now()}`
      const newSession: PlannedSession = {
        id: tempId,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        trackName: lesson.trackName,
        duration: lesson.estimated ?? 25,
        scheduledDate: new Date().toISOString().split("T")[0],
        draft: true,
      }
      setPlannedSessions((prev) => [...prev, newSession])

      await savePlannedSession({
        lessonId: lesson.id,
        date: newSession.scheduledDate,
        duration: newSession.duration,
      })
        .then(() => {
          toast({ title: "Sessão agendada!", description: `${lesson.title} salvo no planner` })
        })
        .catch((err: unknown) => {
          setPlannedSessions((prev) => prev.filter((s) => s.id !== tempId))
          const message = err instanceof Error ? err.message : "Erro desconhecido"
          toast({ title: "Erro ao salvar", description: message, variant: "destructive" })
        })
    }
  }

  const handleRemoveSession = async (sessionId: string) => {
    const previousSessions = [...plannedSessions]
    setPlannedSessions((prev) => prev.filter((s) => s.id !== sessionId))

    await removePlannedSession(sessionId)
      .then(() => {
        toast({ title: "Sessão removida" })
      })
      .catch((err: unknown) => {
        setPlannedSessions(previousSessions)
        const message = err instanceof Error ? err.message : "Erro desconhecido"
        toast({ title: "Erro ao remover", description: message, variant: "destructive" })
      })
  }

  const handleEditSession = (session: PlannedSession) => {
    openModal(session.lessonId, session.lessonId)
  }

  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6">

      
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '2px solid rgba(0,255,65,0.2)' }}>
        <div>
          <div className="font-pixel text-[#00ff41] text-sm mb-1"
            style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
            PLANNER
          </div>
          <div className="font-mono text-lg text-[#7f7f9f]">
            Arraste lições para organizar seus estudos
          </div>
        </div>
        <div className="flex gap-3">
          {contestId && (
            <Button
              variant="secondary"
              onClick={() => setIsScheduleGeneratorOpen(true)}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              IA
            </Button>
          )}
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            NOVA SESSAO
          </Button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          
          <div style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(0,255,65,0.15)' }}>
              <BookOpen className="h-4 w-4 text-[#00ff41]" />
              <span className="font-pixel text-[8px] text-[#00ff41]">LICOES DISPONIVEIS</span>
            </div>
            <div className="p-4">
              <SortableContext items={availableLessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableLessons.map((lesson) => (
                    <DraggableLesson key={lesson.id} lesson={lesson} />
                  ))}
                  {availableLessons.length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-10 w-10 mx-auto mb-2 text-[#333]" />
                      <div className="font-pixel text-[7px] text-[#555]">
                        TODAS AS LICOES CONCLUIDAS!
                      </div>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>

          
          <div style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(0,255,65,0.15)' }}>
              <Calendar className="h-4 w-4 text-[#00ff41]" />
              <span className="font-pixel text-[8px] text-[#00ff41]">SESSOES PLANEJADAS</span>
            </div>
            <div className="p-4">
              <DroppableArea id="planner-area">
                <div className="space-y-3 min-h-96">
                  {plannedSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 hover:-translate-y-0.5 transition-transform"
                      style={{ border: '1px solid rgba(0,255,65,0.25)', background: '#020008' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-lg text-[#e0e0ff] truncate">{session.lessonTitle}</div>
                          <div className="font-mono text-base text-[#7f7f9f] truncate">{session.trackName}</div>
                          <div className="flex items-center gap-3 mt-2 font-mono text-base text-[#555]">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{session.duration}min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(session.scheduledDate).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {session.draft && (
                            <Badge variant="secondary">RASCUNHO</Badge>
                          )}
                          <button
                            onClick={() => handleEditSession(session)}
                            className="font-pixel text-[6px] text-[#00ff41] px-2 py-1 hover:bg-[#00ff41] hover:text-black transition-all"
                            style={{ border: '1px solid rgba(0,255,65,0.4)' }}
                          >
                            EDITAR
                          </button>
                          <button
                            onClick={() => handleRemoveSession(session.id)}
                            className="font-pixel text-[6px] text-[#ff006e] px-2 py-1 hover:bg-[#ff006e] hover:text-black transition-all"
                            style={{ border: '1px solid rgba(255,0,110,0.4)' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {plannedSessions.length === 0 && (
                    <div className="text-center py-12"
                      style={{ border: '2px dashed rgba(0,255,65,0.15)' }}>
                      <Calendar className="h-10 w-10 mx-auto mb-2 text-[#333]" />
                      <div className="font-pixel text-[7px] text-[#555] mb-1">
                        ARRASTE LICOES AQUI
                      </div>
                      <div className="font-mono text-base text-[#444]">
                        Ou clique em &ldquo;NOVA SESSAO&rdquo;
                      </div>
                    </div>
                  )}
                </div>
              </DroppableArea>
            </div>
          </div>
        </div>

        
        <DragOverlay>
          {activeLesson ? (
            <div className="p-3" style={{ border: '2px solid #00ff41', background: '#04000a', boxShadow: '4px 4px 0 #006b1a' }}>
              <div className="font-mono text-base text-[#e0e0ff]">{activeLesson.title}</div>
              <div className="font-mono text-sm text-[#7f7f9f]">{activeLesson.trackName}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {contestId && (
        <SmartScheduleGenerator
          contestId={contestId}
          isOpen={isScheduleGeneratorOpen}
          onOpenChange={setIsScheduleGeneratorOpen}
        />
      )}
    </div>
  )
}
