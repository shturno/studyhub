"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { registerSchema } from "@/lib/schemas";
import type { z } from "zod";

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("RegisterForm");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (formData: RegisterFormData) => {

    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          toast.error(data.error ?? t("accountCreationError"));
        } else {
          toast.success(t("accountCreationSuccess"));
          router.push("/login");
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : t("unknownError");
        toast.error(`${t("errorPrefix")} ${message}`);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="font-pixel text-[7px] text-[#ff006e] block"
        >
          {t("nameLabel")}
        </label>
        <Input
          id="name"
          type="text"
          placeholder={t("namePlaceholder")}
          {...register("name")}
          disabled={isSubmitting}
          autoComplete="name"
          style={{
            borderColor: errors.name ? "#ff006e" : "rgba(255,0,110,0.4)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#ff006e";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.name
              ? "#ff006e"
              : "rgba(255,0,110,0.4)";
          }}
        />
        {errors.name && (
          <p className="text-[#ff006e] text-[10px] font-mono">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="font-pixel text-[7px] text-[#ff006e] block"
        >
          {t("emailLabel")}
        </label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          disabled={isSubmitting}
          autoComplete="email"
          style={{
            borderColor: errors.email ? "#ff006e" : "rgba(255,0,110,0.4)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#ff006e";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.email
              ? "#ff006e"
              : "rgba(255,0,110,0.4)";
          }}
        />
        {errors.email && (
          <p className="text-[#ff006e] text-[10px] font-mono">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="font-pixel text-[7px] text-[#ff006e] block"
        >
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            disabled={isSubmitting}
            className="pr-10"
            autoComplete="new-password"
            style={{
              borderColor: errors.password ? "#ff006e" : "rgba(255,0,110,0.4)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#ff006e";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.password
                ? "#ff006e"
                : "rgba(255,0,110,0.4)";
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#ff006e] transition-colors"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[#ff006e] text-[10px] font-mono">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="font-pixel text-[7px] text-[#ff006e] block"
        >
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("confirmPassword")}
            disabled={isSubmitting}
            className="pr-10"
            autoComplete="new-password"
            style={{
              borderColor: errors.confirmPassword
                ? "#ff006e"
                : "rgba(255,0,110,0.4)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#ff006e";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.confirmPassword
                ? "#ff006e"
                : "rgba(255,0,110,0.4)";
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#ff006e] transition-colors"
            aria-label={
              showConfirmPassword ? t("hidePassword") : t("showPassword")
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[#ff006e] text-[10px] font-mono">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-pixel text-[10px] text-black bg-[#ff006e] h-12 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          boxShadow: "4px 4px 0px #6b0030, 0 0 15px rgba(255,0,110,0.3)",
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("creating")}
          </>
        ) : (
          t("submit")
        )}
      </button>
    </form>
  );
}
