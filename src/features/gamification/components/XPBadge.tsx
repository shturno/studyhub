'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Trophy } from 'lucide-react'
import { getLevelProgress } from '../utils/xpCalculator'

interface XPBadgeProps {
    currentXP: number
    currentLevel: number
    className?: string
}

export function XPBadge({ currentXP, currentLevel, className }: XPBadgeProps) {
    const progress = getLevelProgress(currentXP, currentLevel)
    const nextLevelXP = currentLevel < 25 ? (currentLevel * (currentLevel + 1) * 50) : Infinity
    const xpToNext = nextLevelXP - currentXP

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`flex items-center gap-3 ${className}`}>
                        <Badge
                            variant="outline"
                            className="px-3 py-1.5 bg-xp-gold/10 border-xp-gold text-xp-gold font-semibold"
                        >
                            <Trophy className="h-4 w-4 mr-1.5" />
                            Lvl {currentLevel}
                        </Badge>

                        <div className="flex-1 min-w-[120px] space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{currentXP} XP</span>
                                <span className="text-muted-foreground">{nextLevelXP} XP</span>
                            </div>
                            <Progress
                                value={progress}
                                className="h-2 bg-muted"
                                indicatorClassName="bg-gradient-to-r from-xp-gold to-xp-glow"
                            />
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-semibold">Faltam {xpToNext} XP para o próximo nível</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Progresso: {progress}%
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
