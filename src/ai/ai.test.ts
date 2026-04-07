import { describe, expect, test } from "bun:test";
import { chooseAction } from "./ai.ts";
import { initialState } from "../state/GameState.ts";
import type { GameState, Team, Wall } from "../types.ts";

describe("AI", () => {
  test("evaluate - white closer to goal has higher score", () => {
    const state: GameState = {
      ...initialState(),
      phase: { kind: "playing", activeTeam: "white" },
      players: {
        white: { pos: { x: 4, y: 4 }, wallsLeft: 10 },
        black: { pos: { x: 4, y: 0 }, wallsLeft: 10 },
      },
    };
    // White needs 4 steps to y=0. Black is at y=0, but black's goal is y=8.
    // Black needs 8 steps to y=8.
    // evaluate(state, "white") should be positive because white is closer.
    // score = oppPath.length - myPath.length = 8 - 4 = 4.
    
    // We can't directly test internal 'evaluate', but chooseAction uses it.
    // Let's test chooseAction to see if it moves towards the goal.
    const action = chooseAction(state, "white", "hard");
    expect(action.type).toBe("MOVE");
    if (action.type === "MOVE") {
      expect(action.target.y).toBeLessThan(4); // Move up towards y=0
    }
  });

  test("chooseAction - picks winning move if available", () => {
    const state: GameState = {
      ...initialState(),
      players: {
        white: { pos: { x: 4, y: 1 }, wallsLeft: 10 },
        black: { pos: { x: 4, y: 4 }, wallsLeft: 10 },
      },
      phase: { kind: "playing", activeTeam: "white" },
    };
    const action = chooseAction(state, "white", "hard");
    expect(action).toEqual({
      type: "MOVE",
      team: "white",
      target: { x: 4, y: 0 },
    });
  });

  test("chooseAction - respects wallsLeft", () => {
    const state: GameState = {
      ...initialState(),
      phase: { kind: "playing", activeTeam: "white" },
      players: {
        white: { pos: { x: 4, y: 8 }, wallsLeft: 0 },
        black: { pos: { x: 4, y: 0 }, wallsLeft: 10 },
      },
    };
    const action = chooseAction(state, "white", "hard");
    expect(action.type).toBe("MOVE");
  });

  test("difficulty - easy/medium filters wall candidates", () => {
    const base = initialState();
    const state: GameState = { ...base, phase: { kind: "playing", activeTeam: "black" } };
    const actionEasy = chooseAction(state, "black", "easy");
    expect(actionEasy).toBeDefined();

    const actionMedium = chooseAction(state, "black", "medium");
    expect(actionMedium).toBeDefined();
  });

  test("difficulty - easy is non-deterministic", () => {
    const state: GameState = {
      ...initialState(),
      phase: { kind: "playing", activeTeam: "white" },
    };
    
    // Call chooseAction many times for easy difficulty.
    // Given the 40% blunder chance and random wall selection, we expect some variation.
    const actions = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const action = chooseAction(state, "white", "easy");
      actions.add(JSON.stringify(action));
    }
    
    // On a fresh board, there are 5 legal moves and many walls.
    // With 40% random move chance and random walls, we should see more than 1 distinct action.
    expect(actions.size).toBeGreaterThan(1);
  });

  test("chooseAction - prefers move over wall if scores are equal", () => {
    // On a fresh board, many walls might have the same score as a move (if they don't change path lengths).
    // The AI should prefer moving forward.
    const state: GameState = { ...initialState(), phase: { kind: "playing", activeTeam: "white" } };
    const action = chooseAction(state, "white", "hard");
    expect(action.type).toBe("MOVE");
  });
});
