"use client";

import { Button } from "@/components/ui/Button";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

interface ControlPanelProps {
  onReset: () => void;
  onStepAction: () => void;
  onStepEpisode: () => void;
}

export function ControlPanel({
  onReset,
  onStepAction,
  onStepEpisode,
}: ControlPanelProps) {
  const { isPlaying, setIsPlaying } = usePlaygroundStore();

  return (
    <nav
      className="flex items-center gap-2 bg-bg-panel border border-border-subtle rounded px-3 py-2"
      role="toolbar"
      aria-label="Simulation controls"
    >
      <Button
        variant={isPlaying ? "primary" : "secondary"}
        size="sm"
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-16 font-mono"
        aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
        aria-pressed={isPlaying}
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>

      <div className="w-px h-5 bg-border-subtle" aria-hidden="true" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onStepAction}
        aria-label="Execute single step"
      >
        Step
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onStepEpisode}
        aria-label="Run complete episode"
      >
        Episode
      </Button>

      <div className="w-px h-5 bg-border-subtle" aria-hidden="true" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        aria-label="Reset simulation"
      >
        Reset
      </Button>
    </nav>
  );
}
