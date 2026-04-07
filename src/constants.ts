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
  cellHighlight: "rgba(79, 209, 197, 0.15)",
  cellHover: "rgba(79, 209, 197, 0.25)",
  cellHoverStroke: "rgba(79, 209, 197, 0.6)",
  cellHoverInvalid: "rgba(255, 80, 80, 0.3)",
  cellHoverInvalidStroke: "rgba(255, 50, 50, 0.7)",
  wallSlot: "#3a2510",   // Darker grooves
  wallWhite: "#e6ba8c",  // Light birch/pine
  wallBlack: "#6d4c31",  // Mahogany
  wallWhiteStroke: "rgba(0, 0, 0, 0.15)",
  wallBlackStroke: "rgba(0, 0, 0, 0.15)",
  white: "#d2a679",      // Light brown
  black: "#4a3018",      // Dark brown
  whiteStroke: "#f0c497",
  blackStroke: "#2d1d0e",
  text: "#f5e6d3",
  winOverlay: "rgba(45, 25, 10, 0.85)",
} as const;

export const FAMOUS_DUOS = [
  ["Sherlock", "Watson"],
  ["Batman", "Robin"],
  ["Frodo", "Sam"],
  ["Mario", "Luigi"],
  ["Han Solo", "Chewbacca"],
  ["Rick", "Morty"],
  ["Tom", "Jerry"],
  ["Bonnie", "Clyde"],
  ["Woody", "Buzz"],
  ["Kirk", "Spock"],
  // Philosophers & Thinkers
  ["Plato", "Aristotle"],
  ["Sartre", "Camus"],
  ["Hobbes", "Locke"],
  ["Marx", "Freud"],
  ["Voltaire", "Rousseau"],
  ["Kant", "Hegel"],
  ["Nietzsche", "Wagner"],
  ["Schopenhauer", "Hegel"],
  ["Foucault", "Deleuze"],
  ["Heraclitus", "Parmenides"],
  ["Adorno", "Arendt"],
  ["Hume", "Descartes"],
] as const;
