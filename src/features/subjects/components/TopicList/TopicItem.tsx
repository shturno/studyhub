"use client";

import {
  Play,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import { useTopicItem } from "./useTopicItem";
import { QuestionPractice } from "@/features/topics/components/QuestionPractice";
import type { TopicItemProps } from "./types";

export function TopicItem({ node, level }: TopicItemProps) {
  const hasChildren = node.children.length > 0;
  const [showQuestions, setShowQuestions] = useState(false);
  const {
    isOpen,
    setIsOpen,
    isAddOpen,
    setIsAddOpen,
    newTopicName,
    setNewTopicName,
    handleAddSubTopic,
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    isSaving,
    handleSaveEdit,
    handleCancelEdit,
    optimisticStatus,
    isMarking,
    handleMarkStudied,
  } = useTopicItem(node.id, node.name, node.status);

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

          {optimisticStatus === "mastered" && (
            <CheckCircle2 className="w-4 h-4" style={{ color: "#00ff41" }} />
          )}
          {optimisticStatus === "studied" && (
            <CheckCircle2 className="w-4 h-4" style={{ color: "#7b61ff" }} />
          )}
          {optimisticStatus === "pending" && (
            <button
              onClick={() => void handleMarkStudied()}
              disabled={isMarking}
              title="Marcar como visto"
              className="text-[#333] hover:text-[#7b61ff] transition-colors disabled:opacity-50"
            >
              <Circle className="w-4 h-4" />
            </button>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="font-mono text-base text-[#e0e0ff] bg-transparent border-b border-[#00ff41] outline-none flex-1"
              />
              <button
                onClick={() => void handleSaveEdit()}
                disabled={isSaving}
                className="font-pixel text-[7px] text-[#00ff41] hover:bg-[#00ff41]/10 px-2 py-1"
              >
                {isSaving ? "..." : "✓"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="font-pixel text-[7px] text-[#ff006e] hover:bg-[#ff006e]/10 px-2 py-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="font-mono text-base text-[#e0e0ff] group-hover:text-white transition-colors">
              {node.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title="Renomear"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
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

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQuestions(true)}
            title="Praticar questões"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            QUESTÕES
          </Button>
        </div>
      </div>

      {showQuestions && (
        <QuestionPractice
          topicId={node.id}
          topicName={node.name}
          onClose={() => setShowQuestions(false)}
        />
      )}

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
