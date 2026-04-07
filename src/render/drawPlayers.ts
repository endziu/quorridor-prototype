import { CELL_PX, COLORS } from "../constants.ts";
import type { GameState } from "../types.ts";
import { cellCenter } from "../utils/coords.ts";

const PAWN_RADIUS = CELL_PX * 0.3;

export function drawPlayers(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const team of ["white", "black"] as const) {
    const { px, py } = cellCenter(state.players[team].pos);

    ctx.beginPath();
    ctx.arc(px, py, PAWN_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = team === "white" ? COLORS.white : COLORS.black;
    ctx.fill();
    ctx.strokeStyle = team === "white" ? COLORS.whiteStroke : COLORS.blackStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
