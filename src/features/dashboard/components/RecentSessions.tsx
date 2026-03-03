"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History } from "lucide-react";

interface RecentSession {
  readonly id: string;
  readonly topicName: string;
  readonly minutes: number;
  readonly xpEarned: number;
  readonly completedAt: Date;
}

interface RecentSessionsProps {
  readonly sessions: RecentSession[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <div
      style={{ border: "2px solid rgba(0,255,65,0.4)", background: "#04000a" }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid rgba(0,255,65,0.15)" }}
      >
        <History className="h-4 w-4 text-[#00ff41]" />
        <span className="font-pixel text-[8px] text-[#00ff41]">
          SESSOES RECENTES
        </span>
      </div>

      <div className="p-4">
        {sessions.length === 0 ? (
          <div className="font-mono text-base text-[#444] text-center py-6">
            Nenhuma sessão registrada
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 hover:-translate-y-0.5 transition-transform"
                style={{
                  border: "1px solid rgba(0,255,65,0.2)",
                  background: "#020008",
                }}
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-base text-[#e0e0ff]">
                    {session.topicName}
                  </div>
                  <div className="font-mono text-sm text-[#555]">
                    {formatDistanceToNow(new Date(session.completedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-pixel text-[8px] text-[#ffbe0b]">
                    +{session.xpEarned} XP
                  </div>
                  <div className="font-mono text-sm text-[#555]">
                    {session.minutes} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
