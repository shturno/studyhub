"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Flame, Skull, Trophy, TrendingUp, BookOpen } from "lucide-react";
import type { ActivityEventSummary, ActivityEventType } from "@/features/gamification/services/activityEventService";

interface Props {
  events: ActivityEventSummary[];
}

const EVENT_CONFIG: Record<
  ActivityEventType,
  { icon: React.ElementType; color: string; borderColor: string; label: string }
> = {
  SESSION_COMPLETED: {
    icon: CheckCircle2,
    color: "#00ff41",
    borderColor: "rgba(0,255,65,0.2)",
    label: "SESSÃO CONCLUÍDA",
  },
  STREAK_BROKEN: {
    icon: Skull,
    color: "#ff006e",
    borderColor: "rgba(255,0,110,0.25)",
    label: "STREAK QUEBRADO",
  },
  XP_LOST: {
    icon: TrendingUp,
    color: "#ff006e",
    borderColor: "rgba(255,0,110,0.25)",
    label: "XP PERDIDO",
  },
  OBLIGATION_MISSED: {
    icon: Skull,
    color: "#ff006e",
    borderColor: "rgba(255,0,110,0.35)",
    label: "DIA PERDIDO",
  },
  LEVEL_UP: {
    icon: Trophy,
    color: "#ffbe0b",
    borderColor: "rgba(255,190,11,0.3)",
    label: "LEVEL UP",
  },
  ACHIEVEMENT: {
    icon: Trophy,
    color: "#c084fc",
    borderColor: "rgba(192,132,252,0.3)",
    label: "CONQUISTA",
  },
  QUESTIONS_LOGGED: {
    icon: BookOpen,
    color: "#00f5ff",
    borderColor: "rgba(0,245,255,0.2)",
    label: "QUESTÕES",
  },
};

function EventRow({ event }: { event: ActivityEventSummary }) {
  const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.SESSION_COMPLETED;
  const Icon = config.icon;
  const meta = event.metadata;

  function renderDescription(): React.ReactNode {
    switch (event.type) {
      case "SESSION_COMPLETED":
        return (
          <span>
            <span className="text-[#e0e0ff]">{meta.topicName}</span>
            <span className="text-[#7f7f9f]"> · {meta.minutes} min</span>
            <span style={{ color: "#00ff41" }}> +{meta.xp} XP</span>
          </span>
        );
      case "STREAK_BROKEN":
        return (
          <span>
            <span className="text-[#e0e0ff]">Streak de {meta.streakLost} dias quebrado</span>
            <span style={{ color: "#ff006e" }}> −{meta.penalty} XP</span>
          </span>
        );
      case "XP_LOST":
        return (
          <span>
            <span style={{ color: "#ff006e" }}>−{meta.penalty} XP</span>
          </span>
        );
      case "OBLIGATION_MISSED":
        return (
          <span>
            <span className="text-[#e0e0ff]">{meta.obligationTopic}</span>
            <span style={{ color: "#ff006e" }}> −{meta.penalty} XP</span>
            {meta.date && (
              <span className="text-[#7f7f9f]"> · {meta.date}</span>
            )}
          </span>
        );
      case "LEVEL_UP":
        return (
          <span>
            <span style={{ color: "#ffbe0b" }}>Nível {meta.level} alcançado!</span>
          </span>
        );
      case "ACHIEVEMENT":
        return (
          <span>
            <span style={{ color: "#c084fc" }}>
              {meta.achievementIcon} {meta.achievementName}
            </span>
          </span>
        );
      case "QUESTIONS_LOGGED":
        return (
          <span>
            <span className="text-[#e0e0ff]">{meta.correct}/{meta.total} acertos</span>
            <span style={{ color: "#00f5ff" }}> +{(meta.correct ?? 0) * 3} XP</span>
          </span>
        );
      default:
        return null;
    }
  }

  const isLoss = event.type === "STREAK_BROKEN" || event.type === "OBLIGATION_MISSED" || event.type === "XP_LOST";

  return (
    <div
      className="grid grid-cols-12 px-4 py-3 hover:bg-[#ffffff04] transition-colors"
      style={{
        borderBottom: `1px solid ${config.borderColor}`,
        borderLeft: isLoss ? "3px solid #ff006e" : "3px solid transparent",
      }}
    >
      <div className="col-span-1 flex items-center">
        <Icon
          className="w-4 h-4"
          style={{ color: config.color }}
        />
      </div>
      <div className="col-span-7 flex items-center font-mono text-sm">
        {renderDescription()}
      </div>
      <div
        className="col-span-2 flex items-center font-pixel text-[6px] justify-end"
        style={{ color: config.color }}
      >
        {config.label}
      </div>
      <div className="col-span-2 flex items-center font-mono text-xs text-[#7f7f9f] justify-end">
        {formatDistanceToNow(new Date(event.createdAt), {
          addSuffix: false,
          locale: ptBR,
        })}
      </div>
    </div>
  );
}

export function ActivityFeed({ events }: Props) {
  return (
    <div
      style={{
        border: "2px solid rgba(0,255,65,0.4)",
        background: "#04000a",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
      >
        <span className="font-pixel text-[8px] text-[#00ff41]">── ACTIVITY LOG ──</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff006e]" />
          <span className="font-pixel text-[6px] text-[#7f7f9f]">PERDAS</span>
          <div className="w-2 h-2 rounded-full bg-[#00ff41] ml-1" />
          <span className="font-pixel text-[6px] text-[#7f7f9f]">GANHOS</span>
        </div>
      </div>

      {events.length > 0 ? (
        <div>
          <div
            className="grid grid-cols-12 px-4 py-2 font-pixel text-[7px] text-[#7f7f9f]"
            style={{ borderBottom: "1px solid rgba(0,255,65,0.1)" }}
          >
            <span className="col-span-1" />
            <span className="col-span-7">EVENTO</span>
            <span className="col-span-2 text-right">TIPO</span>
            <span className="col-span-2 text-right">TEMPO</span>
          </div>
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Flame className="w-8 h-8 mx-auto mb-3 text-[#7f7f9f]" />
          <div className="font-pixel text-[8px] text-[#7f7f9f]">NO RECORDS YET</div>
          <div className="font-mono text-base text-[#7f7f9f] mt-1">
            Complete uma sessão para começar o log.
          </div>
        </div>
      )}
    </div>
  );
}
