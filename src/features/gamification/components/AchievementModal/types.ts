import type { UnlockedAchievement } from "@/features/gamification/services/achievementService";

export interface AchievementModalProps {
  achievement: UnlockedAchievement | null;
  nextHint?: string;
  onClose: () => void;
}
