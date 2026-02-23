'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Zap, Brain, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SmartScheduleGeneratorProps {
  contestId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SmartScheduleGenerator({
  contestId,
  isOpen,
  onOpenChange,
}: SmartScheduleGeneratorProps) {
  const [examDate, setExamDate] = useState('')
  const [weeklyHours, setWeeklyHours] = useState('40')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState<any>(null)

  const handleGenerateSchedule = async () => {
    if (!examDate) {
      toast.error('Por favor, selecione a data da prova')
      return
    }

    try {
      setIsGenerating(true)
      const response = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestId,
          examDate,
          weeklyHours: parseInt(weeklyHours),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar cronograma')
      }

      const data = await response.json()
      setGeneratedSchedule(data)
      toast.success('Cronograma gerado com sucesso!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao gerar cronograma'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAcceptSchedule = async () => {
    // TODO: Save schedule sessions to database
    toast.success('Cronograma importado para seu planner!')
    onOpenChange(false)
    setGeneratedSchedule(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            Gerar Cronograma Inteligente com IA
          </DialogTitle>
        </DialogHeader>

        {!generatedSchedule ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="examDate">Data da Prova *</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-zinc-400 mt-1">
                O cronograma será adaptado ao tempo disponível até a data
              </p>
            </div>

            <div>
              <Label htmlFor="weeklyHours">Horas disponíveis por semana</Label>
              <Input
                id="weeklyHours"
                type="number"
                min="5"
                max="168"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Total de horas que você pode dedicar por semana
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-300">
                  <p className="font-medium text-blue-300 mb-1">Como funciona?</p>
                  <ul className="space-y-1 text-xs">
                    <li>✓ A IA analisa seus editais e tópicos de alta prioridade</li>
                    <li>✓ Cria um cronograma personalizado até a data da prova</li>
                    <li>✓ Balanceia tempo de aprendizado, prática e revisão</li>
                    <li>✓ Você pode aceitar e importar para seu planner</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerateSchedule}
                disabled={isGenerating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Zap className="w-4 h-4" />
                {isGenerating ? 'Gerando...' : 'Gerar Cronograma'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Schedule Preview */}
            <Card className="p-4 bg-white/5 border-white/10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">
                    Cronograma para {generatedSchedule.schedule.weeks} semanas
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded bg-white/5">
                    <p className="text-xs text-zinc-400">Total de Horas</p>
                    <p className="text-lg font-bold text-white">
                      {generatedSchedule.schedule.totalHours}h
                    </p>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <p className="text-xs text-zinc-400">Cobertura</p>
                    <p className="text-lg font-bold text-green-400">
                      {generatedSchedule.coverage.coverage}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Milestones */}
            {generatedSchedule.schedule.keyMilestones?.length > 0 && (
              <Card className="p-4 bg-white/5 border-white/10">
                <h4 className="font-semibold text-white mb-3">Marcos Importantes</h4>
                <ul className="space-y-2">
                  {generatedSchedule.schedule.keyMilestones.map((milestone: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">→</span>
                      {milestone}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Tips */}
            {generatedSchedule.schedule.tips?.length > 0 && (
              <Card className="p-4 bg-white/5 border-white/10">
                <h4 className="font-semibold text-white mb-3">Dicas de Estudo</h4>
                <ul className="space-y-2">
                  {generatedSchedule.schedule.tips.slice(0, 3).map((tip: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">💡</Badge>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedSchedule(null)
                  setExamDate('')
                }}
              >
                Gerar Novo
              </Button>
              <Button
                onClick={handleAcceptSchedule}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4" />
                Importar para Planner
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
