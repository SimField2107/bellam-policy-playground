"use client";

import { useState, useCallback } from "react";
import {
  GridCanvas,
  ControlPanel,
  Legend,
  HyperparameterPanel,
  SpeedPanel,
  VizOptionsPanel,
  StatsPanel,
  RewardChart,
  AlgorithmPanel,
  Explainer,
  EditorPanel,
  KeyboardHints,
} from "@/components/playground";
import { useSimulation } from "@/lib/sim/useSimulation";
import { useGridLayout, EditorTool } from "@/lib/sim/useGridLayout";
import { useKeyboardShortcuts } from "@/lib/sim/useKeyboardShortcuts";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

export default function Home() {
  const { canvasRef, reset, stepAction, stepEpisode, switchAlgorithm } =
    useSimulation();
  const { updateCell, resizeGrid, setSlip, startPainting, stopPainting } =
    useGridLayout();
  const { stats, setIsPlaying } = usePlaygroundStore();

  const [activeTool, setActiveTool] = useState<EditorTool>("wall");
  const [customReward, setCustomReward] = useState(0.5);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setIsPlaying(false);
      const reward =
        activeTool === "reward"
          ? customReward
          : activeTool === "penalty"
            ? customReward
            : undefined;
      updateCell(row, col, activeTool, reward);
    },
    [activeTool, customReward, updateCell, setIsPlaying]
  );

  const handleToolChange = useCallback((tool: EditorTool) => {
    setActiveTool(tool);
    if (tool === "reward") {
      setCustomReward(0.5);
    } else if (tool === "penalty") {
      setCustomReward(-1.0);
    }
  }, []);

  const handleResetWithAlgorithm = useCallback(() => {
    reset();
    switchAlgorithm();
  }, [reset, switchAlgorithm]);

  useKeyboardShortcuts({
    onReset: reset,
    onStepEpisode: stepEpisode,
    onStepAction: stepAction,
  });

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <header
        className="flex-shrink-0 border-b border-border-subtle px-6 py-4"
        role="banner"
      >
        <h1 className="text-xl font-semibold tracking-tight text-text-primary uppercase">
          Bellam Policy Playground
        </h1>
        <p className="text-sm text-text-muted font-mono mt-1">
          Q-learning / SARSA / Monte Carlo on a grid world
        </p>
      </header>

      <main className="flex-1 flex overflow-hidden" role="main">
        <aside
          className="w-72 flex-shrink-0 border-r border-border-subtle p-4 overflow-y-auto flex flex-col gap-4"
          aria-label="Configuration controls"
        >
          <AlgorithmPanel onAlgorithmChange={handleResetWithAlgorithm} />
          <HyperparameterPanel />
          <EditorPanel
            activeTool={activeTool}
            onToolChange={handleToolChange}
            onResizeGrid={resizeGrid}
            onSlipChange={setSlip}
            customReward={customReward}
            onCustomRewardChange={setCustomReward}
          />
        </aside>

        <section
          className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden"
          aria-label="Grid world visualization"
        >
          <div className="w-full max-w-xl">
            <GridCanvas
              canvasRef={canvasRef}
              onCellClick={handleCellClick}
              onPaintStart={startPainting}
              onPaintEnd={stopPainting}
            />
          </div>
          <div className="w-full max-w-xl mt-3">
            <Legend minValue={stats.minValue} maxValue={stats.maxValue} />
          </div>
          <div className="mt-4">
            <ControlPanel
              onReset={reset}
              onStepAction={stepAction}
              onStepEpisode={stepEpisode}
            />
          </div>
        </section>

        <aside
          className="w-72 flex-shrink-0 border-l border-border-subtle p-4 overflow-y-auto flex flex-col gap-4"
          aria-label="Statistics and information"
        >
          <StatsPanel />
          <RewardChart />
          <SpeedPanel />
          <VizOptionsPanel />
          <KeyboardHints />
          <Explainer />
        </aside>
      </main>
    </div>
  );
}
