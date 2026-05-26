"use client";

import { Panel } from "@/components/ui/Panel";
import { Slider } from "@/components/ui/Slider";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

export function HyperparameterPanel() {
  const { agentConfig, setAgentConfig, stats } = usePlaygroundStore();

  return (
    <Panel title="Hyperparameters">
      <div className="space-y-4">
        <Slider
          label="Learning Rate (α)"
          min={0.01}
          max={1}
          step={0.01}
          value={agentConfig.alpha}
          displayValue={agentConfig.alpha.toFixed(2)}
          onChange={(e) => setAgentConfig({ alpha: Number(e.target.value) })}
        />

        <Slider
          label="Discount (γ)"
          min={0}
          max={1}
          step={0.01}
          value={agentConfig.gamma}
          displayValue={agentConfig.gamma.toFixed(2)}
          onChange={(e) => setAgentConfig({ gamma: Number(e.target.value) })}
        />

        <Slider
          label="ε Decay"
          min={0.9}
          max={1}
          step={0.001}
          value={agentConfig.epsilonDecay}
          displayValue={agentConfig.epsilonDecay.toFixed(3)}
          onChange={(e) => setAgentConfig({ epsilonDecay: Number(e.target.value) })}
        />

        <Slider
          label="ε Min"
          min={0}
          max={0.5}
          step={0.01}
          value={agentConfig.epsilonMin}
          displayValue={agentConfig.epsilonMin.toFixed(2)}
          onChange={(e) => setAgentConfig({ epsilonMin: Number(e.target.value) })}
        />

        <div className="pt-2 border-t border-border-subtle">
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary">Current ε</span>
            <span className="font-mono text-accent-teal">
              {stats.epsilon.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
