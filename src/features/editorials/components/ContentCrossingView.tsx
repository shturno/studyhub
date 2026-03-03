"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap } from "lucide-react";
import { getContentCrossings } from "../actions";
interface ContentCrossingViewProps {
  contestId: string;
  editorialCount: number;
}

interface Crossing {
  topicId: string;
  topicName: string;
  mappingCount: number;
  editorialCount: number;
  relevanceScore: number;
}

export function ContentCrossingView({
  contestId,
  editorialCount = 0,
}: Readonly<ContentCrossingViewProps>) {
  const [crossings, setCrossings] = useState<Crossing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (editorialCount < 2) {
      setLoading(false);
      return;
    }

    async function loadCrossings() {
      try {
        const data = await getContentCrossings(contestId);

        const multipleCrossings = data.filter((c) => c.editorialCount > 1);
        setCrossings(multipleCrossings);
      } catch (error) {
        console.error("Error loading crossings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCrossings();
  }, [contestId, editorialCount]);

  if (editorialCount < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-[#ff006e]/50 mb-4" />
        <h3 className="font-pixel text-[10px] text-[#e0e0ff] mb-2">
          NENHUM CRUZAMENTO
        </h3>
        <p className="font-mono text-[#7f7f9f] text-sm text-center">
          Adicione pelo menos 2 editais ao concurso para mapear sobreposições.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 rounded-none border-2 border-[#00ff41] border-t-transparent animate-[spin_0.5s_linear_infinite] mx-auto mb-3" />
          <p className="font-pixel text-[8px] text-[#00ff41] animate-pulse">
            CARREGANDO...
          </p>
        </div>
      </div>
    );
  }

  if (crossings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-[#333] border-dashed">
        <AlertCircle className="w-8 h-8 text-[#555] mb-4" />
        <h3 className="font-pixel text-[8px] text-[#a0a0ff] mb-2">
          CÓDIGO LIMPO
        </h3>
        <p className="font-mono text-[#7f7f9f] text-xs text-center">
          Nenhum tópico idêntico encontrado nestes editais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
        {crossings.map((crossing) => (
          <Card
            key={crossing.topicId}
            className="p-4 bg-[#0a0a0f] border-2 border-[#333] hover:border-[#ff006e] transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#ff006e] group-hover:animate-pulse shrink-0" />
                  <h4 className="font-pixel text-[10px] text-[#e0e0ff] leading-loose break-words">
                    {crossing.topicName}
                  </h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="border-[#ff006e]/50 text-[#ff006e] bg-[#ff006e]/10 font-mono text-xs rounded-none"
                  >
                    {crossing.editorialCount} edital
                    {crossing.editorialCount === 1 ? "" : "is"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[#00ff41]/50 text-[#00ff41] bg-[#00ff41]/10 font-mono text-xs rounded-none"
                  >
                    {crossing.mappingCount} maps
                  </Badge>
                </div>
              </div>
              <div className="text-right flex flex-col items-end justify-center">
                <div
                  className="text-2xl font-pixel text-[#00ff41]"
                  style={{ textShadow: "0 0 10px rgba(0,255,65,0.4)" }}
                >
                  {crossing.relevanceScore}%
                </div>
                <p className="font-mono text-[10px] text-[#555] mt-1">
                  RELEVÂNCIA
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-[#0a0005] border-2 border-dashed border-[#ff006e]/50">
        <p className="font-mono text-xs text-[#ff006e]/80 leading-relaxed">
          <span className="font-bold text-[#ff006e]">[{crossings.length}]</span>{" "}
          tópico{crossings.length === 1 ? "" : "s"} em intersecção. Focar nessas
          matérias rende XP dobrado no aprendizado global.
        </p>
      </Card>
    </div>
  );
}
