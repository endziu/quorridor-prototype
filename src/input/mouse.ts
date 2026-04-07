import type { Cell, GameAction, GameState, WallPreview } from "../types.ts";
import { isWallPlacementLegal, wallFromPosOrientation } from "../logic/walls.ts";
import { pixelToCell, pixelToWallHit } from "../utils/coords.ts";

type DispatchFn = (action: GameAction) => void;
type GetStateFn = () => GameState;
type SetPreviewFn = (preview: WallPreview | null) => void;
type SetHoveredMoveFn = (cell: Cell | null) => void;
type GetLegalMovesFn = () => readonly Cell[];

function canvasCoords(
  canvas: HTMLCanvasElement,
  e: MouseEvent,
): { px: number; py: number } {
  const rect = canvas.getBoundingClientRect();
  return { px: e.clientX - rect.left, py: e.clientY - rect.top };
}

function resolvePreview(
  px: number,
  py: number,
  state: GameState,
): WallPreview | null {
  if (state.phase.kind !== "playing") return null;

  const hit = pixelToWallHit(px, py);
  if (hit === null) return null;

  const { pos, orientation } = hit;
  const team = state.phase.activeTeam;
  const wall = wallFromPosOrientation(pos, orientation);
  const valid = isWallPlacementLegal(state, team, wall);
  return { pos, orientation, valid };
}

export function attachMouse(
  canvas: HTMLCanvasElement,
  getState: GetStateFn,
  dispatch: DispatchFn,
  setPreview: SetPreviewFn,
  setHoveredMove: SetHoveredMoveFn,
  getLegalMoves: GetLegalMovesFn,
): void {
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("mouseleave", () => {
    setPreview(null);
    setHoveredMove(null);
    canvas.style.cursor = "crosshair";
  });

  canvas.addEventListener("mousemove", (e) => {
    const { px, py } = canvasCoords(canvas, e);
    const state = getState();

    setPreview(resolvePreview(px, py, state));

    if (state.phase.kind === "playing") {
      const cell = pixelToCell(px, py);
      const isLegal =
        cell !== null &&
        getLegalMoves().some((m) => m.x === cell.x && m.y === cell.y);

      setHoveredMove(cell);
      canvas.style.cursor = isLegal ? "pointer" : "crosshair";
    } else {
      setHoveredMove(null);
      canvas.style.cursor = "default";
    }
  });

  canvas.addEventListener("click", (e) => {
    const state = getState();
    if (state.phase.kind !== "playing") return;

    const { px, py } = canvasCoords(canvas, e);
    const team = state.phase.activeTeam;

    // Wall placement takes priority (cursor in a gap strip)
    const wallHit = pixelToWallHit(px, py);
    if (wallHit !== null) {
      dispatch({
        type: "PLACE_WALL",
        team,
        wall: wallFromPosOrientation(wallHit.pos, wallHit.orientation),
      });
      return;
    }

    // Pawn movement (cursor on a highlighted legal cell)
    const cell = pixelToCell(px, py);
    if (cell !== null) {
      const legal = getLegalMoves();
      if (legal.some((m) => m.x === cell.x && m.y === cell.y)) {
        dispatch({ type: "MOVE", team, target: cell });
      }
    }
  });
}
