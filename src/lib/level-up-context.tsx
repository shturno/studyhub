"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { LevelUpAnimation } from "@/features/gamification/components/LevelUpAnimation";

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
