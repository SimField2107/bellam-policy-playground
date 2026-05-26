import { Cell, GridConfig } from "./types";
import { createDefaultCell, createEmptyGrid } from "./env";

export interface Preset {
  name: string;
  description: string;
  config: GridConfig;
}

function buildGrid(
  rows: number,
  cols: number,
  setup: (cells: Cell[][], r: number, c: number) => void
): { cells: Cell[][]; startPos: [number, number]; goalPos: [number, number] } {
  const cells = createEmptyGrid(rows, cols);
  let startPos: [number, number] = [0, 0];
  let goalPos: [number, number] = [rows - 1, cols - 1];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      setup(cells, r, c);
      if (cells[r][c].type === "start") startPos = [r, c];
      if (cells[r][c].type === "goal") goalPos = [r, c];
    }
  }

  return { cells, startPos, goalPos };
}

export const PRESETS: Preset[] = [
  {
    name: "Open Field",
    description: "Simple 10x10 grid with no obstacles",
    config: (() => {
      const { cells, startPos, goalPos } = buildGrid(10, 10, (cells, r, c) => {
        if (r === 0 && c === 0) cells[r][c] = createDefaultCell("start");
        else if (r === 9 && c === 9) cells[r][c] = createDefaultCell("goal");
      });
      return {
        rows: 10,
        cols: 10,
        cells,
        startPos,
        goalPos,
        stepCost: -0.04,
        slip: 0,
        maxSteps: 200,
      };
    })(),
  },
  {
    name: "Cliff Walk",
    description: "Classic cliff walking environment with penalty zone",
    config: (() => {
      const rows = 4;
      const cols = 12;
      const { cells, startPos, goalPos } = buildGrid(rows, cols, (cells, r, c) => {
        if (r === 3 && c === 0) cells[r][c] = createDefaultCell("start");
        else if (r === 3 && c === 11) cells[r][c] = createDefaultCell("goal");
        else if (r === 3 && c > 0 && c < 11) {
          cells[r][c] = { type: "penalty", reward: -100, terminal: true };
        }
      });
      return {
        rows,
        cols,
        cells,
        startPos,
        goalPos,
        stepCost: -1,
        slip: 0,
        maxSteps: 200,
      };
    })(),
  },
  {
    name: "Four Rooms",
    description: "Grid divided into four rooms with doorways",
    config: (() => {
      const rows = 11;
      const cols = 11;
      const { cells, startPos, goalPos } = buildGrid(rows, cols, (cells, r, c) => {
        if (r === 0 && c === 0) cells[r][c] = createDefaultCell("start");
        else if (r === 10 && c === 10) cells[r][c] = createDefaultCell("goal");
        else if (r === 5 && c !== 2 && c !== 8) cells[r][c] = createDefaultCell("wall");
        else if (c === 5 && r !== 2 && r !== 8) cells[r][c] = createDefaultCell("wall");
      });
      return {
        rows,
        cols,
        cells,
        startPos,
        goalPos,
        stepCost: -0.04,
        slip: 0,
        maxSteps: 300,
      };
    })(),
  },
  {
    name: "Windy Grid",
    description: "Stochastic environment with 20% slip chance",
    config: (() => {
      const { cells, startPos, goalPos } = buildGrid(8, 8, (cells, r, c) => {
        if (r === 0 && c === 0) cells[r][c] = createDefaultCell("start");
        else if (r === 7 && c === 7) cells[r][c] = createDefaultCell("goal");
        else if (r === 4 && c === 3) cells[r][c] = createDefaultCell("reward");
      });
      return {
        rows: 8,
        cols: 8,
        cells,
        startPos,
        goalPos,
        stepCost: -0.04,
        slip: 0.2,
        maxSteps: 200,
      };
    })(),
  },
  {
    name: "Maze",
    description: "Simple maze with walls to navigate around",
    config: (() => {
      const rows = 8;
      const cols = 8;
      const walls = [
        [1, 1], [1, 2], [1, 5], [1, 6],
        [2, 4], [3, 1], [3, 2], [3, 4], [3, 6],
        [4, 4], [4, 6], [5, 2], [5, 4], [5, 6],
        [6, 2], [6, 4],
      ];
      const wallSet = new Set(walls.map(([r, c]) => `${r},${c}`));

      const { cells, startPos, goalPos } = buildGrid(rows, cols, (cells, r, c) => {
        if (r === 0 && c === 0) cells[r][c] = createDefaultCell("start");
        else if (r === 7 && c === 7) cells[r][c] = createDefaultCell("goal");
        else if (wallSet.has(`${r},${c}`)) cells[r][c] = createDefaultCell("wall");
      });

      return {
        rows,
        cols,
        cells,
        startPos,
        goalPos,
        stepCost: -0.04,
        slip: 0,
        maxSteps: 200,
      };
    })(),
  },
];

export function getPreset(name: string): Preset | undefined {
  return PRESETS.find((p) => p.name === name);
}

export function cloneConfig(config: GridConfig): GridConfig {
  return {
    ...config,
    cells: config.cells.map((row) => row.map((cell) => ({ ...cell }))),
    startPos: [...config.startPos] as [number, number],
    goalPos: [...config.goalPos] as [number, number],
  };
}
