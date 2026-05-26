import { Action, GridConfig } from "@/lib/rl/types";
import { greedy, getStateValue, softmaxConfidence } from "@/lib/rl/policy";
import { encodeState } from "@/lib/rl/env";
import { valueToColor, COLORS } from "./colors";

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  config: GridConfig;
  cellSize: number;
  padding: number;
}

function getCellRect(
  rc: RenderContext,
  row: number,
  col: number
): { x: number; y: number; w: number; h: number } {
  return {
    x: rc.padding + col * rc.cellSize,
    y: rc.padding + row * rc.cellSize,
    w: rc.cellSize,
    h: rc.cellSize,
  };
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  config: GridConfig,
  qValues: Float32Array | null,
  agentRow: number,
  agentCol: number,
  trail: [number, number][],
  options: {
    showHeatmap: boolean;
    showArrows: boolean;
    showTrail: boolean;
    showValues: boolean;
  }
): void {
  const canvas = ctx.canvas;
  const { rows, cols } = config;

  const padding = 1;
  const availableWidth = canvas.width - 2 * padding;
  const availableHeight = canvas.height - 2 * padding;
  const cellSize = Math.floor(Math.min(availableWidth / cols, availableHeight / rows));

  const rc: RenderContext = { ctx, config, cellSize, padding };

  ctx.fillStyle = COLORS.bgPrimary;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let minV = 0;
  let maxV = 0;

  if (qValues && options.showHeatmap) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = config.cells[r][c];
        if (cell.type === "wall") continue;
        const state = encodeState(r, c, cols);
        const v = getStateValue(qValues, state);
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      renderCell(rc, r, c, qValues, minV, maxV, options.showHeatmap);
    }
  }

  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  for (let r = 0; r <= rows; r++) {
    const y = padding + r * cellSize;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + cols * cellSize, y);
    ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    const x = padding + c * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + rows * cellSize);
    ctx.stroke();
  }

  if (options.showTrail && trail.length > 0) {
    renderTrail(rc, trail);
  }

  if (qValues && options.showArrows) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = config.cells[r][c];
        if (cell.type === "wall" || cell.terminal) continue;
        renderArrow(rc, r, c, qValues);
      }
    }
  }

  if (qValues && options.showValues) {
    ctx.font = `${Math.max(8, cellSize / 5)}px "Space Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = config.cells[r][c];
        if (cell.type === "wall") continue;
        const state = encodeState(r, c, cols);
        const v = getStateValue(qValues, state);
        const rect = getCellRect(rc, r, c);
        ctx.fillStyle = COLORS.textMuted;
        ctx.fillText(v.toFixed(2), rect.x + rect.w / 2, rect.y + rect.h - 4);
      }
    }
  }

  renderAgent(rc, agentRow, agentCol);
}

function renderCell(
  rc: RenderContext,
  row: number,
  col: number,
  qValues: Float32Array | null,
  minV: number,
  maxV: number,
  showHeatmap: boolean
): void {
  const { ctx, config, cellSize } = rc;
  const cell = config.cells[row][col];
  const rect = getCellRect(rc, row, col);

  if (cell.type === "wall") {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

    ctx.strokeStyle = "#2a2d33";
    ctx.lineWidth = 1;
    const step = cellSize / 4;
    for (let i = -cellSize; i < cellSize * 2; i += step) {
      ctx.beginPath();
      ctx.moveTo(rect.x + i, rect.y);
      ctx.lineTo(rect.x + i + cellSize, rect.y + cellSize);
      ctx.stroke();
    }
    return;
  }

  if (showHeatmap && qValues) {
    const state = encodeState(row, col, config.cols);
    const v = getStateValue(qValues, state);
    ctx.fillStyle = valueToColor(v, minV, maxV);
  } else {
    ctx.fillStyle = COLORS.bgSecondary;
  }
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

  if (cell.type === "goal") {
    ctx.fillStyle = COLORS.goal;
    const inset = cellSize * 0.2;
    ctx.fillRect(rect.x + inset, rect.y + inset, rect.w - 2 * inset, rect.h - 2 * inset);

    ctx.fillStyle = COLORS.bgPrimary;
    ctx.font = `bold ${cellSize * 0.4}px "Space Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("G", rect.x + rect.w / 2, rect.y + rect.h / 2);
  } else if (cell.type === "start") {
    ctx.strokeStyle = COLORS.start;
    ctx.lineWidth = 2;
    const inset = cellSize * 0.25;
    ctx.strokeRect(rect.x + inset, rect.y + inset, rect.w - 2 * inset, rect.h - 2 * inset);

    ctx.fillStyle = COLORS.start;
    ctx.font = `${cellSize * 0.3}px "Space Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", rect.x + rect.w / 2, rect.y + rect.h / 2);
  } else if (cell.type === "reward") {
    ctx.fillStyle = COLORS.goal;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, cellSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (cell.type === "penalty") {
    ctx.fillStyle = COLORS.agent;
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const size = cellSize * 0.2;
    ctx.beginPath();
    ctx.moveTo(cx - size, cy - size);
    ctx.lineTo(cx + size, cy + size);
    ctx.moveTo(cx + size, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.strokeStyle = COLORS.agent;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function renderArrow(
  rc: RenderContext,
  row: number,
  col: number,
  qValues: Float32Array
): void {
  const { ctx, config, cellSize } = rc;
  const state = encodeState(row, col, config.cols);
  const action = greedy(qValues, state);
  const confidence = softmaxConfidence(qValues, state);

  if (confidence < 0.05) return;

  const rect = getCellRect(rc, row, col);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const arrowSize = cellSize * 0.25;

  ctx.save();
  ctx.translate(cx, cy);

  const angles: Record<Action, number> = {
    [Action.Up]: -Math.PI / 2,
    [Action.Right]: 0,
    [Action.Down]: Math.PI / 2,
    [Action.Left]: Math.PI,
  };
  ctx.rotate(angles[action]);

  ctx.fillStyle = `rgba(232, 233, 235, ${confidence * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(arrowSize, 0);
  ctx.lineTo(-arrowSize * 0.5, -arrowSize * 0.5);
  ctx.lineTo(-arrowSize * 0.5, arrowSize * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function renderTrail(rc: RenderContext, trail: [number, number][]): void {
  const { ctx } = rc;

  for (let i = 0; i < trail.length; i++) {
    const [r, c] = trail[i];
    const rect = getCellRect(rc, r, c);
    const alpha = ((i + 1) / trail.length) * 0.4;

    ctx.fillStyle = `rgba(216, 123, 60, ${alpha})`;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rc.cellSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderAgent(rc: RenderContext, row: number, col: number): void {
  const { ctx, cellSize } = rc;
  const rect = getCellRect(rc, row, col);

  ctx.fillStyle = COLORS.agent;
  ctx.beginPath();
  ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, cellSize * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.bgPrimary;
  ctx.beginPath();
  ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, cellSize * 0.15, 0, Math.PI * 2);
  ctx.fill();
}
