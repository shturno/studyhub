"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateSubject } from "@/features/subjects/actions";
import { useToast } from "@/hooks/use-toast";
import type { SubjectCardProps } from "./types";

export function SubjectCard({ subject }: SubjectCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subject.name);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setIsSaving(true);
    const result = await updateSubject(subject.id, { name: editName.trim() });
    if (result.success) {
      setIsEditing(false);
    } else {
      toast({ variant: "destructive", description: result.error });
      setEditName(subject.name);
    }
    setIsSaving(false);
  }

  function handleCancelEdit() {
    setEditName(subject.name);
    setIsEditing(false);
  }

  return (
    <div
      className="group relative h-full p-5 transition-all duration-100 hover:-translate-y-0.5 cursor-pointer"
      style={{
        border: "2px solid rgba(0,255,65,0.35)",
        background: "#04000a",
        boxShadow: "4px 4px 0px rgba(0,255,65,0.1)",
      }}
      onClick={() => !isEditing && router.push(`/subjects/${subject.id}`)}
    >
      <div className="flex justify-between items-center mb-3">
        <div
          className="w-10 h-10 flex items-center justify-center text-[#7f7f9f] group-hover:text-[#00ff41] group-hover:bg-[#00ff41]/10 transition-colors"
          style={{ border: "2px solid rgba(0,255,65,0.2)" }}
        >
          <span className="font-pixel text-xs">
            {subject.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#555] hover:text-[#00ff41]"
            title="Renomear"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <span className="font-pixel text-[8px] text-[#7f7f9f] group-hover:text-[#00ff41] transition-colors">
            ►
          </span>
        </div>
      </div>

      <div className="min-h-[3.5rem] flex items-center mb-4">
        {isEditing ? (
          <div
            className="flex items-center gap-2 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="font-mono text-xl text-[#e0e0ff] bg-transparent border-b border-[#00ff41] outline-none flex-1"
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
          <div className="font-mono text-xl text-[#e0e0ff] group-hover:text-[#00ff41] transition-colors line-clamp-2">
            {subject.name}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="font-pixel text-[7px] text-[#7f7f9f]">
            PROGRESSO
          </span>
          <span className="font-pixel text-[7px] text-[#00ff41]">
            {subject.progress}%
          </span>
        </div>
        <Progress value={subject.progress} />
      </div>

      <div className="flex items-center gap-4 font-mono text-base text-[#555]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{Math.round(subject.totalMinutesStudied / 60)}h</span>
        </div>
        <span className="text-[#333]">·</span>
        <span>
          {subject.completedTopics}/{subject.topicsCount} tópicos
        </span>
      </div>
    </div>
  );
}
