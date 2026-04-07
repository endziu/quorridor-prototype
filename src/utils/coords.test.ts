import { describe, expect, test } from "bun:test";
import { cellOrigin, cellCenter, horizontalWallRect, verticalWallRect, pixelToCell, pixelToWallHit } from "./coords.ts";
import { BOARD_PADDING, CELL_PX, CELL_STRIDE, GAP_PX } from "../constants.ts";

describe("coords", () => {
  test("cellOrigin", () => {
    expect(cellOrigin({ x: 0, y: 0 })).toEqual({ px: BOARD_PADDING, py: BOARD_PADDING });
    expect(cellOrigin({ x: 1, y: 1 })).toEqual({ px: BOARD_PADDING + CELL_STRIDE, py: BOARD_PADDING + CELL_STRIDE });
  });

  test("cellCenter", () => {
    expect(cellCenter({ x: 0, y: 0 })).toEqual({ px: BOARD_PADDING + CELL_PX / 2, py: BOARD_PADDING + CELL_PX / 2 });
  });

  test("pixelToCell", () => {
    // In cell (0,0)
    expect(pixelToCell(BOARD_PADDING + 10, BOARD_PADDING + 10)).toEqual({ x: 0, y: 0 });
    // In gap between cells (0,0) and (1,0)
    expect(pixelToCell(BOARD_PADDING + CELL_PX + 2, BOARD_PADDING + 10)).toBeNull();
    // Out of bounds (in padding)
    expect(pixelToCell(BOARD_PADDING - 1, BOARD_PADDING - 1)).toBeNull();
    expect(pixelToCell(1000, 1000)).toBeNull();
  });

  test("pixelToWallHit", () => {
    // In vertical gap between col 0 and 1
    const vHit = pixelToWallHit(BOARD_PADDING + CELL_PX + 5, BOARD_PADDING + 20);
    expect(vHit).toMatchObject({ pos: { x: 0, y: 0 }, orientation: "vertical" });

    // In horizontal gap between row 0 and 1
    const hHit = pixelToWallHit(BOARD_PADDING + 20, BOARD_PADDING + CELL_PX + 5);
    expect(hHit).toMatchObject({ pos: { x: 0, y: 0 }, orientation: "horizontal" });

    // Center of cell -> null
    expect(pixelToWallHit(BOARD_PADDING + 10, BOARD_PADDING + 10)).toBeNull();

    // Intersection: (BOARD_PADDING + CELL_PX, BOARD_PADDING + CELL_PX) is the top-left of the gap intersection
    const mid = BOARD_PADDING + CELL_PX + GAP_PX / 2;
    // Slightly closer to vertical centerline
    expect(pixelToWallHit(mid, mid - 1)).toMatchObject({ orientation: "vertical" });
    // Slightly closer to horizontal centerline
    expect(pixelToWallHit(mid - 1, mid)).toMatchObject({ orientation: "horizontal" });
  });

  test("rects", () => {
    const hRect = horizontalWallRect({ x: 0, y: 0 });
    expect(hRect).toEqual({ x: BOARD_PADDING, y: BOARD_PADDING + CELL_PX, w: CELL_PX * 2 + GAP_PX, h: GAP_PX });

    const vRect = verticalWallRect({ x: 0, y: 0 });
    expect(vRect).toEqual({ x: BOARD_PADDING + CELL_PX, y: BOARD_PADDING, w: GAP_PX, h: CELL_PX * 2 + GAP_PX });
  });
});
