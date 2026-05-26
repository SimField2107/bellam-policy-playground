export type CellType = "free" | "wall" | "start" | "goal" | "reward" | "penalty";

export interface Cell {
  type: CellType;
  reward: number;
  terminal: boolean;
}

export enum Action {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
}

export const ACTION_DELTAS: Record<Action, [number, number]> = {
  [Action.Up]: [-1, 0],
  [Action.Right]: [0, 1],
  [Action.Down]: [1, 0],
  [Action.Left]: [0, -1],
};

export const ACTION_NAMES: Record<Action, string> = {
  [Action.Up]: "↑",
  [Action.Right]: "→",
  [Action.Down]: "↓",
  [Action.Left]: "←",
};

export const NUM_ACTIONS = 4;

export interface GridConfig {
  rows: number;
  cols: number;
  cells: Cell[][];
  startPos: [number, number];
  goalPos: [number, number];
  stepCost: number;
  slip: number;
  maxSteps: number;
}

export interface Transition {
  nextState: number;
  reward: number;
  done: boolean;
  nextRow: number;
  nextCol: number;
}

export interface AgentConfig {
  alpha: number;
  gamma: number;
  epsilon: number;
  epsilonDecay: number;
  epsilonMin: number;
}

export type AlgorithmType = "qlearning" | "sarsa" | "montecarlo";

export interface SimStats {
  episode: number;
  totalSteps: number;
  epsilon: number;
  meanReward: number;
  meanEpisodeLength: number;
  meanTdError: number;
  rewardHistory: number[];
  minValue: number;
  maxValue: number;
}
