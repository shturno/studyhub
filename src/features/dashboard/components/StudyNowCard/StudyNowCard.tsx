"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudyNowCardProps {
  readonly nextTopic: {
    readonly id: string;
    readonly name: string;
    readonly subjectName: string;
    readonly estimatedMinutes: number;
  } | null;
}

export function StudyNowCard({ nextTopic }: StudyNowCardProps) {
  const router = useRouter();

  if (!nextTopic) {
    return (
      <div
        className="col-span-full py-12 flex flex-col items-center justify-center text-center"
        style={{
          border: "2px dashed rgba(0,255,65,0.2)",
          background: "#04000a",
        }}
      >
        <BookOpen className="h-14 w-14 text-[#333] mb-4" />
        <div className="font-pixel text-[8px] text-[#555] mb-2">
          NENHUM CICLO ATIVO
        </div>
        <div className="font-mono text-base text-[#444] mb-6">
          Crie um ciclo de estudos para começar
        </div>
        <Button onClick={() => router.push("/cycle")}>CRIAR CICLO</Button>
      </div>
    );
  }

  return (
    <div
      className="col-span-full p-6"
      style={{
        border: "2px solid rgba(0,255,65,0.5)",
        background: "#04000a",
        boxShadow: "0 0 30px rgba(0,255,65,0.05)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-[#00ff41]" />
        <span className="font-pixel text-[8px] text-[#00ff41]">
          ESTUDAR AGORA
        </span>
      </div>

      <div className="mb-4">
        <div
          className="font-pixel text-lg text-[#00ff41] mb-1"
          style={{ textShadow: "0 0 15px rgba(0,255,65,0.4)" }}
        >
          {nextTopic.subjectName}
        </div>
        <div className="font-mono text-lg text-[#7f7f9f]">{nextTopic.name}</div>
      </div>

      <div className="flex items-center gap-2 text-[#555] mb-6">
        <Clock className="h-4 w-4" />
        <span className="font-mono text-base">
          {nextTopic.estimatedMinutes} minutos
        </span>
      </div>

      <Button
        size="lg"
        className="w-full text-base h-12"
        onClick={() => router.push(`/study/${encodeURIComponent(nextTopic.name)}`)}
      >
        <Play className="h-5 w-5 mr-2" />
        INICIAR ESTUDO
      </Button>
    </div>
  );
}
