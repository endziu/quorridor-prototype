import { describe, expect, test } from "bun:test";
import { getLegalMoves } from "./movement.ts";
import { initialState } from "../state/GameState.ts";
import type { GameState, Wall } from "../types.ts";

describe("getLegalMoves", () => {
  test("initial state: white has 3 legal moves", () => {
    const state = initialState();
    const moves = getLegalMoves(state, "white");
    // White at (4, 8), can move to (3, 8), (5, 8), (4, 7)
    expect(moves).toHaveLength(3);
    expect(moves).toContainEqual({ x: 3, y: 8 });
    expect(moves).toContainEqual({ x: 5, y: 8 });
    expect(moves).toContainEqual({ x: 4, y: 7 });
  });

  test("initial state: black has 3 legal moves", () => {
    const state = initialState();
    const moves = getLegalMoves(state, "black");
    // Black at (4, 0), can move to (3, 0), (5, 0), (4, 1)
    expect(moves).toHaveLength(3);
    expect(moves).toContainEqual({ x: 3, y: 0 });
    expect(moves).toContainEqual({ x: 5, y: 0 });
    expect(moves).toContainEqual({ x: 4, y: 1 });
  });

  test("standard move blocked by wall", () => {
    const state = initialState();
    const walls: Wall[] = [{ pos: { x: 4, y: 7 }, orientation: "horizontal" }];
    const stateWithWall: GameState = { ...state, walls: walls.map(w => ({ ...w, placedBy: "white" })) };
    
    const moves = getLegalMoves(stateWithWall, "white");
    // White at (4, 8), (4, 7) is blocked by horizontal wall at {4,7} (covers cols 4, 5)
    expect(moves).not.toContainEqual({ x: 4, y: 7 });
    expect(moves).toContainEqual({ x: 3, y: 8 });
    expect(moves).toContainEqual({ x: 5, y: 8 });
    expect(moves).toHaveLength(2);
  });

  test("straight jump over opponent", () => {
    const state: GameState = {
      ...initialState(),
      players: {
        white: { pos: { x: 4, y: 4 }, wallsLeft: 10 },
        black: { pos: { x: 4, y: 3 }, wallsLeft: 10 },
      }
    };
    
    const moves = getLegalMoves(state, "white");
    // White at (4,4), Black at (4,3). 
    // Forward move to (4,3) becomes jump to (4,2).
    expect(moves).toContainEqual({ x: 4, y: 2 });
    expect(moves).not.toContainEqual({ x: 4, y: 3 });
    // Other normal moves
    expect(moves).toContainEqual({ x: 3, y: 4 });
    expect(moves).toContainEqual({ x: 5, y: 4 });
    expect(moves).toContainEqual({ x: 4, y: 5 });
  });

  test("diagonal jump when straight jump is blocked by board edge", () => {
    const state: GameState = {
      ...initialState(),
      players: {
        white: { pos: { x: 4, y: 1 }, wallsLeft: 10 },
        black: { pos: { x: 4, y: 0 }, wallsLeft: 10 },
      }
    };
    
    const moves = getLegalMoves(state, "white");
    // White at (4,1), Black at (4,0). 
    // Forward move to (4,0) would jump to (4,-1) -> out of bounds.
    // So diagonal jumps to (3,0) and (5,0) are allowed.
    expect(moves).toContainEqual({ x: 3, y: 0 });
    expect(moves).toContainEqual({ x: 5, y: 0 });
    // Normal moves
    expect(moves).toContainEqual({ x: 3, y: 1 });
    expect(moves).toContainEqual({ x: 5, y: 1 });
    expect(moves).toContainEqual({ x: 4, y: 2 });
  });

  test("diagonal jump when straight jump is blocked by wall", () => {
    const state: GameState = {
      ...initialState(),
      players: {
        white: { pos: { x: 4, y: 4 }, wallsLeft: 10 },
        black: { pos: { x: 4, y: 3 }, wallsLeft: 10 },
      },
      walls: [{ pos: { x: 4, y: 2 }, orientation: "horizontal", placedBy: "black" }]
    };
    
    const moves = getLegalMoves(state, "white");
    // White at (4,4), Black at (4,3). 
    // Wall at {4,2} horizontal blocks moving from (4,3) to (4,2).
    // So diagonal jumps to (3,3) and (5,3) are allowed.
    expect(moves).toContainEqual({ x: 3, y: 3 });
    expect(moves).toContainEqual({ x: 5, y: 3 });
    expect(moves).not.toContainEqual({ x: 4, y: 2 });
  });
});
