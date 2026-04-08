import { FAMOUS_DUOS } from "./constants.ts";
import { initialState } from "./state/GameState.ts";
import { dispatch } from "./state/stateMachine.ts";
import { Renderer } from "./render/renderer.ts";
import { attachKeyboard } from "./input/keyboard.ts";
import { attachMouse } from "./input/mouse.ts";
import type { GameAction, GameState, Team } from "./types.ts";
import { WALLS_PER_PLAYER } from "./constants.ts";
import { chooseAction } from "./ai/ai.ts";
import type { Difficulty } from "./ai/ai.ts";
import { saveGame } from "./recording/storage.ts";
import { buildReplayStates } from "./recording/replay.ts";
import type { SavedGame } from "./recording/types.ts";

/** Set to a Team to make that side AI-controlled, or null for human vs human. */
const AI_TEAM: Team | null = "black";
let aiDifficulty: Difficulty = "medium";
let currentDuo = FAMOUS_DUOS[Math.floor(Math.random() * FAMOUS_DUOS.length)]!;

let state: GameState = initialState();
let aiPendingTimer: ReturnType<typeof setTimeout> | null = null;
let animationInterval: ReturnType<typeof setInterval> | null = null;

let recordedSeed: GameState = state;
let recordedActions: GameAction[] = [];

const renderer = new Renderer("screen", state);

function getState(): GameState {
  return state;
}

/** 97% of moves: 400–1000 ms (skewed toward lower end). 3%: 1000–2000 ms. */
function aiThinkDelay(): number {
  const r = Math.random();
  return r < 0.97
    ? 400 + (r / 0.97) ** 2 * 600
    : 1000 + ((r - 0.97) / 0.03) * 1000;
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
  recordedActions.push(action);
  renderer.setState(state, { white: currentDuo[0], black: currentDuo[1] });
  updatePanels(state);
  if (state.phase.kind === "won") {
    onGameWon();
  } else if (AI_TEAM !== null && state.phase.kind === "playing" && state.phase.activeTeam === AI_TEAM) {
    scheduleAiMove();
  }
}

function onGameWon(): void {
  const winner = state.phase.kind === "won" ? state.phase.winner : null;
  if (!winner) return;

  const statesCopy = buildReplayStates(recordedSeed, recordedActions);
  const game: SavedGame = {
    id: crypto.randomUUID(),
    date: Date.now(),
    seed: recordedSeed,
    actions: recordedActions,
    winner,
    turnCount: state.turnCount,
    duoNames: [currentDuo[0], currentDuo[1]],
  };
  saveGame(game);
}

function playStartAnimation(): void {
  if (state.phase.kind !== "starting") return;

  if (animationInterval !== null) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  const overlay = document.getElementById("start-overlay");
  if (overlay) overlay.classList.remove("visible");

  const whitePanel = document.getElementById("panel-white");
  const blackPanel = document.getElementById("panel-black");
  let toggle = false;
  let ticks = 0;
  const maxTicks = 12;

  animationInterval = setInterval(() => {
    toggle = !toggle;
    if (whitePanel) whitePanel.classList.toggle("active", toggle);
    if (blackPanel) blackPanel.classList.toggle("active", !toggle);
    
    ticks++;
    if (ticks >= maxTicks) {
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
      doDispatch({ type: "START_GAME" });
    }
  }, 120);
}

function reset(): void {
  if (aiPendingTimer !== null) {
    clearTimeout(aiPendingTimer);
    aiPendingTimer = null;
    renderer.setAiThinking(null);
  }
  if (animationInterval !== null) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  state = initialState();
  recordedSeed = state;
  recordedActions = [];
  currentDuo = FAMOUS_DUOS[Math.floor(Math.random() * FAMOUS_DUOS.length)]!;
  renderer.setState(state, { white: currentDuo[0], black: currentDuo[1] });
  renderer.resetAnimations();
  renderer.setPreview(null);
  updatePanels(state);
}

function updatePanels(s: GameState): void {
  const whiteName = document.querySelector("#panel-white .player-name");
  const blackName = document.querySelector("#panel-black .player-name");
  if (whiteName) whiteName.textContent = currentDuo[0].toUpperCase();
  if (blackName) blackName.textContent = currentDuo[1].toUpperCase();

  const overlay = document.getElementById("start-overlay");
  if (overlay) {
    overlay.classList.toggle("visible", s.phase.kind === "starting");
  }

  const activeTeam = s.phase.kind === "playing" ? s.phase.activeTeam : null;

  for (const team of ["white", "black"] as const) {
    const panel = document.getElementById(`panel-${team}`);
    const pips = document.getElementById(`pips-${team}`);

    if (panel) {
      if (s.phase.kind !== "starting") {
        panel.classList.toggle("active", team === activeTeam);
      } else if (animationInterval === null) {
        panel.classList.remove("active");
      }
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

const randomizeBtn = document.getElementById("randomize-btn");
if (randomizeBtn) {
  randomizeBtn.addEventListener("click", () => {
    playStartAnimation();
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
    if (animationInterval !== null) {
      clearInterval(animationInterval);
    }
  });
}
