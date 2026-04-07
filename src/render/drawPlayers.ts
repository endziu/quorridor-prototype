import { CELL_PX, COLORS } from "../constants.ts";
import type { GameState, Team } from "../types.ts";
import { cellCenter } from "../utils/coords.ts";
import type { PawnAnim } from "./animationTypes.ts";
import { evaluatePawnAnim } from "./animationTypes.ts";

const PAWN_RADIUS = CELL_PX * 0.3;

function resolvePos(
  team: Team,
  state: GameState,
  pawnAnim: PawnAnim | null,
  now: number,
): { px: number; py: number } {
  if (pawnAnim !== null && pawnAnim.team === team) {
    return evaluatePawnAnim(pawnAnim, now);
  }
  return cellCenter(state.players[team].pos);
}

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  pawnAnim: PawnAnim | null,
  thinkingTeam: Team | null,
  now: number,
): void {
  const activeTeam = state.phase.kind === "playing" ? state.phase.activeTeam : null;

  for (const team of ["white", "black"] as const) {
    const { px, py } = resolvePos(team, state, pawnAnim, now);
    const isActive = team === activeTeam;

    // Pulsing thinking ring
    if (team === thinkingTeam) {
      const phase = (now / 1000) * 1.8 * Math.PI * 2;
      const ringRadius = PAWN_RADIUS + 6 + Math.sin(phase) * 4;
      const alpha = 0.45 + Math.sin(phase) * 0.25;
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(120, 120, 255, ${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "rgba(120, 120, 255, 0.6)";
      ctx.stroke();
      ctx.restore();
    }

    if (isActive) {
      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = team === "white" ? "rgba(255,255,255,0.4)" : "rgba(120,120,255,0.3)";
      ctx.shadowOffsetY = 0;
    } else {
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowOffsetY = 6;
    }

    ctx.beginPath();
    ctx.arc(px, py, PAWN_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = team === "white" ? COLORS.white : COLORS.black;
    ctx.fill();
    ctx.restore(); // Restore shadow before stroke

    ctx.strokeStyle = team === "white" ? COLORS.whiteStroke : COLORS.blackStroke;
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.stroke();
  }
}
