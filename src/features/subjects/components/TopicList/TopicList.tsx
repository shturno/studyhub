"use client";

import { TopicItem } from "./TopicItem";
import type { TopicListProps, TopicNode } from "./types";
import type { TopicWithStatus } from "@/features/subjects/types";

function buildTree(topics: TopicWithStatus[]): TopicNode[] {
  const map = new Map<string, TopicNode>();
  const roots: TopicNode[] = [];

  topics.forEach((topic) => {
    map.set(topic.id, { ...topic, children: [] });
  });

  topics.forEach((topic) => {
    const node = map.get(topic.id)!;
    if (topic.parentId && map.has(topic.parentId)) {
      map.get(topic.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function TopicList({ topics }: TopicListProps) {
  const tree = buildTree(topics);

  return (
    <div className="space-y-2">
      {tree.map((node) => (
        <TopicItem key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}
