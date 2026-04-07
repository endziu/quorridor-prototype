import { describe, expect, test } from "bun:test";
import { initialState } from "./GameState.ts";
import { dispatch } from "./stateMachine.ts";
import { getLegalMoves } from "../logic/movement.ts";

describe("stateMachine", () => {
  test("white moves first", () => {
    const state = initialState();
    expect(state.phase).toMatchObject({ kind: "playing", activeTeam: "white" });
  });

  test("black cannot move on white's turn", () => {
    const state = initialState();
    const moves = getLegalMoves(state, "black");
    const next = dispatch(state, { type: "MOVE", team: "black", target: moves[0]! });
    expect(next).toBe(state); // same reference = rejected
  });

  test("white move advances to black's turn", () => {
    const state = initialState();
    const moves = getLegalMoves(state, "white");
    expect(moves.length).toBeGreaterThan(0);
    const next = dispatch(state, { type: "MOVE", team: "white", target: moves[0]! });
    expect(next.phase).toMatchObject({ kind: "playing", activeTeam: "black" });
  });

  test("placing a wall ends the turn", () => {
    const state = initialState();
    const next = dispatch(state, {
      type: "PLACE_WALL",
      team: "white",
      wall: { pos: { x: 4, y: 4 }, orientation: "horizontal" },
    });
    expect(next.walls).toHaveLength(1);
    expect(next.players.white.wallsLeft).toBe(9);
    expect(next.phase).toMatchObject({ kind: "playing", activeTeam: "black" });
  });

  test("illegal wall placement (out of bounds) is rejected", () => {
    const state = initialState();
    const next = dispatch(state, {
      type: "PLACE_WALL",
      team: "white",
      wall: { pos: { x: 8, y: 8 }, orientation: "horizontal" },
    });
    expect(next).toBe(state);
  });

  test("win: white reaches row 0", () => {
    // White at row 1, black moved out of the way to a corner
    const base = initialState();
    const nearWin = {
      ...base,
      players: {
        white: { pos: { x: 4, y: 1 }, wallsLeft: 10 },
        black: { pos: { x: 0, y: 0 }, wallsLeft: 10 },
      },
    };
    const next = dispatch(nearWin, {
      type: "MOVE",
      team: "white",
      target: { x: 4, y: 0 },
    });
    expect(next.phase).toMatchObject({ kind: "won", winner: "white" });
  });

  test("win: black reaches row 8", () => {
    const base = initialState();
    const nearWin = {
      ...base,
      players: {
        white: { pos: { x: 0, y: 8 }, wallsLeft: 10 },
        black: { pos: { x: 4, y: 7 }, wallsLeft: 10 },
      },
      phase: { kind: "playing" as const, activeTeam: "black" as const },
    };
    const next = dispatch(nearWin, {
      type: "MOVE",
      team: "black",
      target: { x: 4, y: 8 },
    });
    expect(next.phase).toMatchObject({ kind: "won", winner: "black" });
  });

  test("unknown action returns same state", () => {
    const state = initialState();
    // @ts-ignore: testing runtime behavior for invalid action
    const next = dispatch(state, { type: "UNKNOWN" });
    expect(next).toBe(state);
  });

  test("rejects PLACE_WALL when budget is empty", () => {
    const base = initialState();
    const poorState: GameState = {
      ...base,
      players: {
        ...base.players,
        white: { ...base.players.white, wallsLeft: 0 }
      }
    };
    const next = dispatch(poorState, {
      type: "PLACE_WALL",
      team: "white",
      wall: { pos: { x: 0, y: 0 }, orientation: "horizontal" }
    });
    expect(next).toBe(poorState);
  });

  test("rejects action when game is won", () => {
    const base = initialState();
    const wonState: GameState = { ...base, phase: { kind: "won", winner: "white" } };
    const next = dispatch(wonState, { type: "MOVE", team: "white", target: { x: 4, y: 7 } });
    expect(next).toBe(wonState);
  });

  test("rejects action from wrong team", () => {
    const state = initialState(); // White's turn
    const next = dispatch(state, { type: "MOVE", team: "black", target: { x: 4, y: 1 } });
    expect(next).toBe(state);
  });
});
