import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/features/gamification/actions"
import { AchievementCard } from "@/features/gamification/components/AchievementCard"
import { XPBadge } from "@/features/gamification/components/XPBadge"
import { Zap, Clock, Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function GamificationPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const profile = await getUserProfile()

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="font-pixel text-[#7f7f9f] text-sm">PERFIL NAO ENCONTRADO</div>
            </div>
        )
    }

    const { user, achievements, stats } = profile

    const unlockedCount = (achievements as { isUnlocked: boolean }[]).filter((a) => a.isUnlocked).length

    return (
        <div className="min-h-screen bg-[#080010] p-4 md:p-6 max-w-5xl mx-auto space-y-6">

            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4"
                style={{ borderBottom: '2px solid rgba(0,255,65,0.2)' }}>
                <div>
                    <div className="font-pixel text-[#00ff41] text-sm mb-1"
                        style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
                        CONQUISTAS
                    </div>
                    <div className="font-mono text-xl text-[#7f7f9f]">
                        Acompanhe sua evolução e desbloqueie recompensas.
                    </div>
                </div>
                <XPBadge currentXP={user.xp} currentLevel={user.level} />
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { icon: <Zap className="w-5 h-5 text-[#00f5ff]" />, value: stats.totalSessions, label: 'SESSOES', color: '#00f5ff' },
                    { icon: <Clock className="w-5 h-5 text-[#00ff41]" />, value: `${stats.totalHours}h`, label: 'HORAS', color: '#00ff41' },
                    { icon: <Trophy className="w-5 h-5 text-[#ffbe0b]" />, value: `${stats.xpToNextLevel}`, label: 'XP PRX NIVEL', color: '#ffbe0b' },
                ].map((stat) => (
                    <div key={stat.label} className="p-5 flex items-center gap-4"
                        style={{ border: `2px solid ${stat.color}30`, background: '#04000a' }}>
                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                            style={{ border: `2px solid ${stat.color}40`, background: `${stat.color}0a` }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="font-pixel text-xl" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="font-pixel text-[7px] text-[#7f7f9f] mt-1">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <span className="font-pixel text-[8px] text-[#ffbe0b]">── CONQUISTAS ──</span>
                    <span className="font-pixel text-[7px] text-[#7f7f9f]">
                        {unlockedCount}/{achievements.length} DESBLOQUEADAS
                    </span>
                </div>

                {achievements.length === 0 ? (
                    <div className="py-12 text-center font-pixel text-[8px] text-[#555]"
                        style={{ border: '2px dashed #333' }}>
                        NENHUMA CONQUISTA DISPONIVEL AINDA
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(achievements as Array<{
                            id: string; name: string; description: string
                            icon: string; xpReward: number; isUnlocked: boolean; unlockedAt: Date | null
                        }>).map((achievement) => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
