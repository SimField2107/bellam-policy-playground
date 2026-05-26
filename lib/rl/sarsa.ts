import { Action, AgentConfig, NUM_ACTIONS } from "./types";
import { BaseAgent } from "./agent";
import { epsilonGreedy } from "./policy";

export class SarsaAgent extends BaseAgent {
  private nextAction: Action | null = null;

  constructor(numStates: number, config: AgentConfig) {
    super(numStates, config);
  }

  selectAction(state: number): Action {
    if (this.nextAction !== null) {
      const action = this.nextAction;
      this.nextAction = null;
      return action;
    }
    return epsilonGreedy(this.qValues, state, this.config.epsilon);
  }

  update(
    state: number,
    action: Action,
    reward: number,
    nextState: number,
    done: boolean,
    nextAction?: Action
  ): void {
    const { alpha, gamma } = this.config;
    const idx = state * NUM_ACTIONS + action;

    let nextQ = 0;
    if (!done) {
      const actualNextAction =
        nextAction ?? epsilonGreedy(this.qValues, nextState, this.config.epsilon);
      nextQ = this.qValues[nextState * NUM_ACTIONS + actualNextAction];
      this.nextAction = actualNextAction;
    } else {
      this.nextAction = null;
    }

    const target = reward + gamma * nextQ;
    const tdError = target - this.qValues[idx];
    this.qValues[idx] += alpha * tdError;
    this.lastTdError = Math.abs(tdError);
  }

  reset(numStates: number): void {
    super.reset(numStates);
    this.nextAction = null;
  }
}
