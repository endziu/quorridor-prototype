export const GRID_SIZE = 9;

/** Pixel size of each cell's content area. */
export const CELL_PX = 70;

/** Pixel size of the gap between cells (wall slot area). */
export const GAP_PX = 15;

/** Distance between the origins of two adjacent cells. */
export const CELL_STRIDE = CELL_PX + GAP_PX; // 85

/** Total canvas size: 9 cells + 8 gaps (no trailing gap after the last cell). */
export const CANVAS_PX = GRID_SIZE * CELL_PX + (GRID_SIZE - 1) * GAP_PX; // 750

/** Walls per player at game start. */
export const WALLS_PER_PLAYER = 10;

export const COLORS = {
  background: "#0d0d1a",
  cell: "#1a1e38",
  cellHighlight: "rgba(91, 163, 255, 0.22)",
  cellHover: "rgba(91, 255, 163, 0.25)",
  cellHoverStroke: "rgba(91, 255, 163, 0.6)",
  cellHoverInvalid: "rgba(255, 91, 91, 0.25)",
  cellHoverInvalidStroke: "rgba(255, 50, 50, 0.6)",
  wallSlot: "rgba(80, 90, 140, 0.18)",
  wallWhite: "#c97b3a",
  wallBlack: "#5c2e0e",
  wallWhiteStroke: "rgba(255, 200, 130, 0.45)",
  wallBlackStroke: "rgba(180, 90, 30, 0.45)",
  white: "#f0f0f0",
  black: "#1e1e1e",
  whiteStroke: "#999999",
  blackStroke: "#555555",
  text: "#d0d0e0",
  winOverlay: "rgba(0, 0, 0, 0.78)",
} as const;
