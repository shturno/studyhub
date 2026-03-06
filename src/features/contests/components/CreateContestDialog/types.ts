import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  institution: z
    .string()
    .min(2, "Instituição deve ter pelo menos 2 caracteres"),
  role: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  examDate: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export type FormData = z.infer<typeof formSchema>;
