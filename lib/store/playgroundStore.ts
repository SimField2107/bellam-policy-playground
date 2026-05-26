import { create } from "zustand";
import {
  AgentConfig,
  AlgorithmType,
  GridConfig,
  SimStats,
} from "@/lib/rl/types";
import { PRESETS, cloneConfig } from "@/lib/rl/presets";

interface VizOptions {
  showHeatmap: boolean;
  showArrows: boolean;
  showTrail: boolean;
  showValues: boolean;
}

interface PlaygroundState {
  gridConfig: GridConfig;
  agentConfig: AgentConfig;
  algorithm: AlgorithmType;
  isPlaying: boolean;
  speed: number;
  vizOptions: VizOptions;
  stats: SimStats;
  selectedPreset: string;

  setGridConfig: (config: GridConfig) => void;
  setAgentConfig: (config: Partial<AgentConfig>) => void;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeed: (speed: number) => void;
  setVizOptions: (options: Partial<VizOptions>) => void;
  setStats: (stats: Partial<SimStats>) => void;
  loadPreset: (name: string) => void;
  resetStats: () => void;
}

const defaultAgentConfig: AgentConfig = {
  alpha: 0.1,
  gamma: 0.99,
  epsilon: 1.0,
  epsilonDecay: 0.995,
  epsilonMin: 0.01,
};

const defaultStats: SimStats = {
  episode: 0,
  totalSteps: 0,
  epsilon: 1.0,
  meanReward: 0,
  meanEpisodeLength: 0,
  meanTdError: 0,
  rewardHistory: [],
  minValue: 0,
  maxValue: 0,
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  gridConfig: cloneConfig(PRESETS[0].config),
  agentConfig: { ...defaultAgentConfig },
  algorithm: "qlearning",
  isPlaying: false,
  speed: 100,
  vizOptions: {
    showHeatmap: true,
    showArrows: true,
    showTrail: true,
    showValues: false,
  },
  stats: { ...defaultStats },
  selectedPreset: PRESETS[0].name,

  setGridConfig: (config) => set({ gridConfig: config }),

  setAgentConfig: (config) =>
    set((state) => ({
      agentConfig: { ...state.agentConfig, ...config },
    })),

  setAlgorithm: (algorithm) => set({ algorithm }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setSpeed: (speed) => set({ speed }),

  setVizOptions: (options) =>
    set((state) => ({
      vizOptions: { ...state.vizOptions, ...options },
    })),

  setStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),

  loadPreset: (name) => {
    const preset = PRESETS.find((p) => p.name === name);
    if (preset) {
      set({
        gridConfig: cloneConfig(preset.config),
        selectedPreset: name,
        stats: { ...defaultStats },
      });
    }
  },

  resetStats: () =>
    set((state) => ({
      stats: { ...defaultStats },
      agentConfig: { ...state.agentConfig, epsilon: 1.0 },
    })),
}));
