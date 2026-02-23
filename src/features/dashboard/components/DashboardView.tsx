'use client'

import { Trophy, Zap, Target, BookOpen, Clock, ArrowUpRight, Flame } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { DashboardData } from '../services/dashboardService'

import { GlassCard } from "@/components/ui/glass-card"

interface DashboardViewProps {
    data: DashboardData
    contests?: { id: string; name: string }[]
}

export function DashboardView({ data, contests = [] }: DashboardViewProps) {
    const { user, randomTopic, recentSessions, streak } = data

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-zinc-400 gap-4">
                <h1 className="text-xl text-white font-bold">Nenhum Usuário Encontrado</h1>
                <p>Parece que o banco de dados está vazio.</p>
                <code className="bg-zinc-900 px-4 py-2 rounded">npm run db:seed</code>
            </div>
        )
    }

    // Show empty state if no contests
    if (contests.length === 0) {
        return (
            <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
                <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                
                <main className="relative max-w-3xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen">
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
                            <Target className="w-10 h-10 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Bem-vindo ao StudyHub!</h1>
                            <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto">
                                Comece criando seu primeiro concurso para organizar seus estudos e acompanhar seu progresso.
                            </p>
                        </div>
                        <Link href="/contests">
                            <button className="relative h-12 px-8 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-[0.98] mx-auto">
                                <Zap className="w-4 h-4 fill-white" />
                                Criar Primeiro Concurso
                            </button>
                        </Link>
                        <p className="text-sm text-zinc-500 pt-4">
                            Você poderá adicionar múltiplos editais e criar um cronograma personalizado.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
            {/* Background Noise Texture */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

            {/* Header */}
            {/* Header Removed - Handled by Layout */}

            {/* Main Content */}
            <main className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Study Now Card + Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Study Now Card */}
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

                    {/* Streak Card */}
                    <GlassCard className="relative overflow-hidden group" hoverEffect>
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Flame className="w-16 h-16 text-orange-500" />
                        </div>

                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                                <Flame className="w-4 h-4 fill-orange-500" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-orange-400 transition-colors">Streak</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight text-foreground">{streak}</span>
                                <span className="text-sm text-zinc-500">days</span>
                            </div>
                            <div className="w-full bg-zinc-800/50 h-1.5 mt-4 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full w-[80%] shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* XP Card */}
                    <GlassCard className="relative overflow-hidden group" hoverEffect>
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy className="w-16 h-16 text-yellow-500" />
                        </div>

                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                                <Trophy className="w-4 h-4 fill-yellow-500" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-yellow-400 transition-colors">Total XP</span>
                        </div>
                        <div className="relative z-10 flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-foreground">{user.xp}</span>
                            <span className="text-sm text-zinc-500">points</span>
                        </div>
                    </GlassCard>

                    {/* Explore Subjects Card */}
                    <Link href="/subjects" className="block">
                        <GlassCard className="relative overflow-hidden group hover:border-brand-primary/50" hoverEffect>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-indigo-400 transition-colors">Explorar</span>
                            </div>
                            <div className="text-lg font-bold text-zinc-200 group-hover:text-white">Meus Conteúdos &rarr;</div>
                        </GlassCard>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-zinc-400">Recent Activity</h3>
                        <button className="text-xs text-zinc-500 hover:text-white transition-colors">View All</button>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-card overflow-hidden">
                        {recentSessions.length > 0 ? (
                            recentSessions.map((session) => (
                                <div key={session.id} className="group flex items-center justify-between p-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
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
