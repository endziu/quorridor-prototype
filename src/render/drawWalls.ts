import { COLORS } from "../constants.ts";
import type { Wall, WallPreview } from "../types.ts";
import { horizontalWallRect, verticalWallRect } from "../utils/coords.ts";

function drawWall(ctx: CanvasRenderingContext2D, wall: Wall, color: string): void {
  const rect =
    wall.orientation === "horizontal"
      ? horizontalWallRect(wall.pos)
      : verticalWallRect(wall.pos);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 3);
  ctx.fill();
}

export function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: readonly Wall[],
  preview: WallPreview | null,
): void {
  for (const wall of walls) {
    drawWall(ctx, wall, COLORS.wall);
  }

  if (preview !== null) {
    const color = preview.valid ? COLORS.wallPreviewValid : COLORS.wallPreviewInvalid;
    drawWall(ctx, { pos: preview.pos, orientation: preview.orientation }, color);
  }
}
