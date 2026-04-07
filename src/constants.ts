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
  background: "#2d0a0a", // Deep burgundy board base
  cell: "#1c1c1c",       // Charcoal raised blocks
  cellHighlight: "rgba(255, 255, 255, 0.12)",
  cellHover: "rgba(0, 255, 170, 0.22)",
  cellHoverStroke: "rgba(0, 255, 170, 0.6)",
  cellHoverInvalid: "rgba(255, 60, 60, 0.25)",
  cellHoverInvalidStroke: "rgba(255, 50, 50, 0.7)",
  wallSlot: "#160505",   // Darker deep grooves
  wallWhite: "#d4a373",  // Light wood
  wallBlack: "#8b5e34",  // Darker wood
  wallWhiteStroke: "rgba(0, 0, 0, 0.2)",
  wallBlackStroke: "rgba(0, 0, 0, 0.2)",
  white: "#f8f1e7",      // Cream/Bone pawn
  black: "#2a2a2a",      // Ebony pawn
  whiteStroke: "#c5b4a2",
  blackStroke: "#111111",
  text: "#e8d8c8",
  winOverlay: "rgba(0, 0, 0, 0.82)",
} as const;
