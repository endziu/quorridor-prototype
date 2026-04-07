import { initialState } from "./state/GameState.ts";
import { dispatch } from "./state/stateMachine.ts";
import { Renderer } from "./render/renderer.ts";
import { attachKeyboard } from "./input/keyboard.ts";
import { attachMouse } from "./input/mouse.ts";
import type { GameAction, GameState } from "./types.ts";

let state: GameState = initialState();

const renderer = new Renderer("screen", state);

function getState(): GameState {
  return state;
}

function doDispatch(action: GameAction): void {
  state = dispatch(state, action);
  renderer.setState(state);
}

function reset(): void {
  state = initialState();
  renderer.setState(state);
  renderer.setPreview(null);
}

attachKeyboard(getState, doDispatch, reset);
attachMouse(renderer.canvasElement, getState, doDispatch, (preview) => {
  renderer.setPreview(preview);
});
