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
import { useSessionModal } from "@/lib/session-modal-context"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, BookOpen } from "lucide-react"

interface Track {
  id: string
  name: string
}

interface Lesson {
  id: string
  title: string
  track: {
    name: string
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

  // Load tracks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch("/api/tracks")
        .then((res) => res.json())
        .then((data) => {
          setTracks(data)
          if (trackId) {
            setSelectedTrackId(trackId)
          }
        })
        .catch(() => {
          toast({
            title: "Erro",
            description: "Erro ao carregar trilhas",
            variant: "destructive",
          })
        })
    }
  }, [isOpen, trackId, toast])

  // Load lessons when track is selected
  useEffect(() => {
    if (selectedTrackId) {
      fetch(`/api/tracks/${selectedTrackId}`)
        .then((res) => res.json())
        .then((data) => {
          setLessons(data.lessons || [])
          if (lessonId) {
            setSelectedLessonId(lessonId)
          }
        })
        .catch(() => {
          toast({
            title: "Erro",
            description: "Erro ao carregar lições",
            variant: "destructive",
          })
        })
    }
  }, [selectedTrackId, lessonId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLessonId || !duration) {
      toast({
        title: "Erro",
        description: "Selecione uma lição e defina a duração",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: selectedLessonId,
          duration: Number.parseInt(duration),
          notes,
          scheduledDate: scheduledDate || null,
          draft: true, // Create as draft session as specified in patch
        }),
      })

      if (response.ok) {
        toast({
          title: "Sessão criada!",
          description: "Sessão de estudo criada com sucesso",
        })
        closeModal()
        resetForm()
        router.refresh()
      } else {
        throw new Error("Erro ao criar sessão")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar sessão de estudo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <span>Nova Sessão de Estudo</span>
          </DialogTitle>
          <DialogDescription>Crie uma nova sessão de estudo para organizar seus estudos</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track">Trilha</Label>
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{track.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson">Lição</Label>
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
              <Label htmlFor="duration">Duração (min)</Label>
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
              <Label htmlFor="date">Data (opcional)</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              placeholder="Adicione notas sobre esta sessão..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Rascunho
            </Badge>
            <span className="text-xs text-gray-500">A sessão será salva como rascunho</span>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Sessão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
