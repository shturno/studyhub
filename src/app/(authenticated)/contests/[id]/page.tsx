import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { EditorialManager } from '@/features/editorials/components/EditorialManager'
import { ContentCrossingView } from '@/features/editorials/components/ContentCrossingView'

export const metadata: Metadata = {
  title: 'Detalhes do Concurso | StudyHub',
  description: 'Veja detalhes e gerencie seus editais',
}

interface ContestDetailPageProps {
  readonly params: Promise<{ id: string }>
}

export default async function ContestDetailPage(props: ContestDetailPageProps) {
  const params = await props.params
  const session = await auth()
  if (!session?.user?.id) {
    return notFound()
  }

  const contest = await prisma.contest.findUnique({
    where: { id: params.id },
    include: {
      subjects: {
        include: {
          topics: true,
        },
      },
      editorialItems: {
        include: {
          contentMappings: true,
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
    <div className="min-h-screen bg-[#080010] text-[#e0e0ff]">

      <div className="px-4 md:px-8 pt-6 pb-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/contests"
            className="flex items-center gap-2 text-[#7f7f9f] hover:text-[#00ff41] transition-colors font-pixel text-[8px]">
            <ArrowLeft className="w-4 h-4" />
            VOLTAR
          </Link>
        </div>

        <div className="p-5" style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a', boxShadow: '4px 4px 0 rgba(0,255,65,0.1)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-mono text-2xl text-[#e0e0ff] mb-1">{contest.name}</div>
              <div className="flex items-center gap-2 font-mono text-base text-[#7f7f9f]">
                <Building2 className="w-3.5 h-3.5" />
                <span>{contest.institution}</span>
                <span className="text-[#333]">·</span>
                <span>{contest.role}</span>
              </div>
            </div>
            {contest.isPrimary && <Badge variant="gold">★ FOCO PRINCIPAL</Badge>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'DATA DA PROVA',
                value: contest.examDate ? new Date(contest.examDate).toLocaleDateString('pt-BR') : 'Não definida',
                icon: <Calendar className="w-3.5 h-3.5" />,
              },
              { label: 'DISCIPLINAS', value: String(contest.subjects.length), icon: null },
              { label: 'TOPICOS', value: String(totalTopics), icon: null },
              { label: 'EDITAIS', value: String(contest.editorialItems.length), icon: null },
            ].map((stat) => (
              <div key={stat.label} className="p-3" style={{ border: '1px solid rgba(0,255,65,0.2)', background: '#020008' }}>
                <div className="font-pixel text-[6px] text-[#7f7f9f] mb-1 flex items-center gap-1">
                  {stat.icon}
                  {stat.label}
                </div>
                <div className="font-pixel text-sm text-[#00ff41]">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="px-4 md:px-8 py-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <div className="p-5 sticky top-24" style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a' }}>
              <EditorialManager contestId={contest.id} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-5" style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a' }}>
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(0,255,65,0.2)' }}>
                <BookOpen className="w-4 h-4 text-[#00ff41]" />
                <span className="font-pixel text-[8px] text-[#00ff41]">ANALISE DE CONTEUDO</span>
              </div>
              <ContentCrossingView editorials={contest.editorialItems as Parameters<typeof ContentCrossingView>[0]['editorials']} />
            </div>
          </div>
        </div>

        {contest.subjects.length > 0 && (
          <div className="p-5 mt-4" style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a' }}>
            <div className="font-pixel text-[8px] text-[#00ff41] mb-4">DISCIPLINAS</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contest.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-4"
                  style={{ border: '1px solid rgba(0,255,65,0.2)', background: '#020008' }}
                >
                  <div className="font-mono text-base text-[#e0e0ff] mb-1">{subject.name}</div>
                  <div className="font-mono text-sm text-[#555] mb-2">
                    {subject.topics.length} tópico{subject.topics.length === 1 ? '' : 's'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subject.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic.id} variant="secondary">{topic.name}</Badge>
                    ))}
                    {subject.topics.length > 3 && (
                      <Badge variant="outline">+{subject.topics.length - 3}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
