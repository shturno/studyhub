"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createContest } from "@/features/contests/actions";
import { formSchema, type FormData } from "./types";
import { useAchievementModal } from "@/lib/achievement-modal-context";

export function useCreateContestDialog() {
  const t = useTranslations("CreateContestDialog");
  const [open, setOpen] = useState(false);
  const { showAchievements } = useAchievementModal();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      institution: "",
      role: "",
      isPrimary: false,
    },
  });

  async function onSubmit(values: FormData) {
    try {
      const res = await createContest(values);
      if ("error" in res) {
        toast.error(`${t("error")}: ${res.error}`);
      } else {
        toast.success(t("created"));
        if (res.newAchievements.length > 0) {
          showAchievements(res.newAchievements);
        }
        setOpen(false);
        form.reset();
      }
    } catch {
      toast.error(t("unexpectedError"));
    }
  }

  return { open, setOpen, form, onSubmit };
}
