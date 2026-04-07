import type { GameAction, GameState, WallOrientation, WallPreview } from "../types.ts";
import { isWallPlacementLegal, wallFromPosOrientation } from "../logic/walls.ts";
import { pixelToWallPos } from "../utils/coords.ts";

type DispatchFn = (action: GameAction) => void;
type GetStateFn = () => GameState;
type SetPreviewFn = (preview: WallPreview | null) => void;

function canvasCoords(
  canvas: HTMLCanvasElement,
  e: MouseEvent,
): { px: number; py: number } {
  const rect = canvas.getBoundingClientRect();
  return { px: e.clientX - rect.left, py: e.clientY - rect.top };
}

function updatePreview(
  canvas: HTMLCanvasElement,
  e: MouseEvent,
  getState: GetStateFn,
  setPreview: SetPreviewFn,
): void {
  const state = getState();
  if (state.phase.kind !== "playing") {
    setPreview(null);
    return;
  }

  // Right mouse button held (buttons === 2) → vertical; otherwise horizontal
  const orientation: WallOrientation = e.buttons === 2 ? "vertical" : "horizontal";
  const { px, py } = canvasCoords(canvas, e);
  const pos = pixelToWallPos(px, py, orientation);

  if (pos === null) {
    setPreview(null);
    return;
  }

  const team = state.phase.activeTeam;
  const wall = wallFromPosOrientation(pos, orientation);
  const valid = isWallPlacementLegal(state, team, wall);
  setPreview({ pos, orientation, valid });
}

export function attachMouse(
  canvas: HTMLCanvasElement,
  getState: GetStateFn,
  dispatch: DispatchFn,
  setPreview: SetPreviewFn,
): void {
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("mouseleave", () => setPreview(null));

  canvas.addEventListener("mousemove", (e) => {
    updatePreview(canvas, e, getState, setPreview);
  });

  canvas.addEventListener("mousedown", (e) => {
    const state = getState();
    if (state.phase.kind !== "playing") return;

    e.preventDefault();
    const orientation: WallOrientation = e.button === 2 ? "vertical" : "horizontal";
    const { px, py } = canvasCoords(canvas, e);
    const pos = pixelToWallPos(px, py, orientation);
    if (pos === null) return;

    const team = state.phase.activeTeam;
    const wall = wallFromPosOrientation(pos, orientation);
    dispatch({ type: "PLACE_WALL", team, wall });
  });
}
