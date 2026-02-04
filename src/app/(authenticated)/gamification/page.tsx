import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/features/gamification/actions"
import { AchievementCard } from "@/features/gamification/components/AchievementCard"
import { XPBadge } from "@/features/gamification/components/XPBadge"
import { Trophy, Zap, Clock } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function GamificationPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const profile = await getUserProfile(session.user.id)

    if (!profile) {
        return <div className="p-8 text-white">Perfil não encontrado.</div>
    }

    const { user, achievements, stats } = profile

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Conquistas & Progresso</h1>
                    <p className="text-zinc-400">Acompanhe sua evolução e desbloqueie recompensas.</p>
                </div>
                <XPBadge currentXP={user.xp} currentLevel={user.level} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-card border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
                        <div className="text-sm text-zinc-500">Sessões Totais</div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.totalHours}h</div>
                        <div className="text-sm text-zinc-500">Horas de Estudo</div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">{stats.xpToNextLevel} XP</div>
                        <div className="text-sm text-zinc-500">Para o Próximo Nível</div>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Conquistas
                    <span className="text-sm font-normal text-zinc-500 ml-2">
                        ({achievements.filter((a: any) => a.isUnlocked).length} / {achievements.length})
                    </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement: any) => (
                        <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}

                    {achievements.length === 0 && (
                        <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                            Nenhuma conquista disponível no sistema ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
