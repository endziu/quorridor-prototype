import { getLegalMoves } from "../logic/movement.ts";
import { isWallPlacementLegal, isEdgeBlocked } from "../logic/walls.ts";
import { getShortestPath } from "../logic/pathfinding.ts";
import { dispatch } from "../state/stateMachine.ts";
import type { Cell, GameAction, GameState, Team, Wall, WallOrientation } from "../types.ts";

export type Difficulty = "easy" | "medium" | "hard";

const ORIENTATIONS: WallOrientation[] = ["horizontal", "vertical"];

function opponent(team: Team): Team {
  return team === "white" ? "black" : "white";
}

/**
 * Score the position from `aiTeam`'s perspective.
 * Higher is better. Returns ±Infinity on terminal positions.
 */
function evaluate(state: GameState, aiTeam: Team): number {
  const opp = opponent(aiTeam);
  const myPath = getShortestPath(state.walls, state.players[aiTeam].pos, aiTeam);
  const oppPath = getShortestPath(state.walls, state.players[opp].pos, opp);
  if (myPath === null) return -Infinity;
  if (oppPath === null) return Infinity;
  return oppPath.length - myPath.length;
}
/**
 * Returns true if any of the four cells the wall anchor covers is on the opponent's path.
 * Used for medium difficulty — walls in the vicinity of the opponent's route.
 * A wall at {x, y} covers cells (x,y), (x+1,y), (x,y+1), (x+1,y+1).
 */
function wallTouchesPathCell(wall: Wall, pathKeys: Set<string>): boolean {
  const { x, y } = wall.pos;
  return (
    pathKeys.has(`${x},${y}`) ||
    pathKeys.has(`${x + 1},${y}`) ||
    pathKeys.has(`${x},${y + 1}`) ||
    pathKeys.has(`${x + 1},${y + 1}`)
  );
}

/**
 * Returns all wall positions to consider based on difficulty.
 * Hard considers every position; easier modes restrict to walls relevant to the opponent's path.
 * Falls back to all positions if the opponent has no path (shouldn't happen in a legal game).
 */
function wallCandidates(state: GameState, aiTeam: Team, difficulty: Difficulty): Wall[] {
  const all: Wall[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      for (const orientation of ORIENTATIONS) {
        all.push({ pos: { x, y }, orientation });
      }
    }
  }

  if (difficulty === "hard") return all;

  if (difficulty === "easy") {
    // Easy mode: Consider only a random subset of possible walls (approx 15%).
    // This makes it much less likely to find an optimal blocking wall.
    return all.filter(() => Math.random() < 0.15);
  }

  const opp = opponent(aiTeam);
  const oppPath = getShortestPath(state.walls, state.players[opp].pos, opp);
  if (!oppPath) return all;

  // medium: walls in the vicinity of the opponent's route.
  const pathKeys = new Set(oppPath.map((c) => `${c.x},${c.y}`));
  return all.filter((w) => wallTouchesPathCell(w, pathKeys));
}

/**
 * Choose the best action for `team` using a greedy 1-ply search.
 * Wall candidates are filtered by difficulty — see wallCandidates().
 * Prefers pawn moves over wall placements when scores are equal (preserves wall budget).
 */
export function chooseAction(state: GameState, team: Team, difficulty: Difficulty): GameAction {
  // Easy difficulty blunder: 40% chance to just pick a random move or a random wall
  if (difficulty === "easy" && Math.random() < 0.4) {
    const moves = getLegalMoves(state, team);
    const wallsLeft = state.players[team].wallsLeft;
    
    // 80% of blunders are moves, 20% are walls (if available)
    if (Math.random() < 0.8 || wallsLeft === 0) {
      if (moves.length > 0) {
        return { type: "MOVE", team, target: moves[Math.floor(Math.random() * moves.length)]! };
      }
    } else {
      // Try to find any legal wall from a random selection
      const allWalls: Wall[] = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          for (const orientation of ORIENTATIONS) {
            allWalls.push({ pos: { x, y }, orientation });
          }
        }
      }
      // Shuffle a bit or just pick randomly
      for (let i = 0; i < 20; i++) {
        const wall = allWalls[Math.floor(Math.random() * allWalls.length)]!;
        if (isWallPlacementLegal(state, team, wall)) {
          return { type: "PLACE_WALL", team, wall };
        }
      }
      // Fallback to random move if no legal wall found quickly
      if (moves.length > 0) {
        return { type: "MOVE", team, target: moves[Math.floor(Math.random() * moves.length)]! };
      }
    }
  }

  let bestAction: GameAction | null = null;
  let bestScore = -Infinity;
  let bestIsWall = false;

  function consider(action: GameAction, isWall: boolean): void {
    const next = dispatch(state, action);
    if (next === state) return; // rejected — illegal
    const score = evaluate(next, team);
    if (score > bestScore || (score === bestScore && !isWall && bestIsWall)) {
      bestScore = score;
      bestAction = action;
      bestIsWall = isWall;
    }
  }

  for (const target of getLegalMoves(state, team)) {
    consider({ type: "MOVE", team, target }, false);
  }

  if (state.players[team].wallsLeft > 0) {
    for (const wall of wallCandidates(state, team, difficulty)) {
      if (isWallPlacementLegal(state, team, wall)) {
        consider({ type: "PLACE_WALL", team, wall }, true);
      }
    }
  }

  if (bestAction === null) {
    throw new Error(`chooseAction: no legal action found for ${team} — called on non-playing state?`);
  }
  return bestAction;
}
