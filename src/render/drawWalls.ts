import { COLORS } from "../constants.ts";
import type { PlacedWall, Wall, WallPreview } from "../types.ts";
import { horizontalWallRect, verticalWallRect } from "../utils/coords.ts";
import type { WallAnim } from "./animationTypes.ts";
import { easeOutCubic } from "./animationTypes.ts";

function wallPath(ctx: CanvasRenderingContext2D, wall: Wall): void {
  const rect =
    wall.orientation === "horizontal"
      ? horizontalWallRect(wall.pos)
      : verticalWallRect(wall.pos);

  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 3);
}

function drawPlacedWall(ctx: CanvasRenderingContext2D, wall: PlacedWall, opacity: number = 1): void {
  const isWhite = wall.placedBy === "white";

  ctx.save();
  ctx.globalAlpha = opacity;

  wallPath(ctx, wall);

  ctx.shadowBlur = 6;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = isWhite ? COLORS.wallWhite : COLORS.wallBlack;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = isWhite ? COLORS.wallWhiteStroke : COLORS.wallBlackStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawPreviewWall(ctx: CanvasRenderingContext2D, preview: WallPreview): void {
  const baseColor = preview.valid
    ? "0, 255, 170"
    : "255, 80, 80";

  wallPath(ctx, { pos: preview.pos, orientation: preview.orientation });
  ctx.fillStyle = `rgba(${baseColor}, 0.15)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${baseColor}, 0.65)`;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: readonly PlacedWall[],
  preview: WallPreview | null,
  wallAnim: WallAnim | null,
  now: number,
): void {
  ctx.lineWidth = 1;
  for (let i = 0; i < walls.length; i++) {
    const opacity =
      wallAnim !== null && wallAnim.wallIndex === i
        ? easeOutCubic(Math.min((now - wallAnim.startTime) / wallAnim.duration, 1))
        : 1;
    drawPlacedWall(ctx, walls[i]!, opacity);
  }

  if (preview !== null) {
    drawPreviewWall(ctx, preview);
  }
}
