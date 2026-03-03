export interface AchievementCardProps {
  readonly achievement: {
    readonly name: string;
    readonly description: string;
    readonly icon: string;
    readonly xpReward: number;
    readonly isUnlocked: boolean;
    readonly unlockedAt: Date | null;
  };
}
