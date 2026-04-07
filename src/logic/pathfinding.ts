import { GRID_SIZE } from "../constants.ts";
import type { Cell, Team, Wall } from "../types.ts";
import { isEdgeBlocked } from "./walls.ts";

/**
 * BFS check: returns true if the player at `start` can reach their goal row.
 * White wins by reaching y=0; black wins by reaching y=8.
 */
export function playerHasPath(
  walls: readonly Wall[],
  start: Cell,
  team: Team,
): boolean {
  const goalY = team === "white" ? 0 : GRID_SIZE - 1;

  const visited = new Set<number>();
  const key = (c: Cell) => c.y * GRID_SIZE + c.x;

  const queue: Cell[] = [start];
  visited.add(key(start));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.y === goalY) return true;

    for (const next of adjacentCells(current)) {
      const k = key(next);
      if (!visited.has(k) && !isEdgeBlocked(walls, current, next)) {
        visited.add(k);
        queue.push(next);
      }
    }
  }

  return false;
}

/**
 * BFS: returns the shortest path (array of cells) to the goal row, or null if blocked.
 */
export function getShortestPath(
  walls: readonly Wall[],
  start: Cell,
  team: Team,
): Cell[] | null {
  const goalY = team === "white" ? 0 : GRID_SIZE - 1;

  const visited = new Map<number, Cell | null>();
  const key = (c: Cell) => c.y * GRID_SIZE + c.x;

  const queue: Cell[] = [start];
  visited.set(key(start), null);

  let endCell: Cell | null = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.y === goalY) {
      endCell = current;
      break;
    }

    for (const next of adjacentCells(current)) {
      const k = key(next);
      if (!visited.has(k) && !isEdgeBlocked(walls, current, next)) {
        visited.set(k, current);
        queue.push(next);
      }
    }
  }

  if (!endCell) return null;

  // Reconstruct path
  const path: Cell[] = [];
  let curr: Cell | null = endCell;
  while (curr) {
    path.push(curr);
    const parent = visited.get(key(curr));
    if (parent === undefined) break;
    curr = parent;
  }
  return path.reverse();
}

function adjacentCells(c: Cell): Cell[] {
  const result: Cell[] = [];
  if (c.y > 0) result.push({ x: c.x, y: c.y - 1 });
  if (c.y < GRID_SIZE - 1) result.push({ x: c.x, y: c.y + 1 });
  if (c.x > 0) result.push({ x: c.x - 1, y: c.y });
  if (c.x < GRID_SIZE - 1) result.push({ x: c.x + 1, y: c.y });
  return result;
}
