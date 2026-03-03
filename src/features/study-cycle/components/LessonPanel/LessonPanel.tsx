"use client";

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
import { ExternalLink, Clock, Timer, Loader2 } from "lucide-react";
import { useLessonPanel } from "./useLessonPanel";
import type { LessonPanelProps } from "./types";

export function LessonPanel({
  lessonId,
  open,
  onOpenChange,
}: LessonPanelProps) {
  const {
    lesson,
    loading,
    totalStudyTime,
    studySessionsCount,
    statusLabel,
    statusVariant,
    refreshLesson,
  } = useLessonPanel(lessonId, open);

  if (!lesson && !loading) return null;

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
          <div className="space-y-6">
            <SheetHeader>
              <SheetTitle className="font-mono text-2xl">
                {lesson.title}
              </SheetTitle>
              <SheetDescription className="text-sm text-[#888]">
                {lesson.track?.name}
              </SheetDescription>
            </SheetHeader>

            <div className="flex gap-2">
              <Badge
                variant={statusVariant as "default" | "secondary" | "outline"}
              >
                {statusLabel}
              </Badge>
              <Badge variant="outline">{studySessionsCount} sessões</Badge>
            </div>

            {lesson.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-[#888] mb-2">Descrição:</p>
                  <p className="text-base">{lesson.description}</p>
                </div>
              </>
            )}

            {lesson.externalUrl && (
              <>
                <Separator />
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={lesson.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir recurso externo
                  </a>
                </Button>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#04000a] border border-[#333] rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="w-4 h-4 text-[#00ff41]" />
                  <span className="text-xs text-[#7f7f9f]">Tempo total</span>
                </div>
                <div className="text-xl font-mono font-bold">
                  {totalStudyTime} min
                </div>
              </div>
              <div className="p-3 bg-[#04000a] border border-[#333] rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#00ff41]" />
                  <span className="text-xs text-[#7f7f9f]">Estimado</span>
                </div>
                <div className="text-xl font-mono font-bold">
                  {lesson.estimated || "—"} min
                </div>
              </div>
            </div>

            <Separator />

            <StudyTimer
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              onSessionComplete={refreshLesson}
            />

            {lesson.studyLogs.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold text-[#00ff41] mb-3">
                    Histórico de estudo
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lesson.studyLogs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs flex justify-between p-2 bg-[#04000a] rounded"
                      >
                        <span className="text-[#888]">
                          {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-[#00ff41]">
                          {log.minutes} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
