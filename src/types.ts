export type Team = "white" | "black";
export type WallOrientation = "horizontal" | "vertical";
export type Direction = "forward" | "back" | "left" | "right";

/** A cell on the 9×9 grid. x: 0–8 col left→right, y: 0–8 row top→bottom. */
export interface Cell {
  readonly x: number;
  readonly y: number;
}

/**
 * Wall anchor position. Both axes 0–7.
 * Horizontal wall at {x,y}: blocks the edge between rows y and y+1,
 *   covering columns x and x+1.
 * Vertical wall at {x,y}: blocks the edge between cols x and x+1,
 *   covering rows y and y+1.
 */
export interface WallPos {
  readonly x: number;
  readonly y: number;
}

export interface Wall {
  readonly pos: WallPos;
  readonly orientation: WallOrientation;
}

export interface PlayerState {
  readonly pos: Cell;
  readonly wallsLeft: number;
}

export type GamePhase =
  | { readonly kind: "playing"; readonly activeTeam: Team }
  | { readonly kind: "won"; readonly winner: Team };

export interface GameState {
  readonly players: Readonly<Record<Team, PlayerState>>;
  readonly walls: readonly Wall[];
  readonly phase: GamePhase;
}

export type GameAction =
  | { readonly type: "MOVE"; readonly team: Team; readonly target: Cell }
  | { readonly type: "PLACE_WALL"; readonly team: Team; readonly wall: Wall };

export interface WallPreview {
  readonly pos: WallPos;
  readonly orientation: WallOrientation;
  readonly valid: boolean;
}
