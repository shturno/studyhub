export interface EditorialItem {
  id: string;
  userId: string;
  contestId: string;
  title: string;
  description?: string | null;
  url?: string | null;
  uploadedAt: Date;
  contentMappings?: ContentMapping[];
}

export interface ContentMapping {
  id: string;
  editorialItemId: string;
  topicId: string;
  contentSummary?: string | null;
  relevance: number;
}

export interface EditorialWithMappings extends EditorialItem {
  contentMappings: ContentMapping[];
  contest: {
    id: string;
    name: string;
  };
}
