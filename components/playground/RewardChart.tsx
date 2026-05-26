"use client";

import { useRef, useEffect } from "react";
import { Panel } from "@/components/ui/Panel";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";
import { COLORS } from "@/lib/viz/colors";

export function RewardChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stats } = usePlaygroundStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 8, right: 8, bottom: 8, left: 8 };

    ctx.fillStyle = COLORS.bgSecondary;
    ctx.fillRect(0, 0, width, height);

    const rewards = stats.rewardHistory.slice(-50);
    if (rewards.length < 2) {
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = '11px "Space Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No episodes yet", width / 2, height / 2);
      return;
    }

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const min = Math.min(...rewards);
    const max = Math.max(...rewards);
    const range = max - min || 1;

    const barWidth = Math.max(2, chartWidth / rewards.length - 1);
    const gap = 1;

    ctx.fillStyle = "#4fb3a9";

    rewards.forEach((reward, i) => {
      const normalizedHeight = ((reward - min) / range) * chartHeight;
      const barHeight = Math.max(2, normalizedHeight);
      const x = padding.left + i * (barWidth + gap);
      const y = padding.top + chartHeight - barHeight;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1);
      ctx.fill();
    });

    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    const zeroY =
      padding.top + chartHeight - ((0 - min) / range) * chartHeight;
    if (zeroY > padding.top && zeroY < padding.top + chartHeight) {
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(padding.left + chartWidth, zeroY);
      ctx.stroke();
    }
  }, [stats.rewardHistory]);

  return (
    <Panel title="Reward History">
      <canvas
        ref={canvasRef}
        className="w-full h-20 rounded border border-border-subtle"
        style={{ display: "block" }}
      />
      {stats.rewardHistory.length > 0 && (
        <div className="flex justify-between text-xs text-text-muted mt-1 font-mono">
          <span>min: {Math.min(...stats.rewardHistory).toFixed(2)}</span>
          <span>max: {Math.max(...stats.rewardHistory).toFixed(2)}</span>
        </div>
      )}
    </Panel>
  );
}
