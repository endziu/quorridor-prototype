import type { Cell, GameAction, GameState, Team } from "../types.ts";
import { getLegalMoves } from "../logic/movement.ts";
import { isWallPlacementLegal } from "../logic/walls.ts";
import { GRID_SIZE } from "../constants.ts";
import { cellEq } from "../utils/coords.ts";

function goalReached(pos: Cell, team: Team): boolean {
  return team === "white" ? pos.y === 0 : pos.y === GRID_SIZE - 1;
}

function flipTeam(team: Team): Team {
  return team === "white" ? "black" : "white";
}

/**
 * Pure reducer: given current state and an action, returns the next state.
 * Returns the same state reference if the action is illegal.
 */
export function dispatch(state: GameState, action: GameAction): GameState {
  if (state.phase.kind !== "playing") return state;
  if (action.team !== state.phase.activeTeam) return state;

  switch (action.type) {
    case "MOVE": {
      const legal = getLegalMoves(state, action.team);
      if (!legal.some((c) => cellEq(c, action.target))) return state;

      const won = goalReached(action.target, action.team);
      return {
        ...state,
        players: {
          ...state.players,
          [action.team]: { ...state.players[action.team], pos: action.target },
        },
        phase: won
          ? { kind: "won", winner: action.team }
          : { kind: "playing", activeTeam: flipTeam(action.team) },
      };
    }

    case "PLACE_WALL": {
      if (!isWallPlacementLegal(state, action.team, action.wall)) return state;

      return {
        ...state,
        players: {
          ...state.players,
          [action.team]: {
            ...state.players[action.team],
            wallsLeft: state.players[action.team].wallsLeft - 1,
          },
        },
        walls: [...state.walls, { ...action.wall, placedBy: action.team }],
        phase: { kind: "playing", activeTeam: flipTeam(action.team) },
      };
    }

    default:
      return state;
  }
}
