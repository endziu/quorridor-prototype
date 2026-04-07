import { CELL_PX, COLORS } from "../constants.ts";
import type { GameState } from "../types.ts";
import { cellCenter } from "../utils/coords.ts";

const PAWN_RADIUS = CELL_PX * 0.3;

export function drawPlayers(ctx: CanvasRenderingContext2D, state: GameState): void {
  const activeTeam = state.phase.kind === "playing" ? state.phase.activeTeam : null;

  for (const team of ["white", "black"] as const) {
    const { px, py } = cellCenter(state.players[team].pos);
    const isActive = team === activeTeam;

    if (isActive) {
      ctx.save();
      ctx.shadowBlur = 22;
      ctx.shadowColor = team === "white" ? "rgba(255,255,255,0.7)" : "rgba(100,100,255,0.5)";
    }

    ctx.beginPath();
    ctx.arc(px, py, PAWN_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = team === "white" ? COLORS.white : COLORS.black;
    ctx.fill();
    ctx.strokeStyle = team === "white" ? COLORS.whiteStroke : COLORS.blackStroke;
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.stroke();

    if (isActive) ctx.restore();
  }
}
