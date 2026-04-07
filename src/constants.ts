export const GRID_SIZE = 9;

/** Pixel size of each cell's content area. */
export const CELL_PX = 70;

/** Pixel size of the gap between cells (wall slot area). */
export const GAP_PX = 10;

/** Distance between the origins of two adjacent cells. */
export const CELL_STRIDE = CELL_PX + GAP_PX; // 80

/** Total canvas size. */
export const CANVAS_PX = GRID_SIZE * CELL_STRIDE; // 720

/** Walls per player at game start. */
export const WALLS_PER_PLAYER = 10;

export const COLORS = {
  background: "#1a1a2e",
  cell: "#2d3561",
  cellHighlight: "rgba(100, 180, 255, 0.25)",
  wallSlot: "rgba(100, 120, 180, 0.2)",
  wall: "#c97b3a",
  wallPreviewValid: "rgba(100, 220, 100, 0.7)",
  wallPreviewInvalid: "rgba(220, 80, 80, 0.7)",
  white: "#f0f0f0",
  black: "#111111",
  whiteStroke: "#aaaaaa",
  blackStroke: "#555555",
  text: "#e0e0e0",
  turnIndicatorWhite: "rgba(240, 240, 240, 0.9)",
  turnIndicatorBlack: "rgba(30, 30, 30, 0.9)",
  winOverlay: "rgba(0, 0, 0, 0.75)",
} as const;
