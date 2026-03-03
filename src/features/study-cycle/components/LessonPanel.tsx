"use client";

import { useState, useEffect, type Key } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StudyTimer } from "@/features/timer/components/StudyTimer";
import { ExternalLink, Clock, Calendar, Timer, Loader2 } from "lucide-react";

interface StudyLog {
  readonly id: string;
  readonly minutes: number;
  readonly createdAt: string;
}

interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly externalUrl: string | null;
  readonly estimated: number | null;
  readonly status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
  readonly studyLogs: StudyLog[];
  readonly track: {
    readonly name: string;
  };
}

interface LessonPanelProps {
  readonly lessonId: string | null;
  readonly trackId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function LessonPanel({
  lessonId,
  open,
  onOpenChange,
}: LessonPanelProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonId && open) {
      setLoading(true);
      fetch(`/api/lessons/${lessonId}`)
        .then((res) => res.json() as Promise<Lesson>)
        .then((data) => {
          setLesson(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [lessonId, open]);

  if (!lesson && !loading) return null;

  const totalStudyTime =
    lesson?.studyLogs.reduce((sum, log) => sum + log.minutes, 0) ?? 0;
  const studySessionsCount = lesson?.studyLogs.length ?? 0;

  const statusLabel =
    lesson?.status === "DONE"
      ? "CONCLUIDA"
      : lesson?.status === "IN_PROGRESS"
        ? "EM ANDAMENTO"
        : "NAO INICIADA";
  const statusVariant =
    lesson?.status === "DONE"
      ? "default"
      : lesson?.status === "IN_PROGRESS"
        ? "secondary"
        : "outline";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 text-[#00ff41] mx-auto mb-4" />
              <div className="font-mono text-base text-[#555]">
                Carregando lição...
              </div>
            </div>
          </div>
        ) : lesson ? (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-left">{lesson.title}</SheetTitle>
                  {lesson.description && (
                    <SheetDescription className="text-left mt-2">
                      {lesson.description}
                    </SheetDescription>
                  )}
                </div>
                <Badge variant={statusVariant} className="ml-4">
                  {statusLabel}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              <StudyTimer
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                onSessionComplete={() => {
                  if (lessonId) {
                    fetch(`/api/lessons/${lessonId}`)
                      .then((res) => res.json() as Promise<Lesson>)
                      .then((data) => setLesson(data))
                      .catch(() => undefined);
                  }
                }}
              />

              <div
                style={{
                  border: "2px solid rgba(0,255,65,0.4)",
                  background: "#04000a",
                }}
              >
                <div
                  className="px-4 py-3 font-pixel text-[7px] text-[#00ff41]"
                  style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
                >
                  INFO DA LICAO
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#555]" />
                      <div>
                        <div className="font-pixel text-[6px] text-[#555]">
                          ESTIMADO
                        </div>
                        <div className="font-mono text-base text-[#e0e0ff]">
                          {lesson.estimated
                            ? `${lesson.estimated} min`
                            : "Não definido"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-[#555]" />
                      <div>
                        <div className="font-pixel text-[6px] text-[#555]">
                          ESTUDADO
                        </div>
                        <div className="font-mono text-base text-[#e0e0ff]">
                          {Math.floor(totalStudyTime / 60)}h{" "}
                          {totalStudyTime % 60}m
                        </div>
                      </div>
                    </div>
                  </div>

                  {lesson.externalUrl && (
                    <>
                      <Separator />
                      <div className="font-pixel text-[6px] text-[#555] mb-2">
                        LINK EXTERNO
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <a
                          href={lesson.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          ABRIR LINK
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  border: "2px solid rgba(0,255,65,0.4)",
                  background: "#04000a",
                }}
              >
                <div
                  className="px-4 py-3 font-pixel text-[7px] text-[#00ff41]"
                  style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
                >
                  HISTORICO
                </div>
                <div className="p-4">
                  {lesson.studyLogs.length > 0 ? (
                    <div className="space-y-2">
                      <div className="font-mono text-sm text-[#555] mb-2">
                        {studySessionsCount} sessões ·{" "}
                        {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}
                        m total
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {lesson.studyLogs.map(
                          (log: {
                            id: Key | null | undefined;
                            createdAt: string | number | Date;
                            minutes: number;
                          }) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between p-2"
                              style={{
                                border: "1px solid rgba(0,255,65,0.15)",
                                background: "#020008",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#555]" />
                                <span className="font-mono text-sm text-[#7f7f9f]">
                                  {new Date(log.createdAt).toLocaleDateString(
                                    "pt-BR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                              <Badge variant="secondary">
                                {log.minutes} min
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-base text-[#444] text-center py-4">
                      Nenhuma sessão registrada
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
