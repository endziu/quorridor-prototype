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
 * Returns true if the wall blocks at least one edge traversed on `path`.
 * Used for easy difficulty — only walls that directly cut the opponent's route.
 */
function wallBlocksPathEdge(wall: Wall, path: Cell[]): boolean {
  const tempWalls = [wall];
  for (let i = 0; i < path.length - 1; i++) {
    if (isEdgeBlocked(tempWalls, path[i]!, path[i + 1]!)) return true;
  }
  return false;
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

  const opp = opponent(aiTeam);
  const oppPath = getShortestPath(state.walls, state.players[opp].pos, opp);
  if (!oppPath) return all;

  if (difficulty === "easy") {
    return all.filter((w) => wallBlocksPathEdge(w, oppPath));
  }

  // medium
  const pathKeys = new Set(oppPath.map((c) => `${c.x},${c.y}`));
  return all.filter((w) => wallTouchesPathCell(w, pathKeys));
}

/**
 * Choose the best action for `team` using a greedy 1-ply search.
 * Wall candidates are filtered by difficulty — see wallCandidates().
 * Prefers pawn moves over wall placements when scores are equal (preserves wall budget).
 */
export function chooseAction(state: GameState, team: Team, difficulty: Difficulty): GameAction {
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

  // bestAction is always set: the game is still playing, so at least one move exists
  return bestAction!;
}
