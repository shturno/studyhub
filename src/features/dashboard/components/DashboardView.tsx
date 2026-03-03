"use client";

import {
  Trophy,
  Zap,
  BookOpen,
  Clock,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DashboardData } from "../services/dashboardService";

interface DashboardViewProps {
  readonly data: DashboardData;
  readonly contests?: {
    id: string;
    name: string;
    slug: string;
    [key: string]: unknown;
  }[];
  readonly activeContestId?: string;
}

export function DashboardView({ data, contests = [] }: DashboardViewProps) {
  const { user, randomTopic, recentSessions, streak } = data;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <div
          className="font-pixel text-[#00ff41] text-2xl"
          style={{ textShadow: "0 0 20px rgba(0,255,65,0.8)" }}
        >
          GAME OVER
        </div>
        <div className="font-mono text-xl text-[#7f7f9f]">
          Banco de dados vazio.
        </div>
        <code
          className="font-pixel text-[8px] text-[#ffbe0b] px-4 py-2"
          style={{ border: "2px solid #ffbe0b" }}
        >
          npm run db:seed
        </code>
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div
          className="font-pixel text-[#00ff41] text-xl mb-4"
          style={{ textShadow: "0 0 20px rgba(0,255,65,0.8)" }}
        >
          PLAYER 1
        </div>
        <div className="font-pixel text-[8px] text-[#ff006e] mb-8 animate-blink">
          SELECT YOUR STAGE
        </div>
        <p className="font-mono text-xl text-[#7f7f9f] mb-8 max-w-sm">
          Crie seu primeiro concurso para começar a jornada.
        </p>
        <Link href="/contests">
          <button
            className="font-pixel text-[10px] text-black bg-[#00ff41] px-8 py-4"
            style={{
              boxShadow: "6px 6px 0px #006b1a, 0 0 20px rgba(0,255,65,0.4)",
            }}
          >
            ▶ CRIAR CONCURSO
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6 space-y-6">
      <div
        className="flex items-center justify-between p-3"
        style={{ border: "2px solid #00ff41", background: "#04000a" }}
      >
        <div>
          <div className="font-pixel text-[7px] text-[#7f7f9f]">PLAYER</div>
          <div
            className="font-pixel text-[10px] text-[#00ff41]"
            style={{ textShadow: "0 0 8px rgba(0,255,65,0.6)" }}
          >
            {user.name?.toUpperCase() || "ESTUDANTE"}
          </div>
        </div>
        <div className="text-center">
          <div className="font-pixel text-[7px] text-[#7f7f9f]">LVL</div>
          <div
            className="font-pixel text-2xl text-[#ffbe0b]"
            style={{ textShadow: "0 0 10px rgba(255,190,11,0.8)" }}
          >
            {user.level.toString().padStart(2, "0")}
          </div>
        </div>
        <div className="text-right">
          <div className="font-pixel text-[7px] text-[#7f7f9f]">SCORE</div>
          <div
            className="font-pixel text-[10px] text-[#ff006e]"
            style={{ textShadow: "0 0 8px rgba(255,0,110,0.6)" }}
          >
            {user.xp.toString().padStart(6, "0")} XP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 p-6"
          style={{
            border: "2px solid #00ff41",
            background: "#04000a",
            boxShadow: "0 0 20px rgba(0,255,65,0.1)",
          }}
        >
          <div className="font-pixel text-[8px] text-[#7f7f9f] mb-4">
            ── CURRENT STAGE ──
          </div>
          {randomTopic ? (
            <>
              <div className="font-pixel text-[8px] text-[#ff006e] mb-2">
                {randomTopic.subject.name.toUpperCase()}
              </div>
              <div className="font-mono text-3xl text-[#e0e0ff] mb-6">
                {randomTopic.name}
              </div>
              <Link href={`/study/${randomTopic.id}`}>
                <button
                  className="font-pixel text-[10px] text-black bg-[#00ff41] px-6 py-3 flex items-center gap-3"
                  style={{
                    boxShadow:
                      "4px 4px 0px #006b1a, 0 0 15px rgba(0,255,65,0.4)",
                  }}
                >
                  <Zap className="w-4 h-4 fill-black" />
                  START SESSION
                </button>
              </Link>
            </>
          ) : (
            <div className="font-mono text-xl text-[#7f7f9f]">
              Nenhum tópico disponível.
              <br />
              <Link href="/contests" className="text-[#00ff41] hover:underline">
                Adicione um concurso.
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div
            className="p-4"
            style={{ border: "2px solid #ff006e", background: "#04000a" }}
          >
            <div className="font-pixel text-[7px] text-[#7f7f9f] mb-1">
              COMBO
            </div>
            <div className="flex items-baseline gap-2">
              <Flame className="w-5 h-5 text-[#ff006e]" />
              <span
                className="font-pixel text-2xl text-[#ff006e]"
                style={{ textShadow: "0 0 10px rgba(255,0,110,0.8)" }}
              >
                x{streak}
              </span>
              <span className="font-mono text-lg text-[#7f7f9f]">dias</span>
            </div>

            <div
              className="mt-3 h-4"
              style={{ background: "#080010", border: "2px solid #ff006e" }}
            >
              <div
                className="h-full"
                style={{
                  width: `${Math.min(streak * 10, 100)}%`,
                  background:
                    "repeating-linear-gradient(90deg, #ff006e 0px, #ff006e 10px, transparent 10px, transparent 14px)",
                  boxShadow: "0 0 8px rgba(255,0,110,0.5)",
                }}
              />
            </div>
          </div>

          <div
            className="p-4"
            style={{ border: "2px solid #ffbe0b", background: "#04000a" }}
          >
            <div className="font-pixel text-[7px] text-[#7f7f9f] mb-1">
              HIGH SCORE
            </div>
            <div className="flex items-baseline gap-2">
              <Trophy className="w-5 h-5 text-[#ffbe0b]" />
              <span
                className="font-pixel text-xl text-[#ffbe0b]"
                style={{ textShadow: "0 0 10px rgba(255,190,11,0.8)" }}
              >
                {user.xp}
              </span>
              <span className="font-mono text-lg text-[#7f7f9f]">XP</span>
            </div>
          </div>

          <Link href="/subjects">
            <div
              className="p-4 hover:bg-[#00f5ff]/5 transition-colors cursor-pointer"
              style={{ border: "2px solid #00f5ff", background: "#04000a" }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00f5ff]" />
                <span className="font-pixel text-[7px] text-[#00f5ff]">
                  MEUS CONTEUDOS
                </span>
                <ArrowUpRight className="w-3 h-3 text-[#00f5ff] ml-auto" />
              </div>
            </div>
          </Link>
        </div>
      </div>

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
          <span className="font-pixel text-[8px] text-[#00ff41]">
            ── RECENT ACTIVITY ──
          </span>
          <Clock className="w-4 h-4 text-[#7f7f9f]" />
        </div>

        {recentSessions.length > 0 ? (
          <div>
            <div
              className="grid grid-cols-12 px-4 py-2 font-pixel text-[7px] text-[#7f7f9f]"
              style={{ borderBottom: "1px solid rgba(0,255,65,0.1)" }}
            >
              <span className="col-span-5">TOPIC</span>
              <span className="col-span-3">SUBJECT</span>
              <span className="col-span-2 text-right">XP</span>
              <span className="col-span-2 text-right">TIME</span>
            </div>
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="grid grid-cols-12 px-4 py-3 font-mono text-base hover:bg-[#00ff41]/5 transition-colors"
                style={{ borderBottom: "1px solid rgba(0,255,65,0.05)" }}
              >
                <span className="col-span-5 text-[#e0e0ff] truncate">
                  {session.topic.name}
                </span>
                <span className="col-span-3 text-[#7f7f9f] truncate">
                  {session.topic.subject.name}
                </span>
                <span className="col-span-2 text-right text-[#ffbe0b]">
                  +{session.xpEarned}
                </span>
                <span className="col-span-2 text-right text-[#7f7f9f] text-sm">
                  {formatDistanceToNow(new Date(session.completedAt), {
                    addSuffix: false,
                    locale: ptBR,
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="font-pixel text-[8px] text-[#7f7f9f] mb-2">
              NO RECORDS YET
            </div>
            <div className="font-mono text-lg text-[#7f7f9f]">
              Comece sua primeira sessão para aparecer no ranking!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
