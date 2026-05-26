import { Action, AgentConfig, NUM_ACTIONS } from "./types";
import { BaseAgent } from "./agent";

export class QLearningAgent extends BaseAgent {
  constructor(numStates: number, config: AgentConfig) {
    super(numStates, config);
  }

  update(
    state: number,
    action: Action,
    reward: number,
    nextState: number,
    done: boolean
  ): void {
    const { alpha, gamma } = this.config;
    const idx = state * NUM_ACTIONS + action;

    let maxNextQ = 0;
    if (!done) {
      const nextOffset = nextState * NUM_ACTIONS;
      maxNextQ = this.qValues[nextOffset];
      for (let a = 1; a < NUM_ACTIONS; a++) {
        if (this.qValues[nextOffset + a] > maxNextQ) {
          maxNextQ = this.qValues[nextOffset + a];
        }
      }
    }

    const target = reward + gamma * maxNextQ;
    const tdError = target - this.qValues[idx];
    this.qValues[idx] += alpha * tdError;
    this.lastTdError = Math.abs(tdError);
  }
}
