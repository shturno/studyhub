"use client";

import { useEffect } from "react";

interface HotkeyConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
}

export function useHotkeys(hotkeys: HotkeyConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        const isCtrlOrMeta = hotkey.ctrlKey
          ? event.ctrlKey
          : hotkey.metaKey
            ? event.metaKey
            : false;

        if (
          event.key.toLowerCase() === hotkey.key.toLowerCase() &&
          isCtrlOrMeta &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          hotkey.callback();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hotkeys]);
}

export function useCommonHotkeys(callbacks: {
  onSearch?: () => void;
  onNewLesson?: () => void;
}) {
  const hotkeys: HotkeyConfig[] = [];

  if (callbacks.onSearch) {
    hotkeys.push({
      key: "k",
      ctrlKey: true,
      callback: callbacks.onSearch,
    });
    hotkeys.push({
      key: "k",
      metaKey: true,
      callback: callbacks.onSearch,
    });
  }

  if (callbacks.onNewLesson) {
    hotkeys.push({
      key: "n",
      ctrlKey: true,
      callback: callbacks.onNewLesson,
    });
    hotkeys.push({
      key: "n",
      metaKey: true,
      callback: callbacks.onNewLesson,
    });
  }

  useHotkeys(hotkeys);
}
