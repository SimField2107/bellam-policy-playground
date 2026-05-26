import { Action, AgentConfig, NUM_ACTIONS } from "./types";
import { epsilonGreedy } from "./policy";

export interface Agent {
  qValues: Float32Array;
  config: AgentConfig;
  lastTdError: number;

  selectAction(state: number): Action;
  update(
    state: number,
    action: Action,
    reward: number,
    nextState: number,
    done: boolean,
    nextAction?: Action
  ): void;
  onEpisodeEnd(): void;
  reset(numStates: number): void;
}

export function createQTable(numStates: number): Float32Array {
  return new Float32Array(numStates * NUM_ACTIONS);
}

export abstract class BaseAgent implements Agent {
  qValues: Float32Array;
  config: AgentConfig;
  lastTdError: number = 0;

  constructor(numStates: number, config: AgentConfig) {
    this.qValues = createQTable(numStates);
    this.config = config;
  }

  selectAction(state: number): Action {
    return epsilonGreedy(this.qValues, state, this.config.epsilon);
  }

  abstract update(
    state: number,
    action: Action,
    reward: number,
    nextState: number,
    done: boolean,
    nextAction?: Action
  ): void;

  onEpisodeEnd(): void {
    this.config.epsilon = Math.max(
      this.config.epsilonMin,
      this.config.epsilon * this.config.epsilonDecay
    );
  }

  reset(numStates: number): void {
    this.qValues = createQTable(numStates);
    this.lastTdError = 0;
  }
}
