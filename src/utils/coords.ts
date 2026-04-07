import { BOARD_PADDING, CELL_PX, CELL_STRIDE, GAP_PX, GRID_SIZE } from "../constants.ts";
import type { Cell, WallOrientation, WallPos } from "../types.ts";

export function cellEq(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

/** Top-left pixel origin of a cell. */
export function cellOrigin(c: Cell): { px: number; py: number } {
  return {
    px: BOARD_PADDING + c.x * CELL_STRIDE,
    py: BOARD_PADDING + c.y * CELL_STRIDE,
  };
}

/** Center pixel of a cell (for drawing pawns). */
export function cellCenter(c: Cell): { px: number; py: number } {
  return {
    px: BOARD_PADDING + c.x * CELL_STRIDE + CELL_PX / 2,
    py: BOARD_PADDING + c.y * CELL_STRIDE + CELL_PX / 2,
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
    x: BOARD_PADDING + pos.x * CELL_STRIDE,
    y: BOARD_PADDING + pos.y * CELL_STRIDE + CELL_PX,
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
    x: BOARD_PADDING + pos.x * CELL_STRIDE + CELL_PX,
    y: BOARD_PADDING + pos.y * CELL_STRIDE,
    w: GAP_PX,
    h: CELL_PX * 2 + GAP_PX,
  };
}

/**
 * Convert canvas pixel coords to a cell.
 * Returns null if the cursor is in a gap strip rather than a cell area.
 */
export function pixelToCell(px: number, py: number): Cell | null {
  const localPx = px - BOARD_PADDING;
  const localPy = py - BOARD_PADDING;

  const col = Math.floor(localPx / CELL_STRIDE);
  const row = Math.floor(localPy / CELL_STRIDE);
  const localX = localPx - col * CELL_STRIDE;
  const localY = localPy - row * CELL_STRIDE;

  if (localX < 0 || localY < 0 || localX >= CELL_PX || localY >= CELL_PX) return null;
  if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return null;

  return { x: col, y: row };
}

/**
 * Convert canvas pixel coords to a wall anchor + orientation.
 * Returns null if the cursor is not in any gap strip.
 */
export function pixelToWallHit(
  px: number,
  py: number,
): { pos: WallPos; orientation: WallOrientation } | null {
  const localPx = px - BOARD_PADDING;
  const localPy = py - BOARD_PADDING;

  const col = Math.floor(localPx / CELL_STRIDE);
  const row = Math.floor(localPy / CELL_STRIDE);
  const localX = localPx - col * CELL_STRIDE;
  const localY = localPy - row * CELL_STRIDE;

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
