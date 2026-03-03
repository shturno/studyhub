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
    isParsing,
    selectedFile,
    pageRanges,
    setPageRanges,
    selectedRole,
    setSelectedRole,
    examDate,
    setExamDate,
    generatedSchedule,
    isSavingSchedule,
    fileInputRef,
    handleFileSelect,
    handleChangeFile,
    handleSubmit,
    handleImportSchedule,
    handleSkipSchedule,
  } = useEditorialManager(contestId, role, examDateProp, onEditorialAdded);

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
            IMPORTAR EDITAL
          </DialogTitle>
        </DialogHeader>

        {generatedSchedule === null ? (
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
                    <li>✓ Gera cronograma personalizado até a data da prova</li>
                    <li>✓ Você revisa e importa para o planner</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
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
                    EXTRAIR MATÉRIAS
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
                    COBERTURA
                  </div>
                  <div className="font-pixel text-xl text-[#ffbe0b] mt-1">
                    {generatedSchedule.weeks}%
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
