"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fuseContests } from "@/features/contests/fuseActions";

export function useMergeContestsView() {
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

  return { selectedIds, isFusing, toggleSelection, handleFuse };
}
