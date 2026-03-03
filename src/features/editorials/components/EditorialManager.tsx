'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Book, UploadCloud, Cpu, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'

interface EditorialManagerProps {
  contestId: string
  onEditorialAdded?: () => void
}

export function EditorialManager({ contestId, onEditorialAdded }: Readonly<EditorialManagerProps>) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'select-file' | 'configure-pages'>('select-file')
  const [isParsing, setIsParsing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pageRanges, setPageRanges] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setStep('configure-pages')
    }
  }

  const handleChangeFile = () => {
    setStep('select-file')
    setSelectedFile(null)
    setPageRanges('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validatePageRanges = (ranges: string): boolean => {
    if (!ranges.trim()) return false
    const pageRangeRegex = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/
    return pageRangeRegex.test(ranges.trim())
  }

  const handleSubmit = async () => {
    if (!selectedFile || !pageRanges.trim()) {
      toast.error('Por favor, selecione um arquivo e as páginas')
      return
    }

    if (!validatePageRanges(pageRanges)) {
      toast.error('Formato de páginas inválido. Use: 15-25, 30, 45-50')
      return
    }

    try {
      setIsParsing(true)

      toast.info('Enviando o PDF para a nuvem de forma segura...', { duration: 5000 })

      const timestamp = Date.now()
      const fileExtension = selectedFile.name.split('.').pop()
      const uniqueFileName = `edital-${timestamp}.${fileExtension}`

      const newBlob = await upload(uniqueFileName, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/editorials/upload',
      })

      const formData = new FormData()
      formData.append('fileUrl', newBlob.url)
      formData.append('fileName', selectedFile.name)
      formData.append('contestId', contestId)
      formData.append('pageRanges', pageRanges.trim())

      toast.info('IA do Alquimista lendo as páginas selecionadas do PDF na Nuvem...', { duration: 5000 })

      const response = await fetch('/api/editorials/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Erro ao processar PDF no backend.'
        try {
          const expectedJSON = JSON.parse(errorText)
          errorMessage = expectedJSON.error || errorMessage
        } catch {
          if (response.status === 413) {
            errorMessage = 'O arquivo PDF é muito grande (ultrapassa o limite de 4MB de upload grátis do Vercel).'
          } else if (response.status === 504) {
            errorMessage = 'Vercel Timeout (504): A inteligência artificial demorou mais do que o limite de 10s para ler o PDF.'
          } else {
            errorMessage = `Erro ${response.status}: O servidor retornou uma falha fatal. Verifique a chave da API (GOOGLE_API_KEY) nas variáveis de ambiente do Vercel.`
          }
        }
        throw new Error(errorMessage)
      }

      toast.success('SUCESSO CRÍTICO: Edital, Disciplinas e Tópicos extraídos perfeitamente pelo Gemini!')
      setIsOpen(false)
      setStep('select-file')
      setSelectedFile(null)
      setPageRanges('')
      router.refresh()
      onEditorialAdded?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na inteligência artificial')
    } finally {
      setIsParsing(false)
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
                {step === 'select-file' ? 'SELECIONAR PDF' : 'CONFIGURAR PÁGINAS'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {step === 'select-file' ? (
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
                    onChange={handleFileSelect}
                    disabled={isParsing}
                  />

                  <UploadCloud className="w-8 h-8 text-[#00ff41] group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs text-[#00ff41] text-center">
                    Faça Upload do PDF do Edital<br/>Você irá especificar as páginas com matérias.
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#04000a] border border-[#7f7f9f]/30 p-4 rounded-none">
                  <p className="font-mono text-xs text-[#00ff41] mb-2">Arquivo selecionado:</p>
                  <p className="font-mono text-sm text-white break-all">{selectedFile?.name}</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pageRanges" className="font-pixel text-[10px] text-[#00ff41]">
                    Páginas com as matérias
                  </Label>
                  <Input
                    id="pageRanges"
                    placeholder="Ex: 15-25, 30, 45-50"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    className="bg-[#04000a] text-white border-[#7f7f9f]/30 rounded-none focus-visible:ring-[#7f7f9f]"
                    disabled={isParsing}
                  />
                  <p className="font-mono text-xs text-[#7f7f9f]">
                    Separe ranges com vírgula. Ex: 15-25 (páginas 15 até 25), 30 (página 30), 45-50 (páginas 45 até 50)
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleChangeFile}
                    disabled={isParsing}
                    className="flex-1 font-pixel text-[10px] tracking-wider transition-all rounded-none bg-[#020008] text-[#7f7f9f] border border-[#7f7f9f] hover:bg-[#7f7f9f] hover:text-[#04000a]"
                  >
                    Trocar Arquivo
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isParsing || !pageRanges.trim()}
                    className="flex-1 gap-2 font-pixel text-[10px] tracking-wider transition-all rounded-none"
                    style={{
                      backgroundColor: pageRanges.trim() ? '#00ff41' : '#7f7f9f',
                      color: '#04000a',
                      boxShadow: pageRanges.trim() ? '0 0 15px rgba(0,255,65,0.4)' : 'none',
                    }}
                  >
                    {isParsing ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        EXTRAINDO...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        EXTRAIR MATÉRIAS
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

