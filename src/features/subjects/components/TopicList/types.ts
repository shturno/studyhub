import type { TopicWithStatus } from "@/features/subjects/types";

export interface TopicListProps {
  readonly topics: TopicWithStatus[];
}

export interface TopicNode extends TopicWithStatus {
  children: TopicNode[];
}

export interface TopicItemProps {
  readonly node: TopicNode;
  readonly level: number;
}
