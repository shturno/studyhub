export interface LevelUpAnimationProps {
  readonly show: boolean;
  readonly newLevel: number;
  readonly onComplete?: () => void;
}
