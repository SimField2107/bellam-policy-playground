"use client";

import { Panel } from "@/components/ui/Panel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";
import { AlgorithmType } from "@/lib/rl/types";

const ALGORITHM_OPTIONS: { value: AlgorithmType; label: string }[] = [
  { value: "qlearning", label: "Q-Learn" },
  { value: "sarsa", label: "SARSA" },
  { value: "montecarlo", label: "MC" },
];

const ALGORITHM_DESCRIPTIONS: Record<AlgorithmType, string> = {
  qlearning: "Off-policy TD learning. Updates toward the greedy action, regardless of what action was actually taken.",
  sarsa: "On-policy TD learning. Updates toward the action that was actually taken next.",
  montecarlo: "First-visit Monte Carlo. Waits until episode ends, then updates from actual returns.",
};

interface AlgorithmPanelProps {
  onAlgorithmChange: () => void;
}

export function AlgorithmPanel({ onAlgorithmChange }: AlgorithmPanelProps) {
  const { algorithm, setAlgorithm } = usePlaygroundStore();

  const handleChange = (value: AlgorithmType) => {
    setAlgorithm(value);
    onAlgorithmChange();
  };

  return (
    <Panel title="Algorithm">
      <div className="space-y-3">
        <SegmentedControl
          options={ALGORITHM_OPTIONS}
          value={algorithm}
          onChange={handleChange}
        />
        <p className="text-xs text-text-muted leading-relaxed">
          {ALGORITHM_DESCRIPTIONS[algorithm]}
        </p>
      </div>
    </Panel>
  );
}
