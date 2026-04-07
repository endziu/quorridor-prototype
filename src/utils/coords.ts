import { CELL_PX, CELL_STRIDE, GAP_PX } from "../constants.ts";
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
    w: CELL_STRIDE * 2,
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
    h: CELL_STRIDE * 2,
  };
}

/**
 * Convert canvas pixel coords to the nearest wall anchor + orientation.
 * Returns null if the cursor is not near a wall slot.
 *
 * Strategy: determine which cell-stride column/row the pixel falls in.
 * If the local offset within that stride is in the gap region (>= CELL_PX),
 * the cursor is in a wall slot. The orientation is supplied by the caller
 * (determined by mouse button), so we just need to find the best anchor.
 */
export function pixelToWallPos(
  px: number,
  py: number,
  orientation: WallOrientation,
): WallPos | null {
  const col = Math.floor(px / CELL_STRIDE); // 0–8
  const row = Math.floor(py / CELL_STRIDE); // 0–8
  const localX = px - col * CELL_STRIDE;
  const localY = py - row * CELL_STRIDE;

  const inVGap = localX >= CELL_PX && col <= 7; // in the vertical gap right of col
  const inHGap = localY >= CELL_PX && row <= 7; // in the horizontal gap below row

  if (orientation === "horizontal") {
    // Horizontal wall needs to be near a horizontal gap
    if (!inHGap) return null;
    // The anchor x is col if we're in the left half of that col's gap, else col-1
    // Simplify: use col directly, clamped to 0–7
    const anchorX = Math.max(0, Math.min(7, col));
    const anchorY = Math.max(0, Math.min(7, row));
    return { x: anchorX, y: anchorY };
  } else {
    // Vertical wall needs to be near a vertical gap
    if (!inVGap) return null;
    const anchorX = Math.max(0, Math.min(7, col));
    const anchorY = Math.max(0, Math.min(7, row));
    return { x: anchorX, y: anchorY };
  }
}
