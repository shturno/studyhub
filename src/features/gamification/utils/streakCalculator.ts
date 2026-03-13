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
  /** XP a subtrair do usuário por quebrar o streak. 0 se manteve ou incrementou. */
  xpPenalty: number;
  /** Streak perdido antes do reset. 0 se não houve reset. */
  streakLost: number;
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
    return { newStreak: 1, isNewDay: true, xpPenalty: 0, streakLost: 0 };
  }

  const lastStr = toDateString(lastStudyDate);

  // Já estudou hoje — mantém streak, não é "novo dia"
  if (lastStr === todayStr) {
    return { newStreak: currentStreak, isNewDay: false, xpPenalty: 0, streakLost: 0 };
  }

  // Calcula diferença em dias (UTC, sem horas)
  const lastDate = new Date(lastStr + "T00:00:00Z");
  const todayDate = new Date(todayStr + "T00:00:00Z");
  const diffDays = Math.round(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 1) {
    // Dia seguinte → incrementa
    return { newStreak: currentStreak + 1, isNewDay: true, xpPenalty: 0, streakLost: 0 };
  }

  // Gap de 2+ dias → reseta + penalidade proporcional ao streak perdido e ao gap
  // Ex: streak de 7 dias, gap de 3 dias = min(7*5 + (3-1)*10, 150) = 55 XP
  const gapPenalty = (diffDays - 1) * 10;
  const streakPenalty = currentStreak * 5;
  const xpPenalty = Math.min(streakPenalty + gapPenalty, 150);
  return { newStreak: 1, isNewDay: true, xpPenalty, streakLost: currentStreak };
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
