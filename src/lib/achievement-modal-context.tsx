"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AchievementModal } from "@/features/gamification/components/AchievementModal";
import { NEXT_HINT } from "@/features/gamification/utils/achievementProgression";
import { getUnlockedAchievements } from "@/features/gamification/actions";
import type { UnlockedAchievement } from "@/features/gamification/services/achievementService";

interface AchievementModalContextType {
  showAchievements: (achievements: UnlockedAchievement[]) => void;
}

const AchievementModalContext = createContext<
  AchievementModalContextType | undefined
>(undefined);

const STORAGE_KEY = "shown_achievements";

function getShownSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(STORAGE_KEY);
  return new Set(raw ? (JSON.parse(raw) as string[]) : []);
}

function markShown(id: string): void {
  if (typeof window === "undefined") return;
  const set = getShownSet();
  set.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function AchievementModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<UnlockedAchievement[]>([]);

  const enqueue = useCallback((achievements: UnlockedAchievement[]) => {
    const shown = getShownSet();
    const unseen = achievements.filter((a) => !shown.has(a.id));
    if (unseen.length > 0) {
      setQueue((prev) => [...prev, ...unseen]);
    }
  }, []);

  useEffect(() => {
    getUnlockedAchievements().then((result) => {
      if (result.success) enqueue(result.data);
    });
  }, [enqueue]);

  const handleClose = () => {
    setQueue((prev) => {
      if (prev.length > 0) markShown(prev[0].id);
      return prev.slice(1);
    });
  };

  const current = queue[0] ?? null;
  const nextHint = current ? NEXT_HINT[current.slug] : undefined;

  return (
    <AchievementModalContext.Provider value={{ showAchievements: enqueue }}>
      {children}
      <AchievementModal
        achievement={current}
        nextHint={nextHint}
        onClose={handleClose}
      />
    </AchievementModalContext.Provider>
  );
}

export function useAchievementModal() {
  const context = useContext(AchievementModalContext);
  if (context === undefined) {
    throw new Error(
      "useAchievementModal must be used within AchievementModalProvider",
    );
  }
  return context;
}
