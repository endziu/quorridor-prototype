import type { Cell, Direction, GameAction, GameState, Team } from "../types.ts";
import { getLegalMoves } from "../logic/movement.ts";
import { GRID_SIZE } from "../constants.ts";

type DispatchFn = (action: GameAction) => void;
type GetStateFn = () => GameState;
type ResetFn = () => void;

const WHITE_KEYS: Record<string, Direction> = {
  KeyW: "forward",
  KeyS: "back",
  KeyA: "left",
  KeyD: "right",
};

const BLACK_KEYS: Record<string, Direction> = {
  ArrowUp:    "forward",
  ArrowDown:  "back",
  ArrowLeft:  "left",
  ArrowRight: "right",
};

function delta(dir: Direction, team: Team): Cell {
  switch (dir) {
    case "forward": return team === "white" ? { x: 0, y: -1 } : { x: 0, y: 1 };
    case "back":    return team === "white" ? { x: 0, y:  1 } : { x: 0, y: -1 };
    case "left":    return { x: -1, y: 0 };
    case "right":   return { x:  1, y: 0 };
  }
}

function inBounds(c: Cell): boolean {
  return c.x >= 0 && c.x < GRID_SIZE && c.y >= 0 && c.y < GRID_SIZE;
}

function cellEq(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Picks the intended target cell for a direction.
 * Handles straight jumps; for diagonal jumps (when straight is blocked) we just
 * attempt the first perpendicular direction that is legal.
 */
function pickTarget(state: GameState, team: Team, dir: Direction): Cell | null {
  const self = state.players[team].pos;
  const opponentTeam: Team = team === "white" ? "black" : "white";
  const opponent = state.players[opponentTeam].pos;

  const d = delta(dir, team);
  const adjacent: Cell = { x: self.x + d.x, y: self.y + d.y };

  if (!inBounds(adjacent)) return null;

  if (!cellEq(adjacent, opponent)) {
    // Normal move target — return it (legality validated by stateMachine)
    return adjacent;
  }

  // Opponent is adjacent: prefer straight jump
  const straight: Cell = { x: adjacent.x + d.x, y: adjacent.y + d.y };
  if (inBounds(straight)) return straight;

  // Straight is out of bounds: try first valid diagonal
  const legal = getLegalMoves(state, team);
  return legal[0] ?? null;
}

export function attachKeyboard(getState: GetStateFn, dispatch: DispatchFn, reset: ResetFn): void {
  window.addEventListener("keydown", (e) => {
    const state = getState();

    if (e.code === "KeyR") {
      reset();
      return;
    }

    if (state.phase.kind !== "playing") return;

    let team: Team | null = null;
    let dir: Direction | null = null;

    if (e.code in WHITE_KEYS) {
      team = "white";
      dir = WHITE_KEYS[e.code]!;
    } else if (e.code in BLACK_KEYS) {
      team = "black";
      dir = BLACK_KEYS[e.code]!;
      e.preventDefault(); // prevent arrow keys from scrolling
    }

    if (team === null || dir === null) return;
    if (team !== state.phase.activeTeam) return;

    const target = pickTarget(state, team, dir);
    if (target === null) return;

    dispatch({ type: "MOVE", team, target });
  });
}
