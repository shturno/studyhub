'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react'
import { createEditorialItem, deleteEditorialItem, getEditorialsForContest } from '../actions'
import { EditorialWithMappings } from '../types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EditorialManagerProps {
  contestId: string
  onEditorialAdded?: () => void
}

export function EditorialManager({ contestId, onEditorialAdded }: EditorialManagerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [editorials, setEditorials] = useState<EditorialWithMappings[]>([])

  useEffect(() => {
    loadEditorials()
  }, [contestId])

  async function loadEditorials() {
    try {
      setIsLoading(true)
      const data = await getEditorialsForContest(contestId)
      setEditorials(data)
    } catch (error) {
      console.error('Error loading editorials:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
      await loadEditorials()
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

  const handleDeleteEditorial = async (editorialId: string) => {
    try {
      await deleteEditorialItem(editorialId)
      toast.success('Edital removido com sucesso!')
      setEditorials(editorials.filter((e) => e.id !== editorialId))
      router.refresh()
      onEditorialAdded?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao remover edital'
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Editais</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Edital
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Edital</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Edital *</Label>
                <Input
                  id="title"
                  placeholder="ex: Edital Banco do Brasil 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os principais tópicos e informações do edital..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="url">Link do Edital</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddEditorial}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? 'Adicionando...' : 'Adicionar Edital'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 mt-4">
        {isLoading ? (
          <div className="text-center py-4 text-zinc-400">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-sm">Carregando editais...</p>
          </div>
        ) : editorials.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p>Nenhum edital adicionado ainda</p>
          </div>
        ) : (
          editorials.map((editorial) => (
          <div
            key={editorial.id}
            className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-start justify-between hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{editorial.title}</h4>
              {editorial.description && (
                <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                  {editorial.description}
                </p>
              )}
              {editorial.url && (
                <a
                  href={editorial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2"
                >
                  <LinkIcon className="w-3 h-3" />
                  Ver Edital
                </a>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                Adicionado em {new Date(editorial.uploadedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button
              onClick={() => handleDeleteEditorial(editorial.id)}
              className="ml-2 p-2 text-zinc-400 hover:text-red-400 transition-colors"
              title="Remover edital"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          ))
        )}
    </div>
  )
}
