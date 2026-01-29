export interface Review {
    id: string
    topicId: string
    scheduledFor: Date
    completed: boolean
    difficulty?: number
}

export interface ReviewSchedule {
    intervals: number[] // dias: [1, 3, 7, 15, 30]
    nextReviewDate: Date
}

export type ReviewDifficulty = 1 | 2 | 3 | 4 | 5
