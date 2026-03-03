"use client";

import { useState } from "react";
import {
  Play,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TopicWithStatus } from "../types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TopicNode extends TopicWithStatus {
  children: TopicNode[];
}

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

export function TopicList({ topics }: { readonly topics: TopicWithStatus[] }) {
  const tree = buildTree(topics);

  return (
    <div className="space-y-2">
      {tree.map((node) => (
        <TopicItem key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}

function TopicItem({
  node,
  level,
}: {
  readonly node: TopicNode;
  readonly level: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  async function handleAddSubTopic() {
    if (!newTopicName) return;
    setIsAddOpen(false);
    setNewTopicName("");
  }

  return (
    <div className={cn("space-y-2", level > 0 && "ml-6")}>
      <div
        className="group flex items-center justify-between p-3 transition-all duration-100"
        style={{
          border: `1px solid ${level > 0 ? "rgba(0,255,65,0.2)" : "rgba(0,255,65,0.35)"}`,
          background: "#04000a",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-1 text-[#555] hover:text-[#00ff41] transition-colors",
              !hasChildren && "invisible",
            )}
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {node.status === "mastered" && (
            <CheckCircle2 className="w-4 h-4" style={{ color: "#00ff41" }} />
          )}
          {node.status === "studied" && (
            <CheckCircle2 className="w-4 h-4" style={{ color: "#7b61ff" }} />
          )}
          {node.status !== "mastered" && node.status !== "studied" && (
            <Circle className="w-4 h-4 text-[#333] group-hover:text-[#555] transition-colors" />
          )}

          <span className="font-mono text-base text-[#e0e0ff] group-hover:text-white transition-colors">
            {node.name}
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Adicionar Sub-tópico"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ADICIONAR SUB-TOPICO</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sub-name">NOME</Label>
                  <Input
                    id="sub-name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="Ex: Juros Compostos"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSubTopic}>SALVAR</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href={`/study/${node.id}`}>
            <Button size="sm">
              <Play className="w-3.5 h-3.5 mr-1.5" />
              ESTUDAR
            </Button>
          </Link>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <TopicItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
