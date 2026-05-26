"use client";

import { useEffect, useRef, RefObject, MouseEvent } from "react";
import { usePlaygroundStore } from "@/lib/store/playgroundStore";

interface GridCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onCellClick?: (row: number, col: number) => void;
  onPaintStart?: () => void;
  onPaintEnd?: () => void;
}

export function GridCanvas({
  canvasRef,
  onCellClick,
  onPaintStart,
  onPaintEnd,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gridConfig } = usePlaygroundStore();
  const isPainting = useRef(false);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      const size = Math.min(container.clientWidth, container.clientHeight);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [canvasRef]);

  const getCellFromEvent = (
    e: MouseEvent<HTMLCanvasElement>
  ): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { rows, cols } = gridConfig;
    const padding = 1;
    const cellSize = Math.floor(
      (Math.min(rect.width, rect.height) - 2 * padding) / Math.max(rows, cols)
    );

    const col = Math.floor((x - padding) / cellSize);
    const row = Math.floor((y - padding) / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      return [row, col];
    }
    return null;
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!onCellClick) return;
    isPainting.current = true;
    onPaintStart?.();

    const cell = getCellFromEvent(e);
    if (cell) {
      onCellClick(cell[0], cell[1]);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting.current || !onCellClick) return;

    const cell = getCellFromEvent(e);
    if (cell) {
      onCellClick(cell[0], cell[1]);
    }
  };

  const handleMouseUp = () => {
    if (isPainting.current) {
      isPainting.current = false;
      onPaintEnd?.();
    }
  };

  const handleMouseLeave = () => {
    if (isPainting.current) {
      isPainting.current = false;
      onPaintEnd?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full aspect-square flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="border border-border-subtle rounded cursor-crosshair"
        style={{ imageRendering: "pixelated" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
