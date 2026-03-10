/**
 * Streak — dias consecutivos de estudo.
 *
 * Regras:
 * - Estudar no mesmo dia do `lastStudyDate` → streak mantido (sem incremento)
 * - Estudar no dia seguinte → streak + 1
 * - Gap de 2+ dias → streak volta para 1
 * - Primeiro estudo (lastStudyDate = null) → streak = 1
 */

export interface StreakResult {
  newStreak: number;
  /** true quando é o primeiro estudo do dia (deve exibir animação/toast) */
  isNewDay: boolean;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function calculateStreak(
  lastStudyDate: Date | null,
  currentStreak: number,
  now: Date = new Date(),
): StreakResult {
  const todayStr = toDateString(now);

  if (!lastStudyDate) {
    return { newStreak: 1, isNewDay: true };
  }

  const lastStr = toDateString(lastStudyDate);

  // Já estudou hoje — mantém streak, não é "novo dia"
  if (lastStr === todayStr) {
    return { newStreak: currentStreak, isNewDay: false };
  }

  // Calcula diferença em dias (UTC, sem horas)
  const lastDate = new Date(lastStr + "T00:00:00Z");
  const todayDate = new Date(todayStr + "T00:00:00Z");
  const diffDays = Math.round(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 1) {
    // Dia seguinte → incrementa
    return { newStreak: currentStreak + 1, isNewDay: true };
  }

  // Gap de 2+ dias → reseta
  return { newStreak: 1, isNewDay: true };
}

/**
 * Multiplicador de XP baseado no streak atual.
 *
 * | Dias   | Multiplicador |
 * |--------|---------------|
 * | 1–6    | 1.0×          |
 * | 7–13   | 1.1×          |
 * | 14–29  | 1.25×         |
 * | 30+    | 1.5×          |
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.25;
  if (streak >= 7) return 1.1;
  return 1.0;
}

export function getStreakTier(streak: number): "none" | "bronze" | "silver" | "gold" {
  if (streak >= 30) return "gold";
  if (streak >= 14) return "silver";
  if (streak >= 7) return "bronze";
  return "none";
}
