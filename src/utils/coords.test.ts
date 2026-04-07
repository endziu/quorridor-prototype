import { describe, expect, test } from "bun:test";
import { cellOrigin, cellCenter, horizontalWallRect, verticalWallRect, pixelToCell, pixelToWallHit } from "./coords.ts";
import { CELL_PX, CELL_STRIDE, GAP_PX } from "../constants.ts";

describe("coords", () => {
  test("cellOrigin", () => {
    expect(cellOrigin({ x: 0, y: 0 })).toEqual({ px: 0, py: 0 });
    expect(cellOrigin({ x: 1, y: 1 })).toEqual({ px: CELL_STRIDE, py: CELL_STRIDE });
  });

  test("cellCenter", () => {
    expect(cellCenter({ x: 0, y: 0 })).toEqual({ px: CELL_PX / 2, py: CELL_PX / 2 });
  });

  test("pixelToCell", () => {
    // In cell (0,0)
    expect(pixelToCell(10, 10)).toEqual({ x: 0, y: 0 });
    // In gap between cells (0,0) and (1,0)
    expect(pixelToCell(CELL_PX + 2, 10)).toBeNull();
    // Out of bounds
    expect(pixelToCell(-1, -1)).toBeNull();
    expect(pixelToCell(1000, 1000)).toBeNull();
  });

  test("pixelToWallHit", () => {
    // In vertical gap between col 0 and 1
    const vHit = pixelToWallHit(CELL_PX + 5, 20);
    expect(vHit).toMatchObject({ pos: { x: 0, y: 0 }, orientation: "vertical" });

    // In horizontal gap between row 0 and 1
    const hHit = pixelToWallHit(20, CELL_PX + 5);
    expect(hHit).toMatchObject({ pos: { x: 0, y: 0 }, orientation: "horizontal" });

    // Center of cell -> null
    expect(pixelToWallHit(10, 10)).toBeNull();

    // Intersection: (CELL_PX, CELL_PX) is the top-left of the gap intersection
    // Center of the gap intersection is (CELL_PX + GAP_PX/2, CELL_PX + GAP_PX/2)
    const mid = CELL_PX + GAP_PX / 2;
    // Slightly closer to vertical centerline (dCol < dRow)
    expect(pixelToWallHit(mid, mid - 1)).toMatchObject({ orientation: "vertical" });
    // Slightly closer to horizontal centerline (dRow < dCol)
    expect(pixelToWallHit(mid - 1, mid)).toMatchObject({ orientation: "horizontal" });
  });

  test("rects", () => {
    const hRect = horizontalWallRect({ x: 0, y: 0 });
    expect(hRect).toEqual({ x: 0, y: CELL_PX, w: CELL_PX * 2 + GAP_PX, h: GAP_PX });

    const vRect = verticalWallRect({ x: 0, y: 0 });
    expect(vRect).toEqual({ x: CELL_PX, y: 0, w: GAP_PX, h: CELL_PX * 2 + GAP_PX });
  });
});
