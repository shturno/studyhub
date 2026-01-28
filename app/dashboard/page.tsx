import { Trophy, Zap, Target, BookOpen, Clock, ArrowUpRight, Flame } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ReactChild, ReactFragment, ReactPortal, Key } from 'react'

export const dynamic = 'force-dynamic' // Ensure real-time data

export default async function DashboardPage() {
  // 1. Fetch User (MVP: First user - assumes seed ran)
  const user = await prisma.user.findFirst({
    include: {
      studySessions: {
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: { topic: { include: { subject: true } } }
      }
    }
  })

  // If no user found, show simple empty state
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0e] text-zinc-400 gap-4">
        <h1 className="text-xl text-white font-bold">Nenhum Usuário Encontrado</h1>
        <p>Parece que o banco de dados está vazio.</p>
        <code className="bg-zinc-900 px-4 py-2 rounded">npm run db:seed</code>
      </div>
    )
  }

  // 2. Fetch Next Topic Strategy (MVP: Random topic from first subject)
  // In V2 this will be the "Smart Cycle Algo"
  const randomTopic = await prisma.topic.findFirst({
    include: { subject: true }
  })

  // Data processing
  const recentSessions = user.studySessions

  // Calculate Streak (Mock logic for MVP - real logic needs complex query)
  const streak = 12 // Hardcoded for now until we add Streak Logic feature

  return (
    // Background #0c0c0e (Very Dark)
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 selection:bg-indigo-500/30">

      {/* Background Noise Texture */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-white text-black font-bold text-xs shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              S
            </div>
            <span className="font-medium text-sm text-zinc-200">StudyHub</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#27272a] border border-orange-500/20 text-orange-400">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span className="text-xs font-bold">{streak} dias</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <span className="text-indigo-400">Lvl {user.level}</span>
              <span>{user.xp} XP</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#27272a] border border-white/10 flex items-center justify-center text-xs text-zinc-400 cursor-pointer hover:bg-zinc-700 transition-colors uppercase font-bold">
              {user.name?.[0] || 'U'}
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Section 1: Focus / Action */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* PRIMARY ACTION CARD - Clear Grey: #27272a */}
          <div className="md:col-span-2 relative group rounded-2xl bg-[#27272a] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden hover:border-indigo-500/30 transition-colors duration-500">
            {/* Subtle interactive hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative p-8 h-full flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                    <Target className="w-3 h-3" />
                    Current Focus
                  </span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    25:00 MIN
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-2 group-hover:text-indigo-50 transition-colors">
                  {randomTopic?.subject.name || 'Nova Matéria'}
                </h2>
                <p className="text-lg text-zinc-400 font-medium tracking-tight">
                  {randomTopic?.name || 'Escolha um tópico para começar'}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-8">
                {/* Primary Button with Real Link */}
                {randomTopic ? (
                  <Link href={`/study/${randomTopic.id}`}>
                    <button className="relative h-12 px-8 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-[0.98]">
                      <Zap className="w-4 h-4 fill-white" />
                      START SESSION
                    </button>
                  </Link>
                ) : (
                  <button disabled className="relative h-12 px-8 bg-zinc-700 text-zinc-400 text-sm font-bold rounded-xl cursor-not-allowed">
                    Sem Matérias
                  </button>
                )}

                <button className="h-12 px-6 text-zinc-400 text-sm font-medium hover:text-white transition-colors">
                  Skip Topic
                </button>
              </div>
            </div>
          </div>

          {/* Stats Column */}
          <div className="space-y-4">
            {/* Stat Item - Streak - #27272a */}
            <div className="p-5 rounded-2xl bg-[#27272a] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame className="w-16 h-16 text-orange-500" />
              </div>

              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-orange-400 transition-colors">Streak</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-white">{streak}</span>
                  <span className="text-sm text-zinc-500">days</span>
                </div>
                <div className="w-full bg-zinc-800/50 h-1.5 mt-4 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[80%] shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                </div>
              </div>
            </div>

            {/* Stat Item - XP - #27272a */}
            <div className="p-5 rounded-2xl bg-[#27272a] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>

              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Trophy className="w-4 h-4 fill-yellow-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-yellow-400 transition-colors">Total XP</span>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">{user.xp}</span>
                <span className="text-sm text-zinc-500">points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Command Center / Recent */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Recent Activity</h3>
            <button className="text-xs text-zinc-500 hover:text-white transition-colors">View All</button>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#27272a] overflow-hidden">
            {recentSessions.length > 0 ? (
              recentSessions.map((session: { topic: { name: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; subject: { name: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined } }; xpEarned: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; completedAt: string | number | Date }, i: Key | null | undefined) => (
                <div key={i} className="group flex items-center justify-between p-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
                      <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{session.topic.name}</div>
                      <div className="text-xs text-zinc-500 font-medium">{session.topic.subject.name} (+{session.xpEarned} XP)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-xs font-mono text-zinc-600 font-medium">
                      {formatDistanceToNow(new Date(session.completedAt), { addSuffix: true, locale: ptBR })}
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500">
                Nenhuma atividade recente. Comece sua primeira sessão!
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
