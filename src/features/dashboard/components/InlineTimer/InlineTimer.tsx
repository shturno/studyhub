"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Zap, ChevronUp } from "lucide-react";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import type { DailyObligationSummary } from "@/features/gamification/services/dailyObligationService";

interface NextTopic {
  id: string;
  name: string;
  subjectName: string;
  estimatedMinutes: number;
}

interface Props {
  dailyObligation: DailyObligationSummary | null;
  nextTopic: NextTopic | null;
  forceExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function InlineTimer({ dailyObligation, nextTopic, forceExpanded, onExpandedChange }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(forceExpanded ?? false);

  // Sync with external forceExpanded
  useEffect(() => {
    if (forceExpanded !== undefined) {
      setExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  const handleSetExpanded = useCallback((val: boolean) => {
    setExpanded(val);
    onExpandedChange?.(val);
  }, [onExpandedChange]);

  // Prioridade: obrigação pendente > próximo tópico recomendado
  const targetTopic = useMemo(() => {
    if (!dailyObligation?.completed && dailyObligation?.topicId) {
      return {
        id: dailyObligation.topicId,
        name: dailyObligation.topicName,
        subjectName: dailyObligation.subjectName,
        estimatedMinutes: 25,
      };
    }
    return nextTopic;
  }, [dailyObligation, nextTopic]);

  const handleStartNow = useCallback(() => {
    if (!targetTopic) return;
    handleSetExpanded(true);
  }, [targetTopic, handleSetExpanded]);

  const handleComplete = useCallback(() => {
    handleSetExpanded(false);
    // Revalidate dashboard
    router.refresh();
  }, [router, handleSetExpanded]);

  if (!targetTopic) {
    return (
      <div
        className="p-4 text-center"
        style={{ border: "2px solid rgba(0,255,65,0.2)", background: "#04000a" }}
      >
        <div className="font-pixel text-[7px] text-[#7f7f9f]">
          Adicione tópicos ao seu concurso para começar.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: expanded ? "2px solid #00ff41" : "2px solid rgba(0,255,65,0.4)",
        background: "#04000a",
        boxShadow: expanded ? "0 0 30px rgba(0,255,65,0.2)" : undefined,
        transition: "all 0.3s ease",
      }}
    >
      {/* Collapsed header — always visible */}
      <button
        className="w-full p-4 flex items-center gap-3 hover:bg-[#00ff41]/5 transition-colors text-left"
        onClick={() => (expanded ? handleSetExpanded(false) : handleStartNow())}
      >
        <div
          className="w-10 h-10 flex items-center justify-center flex-shrink-0"
          style={{
            background: "#00ff41",
            boxShadow: "0 0 20px rgba(0,255,65,0.5)",
          }}
        >
          <Zap className="w-5 h-5 fill-black text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[7px] text-[#7f7f9f]">
            {!dailyObligation?.completed && dailyObligation?.topicId
              ? "⚠ OBRIGAÇÃO PENDENTE"
              : "── PRÓXIMO TÓPICO ──"}
          </div>
          <div className="font-pixel text-[9px] text-[#ff006e] truncate">
            {targetTopic.subjectName.toUpperCase()}
          </div>
          <div className="font-mono text-lg text-[#e0e0ff] truncate font-semibold">
            {targetTopic.name}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {!expanded && (
            <div
              className="font-pixel text-[10px] text-black bg-[#00ff41] px-3 py-1.5"
              style={{ boxShadow: "3px 3px 0px #006b1a" }}
            >
              ▶ ESTUDAR AGORA
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#7f7f9f]" />
          ) : null}
        </div>
      </button>

      {/* Expanded timer */}
      {expanded && (
        <div
          className="px-4 pb-6"
          style={{ borderTop: "1px solid rgba(0,255,65,0.2)" }}
        >
          <div className="mt-4">
            <TimerDisplay
              topicId={targetTopic.id}
              topicName={targetTopic.name}
              subjectName={targetTopic.subjectName}
              onComplete={handleComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
