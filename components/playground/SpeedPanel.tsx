"use client";

import { Panel } from "@/components/ui/Panel";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

const SPEED_STEPS = [1, 10, 100, 1000, 10000];

export function SpeedPanel() {
  const { speed, setSpeed } = usePlaygroundStore();

  const speedIndex = SPEED_STEPS.findIndex((s) => s >= speed);
  const currentIndex = speedIndex === -1 ? SPEED_STEPS.length - 1 : speedIndex;

  const formatSpeed = (s: number) => {
    if (s >= 1000) return `${s / 1000}k`;
    return String(s);
  };

  return (
    <Panel title="Speed">
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Steps/sec</span>
          <span className="font-mono text-accent-teal">{formatSpeed(speed)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={SPEED_STEPS.length - 1}
          step={1}
          value={currentIndex}
          onChange={(e) => setSpeed(SPEED_STEPS[Number(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-text-muted font-mono">
          {SPEED_STEPS.map((s, i) => (
            <span key={i} className={i === currentIndex ? "text-accent-teal" : ""}>
              {formatSpeed(s)}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}
