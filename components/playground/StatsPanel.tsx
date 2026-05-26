"use client";

import { Panel } from "@/components/ui/Panel";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

interface StatRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-mono ${highlight ? "text-accent-teal" : "text-text-primary"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function StatsPanel() {
  const { stats } = usePlaygroundStore();

  return (
    <Panel title="Statistics">
      <div className="space-y-2 text-xs">
        <StatRow label="Episodes" value={stats.episode} />
        <StatRow label="Mean Reward" value={stats.meanReward.toFixed(2)} />
        <StatRow label="Mean Length" value={stats.meanEpisodeLength.toFixed(1)} />
        <StatRow
          label="Mean |TD Error|"
          value={stats.meanTdError.toFixed(4)}
          highlight={stats.meanTdError < 0.01}
        />
        <StatRow label="Epsilon (ε)" value={stats.epsilon.toFixed(3)} />
        <div className="pt-2 mt-2 border-t border-border-subtle">
          <StatRow
            label="V(s) Range"
            value={`${stats.minValue.toFixed(2)} → ${stats.maxValue.toFixed(2)}`}
          />
        </div>
      </div>
    </Panel>
  );
}
