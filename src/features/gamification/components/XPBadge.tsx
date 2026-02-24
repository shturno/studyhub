'use client'

import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getLevelProgress } from '../utils/xpCalculator'

interface XPBadgeProps {
    readonly currentXP: number
    readonly currentLevel: number
    readonly className?: string
}

export function XPBadge({ currentXP, currentLevel, className }: XPBadgeProps) {
    const progress = getLevelProgress(currentXP, currentLevel)
    const nextLevelXP = currentLevel < 25 ? (currentLevel * (currentLevel + 1) * 50) : Infinity
    const xpToNext = nextLevelXP === Infinity ? 0 : nextLevelXP - currentXP

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`flex items-center gap-4 ${className ?? ''}`}>

                        
                        <div className="flex items-center gap-2 px-3 py-1.5"
                            style={{ border: '2px solid #ffbe0b', background: 'rgba(255,190,11,0.1)' }}>
                            <span className="font-pixel text-[8px] text-[#ffbe0b]">LVL</span>
                            <span className="font-pixel text-sm text-[#ffbe0b]"
                                style={{ textShadow: '0 0 10px rgba(255,190,11,0.8)' }}>
                                {currentLevel.toString().padStart(2, '0')}
                            </span>
                        </div>

                        
                        <div className="flex-1 min-w-[120px] space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-pixel text-[6px] text-[#7f7f9f]">{currentXP} XP</span>
                                <span className="font-pixel text-[6px] text-[#7f7f9f]">
                                    {nextLevelXP === Infinity ? 'MAX' : `${nextLevelXP} XP`}
                                </span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent style={{ border: '2px solid #ffbe0b', background: '#04000a', borderRadius: 0 }}>
                    <p className="font-pixel text-[7px] text-[#ffbe0b]">
                        {xpToNext > 0 ? `${xpToNext} XP para o próximo nível` : 'Nível máximo!'}
                    </p>
                    <p className="font-mono text-sm text-[#7f7f9f] mt-1">
                        Progresso: {progress}%
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
