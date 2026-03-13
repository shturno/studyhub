"use client";

import { useEffect, useState } from "react";

interface BlinkCursorProps {
  readonly text: string;
}

export function BlinkCursor({ text }: BlinkCursorProps) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="mt-6 mb-10"
      style={{
        fontSize: 9,
        color: "#ffbe0b",
        textShadow: "0 0 12px #ffbe0b",
        letterSpacing: "0.12em",
        opacity: blink ? 1 : 0,
        transition: "opacity 0.1s",
      }}
    >
      {text}
    </div>
  );
}
