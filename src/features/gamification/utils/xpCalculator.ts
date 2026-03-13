export const XP_PER_MINUTE = 10;

export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100,
  10500, 12000, 13600, 15300, 17100, 19000, 21000, 23100, 25300, 27600, 30000,
];

export function calculateXP(minutes: number): number {
  return minutes * XP_PER_MINUTE;
}

export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(
  currentXP: number,
  currentLevel: number,
): number {
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel] || Infinity;
  return nextLevelXP - currentXP;
}

export function getLevelProgress(
  currentXP: number,
  currentLevel: number,
): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) return 100;

  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel];
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;

  return Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100);
}
