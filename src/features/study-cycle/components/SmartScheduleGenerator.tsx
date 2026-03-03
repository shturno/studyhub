"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Zap, Brain, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ScheduleData {
  readonly schedule: {
    readonly weeks: number;
    readonly totalHours: number;
    readonly keyMilestones?: string[];
    readonly tips?: string[];
  };
  readonly coverage: {
    readonly coverage: number;
  };
}

interface SmartScheduleGeneratorProps {
  readonly contestId: string;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function SmartScheduleGenerator({
  contestId,
  isOpen,
  onOpenChange,
}: SmartScheduleGeneratorProps) {
  const [examDate, setExamDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] =
    useState<ScheduleData | null>(null);

  const handleGenerateSchedule = async () => {
    if (!examDate) {
      toast.error("Selecione a data da prova");
      return;
    }

    setIsGenerating(true);
    await fetch("/api/ai/generate-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contestId,
        examDate,
        weeklyHours: Number.parseInt(weeklyHours),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = (await response.json()) as { error?: string };
          throw new Error(err.error ?? "Erro ao gerar cronograma");
        }
        const data = (await response.json()) as ScheduleData;
        setGeneratedSchedule(data);
        toast.success("Cronograma gerado!");
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : "Erro ao gerar cronograma",
        );
      })
      .finally(() => setIsGenerating(false));
  };

  const handleAcceptSchedule = () => {
    toast.success("Cronograma importado para seu planner!");
    onOpenChange(false);
    setGeneratedSchedule(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#7b61ff]" />
            GERAR CRONOGRAMA INTELIGENTE
          </DialogTitle>
        </DialogHeader>

        {generatedSchedule === null ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="examDate">DATA DA PROVA</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
              <div className="font-mono text-sm text-[#555]">
                O cronograma será adaptado ao tempo disponível
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyHours">HORAS POR SEMANA</Label>
              <Input
                id="weeklyHours"
                type="number"
                min="5"
                max="168"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
              />
              <div className="font-mono text-sm text-[#555]">
                Total de horas que pode dedicar por semana
              </div>
            </div>

            <div
              className="p-4"
              style={{
                border: "2px solid rgba(123,97,255,0.3)",
                background: "#04000a",
              }}
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#7b61ff] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-pixel text-[7px] text-[#7b61ff] mb-2">
                    COMO FUNCIONA?
                  </div>
                  <ul className="space-y-1 font-mono text-sm text-[#7f7f9f]">
                    <li>
                      ✓ A IA analisa seus editais e tópicos de alta prioridade
                    </li>
                    <li>
                      ✓ Cria um cronograma personalizado até a data da prova
                    </li>
                    <li>✓ Balanceia tempo de aprendizado, prática e revisão</li>
                    <li>✓ Você pode aceitar e importar para seu planner</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                CANCELAR
              </Button>
              <Button onClick={handleGenerateSchedule} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    GERANDO...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    GERAR CRONOGRAMA
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className="p-4"
              style={{
                border: "2px solid rgba(0,255,65,0.4)",
                background: "#04000a",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#00ff41]" />
                <div className="font-pixel text-[7px] text-[#00ff41]">
                  CRONOGRAMA — {generatedSchedule.schedule.weeks} SEMANAS
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3"
                  style={{
                    border: "1px solid rgba(0,255,65,0.2)",
                    background: "#020008",
                  }}
                >
                  <div className="font-pixel text-[6px] text-[#555]">
                    TOTAL DE HORAS
                  </div>
                  <div className="font-pixel text-xl text-[#00ff41] mt-1">
                    {generatedSchedule.schedule.totalHours}h
                  </div>
                </div>
                <div
                  className="p-3"
                  style={{
                    border: "1px solid rgba(0,255,65,0.2)",
                    background: "#020008",
                  }}
                >
                  <div className="font-pixel text-[6px] text-[#555]">
                    COBERTURA
                  </div>
                  <div className="font-pixel text-xl text-[#ffbe0b] mt-1">
                    {generatedSchedule.coverage.coverage}%
                  </div>
                </div>
              </div>
            </div>

            {(generatedSchedule.schedule.keyMilestones?.length ?? 0) > 0 && (
              <div
                className="p-4"
                style={{
                  border: "2px solid rgba(0,255,65,0.3)",
                  background: "#04000a",
                }}
              >
                <div className="font-pixel text-[7px] text-[#00ff41] mb-3">
                  MARCOS IMPORTANTES
                </div>
                <ul className="space-y-2">
                  {generatedSchedule.schedule.keyMilestones!.map(
                    (milestone: string) => (
                      <li
                        key={milestone.slice(0, 50)}
                        className="font-mono text-sm text-[#7f7f9f] flex items-start gap-2"
                      >
                        <span className="text-[#00ff41] mt-0.5">→</span>
                        {milestone}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {(generatedSchedule.schedule.tips?.length ?? 0) > 0 && (
              <div
                className="p-4"
                style={{
                  border: "2px solid rgba(123,97,255,0.3)",
                  background: "#04000a",
                }}
              >
                <div className="font-pixel text-[7px] text-[#7b61ff] mb-3">
                  DICAS DE ESTUDO
                </div>
                <ul className="space-y-2">
                  {generatedSchedule.schedule
                    .tips!.slice(0, 3)
                    .map((tip: string) => (
                      <li
                        key={tip.slice(0, 50)}
                        className="font-mono text-sm text-[#7f7f9f] flex items-start gap-2"
                      >
                        <span className="text-[#7b61ff]">💡</span>
                        {tip}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedSchedule(null);
                  setExamDate("");
                }}
              >
                GERAR NOVO
              </Button>
              <Button onClick={handleAcceptSchedule}>
                <Zap className="w-4 h-4 mr-2" />
                IMPORTAR PARA PLANNER
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
