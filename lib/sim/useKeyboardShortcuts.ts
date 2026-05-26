"use client";

import { useEffect, useCallback } from "react";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

interface KeyboardShortcutsOptions {
  onReset: () => void;
  onStepEpisode: () => void;
  onStepAction: () => void;
}

export function useKeyboardShortcuts({
  onReset,
  onStepEpisode,
  onStepAction,
}: KeyboardShortcutsOptions) {
  const { isPlaying, setIsPlaying } = usePlaygroundStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case "n":
          e.preventDefault();
          onStepEpisode();
          break;
        case "s":
          e.preventDefault();
          onStepAction();
          break;
        case "r":
          e.preventDefault();
          onReset();
          break;
      }
    },
    [isPlaying, setIsPlaying, onReset, onStepEpisode, onStepAction]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
