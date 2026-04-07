import { CANVAS_PX, CELL_PX, CELL_STRIDE, COLORS, GAP_PX, GRID_SIZE } from "../constants.ts";
import type { Cell, GameState } from "../types.ts";
import { cellOrigin } from "../utils/coords.ts";

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  legalMoves: readonly Cell[],
): void {
  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

  // Draw gap regions (wall slot indicators)
  ctx.fillStyle = COLORS.wallSlot;
  for (let i = 0; i < GRID_SIZE - 1; i++) {
    // Horizontal gap below row i
    ctx.fillRect(0, i * CELL_STRIDE + CELL_PX, CANVAS_PX, GAP_PX);
    // Vertical gap right of col i
    ctx.fillRect(i * CELL_STRIDE + CELL_PX, 0, GAP_PX, CANVAS_PX);
  }

  // Draw cells
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const { px, py } = cellOrigin({ x, y });
      const isLegal = legalMoves.some((c) => c.x === x && c.y === y);
      ctx.fillStyle = isLegal ? COLORS.cellHighlight : COLORS.cell;
      ctx.fillRect(px, py, CELL_PX, CELL_PX);
    }
  }
}
