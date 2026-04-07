import { initialState } from "./state/GameState.ts";
import { dispatch } from "./state/stateMachine.ts";
import { Renderer } from "./render/renderer.ts";
import { attachKeyboard } from "./input/keyboard.ts";
import { attachMouse } from "./input/mouse.ts";
import type { GameAction, GameState, Team } from "./types.ts";
import { WALLS_PER_PLAYER } from "./constants.ts";
import { chooseAction } from "./ai/ai.ts";
import type { Difficulty } from "./ai/ai.ts";

/** Set to a Team to make that side AI-controlled, or null for human vs human. */
const AI_TEAM: Team | null = "black";
let aiDifficulty: Difficulty = "medium";

let state: GameState = initialState();
let aiPendingTimer: ReturnType<typeof setTimeout> | null = null;

const renderer = new Renderer("screen", state);

function getState(): GameState {
  return state;
}

/** 97% of moves: 400–1000 ms (skewed toward lower end). 3%: 1000–2000 ms. */
function aiThinkDelay(): number {
  const r = Math.random();
  return r < 0.9
    ? 400 + (r / 0.9) ** 2 * 600
    : 1000 + ((r - 0.9) / 0.1) * 1000;
}

function scheduleAiMove(): void {
  if (aiPendingTimer !== null) return;
  renderer.setAiThinking(AI_TEAM);
  aiPendingTimer = setTimeout(() => {
    aiPendingTimer = null;
    renderer.setAiThinking(null);
    if (state.phase.kind !== "playing") return;
    if (state.phase.activeTeam !== AI_TEAM) return;
    doDispatch(chooseAction(state, AI_TEAM, aiDifficulty));
  }, aiThinkDelay());
}

function doDispatch(action: GameAction): void {
  const next = dispatch(state, action);
  if (next === state) return;
  state = next;
  renderer.setState(state);
  updatePanels(state);
  if (AI_TEAM !== null && state.phase.kind === "playing" && state.phase.activeTeam === AI_TEAM) {
    scheduleAiMove();
  }
}

function reset(): void {
  if (aiPendingTimer !== null) {
    clearTimeout(aiPendingTimer);
    aiPendingTimer = null;
    renderer.setAiThinking(null);
  }
  state = initialState();
  renderer.setState(state);
  renderer.setPreview(null);
  updatePanels(state);
  if (AI_TEAM !== null && state.phase.kind === "playing" && state.phase.activeTeam === AI_TEAM) {
    scheduleAiMove();
  }
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
      pips.replaceChildren(
        ...Array.from({ length: WALLS_PER_PLAYER }, (_, i) => {
          const pip = document.createElement("div");
          pip.className = i < wallsLeft ? "pip" : "pip used";
          return pip;
        }),
      );
    }
  }
}

// ── Difficulty ─────────────────────────────────────────────────────────────

const difficultyButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-difficulty]"));

function setDifficulty(d: Difficulty): void {
  aiDifficulty = d;
  for (const btn of difficultyButtons) {
    btn.classList.toggle("active", btn.dataset["difficulty"] === d);
  }
}

setDifficulty(aiDifficulty); // initialise button state

for (const btn of difficultyButtons) {
  btn.addEventListener("click", () => {
    const d = btn.dataset["difficulty"] as Difficulty;
    setDifficulty(d);
  });
}

function toggleDebug(): void {
  renderer.toggleDebugPaths();
}

// ──────────────────────────────────────────────────────────────────────────

const detachKeyboard = attachKeyboard(reset, toggleDebug);
attachMouse(
  renderer.canvasElement,
  getState,
  doDispatch,
  (preview) => renderer.setPreview(preview),
  (cell) => renderer.setHoveredMove(cell),
  () => renderer.currentLegalMoves,
);

updatePanels(state);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    renderer.destroy();
    detachKeyboard();
  });
}
