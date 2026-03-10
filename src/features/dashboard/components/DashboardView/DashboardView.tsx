"use client";

import { Trophy, Zap, BookOpen, Clock, ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DashboardViewProps } from "./types";
import { StudyHeatmap } from "../StudyHeatmap";
import { StatsChartsLazy } from "../StatsCharts";
import { getStreakTier } from "@/features/gamification/utils/streakCalculator";
import { DailyGoalCard } from "../DailyGoalCard/DailyGoalCard";

export function DashboardView({ data, contests = [], aiSlot }: DashboardViewProps) {
  const { user, nextTopic, recentSessions, coveragePercent, heatmap, statsData, streak, xpProgress, xpToNextLevel, dailyGoal } = data;

  const streakTier = getStreakTier(streak ?? 0);
  const streakColor =
    streakTier === "gold" ? "#ffbe0b" :
    streakTier === "silver" ? "#c084fc" :
    streakTier === "bronze" ? "#ff9f1c" :
    "#7f7f9f";

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
        <div className="text-center">
          <div className="font-pixel text-[7px] text-[#7f7f9f]">STREAK</div>
          <div
            className="font-pixel text-2xl flex items-center gap-1 justify-center"
            style={{
              color: streakColor,
              textShadow: `0 0 10px ${streakColor}88`,
            }}
          >
            <Flame className="w-4 h-4" style={{ fill: streakColor, color: streakColor }} />
            {(streak ?? 0).toString().padStart(2, "0")}
          </div>
          {streakTier !== "none" && (
            <div className="font-pixel text-[6px] mt-0.5" style={{ color: streakColor }}>
              {streakTier === "gold" ? "1.5× XP" : streakTier === "silver" ? "1.25× XP" : "1.1× XP"}
            </div>
          )}
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

      {/* XP Progress bar */}
      <div
        className="-mt-4 px-3 pb-3"
        style={{ border: "2px solid #00ff41", borderTop: "none", background: "#04000a" }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-pixel text-[6px] text-[#7f7f9f]">
            LVL {user.level}
          </span>
          <span className="font-pixel text-[6px]" style={{ color: xpProgress >= 90 ? "#ffbe0b" : "#7f7f9f" }}>
            {xpProgress}% · {xpToNextLevel} XP para LVL {user.level + 1}
          </span>
        </div>
        <div
          className="w-full h-3 relative overflow-hidden"
          style={{ background: "#1a1a00", border: "1px solid rgba(255,190,11,0.2)" }}
        >
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${xpProgress}%`,
              background: "linear-gradient(90deg, #ff9f00, #ffbe0b)",
              boxShadow: xpProgress >= 90 ? "0 0 8px rgba(255,190,11,0.8)" : undefined,
            }}
          />
          {/* Pixel tick marks every 25% */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 h-full w-px"
              style={{ left: `${pct}%`, background: "rgba(0,0,0,0.4)" }}
            />
          ))}
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
            ── NEXT TOPIC ──
          </div>
          {nextTopic ? (
            <>
              <div className="font-pixel text-[8px] text-[#ff006e] mb-2">
                {nextTopic.subjectName.toUpperCase()}
              </div>
              <div className="font-mono text-3xl text-[#e0e0ff] mb-6">
                {nextTopic.name}
              </div>
              <Link href={`/study/${nextTopic.id}`}>
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
              <Link href="/subjects" className="text-[#00ff41] hover:underline">
                Adicione matérias ao seu concurso.
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
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

      <DailyGoalCard
        targetMinutes={dailyGoal.targetMinutes}
        studiedTodayMinutes={dailyGoal.studiedTodayMinutes}
      />

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
              <span className="col-span-3">TIME</span>
              <span className="col-span-2 text-right">XP</span>
              <span className="col-span-2 text-right">DATE</span>
            </div>
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="grid grid-cols-12 px-4 py-3 font-mono text-base hover:bg-[#00ff41]/5 transition-colors"
                style={{ borderBottom: "1px solid rgba(0,255,65,0.05)" }}
              >
                <span className="col-span-5 text-[#e0e0ff] truncate">
                  {session.topicName}
                </span>
                <span className="col-span-3 text-[#7f7f9f] truncate">
                  {session.minutes} min
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

      <StudyHeatmap heatmap={heatmap} />

      <StatsChartsLazy stats={statsData} />

      {aiSlot}
    </div>
  );
}
