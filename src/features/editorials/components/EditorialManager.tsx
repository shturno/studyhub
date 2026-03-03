"use client";

import { useState, useRef } from "react";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { savePlannedSession } from "@/features/study-cycle/actions";
import { GeneratedSchedule } from "@/features/ai/services/geminiScheduleService";
import { StudyAreaPriority } from "@/features/editorials/services/contentCrossingService";

interface EditorialManagerProps {
  contestId: string;
  role?: string;
  examDate?: string | null;
  onEditorialAdded?: () => void;
}

export function EditorialManager({
  contestId,
  role,
  examDate: examDateProp,
  onEditorialAdded,
}: Readonly<EditorialManagerProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState("");
  const [selectedRole, setSelectedRole] = useState(role || "");
  const [examDate, setExamDate] = useState(
    examDateProp ? examDateProp.split("T")[0] : "",
  );
  const [generatedSchedule, setGeneratedSchedule] = useState<
    (GeneratedSchedule & { priorities?: StudyAreaPriority[] }) | null
  >(null);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleChangeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validatePageRanges = (ranges: string): boolean => {
    if (!ranges.trim()) return false;
    const pageRangeRegex = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/;
    return pageRangeRegex.test(ranges.trim());
  };

  const handleSubmit = async () => {
    if (!selectedFile || !pageRanges.trim()) {
      toast.error("Por favor, preencha as páginas e selecione um arquivo");
      return;
    }

    if (!selectedRole.trim()) {
      toast.error("Por favor, especifique o cargo");
      return;
    }

    if (!validatePageRanges(pageRanges)) {
      toast.error("Formato de páginas inválido. Use: 15-25, 30, 45-50");
      return;
    }

    try {
      setIsParsing(true);

      toast.info("Enviando o PDF para a nuvem de forma segura...", {
        duration: 5000,
      });

      const timestamp = Date.now();
      const fileExtension = selectedFile.name.split(".").pop();
      const uniqueFileName = `edital-${timestamp}.${fileExtension}`;

      const newBlob = await upload(uniqueFileName, selectedFile, {
        access: "public",
        handleUploadUrl: "/api/editorials/upload",
      });

      const formData = new FormData();
      formData.append("fileUrl", newBlob.url);
      formData.append("fileName", selectedFile.name);
      formData.append("contestId", contestId);
      formData.append("pageRanges", pageRanges.trim());
      formData.append("role", selectedRole.trim());
      if (examDate) {
        formData.append("examDate", examDate);
      }

      toast.info(
        "IA do Alquimista lendo as páginas selecionadas do PDF na Nuvem...",
        { duration: 5000 },
      );

      const response = await fetch("/api/editorials/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Erro ao processar PDF no backend.";
        try {
          const expectedJSON = JSON.parse(errorText);
          errorMessage = expectedJSON.error || errorMessage;
        } catch {
          if (response.status === 413) {
            errorMessage =
              "O arquivo PDF é muito grande (ultrapassa o limite de 4MB de upload grátis do Vercel).";
          } else if (response.status === 504) {
            errorMessage =
              "Vercel Timeout (504): A inteligência artificial demorou mais do que o limite de 10s para ler o PDF.";
          } else {
            errorMessage = `Erro ${response.status}: O servidor retornou uma falha fatal. Verifique a chave da API (GOOGLE_API_KEY) nas variáveis de ambiente do Vercel.`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.schedule && data.schedule.weeks > 0) {
        toast.success(
          "SUCESSO CRÍTICO: Edital, Disciplinas e Tópicos extraídos! Gerando cronograma...",
        );
        setGeneratedSchedule({ ...data.schedule, priorities: data.priorities });

        if (data.usedDefaultExamDate) {
          toast.info(
            "Data da prova não informada. Cronograma gerado com base em 6 meses.",
            { duration: 6000 },
          );
        }
      } else {
        toast.success(
          "SUCESSO CRÍTICO: Edital, Disciplinas e Tópicos extraídos perfeitamente pelo Gemini!",
        );
        setIsOpen(false);
        setSelectedFile(null);
        setPageRanges("");
        setExamDate("");
        router.refresh();
        onEditorialAdded?.();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Falha na inteligência artificial",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportSchedule = async () => {
    if (
      !generatedSchedule?.dailySessions ||
      generatedSchedule.dailySessions.length === 0
    ) {
      toast.error("Cronograma não contém sessões. Tente novamente.");
      return;
    }

    try {
      setIsSavingSchedule(true);

      let successCount = 0;
      for (const session of generatedSchedule.dailySessions) {
        try {
          const dateStr = session.day.split(" ")[0];

          const topicName = session.topics[0];
          let priority = generatedSchedule.priorities?.find(
            (p) => p.topicName === topicName,
          );

          if (!priority && generatedSchedule.priorities?.length) {
            priority = generatedSchedule.priorities[0];
          }

          if (priority) {
            await savePlannedSession({
              lessonId: priority.topicId,
              date: dateStr,
              duration: session.duration,
            });
            successCount++;
          }
        } catch {}
      }

      toast.success(
        `✅ ${successCount} sessões importadas do cronograma completo para o Planner!`,
      );
      setIsOpen(false);
      setSelectedFile(null);
      setPageRanges("");
      setExamDate("");
      setGeneratedSchedule(null);
      router.refresh();
      onEditorialAdded?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao importar cronograma",
      );
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSkipSchedule = () => {
    setGeneratedSchedule(null);
    setIsOpen(false);
    setSelectedFile(null);
    setPageRanges("");
    setExamDate("");
    router.refresh();
    onEditorialAdded?.();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3
          className="font-pixel text-[12px] text-[#ff006e] mb-1 flex items-center gap-2"
          style={{ textShadow: "0 0 10px rgba(255,0,110,0.5)" }}
        >
          <Book className="w-5 h-5 text-[#ff006e]" />
          INVENTÁRIO
        </h3>
        <p className="font-mono text-sm text-[#7f7f9f]">
          Extraia o edital via IA para montar sua Skill Tree instantaneamente.
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full gap-2 font-pixel text-[10px] tracking-wider transition-all"
            style={{
              backgroundColor: "#00ff41",
              color: "#04000a",
              boxShadow: "0 0 15px rgba(0,255,65,0.4)",
              borderRadius: 0,
            }}
          >
            <Plus className="w-4 h-4" />
            NOVO EDITAL
          </Button>
        </DialogTrigger>
        <DialogContent
          className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-0 rounded-none p-0"
          style={{
            background: "#0a0005",
            border: "2px solid #ff006e",
            boxShadow: "0 0 30px rgba(255,0,110,0.2)",
          }}
        >
          <div
            className="p-4 sticky top-0 z-10 bg-[#0a0005]"
            style={{ borderBottom: "2px dashed #ff006e" }}
          >
            <DialogHeader>
              <DialogTitle className="font-pixel text-lg text-[#ff006e] flex items-center gap-2">
                <Book className="w-5 h-5" />
                {generatedSchedule
                  ? "PREVIEW DO CRONOGRAMA"
                  : "EXTRAIR EDITAL COM IA"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {generatedSchedule ? (
              <div className="space-y-4">
                <div
                  className="p-4"
                  style={{
                    border: "1px solid rgba(0,255,65,0.3)",
                    background: "#020008",
                  }}
                >
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="font-pixel text-[9px] text-[#7f7f9f]">
                        SEMANAS
                      </p>
                      <p className="font-pixel text-xl text-[#00ff41]">
                        {generatedSchedule.weeks}
                      </p>
                    </div>
                    <div>
                      <p className="font-pixel text-[9px] text-[#7f7f9f]">
                        TOTAL DE HORAS
                      </p>
                      <p className="font-pixel text-xl text-[#00ff41]">
                        {generatedSchedule.totalHours}h
                      </p>
                    </div>
                    <div>
                      <p className="font-pixel text-[9px] text-[#7f7f9f]">
                        TÓPICOS
                      </p>
                      <p className="font-pixel text-xl text-[#00ff41]">
                        {generatedSchedule.priorities?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {generatedSchedule.keyMilestones &&
                  generatedSchedule.keyMilestones.length > 0 && (
                    <div
                      className="p-3"
                      style={{
                        border: "1px solid rgba(0,255,65,0.2)",
                        background: "#020008",
                      }}
                    >
                      <p className="font-pixel text-[10px] text-[#00ff41] mb-2">
                        📍 MARCOS IMPORTANTES
                      </p>
                      <div className="space-y-1">
                        {generatedSchedule.keyMilestones
                          .slice(0, 3)
                          .map((milestone, i) => (
                            <p
                              key={i}
                              className="font-mono text-xs text-[#7f7f9f]"
                            >
                              • {milestone}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}

                {generatedSchedule.tips &&
                  generatedSchedule.tips.length > 0 && (
                    <div
                      className="p-3"
                      style={{
                        border: "1px solid rgba(0,255,65,0.2)",
                        background: "#020008",
                      }}
                    >
                      <p className="font-pixel text-[10px] text-[#00ff41] mb-2">
                        💡 DICAS DE ESTUDO
                      </p>
                      <div className="space-y-1">
                        {generatedSchedule.tips.slice(0, 3).map((tip, i) => (
                          <p
                            key={i}
                            className="font-mono text-xs text-[#7f7f9f]"
                          >
                            • {tip}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="space-y-2">
                  <Button
                    onClick={handleImportSchedule}
                    disabled={isSavingSchedule}
                    className="w-full gap-2 font-pixel text-[10px] tracking-wider rounded-none"
                    style={{
                      backgroundColor: "#00ff41",
                      color: "#04000a",
                      boxShadow: "0 0 15px rgba(0,255,65,0.4)",
                    }}
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
                  <Button
                    onClick={handleSkipSchedule}
                    disabled={isSavingSchedule}
                    variant="outline"
                    className="w-full font-pixel text-[10px] tracking-wider rounded-none bg-[#04000a] text-[#7f7f9f] border border-[#7f7f9f] hover:bg-[#7f7f9f] hover:text-[#04000a]"
                  >
                    PULAR
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Label className="font-pixel text-[10px] text-[#00ff41] flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> OPÇÃO RECOMENDADA: SCANNER IA
                  (GEMINI)
                </Label>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="role"
                      className="font-pixel text-[10px] text-[#00ff41]"
                    >
                      1️⃣ Cargo/Posição
                    </Label>
                    <Input
                      id="role"
                      placeholder="Ex: Escriturário, Analista, Técnico..."
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="bg-[#04000a] text-white border-[#7f7f9f]/30 rounded-none focus-visible:ring-[#7f7f9f]"
                      disabled={isParsing}
                    />
                    <p className="font-mono text-xs text-[#7f7f9f]">
                      Especifique o cargo para o qual as matérias serão
                      extraídas
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="pageRanges"
                      className="font-pixel text-[10px] text-[#00ff41]"
                    >
                      2️⃣ Páginas com as matérias
                    </Label>
                    <Input
                      id="pageRanges"
                      placeholder="Ex: 15-25, 30, 45-50"
                      value={pageRanges}
                      onChange={(e) => setPageRanges(e.target.value)}
                      className="bg-[#04000a] text-white border-[#7f7f9f]/30 rounded-none focus-visible:ring-[#7f7f9f]"
                      disabled={isParsing}
                    />
                    <p className="font-mono text-xs text-[#7f7f9f]">
                      Separe ranges com vírgula. Ex: 15-25, 30, 45-50
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="pdfFile"
                      className="font-pixel text-[10px] text-[#00ff41]"
                    >
                      3️⃣ PDF do Edital
                    </Label>
                    <label
                      className={`w-full p-6 border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group ${isParsing ? "border-[#ff006e] bg-[#ff006e]/10 animate-pulse" : selectedFile ? "border-[#00ff41] bg-[#00ff41]/10" : "border-[#00ff41]/50 bg-[#00ff41]/5 hover:bg-[#00ff41]/20 hover:border-[#00ff41]"}`}
                    >
                      <input
                        id="pdfFile"
                        type="file"
                        accept="application/pdf, text/plain"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        disabled={isParsing}
                      />

                      {selectedFile ? (
                        <>
                          <div className="w-8 h-8 text-[#00ff41] flex items-center justify-center">
                            ✓
                          </div>
                          <div className="text-center">
                            <p className="font-mono text-xs text-[#00ff41]">
                              {selectedFile.name}
                            </p>
                            <p className="font-mono text-xs text-[#7f7f9f] mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-[#00ff41] group-hover:scale-110 transition-transform" />
                          <span className="font-mono text-xs text-[#00ff41] text-center">
                            Clique para selecionar o PDF
                            <br />
                            ou arraste um arquivo
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="examDate"
                      className="font-pixel text-[10px] text-[#00ff41] flex items-center gap-2"
                    >
                      <Calendar className="w-3 h-3" />
                      4️⃣ Data da Prova (opcional)
                    </Label>
                    <Input
                      id="examDate"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="bg-[#04000a] text-white border-[#7f7f9f]/30 rounded-none focus-visible:ring-[#7f7f9f]"
                      disabled={isParsing}
                    />
                    <p className="font-mono text-xs text-[#7f7f9f] flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      Se não informada, o cronograma usará 6 meses como base
                    </p>
                  </div>

                  {selectedFile && (
                    <Button
                      onClick={handleChangeFile}
                      disabled={isParsing}
                      variant="outline"
                      className="w-full font-pixel text-[10px] tracking-wider rounded-none bg-[#04000a] text-[#7f7f9f] border border-[#7f7f9f] hover:bg-[#7f7f9f] hover:text-[#04000a]"
                    >
                      Trocar Arquivo
                    </Button>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isParsing ||
                      !pageRanges.trim() ||
                      !selectedFile ||
                      !selectedRole.trim()
                    }
                    className="w-full gap-2 font-pixel text-[10px] tracking-wider transition-all rounded-none"
                    style={{
                      backgroundColor:
                        pageRanges.trim() && selectedFile && selectedRole.trim()
                          ? "#00ff41"
                          : "#7f7f9f",
                      color: "#04000a",
                      boxShadow:
                        pageRanges.trim() && selectedFile && selectedRole.trim()
                          ? "0 0 15px rgba(0,255,65,0.4)"
                          : "none",
                    }}
                  >
                    {isParsing ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        EXTRAINDO...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        EXTRAIR MATÉRIAS
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
