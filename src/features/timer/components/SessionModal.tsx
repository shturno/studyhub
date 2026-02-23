"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSessionModal } from "@/features/timer/context/SessionModalContext"
import { useToast } from "@/hooks/use-toast"
import { Clock, BookOpen, Loader2 } from "lucide-react"

interface Track {
  readonly id: string
  readonly name: string
}

interface Lesson {
  readonly id: string
  readonly title: string
  readonly track: {
    readonly name: string
  }
}

export function SessionModal() {
  const { isOpen, closeModal, lessonId, trackId } = useSessionModal()
  const [tracks, setTracks] = useState<Track[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string>("")
  const [selectedLessonId, setSelectedLessonId] = useState<string>("")
  const [duration, setDuration] = useState<string>("25")
  const [notes, setNotes] = useState<string>("")
  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetch("/api/tracks")
        .then((res) => res.json())
        .then((data: Track[]) => {
          setTracks(data)
          if (trackId) {
            setSelectedTrackId(trackId)
          }
        })
        .catch(() => {
          toast({ title: "Erro ao carregar trilhas", variant: "destructive" })
        })
    }
  }, [isOpen, trackId, toast])

  useEffect(() => {
    if (selectedTrackId) {
      fetch(`/api/tracks/${selectedTrackId}`)
        .then((res) => res.json())
        .then((data: { lessons?: Lesson[] }) => {
          setLessons(data.lessons ?? [])
          if (lessonId) {
            setSelectedLessonId(lessonId)
          }
        })
        .catch(() => {
          toast({ title: "Erro ao carregar lições", variant: "destructive" })
        })
    }
  }, [selectedTrackId, lessonId, toast])

  const resetForm = () => {
    setSelectedTrackId("")
    setSelectedLessonId("")
    setDuration("25")
    setNotes("")
    setScheduledDate("")
  }

  const handleClose = () => {
    closeModal()
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLessonId || !duration) {
      toast({ title: "Selecione uma lição e defina a duração", variant: "destructive" })
      return
    }

    setLoading(true)

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: selectedLessonId,
        duration: Number.parseInt(duration),
        notes,
        scheduledDate: scheduledDate || null,
        draft: true,
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Erro ao criar sessão")
        toast({ title: "Sessão criada!" })
        closeModal()
        resetForm()
        router.refresh()
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Erro desconhecido"
        toast({ title: "Erro", description: message, variant: "destructive" })
      })

    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>NOVA SESSAO</DialogTitle>
          <DialogDescription>Crie uma sessão de estudo para organizar seus estudos</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track">TRILHA</Label>
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{track.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson">LICAO</Label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId} disabled={!selectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma lição" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">DURACAO (MIN)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">DATA (OPCIONAL)</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">NOTAS (OPCIONAL)</Label>
            <Textarea
              placeholder="Adicione notas sobre esta sessão..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              RASCUNHO
            </Badge>
            <span className="font-mono text-sm text-[#555]">Sessão salva como rascunho</span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              CANCELAR
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />CRIANDO...</> : "CRIAR SESSAO"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
