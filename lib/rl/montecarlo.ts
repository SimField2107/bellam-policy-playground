import { Action, AgentConfig, NUM_ACTIONS } from "./types";
import { BaseAgent } from "./agent";

interface Experience {
  state: number;
  action: Action;
  reward: number;
}

export class MonteCarloAgent extends BaseAgent {
  private trajectory: Experience[] = [];
  private returns: Map<string, number[]> = new Map();

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
    this.trajectory.push({ state, action, reward });

    if (done) {
      this.processEpisode();
    }
  }

  private processEpisode(): void {
    const { alpha, gamma } = this.config;
    let G = 0;
    const visited = new Set<string>();

    for (let t = this.trajectory.length - 1; t >= 0; t--) {
      const { state, action, reward } = this.trajectory[t];
      G = reward + gamma * G;

      const key = `${state},${action}`;

      if (!visited.has(key)) {
        visited.add(key);

        const idx = state * NUM_ACTIONS + action;
        const tdError = G - this.qValues[idx];
        this.qValues[idx] += alpha * tdError;

        this.lastTdError = Math.max(this.lastTdError, Math.abs(tdError));
      }
    }

    this.trajectory = [];
  }

  onEpisodeEnd(): void {
    super.onEpisodeEnd();
    this.lastTdError = 0;
  }

  reset(numStates: number): void {
    super.reset(numStates);
    this.trajectory = [];
    this.returns.clear();
  }
}
