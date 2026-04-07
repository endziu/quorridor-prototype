import { BOARD_PADDING, CANVAS_PX, CELL_PX, CELL_STRIDE, COLORS, GAP_PX, GRID_SIZE } from "../constants.ts";
import type { Cell, GameState } from "../types.ts";
import { cellOrigin, cellCenter } from "../utils/coords.ts";

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  legalMoves: readonly Cell[],
  hoveredMove: Cell | null = null,
  shortestPaths?: Record<string, Cell[] | null>,
): void {
  // Background (the dark wooden base plate)
  ctx.fillStyle = COLORS.wallSlot;
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
  for (let x = 0; x < GRID_SIZE; x++) {
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

      // Subtle wood grain effect (deterministic to avoid flickering)
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      for (let i = 4; i < CELL_PX - 4; i += 6) {
        // Use deterministic offset based on cell position and index
        const deterministicOffset = ((x * 13 + y * 7 + i) % 10) / 5;
        const xOff = i + deterministicOffset;
        ctx.beginPath();
        ctx.moveTo(px + xOff, py + 4);
        ctx.lineTo(px + xOff, py + CELL_PX - 4);
        ctx.stroke();
      }

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

  // Draw debug paths
  if (shortestPaths) {
    for (const team of ["white", "black"] as const) {
      const path = shortestPaths[team];
      if (!path || path.length < 2) continue;

      ctx.save();
      // Use team colors but with transparency
      ctx.strokeStyle = team === "white" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
      ctx.setLineDash([8, 4]);
      ctx.lineWidth = 4;
      ctx.beginPath();
      const first = path[0];
      if (first) {
        const start = cellCenter(first);
        ctx.moveTo(start.px, start.py);

        for (let i = 1; i < path.length; i++) {
          const p = path[i];
          if (p) {
            const pos = cellCenter(p);
            ctx.lineTo(pos.px, pos.py);
          }
        }
        ctx.stroke();

        // Draw path length text
        const steps = path.length - 1;
        const textPos = cellCenter(first);
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.fillStyle = team === "white" ? "#ffffff" : "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Background for the number to make it readable
        ctx.beginPath();
        ctx.arc(textPos.px + 20, textPos.py - 20, 10, 0, Math.PI * 2);
        ctx.fillStyle = team === "white" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
        ctx.fill();
        
        ctx.fillStyle = team === "white" ? "#ffffff" : "#000000";
        ctx.fillText(steps.toString(), textPos.px + 20, textPos.py - 20);
      }
      ctx.restore();
    }
  }
}
