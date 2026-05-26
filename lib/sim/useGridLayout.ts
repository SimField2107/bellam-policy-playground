"use client";

import { useCallback, useEffect, useRef } from "react";
import { Cell, CellType, GridConfig } from "@/lib/rl/types";
import { createDefaultCell, createEmptyGrid } from "@/lib/rl/env";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";
import { cloneConfig } from "@/lib/rl/presets";

export type EditorTool =
  | "start"
  | "goal"
  | "wall"
  | "reward"
  | "penalty"
  | "erase";

export function useGridLayout() {
  const { gridConfig, setGridConfig, resetStats } = usePlaygroundStore();
  const isPainting = useRef(false);
  const lastPaintedCell = useRef<string | null>(null);

  const updateCell = useCallback(
    (row: number, col: number, tool: EditorTool, customReward?: number) => {
      const config = cloneConfig(gridConfig);
      const { cells, rows, cols } = config;

      if (row < 0 || row >= rows || col < 0 || col >= cols) return;

      const cellKey = `${row},${col}`;
      if (lastPaintedCell.current === cellKey) return;
      lastPaintedCell.current = cellKey;

      let newCell: Cell;

      switch (tool) {
        case "start":
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (cells[r][c].type === "start") {
                cells[r][c] = createDefaultCell("free");
              }
            }
          }
          newCell = createDefaultCell("start");
          config.startPos = [row, col];
          break;

        case "goal":
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (cells[r][c].type === "goal") {
                cells[r][c] = createDefaultCell("free");
              }
            }
          }
          newCell = createDefaultCell("goal");
          config.goalPos = [row, col];
          break;

        case "wall":
          if (
            cells[row][col].type === "start" ||
            cells[row][col].type === "goal"
          ) {
            return;
          }
          newCell = createDefaultCell("wall");
          break;

        case "reward":
          if (
            cells[row][col].type === "start" ||
            cells[row][col].type === "goal"
          ) {
            return;
          }
          newCell = {
            type: "reward",
            reward: customReward ?? 0.5,
            terminal: false,
          };
          break;

        case "penalty":
          if (
            cells[row][col].type === "start" ||
            cells[row][col].type === "goal"
          ) {
            return;
          }
          newCell = {
            type: "penalty",
            reward: customReward ?? -1.0,
            terminal: true,
          };
          break;

        case "erase":
          if (
            cells[row][col].type === "start" ||
            cells[row][col].type === "goal"
          ) {
            return;
          }
          newCell = createDefaultCell("free");
          break;

        default:
          return;
      }

      cells[row][col] = newCell;
      setGridConfig(config);
    },
    [gridConfig, setGridConfig]
  );

  const resizeGrid = useCallback(
    (newRows: number, newCols: number) => {
      const config = cloneConfig(gridConfig);
      const oldCells = config.cells;
      const newCells = createEmptyGrid(newRows, newCols);

      for (let r = 0; r < Math.min(config.rows, newRows); r++) {
        for (let c = 0; c < Math.min(config.cols, newCols); c++) {
          newCells[r][c] = { ...oldCells[r][c] };
        }
      }

      let [startR, startC] = config.startPos;
      let [goalR, goalC] = config.goalPos;

      if (startR >= newRows || startC >= newCols) {
        startR = 0;
        startC = 0;
      }
      if (goalR >= newRows || goalC >= newCols) {
        goalR = newRows - 1;
        goalC = newCols - 1;
      }

      if (startR === goalR && startC === goalC) {
        if (goalC < newCols - 1) goalC++;
        else if (goalR < newRows - 1) goalR++;
        else if (startC > 0) startC--;
        else startR--;
      }

      newCells[startR][startC] = createDefaultCell("start");
      newCells[goalR][goalC] = createDefaultCell("goal");

      setGridConfig({
        ...config,
        rows: newRows,
        cols: newCols,
        cells: newCells,
        startPos: [startR, startC],
        goalPos: [goalR, goalC],
      });
      resetStats();
    },
    [gridConfig, setGridConfig, resetStats]
  );

  const setSlip = useCallback(
    (slip: number) => {
      setGridConfig({ ...gridConfig, slip });
    },
    [gridConfig, setGridConfig]
  );

  const startPainting = useCallback(() => {
    isPainting.current = true;
    lastPaintedCell.current = null;
  }, []);

  const stopPainting = useCallback(() => {
    isPainting.current = false;
    lastPaintedCell.current = null;
  }, []);

  const getIsPainting = useCallback(() => isPainting.current, []);

  return {
    updateCell,
    resizeGrid,
    setSlip,
    startPainting,
    stopPainting,
    getIsPainting,
  };
}
