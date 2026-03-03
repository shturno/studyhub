"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteContest } from "@/features/contests/actions";

export function useContestCard(contestId: string) {
  const router = useRouter();
  const t = useTranslations("ContestCard");

  async function handleDelete() {
    await deleteContest(contestId)
      .then(() => {
        toast.success(t("removedSuccess"));
        router.refresh();
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : t("unknownError");
        toast.error(`${t("removeErrorPrefix")} ${message}`);
      });
  }

  return { handleDelete };
}
