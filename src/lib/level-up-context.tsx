"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import dynamic from "next/dynamic";

const LevelUpAnimation = dynamic(
  () =>
    import("@/features/gamification/components/LevelUpAnimation").then(
      (m) => ({ default: m.LevelUpAnimation }),
    ),
  { ssr: false },
);

interface LevelUpContextType {
  showLevelUp: (newLevel: number) => void;
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

export function LevelUpProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  const showLevelUp = useCallback((level: number) => {
    setNewLevel(level);
    setShow(true);
  }, []);

  const handleComplete = useCallback(() => {
    setShow(false);
  }, []);

  return (
    <LevelUpContext.Provider value={{ showLevelUp }}>
      {children}
      <LevelUpAnimation
        show={show}
        newLevel={newLevel}
        onComplete={handleComplete}
      />
    </LevelUpContext.Provider>
  );
}

export function useLevelUp() {
  const context = useContext(LevelUpContext);
  if (context === undefined) {
    throw new Error("useLevelUp must be used within LevelUpProvider");
  }
  return context;
}
