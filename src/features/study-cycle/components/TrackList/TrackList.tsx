"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, Play } from "lucide-react";
import type { TrackListProps } from "./types";

export function TrackList({ tracks }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div
        className="text-center py-12"
        style={{
          border: "2px dashed rgba(0,255,65,0.2)",
          background: "#04000a",
        }}
      >
        <BookOpen className="h-10 w-10 text-[#333] mx-auto mb-3" />
        <div className="font-pixel text-[8px] text-[#555] mb-2">
          NENHUMA TRILHA ENCONTRADA
        </div>
        <div className="font-mono text-base text-[#444]">
          Crie sua primeira trilha para começar
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tracks.map((track) => {
        const totalLessons = track.lessons.length;
        const completedLessons = track.lessons.filter(
          (l) => l.status === "DONE",
        ).length;
        const inProgressLessons = track.lessons.filter(
          (l) => l.status === "IN_PROGRESS",
        ).length;
        const progress =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        const totalStudyTime = track.lessons.reduce(
          (sum, lesson) =>
            sum +
            lesson.studyLogs.reduce((logSum, log) => logSum + log.minutes, 0),
          0,
        );

        return (
          <div
            key={track.id}
            className="p-4 hover:-translate-y-0.5 transition-transform"
            style={{
              border: "2px solid rgba(0,255,65,0.4)",
              background: "#04000a",
              boxShadow: "4px 4px 0 rgba(0,255,65,0.1)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="font-mono text-lg text-[#e0e0ff] mb-1">
                  {track.name}
                </div>
                {track.description && (
                  <div className="font-mono text-sm text-[#7f7f9f]">
                    {track.description}
                  </div>
                )}
              </div>
              <BookOpen className="h-4 w-4 text-[#00ff41] flex-shrink-0 ml-2" />
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[6px] text-[#7f7f9f]">
                  PROGRESSO
                </span>
                <span className="font-pixel text-[6px] text-[#00ff41]">
                  {completedLessons}/{totalLessons}
                </span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 font-mono text-sm text-[#555]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                  </span>
                </div>
                {inProgressLessons > 0 && (
                  <Badge variant="secondary">
                    <Play className="h-3 w-3 mr-1" />
                    {inProgressLessons}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-mono text-sm text-[#555]">
                <CheckCircle className="h-3.5 w-3.5 text-[#00ff41]" />
                <span>{completedLessons} concluídas</span>
              </div>
              <Button asChild size="sm">
                <Link href={`/tracks/${track.id}`}>VER TRILHA</Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
