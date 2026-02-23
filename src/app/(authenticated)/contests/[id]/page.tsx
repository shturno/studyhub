import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { EditorialManager } from '@/features/editorials/components/EditorialManager'
import { ContentCrossingView } from '@/features/editorials/components/ContentCrossingView'
import type { EditorialWithMappings } from '@/features/editorials/types'

export const metadata: Metadata = {
  title: 'Detalhes do Concurso | StudyHub',
  description: 'Veja detalhes e gerencie seus editais',
}

interface ContestDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return notFound()
  }

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      subjects: {
        include: {
          topics: true,
        },
      },
      editorialItems: {
        include: {
          contentMappings: true,
          contest: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  if (!contest || contest.userId !== session.user.id) {
    return notFound()
  }

  const totalTopics = contest.subjects.reduce(
    (sum, subject) => sum + subject.topics.length,
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/[0.08] bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/contests">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              S
            </div>
            <span className="font-bold text-lg text-white">StudyHub</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Contest Header */}
        <Card className="p-8 bg-gradient-to-br from-white/[0.08] to-white/[0.04] border-white/[0.08] mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{contest.name}</h1>
              <div className="flex items-center gap-2 text-zinc-400">
                <Building2 className="w-4 h-4" />
                <span>{contest.institution}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>{contest.role}</span>
              </div>
            </div>
            {contest.isPrimary && (
              <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-0">
                Foco Principal
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Data da Prova</p>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">
                  {contest.examDate
                    ? new Date(contest.examDate).toLocaleDateString('pt-BR')
                    : 'Não definida'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Disciplinas</p>
              <p className="text-2xl font-bold text-indigo-400">
                {contest.subjects.length}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Total de Tópicos</p>
              <p className="text-2xl font-bold text-indigo-400">{totalTopics}</p>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-zinc-400 mb-1">Editais Adicionados</p>
              <p className="text-2xl font-bold text-indigo-400">
                {contest.editorialItems.length}
              </p>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Editorial Manager */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/5 border-white/10 sticky top-24">
              <EditorialManager contestId={contest.id} />
            </Card>
          </div>

          {/* Right: Content Crossing Analysis */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/5 border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                Análise de Conteúdo
              </h2>
              <ContentCrossingView editorials={contest.editorialItems} />
            </Card>
          </div>
        </div>

        {/* Subjects Section */}
        {contest.subjects.length > 0 && (
          <Card className="p-6 bg-white/5 border-white/10 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Disciplinas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contest.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                >
                  <h3 className="font-semibold text-white mb-2">{subject.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {subject.topics.length} tópico{subject.topics.length !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subject.topics.slice(0, 3).map((topic) => (
                      <Badge
                        key={topic.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {topic.name}
                      </Badge>
                    ))}
                    {subject.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{subject.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
