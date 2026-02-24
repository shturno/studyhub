import { prisma } from '@/lib/prisma'
import type { LevelInfo } from '../types'

export function calculateLevel(xp: number): number {

    return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpForLevel(level: number): number {

    return Math.pow(level - 1, 2) * 100
}

export function getLevelInfo(currentXP: number): LevelInfo {
    const currentLevel = calculateLevel(currentXP)
    const xpForCurrentLevel = xpForLevel(currentLevel)
    const xpForNextLevel = xpForLevel(currentLevel + 1)
    const xpNeeded = xpForNextLevel - xpForCurrentLevel
    const xpProgress = currentXP - xpForCurrentLevel
    const progress = Math.floor((xpProgress / xpNeeded) * 100)

    return {
        currentLevel,
        currentXP,
        xpForNextLevel: xpForNextLevel,
        progress
    }
}

export async function awardXP(userId: string, amount: number): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true }
    })

    if (!user) {
        throw new Error('User not found')
    }

    const newXP = user.xp + amount
    const newLevel = calculateLevel(newXP)
    const leveledUp = newLevel > user.level

    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: newXP,
            level: newLevel
        }
    })

    return {
        leveledUp,
        newLevel,
        newXP
    }
}
