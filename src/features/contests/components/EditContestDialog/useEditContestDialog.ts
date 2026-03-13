"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateContest } from "@/features/contests/actions";
import { formSchema, type FormData, type EditContestDialogProps } from "./types";

export function useEditContestDialog({ contest }: EditContestDialogProps) {
  const t = useTranslations("EditContestDialog");
  const router = useRouter();
  const [open, setOpenRaw] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contest.name,
      institution: contest.institution,
      role: contest.role,
      examDate: contest.examDate ?? undefined,
      isPrimary: contest.isPrimary,
    },
  });

  function setOpen(value: boolean) {
    if (value) {
      form.reset({
        name: contest.name,
        institution: contest.institution,
        role: contest.role,
        examDate: contest.examDate ?? undefined,
        isPrimary: contest.isPrimary,
      });
    }
    setOpenRaw(value);
  }

  async function onSubmit(values: FormData) {
    try {
      const res = await updateContest(contest.id, values);
      if (!res.success) {
        toast.error(t("error"));
      } else {
        toast.success(t("saved"));
        setOpenRaw(false);
        router.refresh();
      }
    } catch {
      toast.error(t("unexpectedError"));
    }
  }

  return { open, setOpen, form, onSubmit };
}
