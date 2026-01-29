import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'

interface AchievementCardProps {
    achievement: {
        name: string
        description: string
        icon: string
        xpReward: number
        isUnlocked: boolean
        unlockedAt: Date | null
    }
}

export function AchievementCard({ achievement }: AchievementCardProps) {
    return (
        <div className={cn(
            "relative p-4 rounded-xl border transition-all duration-300 group overflow-hidden",
            achievement.isUnlocked
                ? "bg-card border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : "bg-zinc-900/50 border-white/5 opacity-60 grayscale hover:opacity-80"
        )}>
            {achievement.isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            )}

            <div className="flex items-start gap-4 relative z-10">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-inner",
                    achievement.isUnlocked ? "bg-zinc-800 border border-white/10" : "bg-zinc-950 border border-white/5"
                )}>
                    {achievement.isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-zinc-600" />}
                </div>

                <div className="flex-1">
                    <h3 className={cn(
                        "font-bold text-sm mb-1",
                        achievement.isUnlocked ? "text-white" : "text-zinc-500"
                    )}>
                        {achievement.name}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                        {achievement.description}
                    </p>

                    {achievement.isUnlocked ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 uppercase tracking-widest">
                                Desbloqueado
                            </span>
                            <span className="text-[10px] text-zinc-600 font-mono">
                                +{achievement.xpReward} XP
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50 uppercase tracking-widest">
                                Bloqueado
                            </span>
                            <span className="text-[10px] text-zinc-600 font-mono">
                                {achievement.xpReward} XP
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
