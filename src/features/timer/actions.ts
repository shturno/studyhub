'use server'

import { prisma } from '@/lib/prisma'
import { calculateXP, calculateLevel, getXPForNextLevel } from '@/features/gamification/utils/xpCalculator'
import { revalidatePath } from 'next/cache'

export interface SaveStudySessionInput {
    topicId: string
    minutes: number
    difficulty: number | null
}

export interface SaveStudySessionResult {
    sessionId: string
    xpEarned: number
    newLevel: number
    leveledUp: boolean
    xpToNextLevel: number
}

export async function saveStudySession(data: SaveStudySessionInput): Promise<SaveStudySessionResult> {
    // TODO: Get userId from auth session
    const userId = 'temp-user-id' // Replace with actual auth

    const xpEarned = calculateXP(data.minutes)

    // Create study session
    const session = await prisma.studySession.create({
        data: {
            userId,
            topicId: data.topicId,
            minutes: data.minutes,
            xpEarned,
            difficulty: data.difficulty
        }
    })

    // Update user XP
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: xpEarned }
        }
    })

    // Calculate new level
    const newLevel = calculateLevel(user.xp)
    const leveledUp = newLevel > user.level

    // Update level if leveled up
    if (leveledUp) {
        await prisma.user.update({
            where: { id: userId },
            data: { level: newLevel }
        })
    }

    const xpToNextLevel = getXPForNextLevel(user.xp, newLevel)

    // Revalidate dashboard
    revalidatePath('/dashboard')

    return {
        sessionId: session.id,
        xpEarned,
        newLevel,
        leveledUp,
        xpToNextLevel
    }
}

export async function updateSessionDifficulty(sessionId: string, difficulty: number) {
    await prisma.studySession.update({
        where: { id: sessionId },
        data: { difficulty }
    })

    revalidatePath('/dashboard')
}
