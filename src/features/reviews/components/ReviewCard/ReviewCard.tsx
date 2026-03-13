"use client";

import { useState } from "react";
import { QUALITY_LABELS, type ReviewQuality } from "@/features/reviews/types";
import type { ReviewCardProps } from "./types";

const QUALITIES: ReviewQuality[] = [0, 1, 2, 3, 4, 5];

export function ReviewCard({ review, onComplete, isLoading }: ReviewCardProps) {
  const [selected, setSelected] = useState<ReviewQuality | null>(null);

  function handleQuality(q: ReviewQuality) {
    if (isLoading) return;
    setSelected(q);
    onComplete(review.id, q);
  }

  return (
    <div
      className="flex flex-col gap-6 p-6 w-full"
      style={{ border: "2px solid rgba(0,255,65,0.4)", background: "#04000a" }}
    >
      {/* Header do card */}
      <div>
        <div className="font-pixel text-[7px] text-[#ff006e] mb-1">
          {review.subjectName.toUpperCase()}
        </div>
        <div
          className="font-mono text-2xl md:text-3xl text-[#e0e0ff] leading-tight"
          style={{ textShadow: "0 0 10px rgba(224,224,255,0.3)" }}
        >
          {review.topicName}
        </div>
      </div>

      {/* Metadados SM-2 */}
      <div className="flex gap-4 font-pixel text-[7px] text-[#7f7f9f]">
        <span>INTERVALO: {review.interval}d</span>
        <span>REPS: {review.repetitions}</span>
        <span>EF: {review.easeFactor.toFixed(2)}</span>
      </div>

      {/* Pergunta */}
      <div
        className="p-4 text-center"
        style={{ border: "1px solid rgba(0,255,65,0.2)", background: "#080010" }}
      >
        <span className="font-pixel text-[8px] text-[#7f7f9f]">
          COMO FOI SUA LEMBRANÇA DESTE TÓPICO?
        </span>
      </div>

      {/* Botões de qualidade */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {QUALITIES.map((q) => {
          const { label, color } = QUALITY_LABELS[q];
          const isSelected = selected === q;
          return (
            <button
              key={q}
              onClick={() => handleQuality(q)}
              disabled={isLoading}
              className="px-3 py-3 font-pixel text-[8px] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: `2px solid ${color}`,
                background: isSelected ? color : "transparent",
                color: isSelected ? "#000" : color,
                boxShadow: isSelected
                  ? `0 0 12px ${color}80`
                  : `0 0 4px ${color}30`,
              }}
            >
              {isLoading && isSelected ? "..." : label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
