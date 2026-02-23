'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Zap } from 'lucide-react'
import { getContentCrossings } from '../actions'
import type { EditorialWithMappings } from '../types'

interface ContentCrossingViewProps {
  editorials: EditorialWithMappings[]
}

interface Crossing {
  topicId: string
  topicName: string
  mappingCount: number
  editorialCount: number
  relevanceScore: number
}

export function ContentCrossingView({ editorials }: ContentCrossingViewProps) {
  const [crossings, setCrossings] = useState<Crossing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (editorials.length === 0) {
      setLoading(false)
      return
    }

    const contestId = editorials[0].contestId

    async function loadCrossings() {
      try {
        const data = await getContentCrossings(contestId)

        const multipleCrossings = data.filter((c) => c.editorialCount > 1)
        setCrossings(multipleCrossings)
      } catch (error) {
        console.error('Error loading crossings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCrossings()
  }, [editorials])

  if (editorials.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-zinc-500 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">Nenhum cruzamento</h3>
        <p className="text-zinc-400 text-sm text-center">
          Adicione pelo menos 2 editais e mapeie seu conteúdo para identificar cruzamentos
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-zinc-400">Carregando cruzamentos...</p>
        </div>
      </div>
    )
  }

  if (crossings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-zinc-500 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">Nenhum cruzamento encontrado</h3>
        <p className="text-zinc-400 text-sm text-center">
          Nenhum tópico foi mapeado em múltiplos editais ainda
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {crossings.map((crossing) => (
          <Card
            key={crossing.topicId}
            className="p-4 bg-card/50 border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h4 className="font-semibold text-white">{crossing.topicName}</h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {crossing.editorialCount} edital{crossing.editorialCount !== 1 ? 'is' : ''}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-indigo-500/50 text-indigo-400"
                  >
                    {crossing.mappingCount} mapeamento{crossing.mappingCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-400">{crossing.relevanceScore}%</div>
                <p className="text-xs text-zinc-400">Relevância média</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-indigo-600/20 border-indigo-500/50">
        <p className="text-sm text-indigo-200">
          <strong>{crossings.length}</strong> tópico{crossings.length !== 1 ? 's' : ''} aparecem em múltiplos
          editais. Estes são ótimos pontos de foco para seus estudos!
        </p>
      </Card>
    </div>
  )
}
