import { dispatch } from "../state/stateMachine.ts";
import type { GameState, GameAction } from "../types.ts";

/**
 * Reconstructs all game states from a seed and action list.
 * Returns array where index 0 is the seed state, and index n is after the nth action.
 * Total length is actions.length + 1.
 */
export function buildReplayStates(seed: GameState, actions: readonly GameAction[]): GameState[] {
  const states: GameState[] = [seed];
  let state = seed;
  for (const action of actions) {
    state = dispatch(state, action);
    states.push(state);
  }
  return states;
}
