export interface SM2Input {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0-1=falha, 2=difícil, 3=ok, 4=bom, 5=fácil
  interval: number;    // dias até próxima revisão
  easeFactor: number;  // EF, mínimo 1.3
  repetitions: number; // repetições consecutivas bem-sucedidas
}

export interface SM2Result {
  nextInterval: number;
  nextEaseFactor: number;
  nextRepetitions: number;
  scheduledFor: Date;
}

/**
 * Algoritmo SM-2 original de Piotr Wozniak.
 * quality < 3 = falha (reinicia sequência)
 * quality >= 3 = acerto (avança intervalo)
 */
export function sm2(input: SM2Input): SM2Result {
  const { quality, interval, easeFactor, repetitions } = input;

  let nextRepetitions: number;
  let nextInterval: number;
  let nextEaseFactor: number;

  if (quality < 3) {
    // Falha: reiniciar sequência, não altera EF
    nextRepetitions = 0;
    nextInterval = 1;
    nextEaseFactor = easeFactor;
  } else {
    // Acerto
    nextRepetitions = repetitions + 1;
    if (repetitions === 0) nextInterval = 1;
    else if (repetitions === 1) nextInterval = 6;
    else nextInterval = Math.round(interval * easeFactor);

    // EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    nextEaseFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    );
  }

  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + nextInterval);

  return { nextInterval, nextEaseFactor, nextRepetitions, scheduledFor };
}
