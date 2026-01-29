export interface Topic {
    id: string
    name: string
    description?: string
    subjectId: string
    subject?: {
        id: string
        name: string
    }
}

export interface TopicFormData {
    name: string
    description?: string
    subjectId: string
}
