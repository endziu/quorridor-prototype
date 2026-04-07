import { CELL_PX, CELL_STRIDE, GAP_PX, GRID_SIZE } from "../constants.ts";
import type { Cell, WallOrientation, WallPos } from "../types.ts";

/** Top-left pixel origin of a cell. */
export function cellOrigin(c: Cell): { px: number; py: number } {
  return { px: c.x * CELL_STRIDE, py: c.y * CELL_STRIDE };
}

/** Center pixel of a cell (for drawing pawns). */
export function cellCenter(c: Cell): { px: number; py: number } {
  return {
    px: c.x * CELL_STRIDE + CELL_PX / 2,
    py: c.y * CELL_STRIDE + CELL_PX / 2,
  };
}

/** Pixel rectangle for a horizontal wall. */
export function horizontalWallRect(pos: WallPos): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  return {
    x: pos.x * CELL_STRIDE,
    y: pos.y * CELL_STRIDE + CELL_PX,
    w: CELL_PX * 2 + GAP_PX,
    h: GAP_PX,
  };
}

/** Pixel rectangle for a vertical wall. */
export function verticalWallRect(pos: WallPos): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  return {
    x: pos.x * CELL_STRIDE + CELL_PX,
    y: pos.y * CELL_STRIDE,
    w: GAP_PX,
    h: CELL_PX * 2 + GAP_PX,
  };
}

/**
 * Convert canvas pixel coords to a cell.
 * Returns null if the cursor is in a gap strip rather than a cell area.
 */
export function pixelToCell(px: number, py: number): Cell | null {
  const col = Math.floor(px / CELL_STRIDE);
  const row = Math.floor(py / CELL_STRIDE);
  const localX = px - col * CELL_STRIDE;
  const localY = py - row * CELL_STRIDE;

  if (localX >= CELL_PX || localY >= CELL_PX) return null;
  if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return null;

  return { x: col, y: row };
}

/**
 * Convert canvas pixel coords to a wall anchor + orientation.
 * Returns null if the cursor is not in any gap strip.
 *
 * - Column gap strip (between columns) → vertical wall
 * - Row gap strip (between rows)       → horizontal wall
 * - Intersection of both strips        → whichever gap centerline is closer
 */
export function pixelToWallHit(
  px: number,
  py: number,
): { pos: WallPos; orientation: WallOrientation } | null {
  const col = Math.floor(px / CELL_STRIDE);
  const row = Math.floor(py / CELL_STRIDE);
  const localX = px - col * CELL_STRIDE;
  const localY = py - row * CELL_STRIDE;

  const inColGap = localX >= CELL_PX && col <= 7;
  const inRowGap = localY >= CELL_PX && row <= 7;

  if (!inColGap && !inRowGap) return null;

  let orientation: WallOrientation;
  if (inColGap && inRowGap) {
    // Intersection: pick by distance to each gap's centerline
    const dCol = Math.abs(localX - (CELL_PX + GAP_PX / 2));
    const dRow = Math.abs(localY - (CELL_PX + GAP_PX / 2));
    orientation = dCol <= dRow ? "vertical" : "horizontal";
  } else {
    orientation = inColGap ? "vertical" : "horizontal";
  }

  return {
    pos: {
      x: Math.max(0, Math.min(7, col)),
      y: Math.max(0, Math.min(7, row)),
    },
    orientation,
  };
}
