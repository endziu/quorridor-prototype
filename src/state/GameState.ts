import { WALLS_PER_PLAYER } from "../constants.ts";
import type { GameState } from "../types.ts";

export function initialState(): GameState {
  return {
    players: {
      white: { pos: { x: 4, y: 8 }, wallsLeft: WALLS_PER_PLAYER },
      black: { pos: { x: 4, y: 0 }, wallsLeft: WALLS_PER_PLAYER },
    },
    walls: [],
    phase: { kind: "starting", startingTeam: Math.random() < 0.5 ? "white" : "black" },
  };
}
