import type { Cell, GameState, WallPreview } from "../types.ts";
import { CANVAS_PX } from "../constants.ts";
import { drawBoard } from "./drawBoard.ts";
import { drawWalls } from "./drawWalls.ts";
import { drawPlayers } from "./drawPlayers.ts";
import { drawUI } from "./drawUI.ts";
import { getLegalMoves } from "../logic/movement.ts";

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private state: GameState;
  private preview: WallPreview | null = null;
  private rafHandle: number | null = null;

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
    this.loop();
  }

  setState(state: GameState): void {
    this.state = state;
  }

  setPreview(preview: WallPreview | null): void {
    this.preview = preview;
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
    const state = this.state;
    const legalMoves: readonly Cell[] =
      state.phase.kind === "playing"
        ? getLegalMoves(state, state.phase.activeTeam)
        : [];

    drawBoard(this.ctx, state, legalMoves);
    drawWalls(this.ctx, state.walls, this.preview);
    drawPlayers(this.ctx, state);
    drawUI(this.ctx, state);
  }
}
