import { prisma } from '@/lib/prisma'
import type { LevelInfo } from '../types'

/**
 * Calcula o nível baseado no XP total
 */
export function calculateLevel(xp: number): number {
    // Fórmula: Level = floor(sqrt(XP / 100))
    // Nível 1: 0-99 XP
    // Nível 2: 100-399 XP
    // Nível 3: 400-899 XP
    // etc.
    return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Calcula XP necessário para o próximo nível
 */
export function xpForLevel(level: number): number {
    // Inverso da fórmula: XP = (level - 1)^2 * 100
    return Math.pow(level - 1, 2) * 100
}

/**
 * Retorna informações sobre o nível atual do usuário
 */
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

/**
 * Adiciona XP ao usuário e retorna se houve level up
 */
export async function awardXP(userId: string, amount: number, source: string): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
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
