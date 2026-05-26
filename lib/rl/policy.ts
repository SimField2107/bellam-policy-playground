import { Action, NUM_ACTIONS } from "./types";

export function epsilonGreedy(
  qValues: Float32Array,
  state: number,
  epsilon: number
): Action {
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * NUM_ACTIONS) as Action;
  }
  return greedy(qValues, state);
}

export function greedy(qValues: Float32Array, state: number): Action {
  const offset = state * NUM_ACTIONS;
  let bestAction = 0;
  let bestValue = qValues[offset];

  for (let a = 1; a < NUM_ACTIONS; a++) {
    if (qValues[offset + a] > bestValue) {
      bestValue = qValues[offset + a];
      bestAction = a;
    }
  }

  return bestAction as Action;
}

export function getStateValue(qValues: Float32Array, state: number): number {
  const offset = state * NUM_ACTIONS;
  let maxValue = qValues[offset];

  for (let a = 1; a < NUM_ACTIONS; a++) {
    if (qValues[offset + a] > maxValue) {
      maxValue = qValues[offset + a];
    }
  }

  return maxValue;
}

export function getActionValues(
  qValues: Float32Array,
  state: number
): number[] {
  const offset = state * NUM_ACTIONS;
  return [
    qValues[offset],
    qValues[offset + 1],
    qValues[offset + 2],
    qValues[offset + 3],
  ];
}

export function softmaxConfidence(qValues: Float32Array, state: number): number {
  const values = getActionValues(qValues, state);
  const maxQ = Math.max(...values);
  const minQ = Math.min(...values);
  const range = maxQ - minQ;

  if (range < 0.01) return 0;

  const temp = 0.5;
  const expValues = values.map((v) => Math.exp((v - maxQ) / temp));
  const sum = expValues.reduce((a, b) => a + b, 0);
  const maxProb = Math.max(...expValues) / sum;

  return Math.min(1, (maxProb - 0.25) / 0.75);
}
