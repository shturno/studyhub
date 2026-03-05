"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle } from "lucide-react";
import { completeReview } from "@/features/reviews/actions";
import { ReviewCard } from "../ReviewCard";
import type { ReviewWithTopic, ReviewQuality } from "@/features/reviews/types";

interface ReviewsViewProps {
  initialReviews: ReviewWithTopic[];
  nextReviewDate: Date | null;
}

export function ReviewsView({ initialReviews, nextReviewDate }: ReviewsViewProps) {
  const [queue, setQueue] = useState<ReviewWithTopic[]>(initialReviews);
  const [current, setCurrent] = useState(0);
  const [isPending, startTransition] = useTransition();
  const total = initialReviews.length;

  function handleComplete(reviewId: string, quality: number) {
    startTransition(async () => {
      await completeReview(reviewId, quality as ReviewQuality);
      setQueue((prev) => prev.filter((r) => r.id !== reviewId));
      setCurrent((prev) => prev + 1);
    });
  }

  const activeReview = queue[0] ?? null;
  const allDone = total === 0 || queue.length === 0;

  if (allDone) {
    return (
      <div className="min-h-screen bg-[#080010] flex flex-col items-center justify-center gap-8 p-6 text-center">
        <CheckCircle
          className="w-16 h-16"
          style={{ color: "#00ff41", filter: "drop-shadow(0 0 16px #00ff41)" }}
        />
        <div>
          <div
            className="font-pixel text-xl text-[#00ff41] mb-2"
            style={{ textShadow: "0 0 20px rgba(0,255,65,0.8)" }}
          >
            TUDO EM DIA
          </div>
          <div className="font-mono text-lg text-[#7f7f9f]">
            Nenhuma revisão pendente para hoje.
          </div>
        </div>
        {nextReviewDate && (
          <div
            className="px-6 py-3"
            style={{ border: "2px solid rgba(0,255,65,0.4)", background: "#04000a" }}
          >
            <div className="font-pixel text-[7px] text-[#7f7f9f] mb-1">
              PRÓXIMA REVISÃO
            </div>
            <div className="font-mono text-lg text-[#e0e0ff]">
              {format(new Date(nextReviewDate), "dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div
          className="flex items-center justify-between p-3"
          style={{ border: "2px solid #00ff41", background: "#04000a" }}
        >
          <span className="font-pixel text-[8px] text-[#00ff41]">REVISÕES</span>
          <span className="font-pixel text-[8px] text-[#7f7f9f]">
            {current}/{total}
          </span>
        </div>

        <div
          className="w-full h-1"
          style={{ background: "rgba(0,255,65,0.15)" }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${total > 0 ? (current / total) * 100 : 0}%`,
              background: "#00ff41",
              boxShadow: "0 0 8px rgba(0,255,65,0.6)",
            }}
          />
        </div>

        {activeReview && (
          <ReviewCard
            review={activeReview}
            onComplete={handleComplete}
            isLoading={isPending}
          />
        )}
      </div>
    </div>
  );
}
