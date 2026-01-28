// XP and Level Calculation Utilities

export const XP_PER_MINUTE = 10

export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2 (10 min)
    300,    // Level 3 (30 min total)
    600,    // Level 4 (60 min total)
    1000,   // Level 5 (100 min total)
    1500,   // Level 6
    2100,   // Level 7
    2800,   // Level 8
    3600,   // Level 9
    4500,   // Level 10
    5500,   // Level 11
    6600,   // Level 12
    7800,   // Level 13
    9100,   // Level 14
    10500,  // Level 15
    12000,  // Level 16
    13600,  // Level 17
    15300,  // Level 18
    17100,  // Level 19
    19000,  // Level 20
    21000,  // Level 21
    23100,  // Level 22
    25300,  // Level 23
    27600,  // Level 24
    30000,  // Level 25
]

/**
 * Calculate XP earned for a given number of minutes studied
 */
export function calculateXP(minutes: number): number {
    return minutes * XP_PER_MINUTE
}

/**
 * Calculate level based on total XP
 */
export function calculateLevel(totalXP: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_THRESHOLDS[i]) {
            return i + 1
        }
    }
    return 1
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentXP: number, currentLevel: number): number {
    const nextLevelXP = LEVEL_THRESHOLDS[currentLevel] || Infinity
    return nextLevelXP - currentXP
}

/**
 * Get progress percentage to next level
 */
export function getLevelProgress(currentXP: number, currentLevel: number): number {
    if (currentLevel >= LEVEL_THRESHOLDS.length) return 100

    const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1]
    const nextLevelXP = LEVEL_THRESHOLDS[currentLevel]
    const xpInCurrentLevel = currentXP - currentLevelXP
    const xpNeededForLevel = nextLevelXP - currentLevelXP

    return Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100)
}
