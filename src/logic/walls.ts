import type { Cell, GameState, PlayerState, Team, Wall, WallPos, WallOrientation } from "../types.ts";
import { playerHasPath } from "./pathfinding.ts";

/**
 * Returns true if the edge between `from` and `to` is blocked by a wall.
 * `from` and `to` must be adjacent (differ by 1 in exactly one axis).
 */
export function isEdgeBlocked(walls: readonly Wall[], from: Cell, to: Cell): boolean {
  const dy = to.y - from.y;
  const dx = to.x - from.x;

  if (dy !== 0) {
    // Vertical move — horizontal walls block it
    const topRow = Math.min(from.y, to.y);
    return walls.some(
      (w) =>
        w.orientation === "horizontal" &&
        w.pos.y === topRow &&
        (w.pos.x === from.x || w.pos.x === from.x - 1),
    );
  } else {
    // Horizontal move — vertical walls block it
    const leftCol = Math.min(from.x, to.x);
    return walls.some(
      (w) =>
        w.orientation === "vertical" &&
        w.pos.x === leftCol &&
        (w.pos.y === from.y || w.pos.y === from.y - 1),
    );
  }
}

/** Returns true if two walls conflict (overlap or cross). */
function wallsConflict(a: Wall, b: Wall): boolean {
  if (a.orientation === "horizontal" && b.orientation === "horizontal") {
    return a.pos.y === b.pos.y && Math.abs(a.pos.x - b.pos.x) <= 1;
  }
  if (a.orientation === "vertical" && b.orientation === "vertical") {
    return a.pos.x === b.pos.x && Math.abs(a.pos.y - b.pos.y) <= 1;
  }
  // Cross-conflict: share the same anchor point
  return a.pos.x === b.pos.x && a.pos.y === b.pos.y;
}

/**
 * Returns true if placing `wall` is legal given the current game state.
 * Checks: bounds, overlap/cross-conflict, wall budget, and path existence for both players.
 */
export function isWallPlacementLegal(state: GameState, team: Team, wall: Wall): boolean {
  const { pos, orientation } = wall;

  // Bounds: anchor 0–7 on each axis
  if (pos.x < 0 || pos.x > 7 || pos.y < 0 || pos.y > 7) return false;

  // Wall budget
  const player: PlayerState = state.players[team];
  if (player.wallsLeft <= 0) return false;

  // Overlap / cross-conflict with existing walls
  for (const existing of state.walls) {
    if (wallsConflict(wall, existing)) return false;
  }

  // Path existence: both players must still reach their goal after placement
  const hypotheticalWalls: readonly Wall[] = [...state.walls, wall];
  if (!playerHasPath(hypotheticalWalls, state.players.white.pos, "white")) return false;
  if (!playerHasPath(hypotheticalWalls, state.players.black.pos, "black")) return false;

  return true;
}

/** Exposed for use in rendering wall slot indicators. */
export function wallFromPosOrientation(pos: WallPos, orientation: WallOrientation): Wall {
  return { pos, orientation };
}
