"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Settings, Bell, Save, Globe } from "lucide-react";
import { updateProfileSettings } from "@/app/[locale]/(authenticated)/settings/actions";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { updateSettingsSchema } from "@/lib/schemas";
import type { z } from "zod";

type SettingsFormData = z.infer<typeof updateSettingsSchema>;

interface SettingsFormProps {
  initialName: string;
  initialEmail: string;
  initialPomodoro: number;
  initialBreak: number;
  initialDailyGoal: number;
  initialLocale: string;
}

export function SettingsForm({
  initialName,
  initialEmail,
  initialPomodoro,
  initialBreak,
  initialDailyGoal,
  initialLocale,
}: Readonly<SettingsFormProps>) {
  const t = useTranslations("Settings");
  const router = useRouter();
  const pathname = usePathname();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      name: initialName,
      pomodoroDefault: initialPomodoro,
      breakDefault: initialBreak,
      dailyGoalMinutes: initialDailyGoal,
    },
  });

  const name = watch("name");
  const pomodoro = watch("pomodoroDefault");
  const breakTime = watch("breakDefault");
  const dailyGoal = watch("dailyGoalMinutes");
  const [locale, setLocale] = useState(initialLocale);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateProfileSettings({
        name: data.name ?? initialName,
        pomodoroDefault: data.pomodoroDefault,
        breakDefault: data.breakDefault,
        dailyGoalMinutes: data.dailyGoalMinutes,
        locale,
      });

      if (locale !== initialLocale) {
        const newPath = pathname.replace(`/${initialLocale}/`, `/${locale}/`);
        router.push(newPath);
      }

      toast.success(t("saved"));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveError"));
    }
  };

  const hasChanges =
    name !== initialName ||
    pomodoro !== initialPomodoro ||
    breakTime !== initialBreak ||
    dailyGoal !== initialDailyGoal ||
    locale !== initialLocale;

  return (
    <div className="space-y-6">
      <div
        className="p-5 space-y-5"
        style={{
          border: "2px solid rgba(0,255,65,0.4)",
          background: "#04000a",
        }}
      >
        <div
          className="flex items-center gap-3 pb-3"
          style={{ borderBottom: "1px solid rgba(0,255,65,0.15)" }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center text-[#00ff41]"
            style={{ border: "2px solid rgba(0,255,65,0.4)" }}
          >
            <User className="w-4 h-4" />
          </div>
          <span className="font-pixel text-[8px] text-[#00ff41]">PERFIL</span>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="font-pixel text-[7px] text-[#7f7f9f]"
            >
              NOME
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="bg-[#020008] border-[#333] text-[#e0e0ff] focus-visible:ring-[#00ff41] rounded-none"
              style={{
                borderColor: errors.name ? "#ff006e" : undefined,
              }}
            />
            {errors.name && (
              <p className="text-[#ff006e] text-[10px] font-mono">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-pixel text-[7px] text-[#7f7f9f]"
            >
              EMAIL
            </Label>
            <Input
              id="email"
              value={initialEmail}
              disabled
              className="bg-[#0a0005]/50 border-[#222] text-[#555] rounded-none cursor-not-allowed"
            />
            <p className="text-[#555] text-[10px] font-mono mt-1">
              O email está vinculado ao seu login e não pode ser alterado.
            </p>
          </div>
        </div>
      </div>

      <div
        className="p-5 space-y-5"
        style={{
          border: "2px solid rgba(0,255,65,0.4)",
          background: "#04000a",
        }}
      >
        <div
          className="flex items-center gap-3 pb-3"
          style={{ borderBottom: "1px solid rgba(0,255,65,0.15)" }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center text-[#00ff41]"
            style={{ border: "2px solid rgba(0,255,65,0.4)" }}
          >
            <Settings className="w-4 h-4" />
          </div>
          <span className="font-pixel text-[8px] text-[#00ff41]">
            PREFERENCIAS DE ESTUDO
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="pomodoro"
              className="font-pixel text-[7px] text-[#7f7f9f]"
            >
              FOCO (min)
            </Label>
            <Input
              id="pomodoro"
              type="number"
              {...register("pomodoroDefault", { valueAsNumber: true })}
              min={5}
              max={120}
              className="bg-[#020008] border-[#333] text-[#00ff41] focus-visible:ring-[#00ff41] rounded-none font-mono"
              style={{
                borderColor: errors.pomodoroDefault ? "#ff006e" : undefined,
              }}
            />
            {errors.pomodoroDefault && (
              <p className="text-[#ff006e] text-[10px] font-mono">
                {errors.pomodoroDefault.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="break"
              className="font-pixel text-[7px] text-[#7f7f9f]"
            >
              PAUSA (min)
            </Label>
            <Input
              id="break"
              type="number"
              {...register("breakDefault", { valueAsNumber: true })}
              min={1}
              max={60}
              className="bg-[#020008] border-[#333] text-[#00ff41] focus-visible:ring-[#00ff41] rounded-none font-mono"
              style={{
                borderColor: errors.breakDefault ? "#ff006e" : undefined,
              }}
            />
            {errors.breakDefault && (
              <p className="text-[#ff006e] text-[10px] font-mono">
                {errors.breakDefault.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="dailyGoal"
            className="font-pixel text-[7px] text-[#7f7f9f]"
          >
            META DIÁRIA (min)
          </Label>
          <Input
            id="dailyGoal"
            type="number"
            {...register("dailyGoalMinutes", { valueAsNumber: true })}
            min={10}
            max={1440}
            className="bg-[#020008] border-[#333] text-[#00ff41] focus-visible:ring-[#00ff41] rounded-none font-mono"
            style={{
              borderColor: errors.dailyGoalMinutes ? "#ff006e" : undefined,
            }}
          />
          <p className="text-[#555] text-[10px] font-mono">
            Minutos de estudo que você quer completar por dia. Ex: 120 = 2 horas.
          </p>
          {errors.dailyGoalMinutes && (
            <p className="text-[#ff006e] text-[10px] font-mono">
              {errors.dailyGoalMinutes.message}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !hasChanges}
            className="flex items-center gap-2 font-pixel text-[8px] px-6 py-3 transition-all rounded-none"
            style={{
              backgroundColor: hasChanges ? "#00ff41" : "#020008",
              color: hasChanges ? "#04000a" : "#555",
              border: hasChanges ? "1px solid #00ff41" : "1px solid #333",
              boxShadow: hasChanges ? "0 0 15px rgba(0,255,65,0.3)" : "none",
              cursor: isSubmitting || !hasChanges ? "not-allowed" : "pointer",
            }}
          >
            <Save className="w-3 h-3" />
            {isSubmitting ? "SALVANDO..." : "SALVAR ALTERACOES"}
          </button>
        </div>
      </div>

      <div
        className="p-5 space-y-5"
        style={{
          border: "2px solid rgba(0,255,65,0.4)",
          background: "#04000a",
        }}
      >
        <div
          className="flex items-center gap-3 pb-3"
          style={{ borderBottom: "1px solid rgba(0,255,65,0.15)" }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center text-[#00ff41]"
            style={{ border: "2px solid rgba(0,255,65,0.4)" }}
          >
            <Globe className="w-4 h-4" />
          </div>
          <span className="font-pixel text-[8px] text-[#00ff41]">IDIOMA</span>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="locale"
            className="font-pixel text-[7px] text-[#7f7f9f]"
          >
            LANGUAGE / IDIOMA / IDIOMA
          </Label>
          <select
            id="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full bg-[#020008] border-[#333] border text-[#00ff41] focus-visible:ring-[#00ff41] rounded-none font-mono p-2 cursor-pointer"
          >
            <option value="pt">🇧🇷 Português (PT-BR)</option>
            <option value="en">🇺🇸 English (US)</option>
            <option value="es">🇪🇸 Español (ES)</option>
          </select>
          <p className="text-[#7f7f9f] text-[10px] font-mono mt-1">
            A interface será exibida no idioma selecionado.
          </p>
        </div>
      </div>

      <div
        className="p-5 opacity-40"
        style={{ border: "2px solid #333", background: "#04000a" }}
      >
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4 text-[#555]" />
          <span className="font-pixel text-[8px] text-[#555]">
            NOTIFICACOES
          </span>
          <span className="font-pixel text-[6px] text-[#333] ml-2">
            — EM DESENVOLVIMENTO
          </span>
        </div>
      </div>
    </div>
  );
}
