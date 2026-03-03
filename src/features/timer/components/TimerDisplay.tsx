"use client";

import Link from "next/link";
import { Play, Pause, RotateCcw, Trophy, ArrowLeft } from "lucide-react";
import { useStudyTimer } from "@/features/timer/hooks/useStudyTimer";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useEffect } from "react";

const BLOCKS = Array.from({ length: 20 }, (_, n) => ({
  id: `pb-${n}`,
  index: n,
}));
const TOTAL_BLOCKS = BLOCKS.length;

interface TimerDisplayProps {
  readonly topicId: string;
  readonly topicName: string;
  readonly subjectName: string;
  readonly onComplete?: () => void;
}

export function TimerDisplay({
  topicId,
  topicName,
  subjectName,
  onComplete,
}: TimerDisplayProps) {
  const {
    formattedTime,
    isRunning,
    hasCompleted,
    isSaving,
    progress,
    start,
    pause,
    reset,
    setDuration,
  } = useStudyTimer({
    topicId,
    initialMinutes: 25,
    onComplete,
  });

  const durations = [15, 25, 45, 60];
  const totalBlocks = TOTAL_BLOCKS;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);

  useEffect(() => {
    if (hasCompleted && !isSaving) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;
      const interval: ReturnType<typeof setInterval> = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [hasCompleted, isSaving]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="font-pixel text-[8px] text-[#7f7f9f] tracking-widest">
          {subjectName.toUpperCase()}
        </div>
        <div className="font-mono text-3xl text-[#e0e0ff] leading-tight">
          {topicName}
        </div>
      </div>

      <div
        className="relative w-full"
        style={{
          border: "4px solid #00ff41",
          background: "#020008",
          padding: "32px 24px",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 40px rgba(0,255,65,0.1)" }}
        />

        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />

        <div className="text-center relative z-10">
          <div
            className={cn(
              "font-pixel text-6xl md:text-7xl tracking-widest transition-all duration-300",
              isRunning ? "text-[#00ff41]" : "text-[#7f7f9f]",
            )}
            style={
              isRunning
                ? {
                    textShadow:
                      "0 0 20px rgba(0,255,65,0.8), 0 0 40px rgba(0,255,65,0.4)",
                  }
                : {}
            }
          >
            {formattedTime}
          </div>
          <div className="font-pixel text-[7px] mt-3 text-[#7f7f9f]">
            {isRunning ? "── FOCANDO ──" : "── PAUSADO ──"}
          </div>
        </div>
      </div>

      <div className="w-full space-y-1">
        <div className="font-pixel text-[7px] text-[#7f7f9f] text-right">
          {Math.round(progress)}%
        </div>
        <div
          className="w-full h-6 flex gap-1"
          style={{
            border: "2px solid #00ff41",
            padding: "3px",
            background: "#020008",
          }}
        >
          {BLOCKS.map((block) => (
            <div
              key={block.id}
              className="flex-1 h-full transition-all duration-300"
              style={{
                background: block.index < filledBlocks ? "#00ff41" : "#0d001a",
                boxShadow:
                  block.index < filledBlocks
                    ? "0 0 6px rgba(0,255,65,0.6)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            disabled={isRunning}
            className={cn(
              "font-pixel text-[8px] px-3 py-2 transition-all",
              isRunning
                ? "text-[#333] border-[#333] cursor-not-allowed"
                : "text-[#00ff41] hover:bg-[#00ff41] hover:text-black",
            )}
            style={{
              border: isRunning ? "2px solid #333" : "2px solid #00ff41",
            }}
          >
            {d}m
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          disabled={isSaving || (!isRunning && progress === 0)}
          className="w-12 h-12 flex items-center justify-center text-[#7f7f9f] hover:text-[#00ff41] transition-colors disabled:opacity-30"
          style={{ border: "2px solid currentColor" }}
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        {isRunning ? (
          <button
            onClick={pause}
            className="font-pixel text-[10px] text-[#e0e0ff] px-10 py-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            style={{
              background: "#0d001a",
              border: "2px solid #e0e0ff",
              boxShadow: "4px 4px 0px #333",
            }}
          >
            <Pause className="h-5 w-5 fill-[#e0e0ff]" />
            PAUSAR
          </button>
        ) : (
          <button
            onClick={start}
            disabled={hasCompleted || isSaving}
            className="font-pixel text-[10px] text-black bg-[#00ff41] px-10 py-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              boxShadow: "4px 4px 0px #006b1a, 0 0 15px rgba(0,255,65,0.4)",
            }}
          >
            <Play className="h-5 w-5 fill-black" />
            INICIAR
          </button>
        )}
      </div>

      <div className="h-16 flex items-center justify-center">
        {isSaving && (
          <div
            className="font-pixel text-[8px] text-[#ffbe0b] animate-blink"
            style={{ textShadow: "0 0 10px rgba(255,190,11,0.8)" }}
          >
            ► SALVANDO PROGRESSO...
          </div>
        )}
        {hasCompleted && !isSaving && (
          <div className="text-center space-y-3">
            <div
              className="font-pixel text-[10px] text-[#00ff41] flex items-center gap-2"
              style={{ textShadow: "0 0 15px rgba(0,255,65,0.8)" }}
            >
              <Trophy className="w-5 h-5" />
              STAGE CLEAR!
            </div>
            <Link
              href="/dashboard"
              className="font-pixel text-[7px] text-[#7f7f9f] hover:text-[#00ff41] flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              VOLTAR AO HUB
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
