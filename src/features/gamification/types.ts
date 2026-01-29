export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    xpRequired: number
    unlockedAt?: Date
}

export interface XPGain {
    amount: number
    source: 'study_session' | 'achievement' | 'streak' | 'review'
    description: string
}

export interface LevelInfo {
    currentLevel: number
    currentXP: number
    xpForNextLevel: number
    progress: number // 0-100
}
