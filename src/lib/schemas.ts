import { z } from "zod"

/**
 * Schema for updating user profile and preferences (ADHD Settings)
 */
export const updateSettingsSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
    pomodoroDefault: z.number().min(5).max(120),
    breakDefault: z.number().min(1).max(60),
    dailyGoalMinutes: z.number().min(10).max(1440),
})

/**
 * Schema for logging a completed study session
 */
export const studySessionSchema = z.object({
    topicId: z.string().cuid(),
    minutes: z.number().min(1, "A sessão deve ter pelo menos 1 minuto"),
    difficulty: z.number().min(1).max(5).optional(), // 1 (Easy) - 5 (Hard)
    notes: z.string().max(500).optional(),
})

/**
 * Schema for creating a new custom topic/lesson
 */
export const createTopicSchema = z.object({
    subjectId: z.string().cuid(),
    name: z.string().min(3, "O nome do tópico deve ser claro").max(100),
    parentId: z.string().cuid().optional(), // For sub-lessons
})
