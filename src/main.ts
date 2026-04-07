import { initialState } from "./state/GameState.ts";
import { dispatch } from "./state/stateMachine.ts";
import { Renderer } from "./render/renderer.ts";
import { attachKeyboard } from "./input/keyboard.ts";
import { attachMouse } from "./input/mouse.ts";
import type { GameAction, GameState } from "./types.ts";
import { WALLS_PER_PLAYER } from "./constants.ts";

let state: GameState = initialState();

const renderer = new Renderer("screen", state);

function getState(): GameState {
  return state;
}

function doDispatch(action: GameAction): void {
  const next = dispatch(state, action);
  if (next === state) return;
  state = next;
  renderer.setState(state);
  updatePanels(state);
}

function reset(): void {
  state = initialState();
  renderer.setState(state);
  renderer.setPreview(null);
  updatePanels(state);
}

function updatePanels(s: GameState): void {
  const activeTeam = s.phase.kind === "playing" ? s.phase.activeTeam : null;

  for (const team of ["white", "black"] as const) {
    const panel = document.getElementById(`panel-${team}`);
    const pips = document.getElementById(`pips-${team}`);

    if (panel) {
      panel.classList.toggle("active", team === activeTeam);
    }

    if (pips) {
      const wallsLeft = s.players[team].wallsLeft;
      const html: string[] = [];
      for (let i = 0; i < WALLS_PER_PLAYER; i++) {
        html.push(`<div class="pip${i < wallsLeft ? "" : " used"}"></div>`);
      }
      pips.innerHTML = html.join("");
    }
  }
}

attachKeyboard(reset);
attachMouse(
  renderer.canvasElement,
  getState,
  doDispatch,
  (preview) => renderer.setPreview(preview),
  () => renderer.currentLegalMoves,
);

updatePanels(state);

if (import.meta.hot) {
  import.meta.hot.dispose(() => renderer.destroy());
}
