import { COLORS } from "../constants.ts";
import type { Wall, WallPreview } from "../types.ts";
import { horizontalWallRect, verticalWallRect } from "../utils/coords.ts";

function wallPath(ctx: CanvasRenderingContext2D, wall: Wall): void {
  const rect =
    wall.orientation === "horizontal"
      ? horizontalWallRect(wall.pos)
      : verticalWallRect(wall.pos);

  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 3);
}

function drawPlacedWall(ctx: CanvasRenderingContext2D, wall: Wall): void {
  wallPath(ctx, wall);
  ctx.fillStyle = COLORS.wall;
  ctx.fill();
}

function drawPreviewWall(ctx: CanvasRenderingContext2D, preview: WallPreview): void {
  const baseColor = preview.valid
    ? "80, 210, 120"
    : "220, 70, 70";

  wallPath(ctx, { pos: preview.pos, orientation: preview.orientation });
  ctx.fillStyle = `rgba(${baseColor}, 0.12)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${baseColor}, 0.55)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: readonly Wall[],
  preview: WallPreview | null,
): void {
  for (const wall of walls) {
    drawPlacedWall(ctx, wall);
  }

  if (preview !== null) {
    drawPreviewWall(ctx, preview);
  }
}
