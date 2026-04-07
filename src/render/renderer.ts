import type { Cell, GameState, Team, WallPreview } from "../types.ts";
import { CANVAS_PX } from "../constants.ts";
import { drawBoard } from "./drawBoard.ts";
import { drawWalls } from "./drawWalls.ts";
import { drawPlayers } from "./drawPlayers.ts";
import { drawUI } from "./drawUI.ts";
import { getLegalMoves } from "../logic/movement.ts";
import { getShortestPath } from "../logic/pathfinding.ts";
import { cellCenter } from "../utils/coords.ts";
import type { PawnAnim, WallAnim } from "./animationTypes.ts";
import { evaluatePawnAnim } from "./animationTypes.ts";

function computeLegalMoves(state: GameState): readonly Cell[] {
  return state.phase.kind === "playing"
    ? getLegalMoves(state, state.phase.activeTeam)
    : [];
}

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private state: GameState;
  private preview: WallPreview | null = null;
  private hoveredMove: Cell | null = null;
  private debugPaths: boolean = true;
  private rafHandle: number | null = null;
  private legalMoves: readonly Cell[] = [];
  private shortestPaths: Record<string, Cell[] | null> = { white: null, black: null };

  private pawnAnim: PawnAnim | null = null;
  private wallAnim: WallAnim | null = null;
  private thinkingTeam: Team | null = null;

  constructor(canvasId: string, initialState: GameState) {
    const canvas = document.getElementById(canvasId);
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`No canvas element with id "${canvasId}"`);
    }
    this.canvas = canvas;
    this.canvas.width = CANVAS_PX;
    this.canvas.height = CANVAS_PX;

    const ctx = this.canvas.getContext("2d");
    if (ctx === null) throw new Error("Could not get 2d context");
    this.ctx = ctx;

    this.state = initialState;
    this.updateComputed(initialState);
    this.loop();
  }

  setState(state: GameState): void {
    const now = performance.now();
    const old = this.state;

    // Detect pawn moves
    for (const team of ["white", "black"] as const) {
      const oldPos = old.players[team].pos;
      const newPos = state.players[team].pos;
      if (oldPos.x !== newPos.x || oldPos.y !== newPos.y) {
        let startPx: number;
        let startPy: number;
        if (this.pawnAnim !== null && this.pawnAnim.team === team) {
          // Chain from current interpolated position to avoid visual jump
          ({ px: startPx, py: startPy } = evaluatePawnAnim(this.pawnAnim, now));
        } else {
          ({ px: startPx, py: startPy } = cellCenter(oldPos));
        }
        const to = cellCenter(newPos);
        this.pawnAnim = { team, startPx, startPy, endPx: to.px, endPy: to.py, startTime: now, duration: 200 };
      }
    }

    // Detect new wall (walls are append-only during normal play)
    if (state.walls.length > old.walls.length) {
      this.wallAnim = { wallIndex: state.walls.length - 1, startTime: now, duration: 150 };
    }

    this.state = state;
    this.updateComputed(state);
  }

  resetAnimations(): void {
    this.pawnAnim = null;
    this.wallAnim = null;
  }

  private updateComputed(state: GameState): void {
    this.legalMoves = computeLegalMoves(state);
    this.shortestPaths = {
      white: getShortestPath(state.walls, state.players.white.pos, "white"),
      black: getShortestPath(state.walls, state.players.black.pos, "black"),
    };
  }

  get currentLegalMoves(): readonly Cell[] {
    return this.legalMoves;
  }

  setPreview(preview: WallPreview | null): void {
    this.preview = preview;
  }

  setHoveredMove(cell: Cell | null): void {
    this.hoveredMove = cell;
  }

  setAiThinking(team: Team | null): void {
    this.thinkingTeam = team;
  }

  toggleDebugPaths(): void {
    this.debugPaths = !this.debugPaths;
  }

  get isDebugPaths(): boolean {
    return this.debugPaths;
  }

  get canvasElement(): HTMLCanvasElement {
    return this.canvas;
  }

  destroy(): void {
    if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
  }

  private loop(): void {
    this.draw();
    this.rafHandle = requestAnimationFrame(() => this.loop());
  }

  private draw(): void {
    const now = performance.now();

    // Expire completed animations so they don't hold stale state indefinitely
    if (this.pawnAnim !== null && now - this.pawnAnim.startTime >= this.pawnAnim.duration) {
      this.pawnAnim = null;
    }
    if (this.wallAnim !== null && now - this.wallAnim.startTime >= this.wallAnim.duration) {
      this.wallAnim = null;
    }

    drawBoard(
      this.ctx,
      this.state,
      this.legalMoves,
      this.hoveredMove,
      this.debugPaths ? this.shortestPaths : undefined
    );
    drawWalls(this.ctx, this.state.walls, this.preview, this.wallAnim, now);
    drawPlayers(this.ctx, this.state, this.pawnAnim, this.thinkingTeam, now);
    drawUI(this.ctx, this.state);
  }
}
