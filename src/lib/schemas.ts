import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(128, "A senha deve ter no máximo 128 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const updateSettingsSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
  pomodoroDefault: z.number().min(5).max(120),
  breakDefault: z.number().min(1).max(60),
  dailyGoalMinutes: z.number().min(10).max(1440),
});

export const studySessionSchema = z.object({
  topicId: z.string().cuid(),
  minutes: z.number().min(1, "A sessão deve ter pelo menos 1 minuto"),
  difficulty: z.number().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
});

export const createTopicSchema = z.object({
  subjectId: z.string().cuid(),
  name: z.string().min(3, "O nome do tópico deve ser claro").max(100),
  parentId: z.string().cuid().optional(),
});

export const createMaterialSchema = z.object({
  type: z.enum(["link", "pdf", "video"], {
    errorMap: () => ({ message: "Tipo de material inválido" }),
  }),
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
});
