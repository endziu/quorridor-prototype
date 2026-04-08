import type { GameState, GameAction, Team } from "../types.ts";

export interface SavedGame {
  readonly id: string;
  readonly date: number;
  readonly seed: GameState;
  readonly actions: readonly GameAction[];
  readonly winner: Team;
  readonly turnCount: number;
  readonly duoNames: readonly [string, string];
}
