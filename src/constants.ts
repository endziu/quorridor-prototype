export const GRID_SIZE = 9;

/** Pixel size of each cell's content area. */
export const CELL_PX = 70;

/** Pixel size of the gap between cells (wall slot area). */
export const GAP_PX = 15;

/** Padding around the entire grid. */
export const BOARD_PADDING = GAP_PX * 2;

/** Distance between the origins of two adjacent cells. */
export const CELL_STRIDE = CELL_PX + GAP_PX; // 85

/** Total canvas size: 9 cells + 8 gaps + padding on both sides. */
export const CANVAS_PX = (GRID_SIZE * CELL_PX) + ((GRID_SIZE - 1) * GAP_PX) + (BOARD_PADDING * 2); // 810

/** Walls per player at game start. */
export const WALLS_PER_PLAYER = 10;

export const COLORS = {
  background: "#5d3a1a", // Warm teak wood base
  cell: "#3c2a1a",       // Dark walnut raised blocks
  cellHighlight: "rgba(255, 255, 255, 0.15)",
  cellHover: "rgba(100, 255, 100, 0.25)",
  cellHoverStroke: "rgba(100, 255, 100, 0.6)",
  cellHoverInvalid: "rgba(255, 80, 80, 0.3)",
  cellHoverInvalidStroke: "rgba(255, 50, 50, 0.7)",
  wallSlot: "#3a2510",   // Darker grooves
  wallWhite: "#e6ba8c",  // Light birch/pine
  wallBlack: "#6d4c31",  // Mahogany
  wallWhiteStroke: "rgba(0, 0, 0, 0.15)",
  wallBlackStroke: "rgba(0, 0, 0, 0.15)",
  white: "#fdf8f0",      // Polished bone
  black: "#26211c",      // Dark wood ebony
  whiteStroke: "#dcc9b0",
  blackStroke: "#1a1612",
  text: "#f5e6d3",
  winOverlay: "rgba(45, 25, 10, 0.85)",
} as const;
