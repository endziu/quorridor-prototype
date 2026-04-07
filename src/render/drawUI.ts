import { CANVAS_PX, COLORS } from "../constants.ts";
import type { GameState } from "../types.ts";

export function drawUI(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase.kind === "won") {
    drawWinOverlay(ctx, state.phase.winner);
    return;
  }

  const { activeTeam } = state.phase;

  // Turn indicator bar at the top
  const BAR_H = 30;
  ctx.fillStyle =
    activeTeam === "white" ? "rgba(220,220,220,0.15)" : "rgba(20,20,20,0.35)";
  ctx.fillRect(0, 0, CANVAS_PX, BAR_H);

  ctx.font = "bold 13px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.text;

  const whitePawn = "●";
  const whiteWalls = state.players.white.wallsLeft;
  const blackWalls = state.players.black.wallsLeft;

  ctx.fillText(
    `${activeTeam === "white" ? "▶ " : "  "}WHITE  walls: ${whiteWalls}   WASD to move, click to place wall`,
    8,
    BAR_H / 2,
  );

  // Black info at bottom
  const BAR_Y = CANVAS_PX - BAR_H;
  ctx.fillStyle =
    activeTeam === "black" ? "rgba(20,20,20,0.55)" : "rgba(20,20,20,0.25)";
  ctx.fillRect(0, BAR_Y, CANVAS_PX, BAR_H);

  ctx.fillStyle = COLORS.text;
  ctx.fillText(
    `${activeTeam === "black" ? "▶ " : "  "}BLACK  walls: ${blackWalls}   Arrows to move, click to place wall`,
    8,
    BAR_Y + BAR_H / 2,
  );
}

function drawWinOverlay(ctx: CanvasRenderingContext2D, winner: "white" | "black"): void {
  ctx.fillStyle = COLORS.winOverlay;
  ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "bold 56px monospace";
  ctx.fillStyle = winner === "white" ? COLORS.white : "#888888";
  ctx.fillText(winner.toUpperCase(), CANVAS_PX / 2, CANVAS_PX / 2 - 20);

  ctx.font = "24px monospace";
  ctx.fillStyle = COLORS.text;
  ctx.fillText("wins!", CANVAS_PX / 2, CANVAS_PX / 2 + 36);

  ctx.font = "14px monospace";
  ctx.fillStyle = "rgba(200,200,200,0.6)";
  ctx.fillText("Press R to restart", CANVAS_PX / 2, CANVAS_PX / 2 + 76);
}
