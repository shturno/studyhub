export interface EditorialItem {
  id: string
  userId: string
  contestId: string
  title: string
  description?: string
  url?: string
  uploadedAt: Date
  contentMappings?: ContentMapping[]
}

export interface ContentMapping {
  id: string
  editorialItemId: string
  topicId: string
  contentSummary?: string
  relevance: number
  createdAt: Date
}

export interface EditorialWithMappings extends EditorialItem {
  contentMappings: ContentMapping[]
  contest: {
    id: string
    name: string
  }
}
