import { CANVAS_PX, COLORS } from "../constants.ts";
import type { GameState } from "../types.ts";

export function drawUI(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase.kind === "won") {
    drawWinOverlay(ctx, state.phase.winner);
  }
}

function drawWinOverlay(ctx: CanvasRenderingContext2D, winner: "white" | "black"): void {
  ctx.fillStyle = COLORS.winOverlay;
  ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "bold 56px 'Courier New', monospace";
  ctx.fillStyle = winner === "white" ? COLORS.white : "#666677";
  ctx.fillText(winner.toUpperCase(), CANVAS_PX / 2, CANVAS_PX / 2 - 22);

  ctx.font = "22px 'Courier New', monospace";
  ctx.fillStyle = COLORS.text;
  ctx.fillText("wins!", CANVAS_PX / 2, CANVAS_PX / 2 + 34);

  ctx.font = "13px 'Courier New', monospace";
  ctx.fillStyle = "rgba(180,180,200,0.5)";
  ctx.fillText("press R to restart", CANVAS_PX / 2, CANVAS_PX / 2 + 74);
}
