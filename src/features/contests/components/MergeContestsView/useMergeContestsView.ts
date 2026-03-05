"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { fuseContests } from "@/features/contests/fuseActions";

export function useMergeContestsView() {
  const t = useTranslations("Fusion");
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
      toast.error(t("minContests"));
      return;
    }

    setIsFusing(true);
    try {
      await fuseContests(Array.from(selectedIds));

      toast.success(t("success"), {
        description: t("successDescription"),
      });
      router.push("/contests");
      router.refresh();
    } catch {
      toast.error(t("error"), { description: t("errorDescription") });
    } finally {
      setIsFusing(false);
    }
  };

  return { selectedIds, isFusing, toggleSelection, handleFuse };
}
