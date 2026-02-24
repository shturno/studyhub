'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Book } from 'lucide-react'
import { createEditorialItem } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EditorialManagerProps {
  contestId: string
  onEditorialAdded?: () => void
}

export function EditorialManager({ contestId, onEditorialAdded }: Readonly<EditorialManagerProps>) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')

  const handleAddEditorial = async () => {
    if (!title.trim()) {
      toast.error('Por favor, insira um título para o edital')
      return
    }

    try {
      setIsSubmitting(true)
      await createEditorialItem({
        contestId,
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim() || undefined,
      })

      toast.success('Edital adicionado com sucesso!')
      setTitle('')
      setDescription('')
      setUrl('')
      setIsOpen(false)
      router.refresh()
      onEditorialAdded?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao adicionar edital'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-pixel text-[12px] text-[#ff006e] mb-1 flex items-center gap-2" style={{ textShadow: '0 0 10px rgba(255,0,110,0.5)' }}>
          <Book className="w-5 h-5 text-[#ff006e]" />
          INVENTÁRIO
        </h3>
        <p className="font-mono text-sm text-[#7f7f9f]">
          Adicione os editais bases que compõem este concurso.
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Edital
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Novo Edital</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-white">
                Título do Edital
              </Label>
              <Input
                id="title"
                placeholder="Ex: Edital Banco do Brasil 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-white/10 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-white">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva o conteúdo do edital..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-900 border-white/10 text-white min-h-24"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url" className="text-white">
                Link do Edital (opcional)
              </Label>
              <Input
                id="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-zinc-900 border-white/10 text-white"
              />
            </div>

            <Button
              onClick={handleAddEditorial}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 w-full mt-4"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Edital'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="font-mono text-[10px] text-[#555] p-3 bg-[#0a0005] rounded-none border border-dashed border-[#ff006e]/30">
        <p>Dica: Mapeie o conteúdo dos seus editais para os tópicos de estudo para o Alquimista funcionar.</p>
      </div>
    </div>
  )
}
