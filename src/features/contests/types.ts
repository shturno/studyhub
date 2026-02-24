export interface ContestFormData {
    name: string
    institution: string
    role: string
    examDate?: Date
    isPrimary: boolean
}

export interface SubjectFormData {
    name: string
    weight: number
    userLevel: number
}

export interface TopicFormData {
    name: string
    description?: string
}

export interface Subject {
    id: string
    contestId: string
    name: string
    weight: number
    userLevel: number
}

export interface Topic {
    id: string
    subjectId: string
    name: string
    description?: string | null
    parentId?: string | null
}
