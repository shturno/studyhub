'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Book, UploadCloud, Cpu } from 'lucide-react'
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
  const [isParsing, setIsParsing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleManualAdd = async () => {
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

      toast.success('Edital manual adicionado!')
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

  const handleParsePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsParsing(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('contestId', contestId)

      toast.info('IA do Alquimista lendo as centenas de páginas do PDF...', { duration: 5000 })

      const response = await fetch('/api/editorials/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar PDF')
      }

      toast.success('SUCESSO CRÍTICO: Edital, Disciplinas e Tópicos extraídos perfeitamente pelo Gemini!')
      setIsOpen(false)
      router.refresh()
      onEditorialAdded?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na inteligência artificial')
    } finally {
      setIsParsing(false)
      if (e.target) e.target.value = ''
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
          Extraia o edital via IA para montar sua Skill Tree instantaneamente.
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="w-full gap-2 font-pixel text-[10px] tracking-wider transition-all"
            style={{ backgroundColor: '#00ff41', color: '#04000a', boxShadow: '0 0 15px rgba(0,255,65,0.4)', borderRadius: 0 }}
          >
            <Plus className="w-4 h-4" />
            NOVO EDITAL
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-0 rounded-none p-0" style={{ background: '#0a0005', border: '2px solid #ff006e', boxShadow: '0 0 30px rgba(255,0,110,0.2)' }}>
          <div className="p-4 sticky top-0 z-10 bg-[#0a0005]" style={{ borderBottom: '2px dashed #ff006e' }}>
            <DialogHeader>
              <DialogTitle className="font-pixel text-lg text-[#ff006e] flex items-center gap-2">
                <Book className="w-5 h-5" />
                ADICIONAR EDITAL
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-8">
            {/* AI AUTO PARSER SECTION */}
            <div className="space-y-3">
              <Label className="font-pixel text-[10px] text-[#00ff41] flex items-center gap-2">
                <Cpu className="w-4 h-4" /> OPÇÃO RECOMENDADA: SCANNER IA (GEMINI)
              </Label>
              
              <label 
                className={`w-full p-6 border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group ${isParsing ? 'border-[#ff006e] bg-[#ff006e]/10 animate-pulse' : 'border-[#00ff41]/50 bg-[#00ff41]/5 hover:bg-[#00ff41]/20 hover:border-[#00ff41]'}`}
              >
                <input 
                  type="file" 
                  accept="application/pdf, text/plain" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleParsePdf}
                  disabled={isParsing}
                />
                
                {isParsing ? (
                  <>
                    <Cpu className="w-8 h-8 text-[#ff006e] animate-spin" />
                    <span className="font-mono text-xs text-[#ff006e] text-center">
                      ALQUIMISTA EXTRAINDO DISCIPLINAS...<br/>Isso pode levar de 10 a 30 segundos.
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-[#00ff41] group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs text-[#00ff41] text-center">
                      Faça Upload do PDF do Edital<br/>A IA lerá todas as matérias automaticamente.
                    </span>
                  </>
                )}
              </label>
            </div>

            <div className="flex items-center gap-2 opacity-50">
              <div className="h-px bg-white/20 flex-1"></div>
              <span className="font-pixel text-[8px] text-white/50">OU MANUALMENTE</span>
              <div className="h-px bg-white/20 flex-1"></div>
            </div>

            {/* MANUAL SECTION */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-mono text-xs text-[#7f7f9f]">Título do Edital</Label>
                <Input
                  id="title"
                  placeholder="Ex: Edital Banco do Brasil 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#04000a] text-white border-[#7f7f9f]/30 rounded-none focus-visible:ring-[#7f7f9f]"
                  disabled={isParsing || isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="font-mono text-xs text-[#7f7f9f]">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o conteúdo do edital..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#04000a] text-white border-[#7f7f9f]/30 rounded-none focus-visible:ring-[#7f7f9f] min-h-16"
                  disabled={isParsing || isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url" className="font-mono text-xs text-[#7f7f9f]">Link (opcional)</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-[#04000a] text-white border-[#7f7f9f]/30 rounded-none focus-visible:ring-[#7f7f9f]"
                  disabled={isParsing || isSubmitting}
                />
              </div>

              <Button
                onClick={handleManualAdd}
                disabled={isSubmitting || isParsing}
                className="mt-2 font-pixel text-[10px] tracking-wider transition-all rounded-none bg-[#020008] text-[#7f7f9f] border border-[#7f7f9f] hover:bg-[#7f7f9f] hover:text-[#04000a]"
              >
                {isSubmitting ? 'ADICIONANDO...' : 'ADICIONAR MANUALMENTE (LENTO)'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

