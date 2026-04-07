import { GRID_SIZE } from "../constants.ts";
import type { Cell, Direction, GameState, Team } from "../types.ts";
import { isEdgeBlocked } from "./walls.ts";

/** Absolute delta for a direction given a team. */
function delta(dir: Direction, team: Team): Cell {
  switch (dir) {
    case "forward": return team === "white" ? { x: 0, y: -1 } : { x: 0, y: 1 };
    case "back":    return team === "white" ? { x: 0, y:  1 } : { x: 0, y: -1 };
    case "left":    return { x: -1, y: 0 };
    case "right":   return { x:  1, y: 0 };
  }
}

function addCell(a: Cell, b: Cell): Cell {
  return { x: a.x + b.x, y: a.y + b.y };
}

function inBounds(c: Cell): boolean {
  return c.x >= 0 && c.x < GRID_SIZE && c.y >= 0 && c.y < GRID_SIZE;
}

function cellEq(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Returns all cells the active player can legally move to.
 * Handles standard moves, straight jumps, and diagonal jumps.
 */
export function getLegalMoves(state: GameState, team: Team): Cell[] {
  const self = state.players[team].pos;
  const opponentTeam: Team = team === "white" ? "black" : "white";
  const opponent = state.players[opponentTeam].pos;
  const walls = state.walls;

  const legal: Cell[] = [];

  const DIRECTIONS: Direction[] = ["forward", "back", "left", "right"];

  for (const dir of DIRECTIONS) {
    const d = delta(dir, team);
    const adjacent = addCell(self, d);

    if (!inBounds(adjacent)) continue;
    if (isEdgeBlocked(walls, self, adjacent)) continue;

    if (!cellEq(adjacent, opponent)) {
      // Normal move
      legal.push(adjacent);
    } else {
      // Opponent is adjacent — jump logic
      const straightTarget = addCell(adjacent, d);
      const straightInBounds = inBounds(straightTarget);
      const straightBlocked = straightInBounds
        ? isEdgeBlocked(walls, adjacent, straightTarget)
        : true;

      if (straightInBounds && !straightBlocked) {
        // Straight jump over opponent
        legal.push(straightTarget);
      } else {
        // Diagonal jumps: perpendicular directions from opponent's cell
        const perpDeltas: Cell[] =
          d.y === 0
            ? [{ x: 0, y: -1 }, { x: 0, y: 1 }]  // moving horizontally → vertical perps
            : [{ x: -1, y: 0 }, { x: 1, y: 0 }];  // moving vertically → horizontal perps

        for (const pd of perpDeltas) {
          const diagTarget = addCell(adjacent, pd);
          if (inBounds(diagTarget) && !isEdgeBlocked(walls, adjacent, diagTarget)) {
            legal.push(diagTarget);
          }
        }
      }
    }
  }

  return legal;
}
