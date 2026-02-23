'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Zap } from 'lucide-react'
import {
  analyzeContentCrossings,
  identifyContentGaps,
  calculateCoveragePercentage,
} from '../services/contentCrossingService'

interface ContentCrossingViewProps {
  contestId: string
  userId: string
}

export function ContentCrossingView({ contestId, userId }: ContentCrossingViewProps) {
  const [crossings, setCrossings] = useState<any[]>([])
  const [gaps, setGaps] = useState<any[]>([])
  const [coverage, setCoverage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [contestId, userId])

  async function loadData() {
    try {
      setIsLoading(true)
      const [crossingsData, gapsData, coverageData] = await Promise.all([
        analyzeContentCrossings(contestId, userId),
        identifyContentGaps(contestId, userId),
        calculateCoveragePercentage(contestId, userId),
      ])

      setCrossings(crossingsData)
      setGaps(gapsData)
      setCoverage(coverageData)
    } catch (error) {
      console.error('Error loading crossing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-zinc-400">Carregando análise...</div>
  }

  return (
    <div className="space-y-6">
      {/* Coverage Overview */}
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Cobertura de Conteúdo
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-300">Tópicos Cobertos</span>
              <span className="text-2xl font-bold text-indigo-400">
                {coverage?.coverage}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
                style={{ width: `${coverage?.coverage}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              {coverage?.coveredTopics} de {coverage?.totalTopics} tópicos
              {coverage?.gaps > 0 && (
                <span className="text-yellow-400 ml-2">
                  ({coverage?.gaps} lacunas)
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* High Priority Topics (crossings) */}
      {crossings.length > 0 && (
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Tópicos de Alta Prioridade
          </h3>

          <div className="space-y-3">
            {crossings.slice(0, 10).map((crossing) => (
              <div
                key={crossing.topicId}
                className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-white">{crossing.topicName}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Presente em {crossing.editorialsCount} edital
                      {crossing.editorialsCount > 1 ? 'is' : ''}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
                  >
                    {crossing.averageRelevance}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Content Gaps */}
      {gaps.length > 0 && (
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Lacunas de Conteúdo ({gaps.length})
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gaps.map((gap) => (
              <div
                key={gap.topicId}
                className="p-2 rounded text-sm bg-white/5 hover:bg-white/[0.08] transition-colors"
              >
                <p className="text-white">{gap.topicName}</p>
                <p className="text-xs text-zinc-500">{gap.subjectName}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-400 mt-4 p-3 bg-orange-500/10 rounded border border-orange-500/20">
            Dica: Mapeie esses tópicos para seus editais para melhorar a cobertura
          </p>
        </Card>
      )}

      {crossings.length === 0 && gaps.length === 0 && (
        <div className="text-center py-8 text-zinc-400">
          <p>Nenhuma análise disponível. Adicione editais e mapeie conteúdos primeiro.</p>
        </div>
      )}
    </div>
  )
}
