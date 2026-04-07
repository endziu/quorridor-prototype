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
  background: "#1a1a2e",
  cell: "#242444",
  cellHighlight: "rgba(0, 212, 255, 0.25)",
  cellHover: "rgba(0, 255, 170, 0.25)",
  cellHoverStroke: "rgba(0, 255, 170, 0.6)",
  cellHoverInvalid: "rgba(255, 80, 80, 0.3)",
  cellHoverInvalidStroke: "rgba(255, 50, 50, 0.7)",
  wallSlot: "rgba(100, 110, 160, 0.25)",
  wallWhite: "#e67e22",
  wallBlack: "#7e4a35",
  wallWhiteStroke: "rgba(255, 255, 255, 0.3)",
  wallBlackStroke: "rgba(0, 0, 0, 0.3)",
  white: "#ffffff",
  black: "#111111",
  whiteStroke: "#cccccc",
  blackStroke: "#444444",
  text: "#f0f0ff",
  winOverlay: "rgba(10, 10, 25, 0.85)",
} as const;
