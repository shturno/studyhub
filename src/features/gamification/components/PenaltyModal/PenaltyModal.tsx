"use client";

import { useEffect, useState } from "react";
import { Skull, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MissedDay {
  date: string;
  topicName: string;
  xpPenalty: number;
  aiReasoning: string | null;
}

interface Props {
  pendingPenalties: {
    totalPenalty: number;
    missedDays: MissedDay[];
  };
  onDismiss: () => void;
  onStudyNow: () => void;
}

export function PenaltyModal({ pendingPenalties, onDismiss, onStudyNow }: Props) {
  const [visible, setVisible] = useState(false);
  const [xpCountdown, setXpCountdown] = useState(pendingPenalties.totalPenalty);

  useEffect(() => {
    if (pendingPenalties.totalPenalty <= 0) return;
    // Small delay for dramatic effect
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, [pendingPenalties.totalPenalty]);

  useEffect(() => {
    if (!visible) return;
    // Animate XP counting down
    const start = pendingPenalties.totalPenalty;
    const duration = 1500; // ms
    const steps = 30;
    const stepValue = Math.ceil(start / steps);
    let current = start;
    const id = setInterval(() => {
      current = Math.max(0, current - stepValue);
      setXpCountdown(current);
      if (current <= 0) clearInterval(id);
    }, duration / steps);
    return () => clearInterval(id);
  }, [visible, pendingPenalties.totalPenalty]);

  if (pendingPenalties.totalPenalty <= 0 || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      <div
        className="w-full max-w-md"
        style={{
          border: "3px solid #ff006e",
          background: "#0d0008",
          boxShadow: "0 0 60px rgba(255,0,110,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: "2px solid #ff006e", background: "#1a0008" }}
        >
          <Skull
            className="w-6 h-6 animate-pulse flex-shrink-0"
            style={{ color: "#ff006e" }}
          />
          <div>
            <div
              className="font-pixel text-[10px]"
              style={{ color: "#ff006e", textShadow: "0 0 10px rgba(255,0,110,0.8)" }}
            >
              PENALIDADE APLICADA
            </div>
            <div className="font-pixel text-[7px] text-[#7f7f9f] mt-0.5">
              {pendingPenalties.missedDays.length}{" "}
              {pendingPenalties.missedDays.length === 1 ? "dia perdido" : "dias perdidos"}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-pixel text-[7px] text-[#7f7f9f]">XP PERDIDO</div>
            <div
              className="font-pixel text-2xl transition-all duration-100"
              style={{
                color: "#ff006e",
                textShadow: "0 0 15px rgba(255,0,110,0.8)",
              }}
            >
              −{xpCountdown}
            </div>
          </div>
        </div>

        {/* Missed days list */}
        <div className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto">
          {pendingPenalties.missedDays.map((day) => (
            <div
              key={day.date}
              className="p-3"
              style={{ border: "1px solid rgba(255,0,110,0.3)", background: "#1a0008" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-pixel text-[7px] text-[#7f7f9f]">
                    {format(parseISO(day.date), "EEEE, dd/MM", { locale: ptBR }).toUpperCase()}
                  </div>
                  <div className="font-mono text-sm text-[#ff6e9c] truncate">
                    {day.topicName}
                  </div>
                  {day.aiReasoning && (
                    <div className="font-mono text-xs text-[#7f7f9f] mt-1 leading-relaxed">
                      &ldquo;{day.aiReasoning}&rdquo;
                    </div>
                  )}
                </div>
                <div
                  className="font-pixel text-[10px] flex-shrink-0"
                  style={{ color: "#ff006e" }}
                >
                  −{day.xpPenalty} XP
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          className="px-6 py-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid rgba(255,0,110,0.3)" }}
        >
          <button
            onClick={onStudyNow}
            className="w-full font-pixel text-[10px] text-black bg-[#ff006e] px-4 py-3 flex items-center justify-center gap-2 hover:bg-[#ff339e] transition-colors"
            style={{ boxShadow: "4px 4px 0px #800037" }}
          >
            <Zap className="w-4 h-4 fill-black" />
            ESTUDAR AGORA — NÃO PERDER MAIS
          </button>
          <button
            onClick={onDismiss}
            className="w-full font-pixel text-[7px] text-[#7f7f9f] py-2 hover:text-[#e0e0ff] transition-colors"
          >
            Entendido — fechar
          </button>
        </div>
      </div>
    </div>
  );
}
