"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Zap, Beaker } from "lucide-react";
import { fuseContests } from "../fuseActions";

interface MergeContestsViewProps {
  readonly availableContests: Array<{
    id: string;
    name: string;
    institution: string;
    _count: { subjects: number };
  }>;
}

export function MergeContestsView({
  availableContests,
}: MergeContestsViewProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFusing, setIsFusing] = useState(false);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleFuse = async () => {
    if (selectedIds.size < 2) {
      toast.error("O Laboratório precisa de pelo menos 2 editais para fundir!");
      return;
    }

    setIsFusing(true);
    try {
      await fuseContests(Array.from(selectedIds));

      toast.success("Poder Cósmico Alcançado!", {
        description: "Super-Ciclo criado com sucesso.",
      });
      router.push("/contests");
      router.refresh();
    } catch (error) {
      toast.error("Falha na fusão.", { description: String(error) });
    } finally {
      setIsFusing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6"
        style={{
          border: "2px dashed rgba(255,0,110,0.5)",
          background: "#090004",
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Beaker className="w-8 h-8 text-[#ff006e]" />
            <h2
              className="font-pixel text-xl text-[#ff006e]"
              style={{ textShadow: "0 0 15px rgba(255,0,110,0.6)" }}
            >
              O ALQUIMISTA
            </h2>
          </div>
          <p className="font-mono text-sm text-[#7f7f9f]">
            Selecione 2 ou mais concursos para combinar matérias repetidas e
            criar um Super-Ciclo de Estudos Otimizado.
          </p>
        </div>

        <Button
          onClick={handleFuse}
          disabled={selectedIds.size < 2 || isFusing}
          className="h-14 px-8 text-[#04000a] font-pixel text-[10px]"
          style={{
            background: selectedIds.size >= 2 ? "#ff006e" : "#333",
            boxShadow: selectedIds.size >= 2 ? "4px 4px 0 #990042" : "none",
          }}
        >
          {isFusing ? (
            <span className="animate-pulse">SINTETIZANDO...</span>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              FUNDIR EDITAIS ({selectedIds.size})
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableContests.map((contest) => {
          const isSelected = selectedIds.has(contest.id);
          return (
            <button
              key={contest.id}
              onClick={() => toggleSelection(contest.id)}
              className="w-full text-left cursor-pointer transition-all duration-200 p-5 group flex flex-col focus:outline-none focus:ring-2 focus:ring-[#ff006e]"
              style={{
                border: isSelected ? "2px solid #ff006e" : "2px solid #333",
                background: isSelected ? "rgba(255,0,110,0.05)" : "#0a0a0f",
                boxShadow: isSelected ? "0 0 20px rgba(255,0,110,0.2)" : "none",
                transform: isSelected ? "translateY(-2px)" : "none",
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="font-pixel text-xs text-[#e0e0ff] group-hover:text-[#ff006e] transition-colors line-clamp-2 leading-loose">
                  {contest.name}
                </div>
                <div
                  className="w-5 h-5 flex items-center justify-center shrink-0"
                  style={{
                    border: "2px solid",
                    borderColor: isSelected ? "#ff006e" : "#555",
                    background: isSelected ? "#ff006e" : "transparent",
                  }}
                >
                  {isSelected && (
                    <span className="text-[#04000a] text-xs font-bold leading-none">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 space-y-2 w-full">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#555]">Banca/Instituição:</span>
                  <span className="text-[#aaa]">{contest.institution}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#555]">Matérias:</span>
                  <span className="text-[#aaa]">{contest._count.subjects}</span>
                </div>
              </div>
            </button>
          );
        })}

        {availableContests.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#555] font-pixel text-[8px]">
            NENHUM CONCURSO DISPONÍVEL NO INVENTÁRIO.
          </div>
        )}
      </div>
    </div>
  );
}
