"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface CreateLessonDialogProps {
  readonly children: React.ReactNode
  readonly trackId: string
}

export function CreateLessonDialog({ children, trackId }: CreateLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [externalUrl, setExternalUrl] = useState("")
  const [estimated, setEstimated] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setExternalUrl("")
    setEstimated("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await fetch(`/api/tracks/${trackId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        externalUrl: externalUrl || null,
        estimated: estimated || null,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json() as { error?: string }
          throw new Error(err.error ?? "Erro ao criar lição")
        }
        toast({ title: "Lição criada!" })
        setOpen(false)
        resetForm()
        router.refresh()
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Erro ao criar lição"
        toast({ title: "Erro", description: message, variant: "destructive" })
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NOVA LICAO</DialogTitle>
          <DialogDescription>Adicione uma nova lição à sua trilha.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">TITULO</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Instalar JDK"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-desc">DESCRICAO (OPCIONAL)</Label>
            <Textarea
              id="lesson-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que será aprendido..."
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-url">LINK EXTERNO (OPCIONAL)</Label>
            <Input
              id="lesson-url"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://exemplo.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-est">TEMPO ESTIMADO (MIN)</Label>
            <Input
              id="lesson-est"
              type="number"
              value={estimated}
              onChange={(e) => setEstimated(e.target.value)}
              placeholder="60"
              min="1"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              CANCELAR
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />CRIANDO...</> : "CRIAR LICAO"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
