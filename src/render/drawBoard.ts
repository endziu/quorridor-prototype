import { BOARD_PADDING, CANVAS_PX, CELL_PX, CELL_STRIDE, COLORS, GAP_PX, GRID_SIZE } from "../constants.ts";
import type { Cell, GameState } from "../types.ts";
import { cellOrigin } from "../utils/coords.ts";

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  legalMoves: readonly Cell[],
  hoveredMove: Cell | null = null,
): void {
  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

  // Draw gap regions (wall slot indicators)
  const gridSpan = GRID_SIZE * CELL_PX + (GRID_SIZE - 1) * GAP_PX;
  ctx.fillStyle = COLORS.wallSlot;
  for (let i = 0; i < GRID_SIZE - 1; i++) {
    const offset = BOARD_PADDING + (i * CELL_STRIDE) + CELL_PX;
    // Horizontal gap below row i
    ctx.fillRect(BOARD_PADDING, offset, gridSpan, GAP_PX);
    // Vertical gap right of col i
    ctx.fillRect(offset, BOARD_PADDING, GAP_PX, gridSpan);
  }

  // Draw cells
...
    for (let y = 0; y < GRID_SIZE; y++) {
      const { px, py } = cellOrigin({ x, y });
      const isLegal = legalMoves.some((c) => c.x === x && c.y === y);
      const isHovered = hoveredMove !== null && hoveredMove.x === x && hoveredMove.y === y;

      ctx.save();
      if (isHovered) {
        ctx.lineWidth = 2.5;
        if (isLegal) {
          ctx.fillStyle = COLORS.cellHover;
          ctx.strokeStyle = COLORS.cellHoverStroke;
        } else {
          ctx.fillStyle = COLORS.cellHoverInvalid;
          ctx.strokeStyle = COLORS.cellHoverInvalidStroke;
        }
      } else {
        ctx.fillStyle = isLegal ? COLORS.cellHighlight : COLORS.cell;
        // Raise the "normal" block with shadow
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(0,0,0,0.65)";
        ctx.shadowOffsetY = 4;
      }

      ctx.beginPath();
      ctx.roundRect(px, py, CELL_PX, CELL_PX, 4);
      ctx.fill();

      if (isHovered) {
        ctx.stroke();
      } else if (isLegal) {
          // Subtle inner glow for legal move hint
          ctx.strokeStyle = "rgba(255,255,255,0.06)";
          ctx.stroke();
      }
      ctx.restore();
    }
  }
}
