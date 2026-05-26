"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";
import { PRESETS } from "@/lib/rl/presets";
import { EditorTool } from "@/lib/sim/useGridLayout";

const TOOLS: { tool: EditorTool; label: string; icon: string }[] = [
  { tool: "start", label: "Start", icon: "S" },
  { tool: "goal", label: "Goal", icon: "G" },
  { tool: "wall", label: "Wall", icon: "█" },
  { tool: "reward", label: "Reward+", icon: "+" },
  { tool: "penalty", label: "Penalty-", icon: "×" },
  { tool: "erase", label: "Erase", icon: "○" },
];

interface EditorPanelProps {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onResizeGrid: (rows: number, cols: number) => void;
  onSlipChange: (slip: number) => void;
  customReward: number;
  onCustomRewardChange: (reward: number) => void;
}

export function EditorPanel({
  activeTool,
  onToolChange,
  onResizeGrid,
  onSlipChange,
  customReward,
  onCustomRewardChange,
}: EditorPanelProps) {
  const { gridConfig, loadPreset, selectedPreset, setIsPlaying } =
    usePlaygroundStore();
  const [gridSize, setGridSize] = useState(gridConfig.rows);

  const handlePresetChange = (name: string) => {
    setIsPlaying(false);
    loadPreset(name);
    const preset = PRESETS.find((p) => p.name === name);
    if (preset) {
      setGridSize(preset.config.rows);
    }
  };

  const handleGridSizeChange = (size: number) => {
    setGridSize(size);
    setIsPlaying(false);
    onResizeGrid(size, size);
  };

  return (
    <Panel title="Environment">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-text-secondary block mb-1">
            Preset
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full bg-bg-secondary border border-border-subtle rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-teal"
          >
            {PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-text-secondary block mb-2">
            Tools
          </label>
          <div className="grid grid-cols-3 gap-1">
            {TOOLS.map(({ tool, label, icon }) => (
              <Button
                key={tool}
                variant={activeTool === tool ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  setIsPlaying(false);
                  onToolChange(tool);
                }}
                className="flex flex-col items-center py-2"
              >
                <span className="text-sm font-mono">{icon}</span>
                <span className="text-[10px] mt-0.5">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {(activeTool === "reward" || activeTool === "penalty") && (
          <Slider
            label={activeTool === "reward" ? "Reward Value" : "Penalty Value"}
            min={activeTool === "reward" ? 0.1 : -10}
            max={activeTool === "reward" ? 10 : -0.1}
            step={0.1}
            value={customReward}
            displayValue={customReward.toFixed(1)}
            onChange={(e) => onCustomRewardChange(Number(e.target.value))}
          />
        )}

        <Slider
          label="Grid Size"
          min={5}
          max={20}
          step={1}
          value={gridSize}
          displayValue={`${gridSize}×${gridSize}`}
          onChange={(e) => handleGridSizeChange(Number(e.target.value))}
        />

        <Slider
          label="Slip Probability"
          min={0}
          max={0.3}
          step={0.01}
          value={gridConfig.slip}
          displayValue={`${(gridConfig.slip * 100).toFixed(0)}%`}
          onChange={(e) => {
            setIsPlaying(false);
            onSlipChange(Number(e.target.value));
          }}
        />
      </div>
    </Panel>
  );
}
