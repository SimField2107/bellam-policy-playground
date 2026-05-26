"use client";

import { useMemo } from "react";
import { valueToColor } from "@/lib/viz/colors";

interface LegendProps {
  minValue: number;
  maxValue: number;
}

export function Legend({ minValue, maxValue }: LegendProps) {
  const gradientStops = useMemo(() => {
    const stops: string[] = [];
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const value = minValue + t * (maxValue - minValue);
      const color = valueToColor(value, minValue, maxValue);
      stops.push(`${color} ${t * 100}%`);
    }

    return stops.join(", ");
  }, [minValue, maxValue]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted font-mono w-12 text-right">
          {minValue.toFixed(2)}
        </span>
        <div
          className="flex-1 h-3 rounded border border-border-subtle"
          style={{
            background: `linear-gradient(to right, ${gradientStops})`,
          }}
        />
        <span className="text-xs text-text-muted font-mono w-12">
          {maxValue.toFixed(2)}
        </span>
      </div>
      <div className="text-center text-xs text-text-muted">V(s) — State Value</div>
    </div>
  );
}
