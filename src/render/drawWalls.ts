import { COLORS } from "../constants.ts";
import type { PlacedWall, Wall, WallPreview } from "../types.ts";
import { horizontalWallRect, verticalWallRect } from "../utils/coords.ts";

function wallPath(ctx: CanvasRenderingContext2D, wall: Wall): void {
  const rect =
    wall.orientation === "horizontal"
      ? horizontalWallRect(wall.pos)
      : verticalWallRect(wall.pos);

  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 3);
}

function drawPlacedWall(ctx: CanvasRenderingContext2D, wall: PlacedWall): void {
  const isWhite = wall.placedBy === "white";
  wallPath(ctx, wall);
  ctx.fillStyle = isWhite ? COLORS.wallWhite : COLORS.wallBlack;
  ctx.fill();
  ctx.strokeStyle = isWhite ? COLORS.wallWhiteStroke : COLORS.wallBlackStroke;
  ctx.stroke();
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
  walls: readonly PlacedWall[],
  preview: WallPreview | null,
): void {
  ctx.lineWidth = 1;
  for (const wall of walls) {
    drawPlacedWall(ctx, wall);
  }

  if (preview !== null) {
    drawPreviewWall(ctx, preview);
  }
}
