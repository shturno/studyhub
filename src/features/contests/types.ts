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
