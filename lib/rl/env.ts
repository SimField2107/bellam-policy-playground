import {
  Action,
  ACTION_DELTAS,
  Cell,
  CellType,
  GridConfig,
  NUM_ACTIONS,
  Transition,
} from "./types";

export function createDefaultCell(type: CellType = "free"): Cell {
  const rewards: Record<CellType, number> = {
    free: 0,
    wall: 0,
    start: 0,
    goal: 1.0,
    reward: 0.5,
    penalty: -1.0,
  };

  const terminal: Record<CellType, boolean> = {
    free: false,
    wall: false,
    start: false,
    goal: true,
    reward: false,
    penalty: true,
  };

  return { type, reward: rewards[type], terminal: terminal[type] };
}

export function createEmptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => createDefaultCell("free"))
  );
}

export function createDefaultConfig(): GridConfig {
  const rows = 10;
  const cols = 10;
  const cells = createEmptyGrid(rows, cols);

  cells[0][0] = createDefaultCell("start");
  cells[rows - 1][cols - 1] = createDefaultCell("goal");

  return {
    rows,
    cols,
    cells,
    startPos: [0, 0],
    goalPos: [rows - 1, cols - 1],
    stepCost: -0.04,
    slip: 0,
    maxSteps: 200,
  };
}

export function encodeState(row: number, col: number, cols: number): number {
  return row * cols + col;
}

export function decodeState(
  state: number,
  cols: number
): [number, number] {
  return [Math.floor(state / cols), state % cols];
}

export class GridWorld {
  config: GridConfig;
  agentRow: number;
  agentCol: number;
  stepCount: number;

  constructor(config: GridConfig) {
    this.config = config;
    this.agentRow = config.startPos[0];
    this.agentCol = config.startPos[1];
    this.stepCount = 0;
  }

  get numStates(): number {
    return this.config.rows * this.config.cols;
  }

  get state(): number {
    return encodeState(this.agentRow, this.agentCol, this.config.cols);
  }

  reset(): number {
    this.agentRow = this.config.startPos[0];
    this.agentCol = this.config.startPos[1];
    this.stepCount = 0;
    return this.state;
  }

  isValidPosition(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < this.config.rows &&
      col >= 0 &&
      col < this.config.cols &&
      this.config.cells[row][col].type !== "wall"
    );
  }

  step(action: Action): Transition {
    let actualAction = action;

    if (this.config.slip > 0 && Math.random() < this.config.slip) {
      actualAction = Math.floor(Math.random() * NUM_ACTIONS) as Action;
    }

    const [dRow, dCol] = ACTION_DELTAS[actualAction];
    let newRow = this.agentRow + dRow;
    let newCol = this.agentCol + dCol;

    if (!this.isValidPosition(newRow, newCol)) {
      newRow = this.agentRow;
      newCol = this.agentCol;
    }

    this.agentRow = newRow;
    this.agentCol = newCol;
    this.stepCount++;

    const cell = this.config.cells[newRow][newCol];
    const reward = cell.reward + this.config.stepCost;
    const done = cell.terminal || this.stepCount >= this.config.maxSteps;

    return {
      nextState: this.state,
      reward,
      done,
      nextRow: newRow,
      nextCol: newCol,
    };
  }

  clone(): GridWorld {
    const cloned = new GridWorld(this.config);
    cloned.agentRow = this.agentRow;
    cloned.agentCol = this.agentCol;
    cloned.stepCount = this.stepCount;
    return cloned;
  }
}
