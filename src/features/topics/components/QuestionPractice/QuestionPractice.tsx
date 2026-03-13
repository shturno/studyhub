"use client";

import { Loader2, X, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { QuestionPracticeProps } from "./types";
import { useQuestionPractice } from "./useQuestionPractice";

export function QuestionPractice({
  topicId,
  topicName,
  contestId,
  onClose,
}: Readonly<QuestionPracticeProps>) {
  const { state, currentQuestion, isAnswered, handleAnswer, handleNext, handleClose } =
    useQuestionPractice({
      topicId,
      topicName,
      contestId,
      onClose,
    });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        hideCloseButton
        className="max-w-2xl bg-[#04000a] border-2 border-[#00ff41]"
        style={{
          boxShadow: "0 0 20px rgba(0,255,65,0.2), inset 0 0 20px rgba(0,255,65,0.05)",
        }}
      >
        {/* Loading Phase */}
        {state.phase === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#00ff41" }} />
            <div className="font-pixel text-sm text-[#e0e0ff]">
              Gerando questões com IA...
            </div>
          </div>
        )}

        {/* Answering Phase */}
        {state.phase === "answering" && currentQuestion && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-pixel text-[7px] text-[#7f7f9f] mb-1">
                  TÓPICO
                </div>
                <div className="font-mono text-sm text-[#e0e0ff]">{topicName}</div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-[#1a1a2e] transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" style={{ color: "#7f7f9f" }} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="font-pixel text-[7px] text-[#7f7f9f]">
                PERGUNTA {state.currentIndex + 1} DE {state.questions.length}
              </div>
              <div className="w-full h-1 bg-[#1a1a2e]" style={{ border: "1px solid #7f7f9f" }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${((state.currentIndex + 1) / state.questions.length) * 100}%`,
                    background: "#00ff41",
                  }}
                />
              </div>
            </div>

            {/* Question Statement */}
            <div className="p-4" style={{ border: "1px solid #7f7f9f", background: "#0a0a14" }}>
              <div className="font-mono text-base text-[#e0e0ff] leading-relaxed">
                {currentQuestion.statement}
              </div>
            </div>

            {/* Options */}
            {currentQuestion.type === "CERTO_ERRADO" ? (
              <div className="grid grid-cols-2 gap-3">
                {["CERTO", "ERRADO"].map((option) => {
                  const isSelectedAnswer =
                    isAnswered && state.answers[currentQuestion.id] === (option === "CERTO");
                  const isCorrectAnswer = currentQuestion.answer === option;
                  const showFeedback = isAnswered;

                  let bgColor = "bg-[#1a1a2e]";
                  let borderColor = "#7f7f9f";
                  let textColor = "#e0e0ff";

                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      bgColor = "bg-[#00ff4108]";
                      borderColor = "#00ff41";
                      textColor = "#00ff41";
                    } else if (isSelectedAnswer) {
                      bgColor = "bg-[#ff006e08]";
                      borderColor = "#ff006e";
                      textColor = "#ff006e";
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswered}
                      className={`p-4 transition-all ${bgColor} disabled:cursor-default font-pixel text-sm ${
                        !isAnswered && "hover:bg-[#2a2a3e]"
                      }`}
                      style={{ border: `2px solid ${borderColor}`, color: textColor }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {currentQuestion.options?.map((opt) => {
                  const isSelectedAnswer =
                    isAnswered && state.answers[currentQuestion.id] === (opt.key === currentQuestion.answer);
                  const isCorrectAnswer = opt.key === currentQuestion.answer;
                  const showFeedback = isAnswered;

                  let bgColor = "bg-[#1a1a2e]";
                  let borderColor = "#7f7f9f";
                  let textColor = "#e0e0ff";

                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      bgColor = "bg-[#00ff4108]";
                      borderColor = "#00ff41";
                      textColor = "#00ff41";
                    } else if (isSelectedAnswer) {
                      bgColor = "bg-[#ff006e08]";
                      borderColor = "#ff006e";
                      textColor = "#ff006e";
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswer(opt.key)}
                      disabled={isAnswered}
                      className={`p-3 text-left transition-all ${bgColor} disabled:cursor-default font-mono text-sm ${
                        !isAnswered && "hover:bg-[#2a2a3e]"
                      }`}
                      style={{ border: `2px solid ${borderColor}`, color: textColor }}
                    >
                      <span className="font-pixel font-bold">{opt.key}. </span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Explanation */}
            {isAnswered && (
              <div
                className="p-4 space-y-2"
                style={{
                  border: "1px solid #c084fc",
                  background: "rgba(192,132,252,0.05)",
                  borderLeft: "3px solid #c084fc",
                }}
              >
                <div className="font-pixel text-[7px] text-[#c084fc]">EXPLICAÇÃO</div>
                <div className="font-mono text-sm text-[#e0e0ff]">{currentQuestion.explanation}</div>
              </div>
            )}

            {/* Action Button */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full font-pixel text-sm text-black bg-[#00ff41] px-4 py-3 hover:bg-[#00dd35] transition-colors"
                style={{ boxShadow: "3px 3px 0px #009933" }}
              >
                {state.currentIndex < state.questions.length - 1 ? "PRÓXIMA →" : "VER RESULTADOS →"}
              </button>
            )}
          </div>
        )}

        {/* Results Phase */}
        {state.phase === "results" && (
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className="w-20 h-20 flex items-center justify-center text-4xl font-pixel"
                  style={{
                    background: "radial-gradient(circle, #00ff4120, transparent)",
                    border: "2px solid #00ff41",
                    boxShadow: "0 0 20px rgba(0,255,65,0.3)",
                  }}
                >
                  {state.score}/{state.questions.length}
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" style={{ color: "#00ff41" }} />
                </div>
              </div>

              <div className="text-center mt-4">
                <div className="font-pixel text-sm text-[#e0e0ff] mb-2">
                  {(() => {
                    if (state.score === state.questions.length) return "PERFEITO!";
                    if (state.score >= state.questions.length * 0.7) return "BOM RESULTADO!";
                    return "CONTINUE ESTUDANDO!";
                  })()}
                </div>
                <div
                  className="font-pixel text-2xl font-bold"
                  style={{
                    color: "#00ff41",
                    textShadow: "0 0 10px rgba(0,255,65,0.5)",
                  }}
                >
                  +{state.xpEarned} XP
                </div>
              </div>

              <div className="w-full space-y-2">
                <div className="font-pixel text-[7px] text-[#7f7f9f]">RESUMO</div>
                <div
                  className="p-4 space-y-2"
                  style={{ border: "1px solid #7f7f9f", background: "#0a0a14" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-[#e0e0ff]">Acertos:</span>
                    <span
                      className="font-pixel text-lg"
                      style={{ color: "#00ff41", textShadow: "0 0 8px rgba(0,255,65,0.5)" }}
                    >
                      {state.score}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-[#e0e0ff]">Total:</span>
                    <span className="font-pixel text-lg text-[#7f7f9f]">{state.questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-[#e0e0ff]">Taxa:</span>
                    <span
                      className="font-pixel text-lg"
                      style={{
                        color:
                          state.score >= state.questions.length * 0.7 ? "#00ff41" : "#ff006e",
                      }}
                    >
                      {Math.round((state.score / state.questions.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full font-pixel text-sm text-black bg-[#00ff41] px-4 py-3 hover:bg-[#00dd35] transition-colors"
              style={{ boxShadow: "3px 3px 0px #009933" }}
            >
              FECHAR
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
