"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Book,
  UploadCloud,
  Cpu,
  ArrowRight,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useEditorialManager } from "./useEditorialManager";
import type { EditorialManagerProps } from "./types";

export function EditorialManager({
  contestId,
  role,
  examDate: examDateProp,
  onEditorialAdded,
}: EditorialManagerProps) {
  const {
    isOpen,
    setIsOpen,
    step,
    isParsing,
    isGenerating,
    selectedFile,
    pageRanges,
    setPageRanges,
    selectedRole,
    setSelectedRole,
    examDate,
    setExamDate,
    dailyHours,
    setDailyHours,
    generatedSchedule,
    isSavingSchedule,
    extractedSubjects,
    selectedDifficultSubjects,
    fileInputRef,
    handleFileSelect,
    handleChangeFile,
    handleSubmit,
    handleGenerateSchedule,
    handleImportSchedule,
    handleSkipSchedule,
    handleGoBack,
    handleClose,
    handleSelectDifficulty,
    handleContinueFromDifficulty,
  } = useEditorialManager(contestId, role, examDateProp, onEditorialAdded);

  const dayLabels = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"] as const;
  const dayKeys = [
    "monday" as const,
    "tuesday" as const,
    "wednesday" as const,
    "thursday" as const,
    "friday" as const,
    "saturday" as const,
    "sunday" as const,
  ];
  const weeklyTotal = Object.values(dailyHours).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          ADICIONAR EDITAL
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-[#00ff41]" />
            {step === "upload" && "IMPORTAR EDITAL"}
            {step === "availability" && "DISPONIBILIDADE & CRONOGRAMA"}
            {step === "difficulty" && "ÁREAS DE DIFICULDADE"}
            {step === "preview" && "REVISAR CRONOGRAMA"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role">CARGO / POSIÇÃO</Label>
              <Input
                id="role"
                placeholder="Ex: Escriturário, Analista..."
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">PÁGINAS COM MATÉRIAS</Label>
              <Input
                id="pages"
                placeholder="Ex: 15-25, 30, 45-50"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
              />
              <div className="font-mono text-sm text-[#555]">
                Digite os intervalos de páginas que contêm as matérias
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">PDF DO EDITAL</Label>
              <div
                className="border-2 border-dashed border-[#00ff41] rounded p-4 text-center hover:bg-[#04000a] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <UploadCloud className="h-8 w-8 mx-auto text-[#00ff41]" />
                    <div className="font-mono text-sm text-[#00ff41]">
                      {selectedFile.name}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleChangeFile}
                    >
                      Trocar arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="h-8 w-8 mx-auto text-[#555]" />
                    <div className="font-mono text-sm text-[#555]">
                      Clique para selecionar o PDF
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examDate">DATA DA PROVA (OPCIONAL)</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
              <div className="font-mono text-sm text-[#555]">
                Se deixar em branco, usaremos 6 meses a partir de hoje
              </div>
            </div>

            <div
              className="p-4"
              style={{
                border: "2px solid rgba(0,255,65,0.3)",
                background: "#04000a",
              }}
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#00ff41] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-pixel text-[7px] text-[#00ff41] mb-2">
                    COMO FUNCIONA?
                  </div>
                  <ul className="space-y-1 font-mono text-sm text-[#7f7f9f]">
                    <li>✓ Upload seguro do PDF na nuvem</li>
                    <li>✓ IA extrai matérias e tópicos específicos do cargo</li>
                    <li>✓ Você define sua disponibilidade</li>
                    <li>✓ IA gera cronograma personalizado</li>
                    <li>✓ Você revisa e importa para o planner</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose}>
                CANCELAR
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isParsing}
                className="gap-2"
              >
                {isParsing ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    PRÓXIMO
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "availability" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                DISPONIBILIDADE POR DIA
              </Label>
              <div className="space-y-3">
                <div className="text-xs text-[#7f7f9f] font-mono">
                  Clique em um dia para ativar/desativar. Quando ativo, defina as
                  horas de estudo.
                </div>

                {/* Grid of 7 day cards */}
                <div className="grid grid-cols-7 gap-2">
                  {dayKeys.map((dayKey, idx) => {
                    const hours = dailyHours[dayKey];
                    const isActive = hours > 0;

                    return (
                      <div
                        key={dayKey}
                        className={`rounded border-2 p-3 transition-colors cursor-pointer ${
                          isActive
                            ? "border-[#00ff41] bg-[#020008]"
                            : "border-[#00ff41]/30 bg-[#04000a] opacity-60"
                        }`}
                        onClick={() => {
                          setDailyHours((prev) => ({
                            ...prev,
                            [dayKey]: isActive ? 0 : 2,
                          }));
                        }}
                      >
                        <div className="text-center mb-2">
                          <div className="font-pixel text-[7px] text-[#00ff41] font-bold">
                            {dayLabels[idx]}
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0.5"
                              max="12"
                              step="0.5"
                              value={hours}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val > 0) {
                                  setDailyHours((prev) => ({
                                    ...prev,
                                    [dayKey]: val,
                                  }));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 text-xs p-1"
                            />
                            <span className="text-xs font-mono text-[#7f7f9f] whitespace-nowrap">
                              h
                            </span>
                          </div>
                        )}
                        {!isActive && (
                          <div className="text-center text-xs font-mono text-[#555]">
                            —
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Weekly total */}
                <div className="mt-3 p-3 border border-[#00ff41]/30 rounded bg-[#04000a]">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-[#7f7f9f]">
                      TOTAL SEMANAL:
                    </span>
                    <span className="font-pixel text-lg text-[#00ff41]">
                      {weeklyTotal}h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-4"
              style={{
                border: "2px solid rgba(0,255,65,0.2)",
                background: "#04000a",
              }}
            >
              <div className="font-pixel text-[7px] text-[#00ff41] mb-2">
                DICA
              </div>
              <p className="font-mono text-xs text-[#7f7f9f]">
                Com {weeklyTotal}h/semana, você terá um cronograma realista e
                sustentável. A IA distribuirá as matérias de forma inteligente!
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleGoBack}
                disabled={isGenerating}
              >
                VOLTAR
              </Button>
              <Button
                onClick={handleGenerateSchedule}
                disabled={isGenerating || weeklyTotal === 0}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    GERANDO...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    GERAR CRONOGRAMA
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "difficulty" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="font-pixel text-[8px] text-[#7f7f9f] mb-3">
                Selecione as matérias em que você sente maior dificuldade (opcional). Essas áreas receberão prioridade na sua obrigação diária.
              </div>

              <div className="space-y-2">
                {extractedSubjects.length > 0 ? (
                  extractedSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => handleSelectDifficulty(subject.id)}
                      className={`w-full p-3 text-left rounded transition-colors ${
                        selectedDifficultSubjects.has(subject.id)
                          ? "border-2 border-[#00ff41] bg-[#00ff4108]"
                          : "border-2 border-[#00ff41]/30 bg-[#04000a]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: selectedDifficultSubjects.has(subject.id)
                              ? "#00ff41"
                              : "#7f7f9f",
                            background: selectedDifficultSubjects.has(subject.id)
                              ? "#00ff41"
                              : "transparent",
                          }}
                        >
                          {selectedDifficultSubjects.has(subject.id) && (
                            <div className="text-black font-bold text-sm">✓</div>
                          )}
                        </div>
                        <span className="font-mono text-sm text-[#e0e0ff]">
                          {subject.name}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#7f7f9f]">
                    Nenhuma matéria encontrada
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleGoBack}
                disabled={isGenerating}
              >
                VOLTAR
              </Button>
              <Button
                onClick={handleContinueFromDifficulty}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                CONTINUAR
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && generatedSchedule && (
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
                  CRONOGRAMA GERADO — {generatedSchedule.weeks} SEMANAS
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
                    {generatedSchedule.totalHours}h
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
                    DIAS DE ESTUDO
                  </div>
                  <div className="font-pixel text-xl text-[#ffbe0b] mt-1">
                    {generatedSchedule.fullScheduleOverview?.totalDaysOfStudy ||
                      0}
                  </div>
                </div>
              </div>
            </div>

            {(generatedSchedule.keyMilestones?.length ?? 0) > 0 && (
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
                  {generatedSchedule
                    .keyMilestones!.slice(0, 3)
                    .map((milestone: string) => (
                      <li
                        key={milestone.slice(0, 30)}
                        className="font-mono text-sm text-[#7f7f9f] flex items-start gap-2"
                      >
                        <ArrowRight className="w-4 h-4 text-[#00ff41] flex-shrink-0 mt-0.5" />
                        {milestone}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleSkipSchedule}
                disabled={isSavingSchedule}
              >
                PULAR
              </Button>
              <Button
                onClick={handleImportSchedule}
                disabled={isSavingSchedule}
                className="gap-2"
              >
                {isSavingSchedule ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    IMPORTANDO...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    IMPORTAR PARA PLANNER
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
