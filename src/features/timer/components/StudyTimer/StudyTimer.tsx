"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudyTimer } from "./useStudyTimer";
import { DURATIONS, type StudyTimerProps } from "./types";

export function StudyTimer({
  lessonId,
  lessonTitle,
  onSessionComplete,
}: StudyTimerProps) {
  const {
    timeLeft,
    isRunning,
    setIsRunning,
    sessionMinutes,
    totalSessionTime,
    formatTime,
    progress,
    handleStop,
    setTimerDuration,
  } = useStudyTimer(lessonId, onSessionComplete);

  return (
    <div
      className="w-full space-y-5"
      style={{
        border: "2px solid rgba(0,255,65,0.4)",
        background: "#04000a",
        padding: "24px",
      }}
    >
      <div className="text-center">
        <div className="font-pixel text-[7px] text-[#7f7f9f] mb-1">
          TIMER DE ESTUDO
        </div>
        <div className="font-mono text-base text-[#7f7f9f]">{lessonTitle}</div>
      </div>

      <div className="text-center">
        <div
          className={cn(
            "font-pixel text-5xl tracking-widest mb-3 transition-all duration-300",
            isRunning ? "text-[#00ff41]" : "text-[#7f7f9f]",
          )}
          style={isRunning ? { textShadow: "0 0 20px rgba(0,255,65,0.8)" } : {}}
        >
          {formatTime(timeLeft)}
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex justify-center gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => setTimerDuration(d)}
            disabled={isRunning}
            className={cn(
              "font-pixel text-[7px] px-3 py-1.5 transition-all",
              totalSessionTime === d * 60
                ? "bg-[#00ff41] text-black"
                : "text-[#555] hover:text-[#00ff41] disabled:opacity-30",
            )}
            style={{
              border:
                totalSessionTime === d * 60
                  ? "2px solid #00ff41"
                  : "2px solid #333",
            }}
          >
            {d}m
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <Button onClick={() => setIsRunning(true)} size="lg">
            <Play className="h-4 w-4 mr-2" />
            INICIAR
          </Button>
        ) : (
          <Button
            onClick={() => setIsRunning(false)}
            size="lg"
            variant="outline"
          >
            <Pause className="h-4 w-4 mr-2" />
            PAUSAR
          </Button>
        )}
        <Button onClick={handleStop} size="lg" variant="outline">
          <Square className="h-4 w-4 mr-2" />
          PARAR
        </Button>
        <Button
          onClick={() => {
            setIsRunning(false);
            setTimerDuration(25);
          }}
          size="lg"
          variant="outline"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {sessionMinutes > 0 && (
        <div
          className="text-center p-3"
          style={{
            border: "1px solid rgba(0,255,65,0.3)",
            background: "#020008",
          }}
        >
          <span className="font-pixel text-[7px] text-[#00ff41]">
            SESSAO ATUAL: {sessionMinutes} MIN
          </span>
        </div>
      )}
    </div>
  );
}
