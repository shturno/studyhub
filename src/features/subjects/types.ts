export interface SubjectStats {
    id: string
    name: string
    topicsCount: number
    completedTopics: number
    progress: number
    totalMinutesStudied: number
}

export interface TopicWithStatus {
    id: string
    name: string
    status: 'pending' | 'studied' | 'mastered'
    lastStudiedAt?: Date
    xpEarned: number
    parentId: string | null
}
