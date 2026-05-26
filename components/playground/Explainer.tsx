"use client";

import { Panel } from "@/components/ui/Panel";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";
import { AlgorithmType } from "@/lib/rl/types";

const EQUATIONS: Record<AlgorithmType, { update: string; description: string }> = {
  qlearning: {
    update: "Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') − Q(s,a)]",
    description: "Updates toward the best possible next action (greedy), making it off-policy.",
  },
  sarsa: {
    update: "Q(s,a) ← Q(s,a) + α[r + γ·Q(s',a') − Q(s,a)]",
    description: "Updates toward the action actually taken next (a'), making it on-policy.",
  },
  montecarlo: {
    update: "Q(s,a) ← Q(s,a) + α[Gₜ − Q(s,a)]",
    description: "Updates from the actual discounted return Gₜ after the episode completes.",
  },
};

export function Explainer() {
  const { algorithm } = usePlaygroundStore();
  const { update, description } = EQUATIONS[algorithm];

  return (
    <Panel title="Update Rule">
      <div className="space-y-3">
        <div className="bg-bg-secondary rounded p-2 border border-border-subtle">
          <code className="text-xs font-mono text-accent-teal break-all">
            {update}
          </code>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">{description}</p>
        <div className="text-xs text-text-secondary space-y-1 pt-2 border-t border-border-subtle">
          <p>
            <strong className="text-text-primary">Heatmap:</strong> Shows V(s) = max Q(s,a).
            Brighter teal means higher expected return.
          </p>
          <p>
            <strong className="text-text-primary">Arrows:</strong> Show π(s) = argmax Q(s,a).
            Opacity indicates confidence in that action.
          </p>
        </div>
      </div>
    </Panel>
  );
}
