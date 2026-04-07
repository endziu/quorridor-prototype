import { describe, expect, test } from "bun:test";
import { playerHasPath, getShortestPath } from "./pathfinding.ts";
import { isEdgeBlocked } from "./walls.ts";
import type { Cell, Wall } from "../types.ts";
import { GRID_SIZE } from "../constants.ts";

describe("isEdgeBlocked Symmetry", () => {
  test("horizontal wall blocks both directions equally", () => {
    const walls: Wall[] = [{ pos: { x: 4, y: 3 }, orientation: "horizontal" }];
    const a: Cell = { x: 4, y: 3 };
    const b: Cell = { x: 4, y: 4 };
    expect(isEdgeBlocked(walls, a, b)).toBe(true);
    expect(isEdgeBlocked(walls, b, a)).toBe(true);
  });

  test("vertical wall blocks both directions equally", () => {
    const walls: Wall[] = [{ pos: { x: 3, y: 4 }, orientation: "vertical" }];
    const a: Cell = { x: 3, y: 4 };
    const b: Cell = { x: 4, y: 4 };
    expect(isEdgeBlocked(walls, a, b)).toBe(true);
    expect(isEdgeBlocked(walls, b, a)).toBe(true);
  });
});

describe("isEdgeBlocked Boundaries", () => {
  test("horizontal wall at far left (x=0) blocks col 0 and 1", () => {
    const walls: Wall[] = [{ pos: { x: 0, y: 3 }, orientation: "horizontal" }];
    expect(isEdgeBlocked(walls, { x: 0, y: 3 }, { x: 0, y: 4 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 1, y: 3 }, { x: 1, y: 4 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 2, y: 3 }, { x: 2, y: 4 })).toBe(false);
  });

  test("horizontal wall at far right (x=7) blocks col 7 and 8", () => {
    const walls: Wall[] = [{ pos: { x: 7, y: 3 }, orientation: "horizontal" }];
    expect(isEdgeBlocked(walls, { x: 7, y: 3 }, { x: 7, y: 4 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 8, y: 3 }, { x: 8, y: 4 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 6, y: 3 }, { x: 6, y: 4 })).toBe(false);
  });

  test("vertical wall at top (y=0) blocks row 0 and 1", () => {
    const walls: Wall[] = [{ pos: { x: 3, y: 0 }, orientation: "vertical" }];
    expect(isEdgeBlocked(walls, { x: 3, y: 0 }, { x: 4, y: 0 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 3, y: 1 }, { x: 4, y: 1 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 3, y: 2 }, { x: 4, y: 2 })).toBe(false);
  });

  test("vertical wall at bottom (y=7) blocks row 7 and 8", () => {
    const walls: Wall[] = [{ pos: { x: 3, y: 7 }, orientation: "vertical" }];
    expect(isEdgeBlocked(walls, { x: 3, y: 7 }, { x: 4, y: 7 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 3, y: 8 }, { x: 4, y: 8 })).toBe(true);
    expect(isEdgeBlocked(walls, { x: 3, y: 6 }, { x: 4, y: 6 })).toBe(false);
  });
});

describe("playerHasPath Advanced Scenarios", () => {
  test("the snake: a long winding path is detected", () => {
    // Construct a snake-like path from bottom to top
    // We alternate horizontal walls with one gap at the end
    const walls: Wall[] = [];
    for (let y = 1; y < GRID_SIZE - 1; y += 2) {
      // Wall from x=0..6, gap at x=8 (covers col 0-7, leaves 8 open)
      walls.push({ pos: { x: 0, y }, orientation: "horizontal" });
      walls.push({ pos: { x: 2, y }, orientation: "horizontal" });
      walls.push({ pos: { x: 4, y }, orientation: "horizontal" });
      walls.push({ pos: { x: 6, y }, orientation: "horizontal" });

      // Next wall at y+1 has gap at x=0 (covers col 1-8, leaves 0 open)
      const nextY = y + 1;
      if (nextY < GRID_SIZE - 1) {
        walls.push({ pos: { x: 1, y: nextY }, orientation: "horizontal" });
        walls.push({ pos: { x: 3, y: nextY }, orientation: "horizontal" });
        walls.push({ pos: { x: 5, y: nextY }, orientation: "horizontal" });
        walls.push({ pos: { x: 7, y: nextY }, orientation: "horizontal" });
      }
    }

    // White starts at (4, 8), goal is y=0
    expect(playerHasPath(walls, { x: 4, y: 8 }, "white")).toBe(true);

    // Now close the only gap at (0, 7) or whatever is the last one
    // Let's just find a gap and close it.
    // If we add a vertical wall that crosses the path, it should fail.
    // But better: add the missing horizontal wall segment.
    const closingWall: Wall = { pos: { x: 7, y: 1 }, orientation: "horizontal" }; 
    // This is getting complex to reason about manually. Let's just block the whole row.
    const blockingRow: Wall[] = [
        { pos: { x: 0, y: 4 }, orientation: "horizontal" },
        { pos: { x: 2, y: 4 }, orientation: "horizontal" },
        { pos: { x: 4, y: 4 }, orientation: "horizontal" },
        { pos: { x: 6, y: 4 }, orientation: "horizontal" },
        { pos: { x: 7, y: 4 }, orientation: "horizontal" },
    ];
    expect(playerHasPath(blockingRow, { x: 4, y: 8 }, "white")).toBe(false);
  });

  test("goal row is any cell", () => {
    // If white is at (0, 1) and y=0 is blocked except for (8, 0), it should still find it.
    const walls: Wall[] = [
        { pos: { x: 0, y: 0 }, orientation: "horizontal" },
        { pos: { x: 2, y: 0 }, orientation: "horizontal" },
        { pos: { x: 4, y: 0 }, orientation: "horizontal" },
        { pos: { x: 6, y: 0 }, orientation: "horizontal" },
        // (8,0) is open
    ];
    // Start at (0, 8), must reach y=0
    expect(playerHasPath(walls, { x: 0, y: 8 }, "white")).toBe(true);
  });

  test("path monotonicity: adding walls never creates a path", () => {
    const walls: Wall[] = [];
    const start: Cell = { x: 4, y: 8 };
    const team = "white";

    for (let i = 0; i < 50; i++) {
        const hasPathBefore = playerHasPath(walls, start, team);
        
        // Add a random wall
        const newWall: Wall = {
            pos: { x: Math.floor(Math.random() * 8), y: Math.floor(Math.random() * 8) },
            orientation: Math.random() > 0.5 ? "horizontal" : "vertical"
        };
        walls.push(newWall);
        
        const hasPathAfter = playerHasPath(walls, start, team);
        
        // If there was no path before, there cannot be a path after adding a wall
        if (!hasPathBefore) {
            expect(hasPathAfter).toBe(false);
        }
    }
  });
});

describe("getShortestPath", () => {
  test("returns shortest path on open board", () => {
    const start: Cell = { x: 4, y: 8 };
    const path = getShortestPath([], start, "white");
    expect(path).not.toBeNull();
    // Path should be 9 cells long (y=8 to y=0)
    expect(path).toHaveLength(9);
    expect(path![0]).toEqual(start);
    expect(path![8].y).toBe(0);
  });

  test("returns null when blocked", () => {
    const start: Cell = { x: 4, y: 8 };
    const blockingRow: Wall[] = [
      { pos: { x: 0, y: 4 }, orientation: "horizontal" },
      { pos: { x: 2, y: 4 }, orientation: "horizontal" },
      { pos: { x: 4, y: 4 }, orientation: "horizontal" },
      { pos: { x: 6, y: 4 }, orientation: "horizontal" },
      { pos: { x: 7, y: 4 }, orientation: "horizontal" },
    ];
    const path = getShortestPath(blockingRow, start, "white");
    expect(path).toBeNull();
  });

  test("finds path around a wall", () => {
    // Wall in front of white
    const walls: Wall[] = [{ pos: { x: 4, y: 7 }, orientation: "horizontal" }];
    const start: Cell = { x: 4, y: 8 };
    const path = getShortestPath(walls, start, "white");
    expect(path).not.toBeNull();
    // Should go around the wall
    expect(path!.length).toBeGreaterThan(9);
  });
});
