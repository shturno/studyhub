"use client"

import { useState } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  id: string
  title: string
  trackName: string
  trackId: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
  estimated: number | null
}

interface PlannedSession {
  id: string
  lessonId: string
  lessonTitle: string
  trackName: string
  duration: number
  scheduledDate: string
  draft: boolean
}

interface PlannerData {
  tracks: Array<{
    id: string
    name: string
    lessons: Lesson[]
  }>
  availableLessons: Lesson[]
  plannedSessions: PlannedSession[]
}

interface PlannerContentProps {
  data: PlannerData
  contestId?: string
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
    setActiveLesson(lesson || null)
  }



  // ... inside component

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLesson(null)

    if (!over) return

    if (over.id === "planner-area") {
      const lesson = availableLessons.find((l) => l.id === active.id)
      if (lesson) {

        // Optimistic Update
        const tempId = `temp-${Date.now()}`
        const newSession: PlannedSession = {
          id: tempId,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          trackName: lesson.trackName,
          duration: lesson.estimated || 25,
          scheduledDate: new Date().toISOString().split("T")[0],
          draft: true,
        }
        setPlannedSessions((prev) => [...prev, newSession])

        try {
          await savePlannedSession({
            lessonId: lesson.id,
            date: newSession.scheduledDate,
            duration: newSession.duration
          })

          toast({
            title: "Sessão agendada!",
            description: `${lesson.title} foi salvo no seu planner`,
          })
        } catch (_error) {
          // Rollback
          setPlannedSessions((prev) => prev.filter(s => s.id !== tempId))
          toast({
            title: "Erro ao salvar",
            description: "Não foi possível agendar a sessão",
            variant: "destructive"
          })
        }
      }
    }
  }

  const handleRemoveSession = async (sessionId: string) => {
    // Optimistic Update
    const previousSessions = [...plannedSessions]
    setPlannedSessions((prev) => prev.filter((s) => s.id !== sessionId))

    try {
      await removePlannedSession(sessionId)
      toast({
        title: "Sessão removida",
        description: "A sessão foi removida do seu planner",
      })
    } catch (_error) {
      // Rollback
      setPlannedSessions(previousSessions)
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a sessão",
        variant: "destructive"
      })
    }
  }

  const handleEditSession = (session: PlannedSession) => {
    openModal(session.lessonId, session.lessonId)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planner</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Arraste lições para o planner para organizar seus estudos
            </p>
          </div>
          <div className="flex gap-2">
            {contestId && (
              <Button 
                onClick={() => setIsScheduleGeneratorOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Brain className="h-4 w-4" />
                IA Cronograma
              </Button>
            )}
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          </div>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          { }
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Lições Disponíveis</span>
              </CardTitle>
              <CardDescription>Arraste as lições para o planner para agendar estudos</CardDescription>
            </CardHeader>
            <CardContent>
              <SortableContext items={availableLessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableLessons.map((lesson) => (
                    <DraggableLesson key={lesson.id} lesson={lesson} />
                  ))}
                  {availableLessons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Todas as lições foram concluídas!</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </CardContent>
          </Card>

          { }
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Sessões Planejadas</span>
              </CardTitle>
              <CardDescription>Suas sessões de estudo agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <DroppableArea id="planner-area">
                <div className="space-y-3 min-h-96">
                  {plannedSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{session.lessonTitle}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{session.trackName}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{session.duration} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(session.scheduledDate).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.draft && (
                            <Badge variant="secondary" className="text-xs">
                              Rascunho
                            </Badge>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleEditSession(session)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveSession(session.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {plannedSessions.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="mb-2">Arraste lições aqui para planejar seus estudos</p>
                       <p className="text-sm">Ou clique em &ldquo;Nova Sessão&rdquo; para criar manualmente</p>
                    </div>
                  )}
                </div>
              </DroppableArea>
            </CardContent>
          </Card>
        </div>

        <DragOverlay>
          {activeLesson ? (
            <div className="p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
              <h4 className="font-medium">{activeLesson.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activeLesson.trackName}</p>
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
