"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createContest } from "@/features/contests/actions";
import { formSchema, type FormData } from "./types";

export function useCreateContestDialog() {
  const [open, setOpen] = useState(false);
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
      if (res?.error) {
        toast.error(`Erro: ${res.error}`);
      } else {
        toast.success("Concurso criado!");
        setOpen(false);
        form.reset();
      }
    } catch {
      toast.error("Ocorreu um erro inesperado ao salvar o concurso.");
    }
  }

  return { open, setOpen, form, onSubmit };
}
