import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface AchievementCardProps {
  readonly achievement: {
    readonly name: string;
    readonly description: string;
    readonly icon: string;
    readonly xpReward: number;
    readonly isUnlocked: boolean;
    readonly unlockedAt: Date | null;
  };
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div
      className={cn(
        "relative p-4 transition-all duration-200 group",
        achievement.isUnlocked
          ? "hover:-translate-y-0.5"
          : "opacity-50 grayscale",
      )}
      style={{
        border: achievement.isUnlocked ? "2px solid #ffbe0b" : "2px solid #333",
        background: "#04000a",
        boxShadow: achievement.isUnlocked
          ? "4px 4px 0px #6b4f00, 0 0 15px rgba(255,190,11,0.2)"
          : "4px 4px 0px #111",
      }}
    >
      {achievement.isUnlocked && (
        <div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderLeft: "16px solid transparent",
            borderTop: "16px solid #ffbe0b",
          }}
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0",
            achievement.isUnlocked ? "" : "bg-[#0d001a]",
          )}
          style={{
            border: achievement.isUnlocked
              ? "2px solid #ffbe0b"
              : "2px solid #333",
          }}
        >
          {achievement.isUnlocked ? (
            achievement.icon
          ) : (
            <Lock className="w-5 h-5 text-[#555]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-pixel text-[7px] mb-1 truncate",
              achievement.isUnlocked ? "text-[#ffbe0b]" : "text-[#555]",
            )}
          >
            {achievement.name.toUpperCase()}
          </div>
          <div className="font-mono text-sm text-[#7f7f9f] leading-tight mb-2">
            {achievement.description}
          </div>

          {achievement.isUnlocked ? (
            <div className="flex items-center gap-2">
              <span
                className="font-pixel text-[6px] text-[#00ff41] px-2 py-0.5"
                style={{ border: "1px solid #00ff41" }}
              >
                UNLOCKED
              </span>
              <span className="font-pixel text-[6px] text-[#ffbe0b]">
                +{achievement.xpReward} XP
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="font-pixel text-[6px] text-[#555] px-2 py-0.5"
                style={{ border: "1px solid #333" }}
              >
                LOCKED
              </span>
              <span className="font-pixel text-[6px] text-[#555]">
                {achievement.xpReward} XP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
