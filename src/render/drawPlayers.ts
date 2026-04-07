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
      ctx.shadowBlur = 18;
      ctx.shadowColor = team === "white" ? "rgba(220,220,255,0.55)" : "rgba(80,80,120,0.6)";
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
