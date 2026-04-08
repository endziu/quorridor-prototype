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
import { saveGame, loadGames } from "./recording/storage.ts";
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
let scrubStates: GameState[] | null = null;
let scrubIndex = 0;
let scrubShowResume = false;

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
  if (scrubStates !== null) return;
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
  if (scrubStates !== null) return;
  const next = dispatch(state, action);
  if (next === state) return;
  state = next;
  recordedActions.push(action);
  renderer.setState(state, { white: currentDuo[0], black: currentDuo[1] });
  updatePanels(state);
  updateUndoButtonState();
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
  exitScrubMode();
  state = initialState();
  recordedSeed = state;
  recordedActions = [];
  currentDuo = FAMOUS_DUOS[Math.floor(Math.random() * FAMOUS_DUOS.length)]!;
  renderer.setState(state, { white: currentDuo[0], black: currentDuo[1] });
  renderer.resetAnimations();
  renderer.setPreview(null);
  updatePanels(state);
  updateUndoButtonState();
}

function enterScrubMode(index: number, showResume: boolean): void {
  if (scrubStates === null) {
    scrubStates = buildReplayStates(recordedSeed, recordedActions);
  }
  scrubIndex = Math.max(0, Math.min(index, scrubStates.length - 1));
  scrubShowResume = showResume;
  updateReplayControls();
  updateUndoButtonState();
  scrubTo(scrubIndex);
}

function exitScrubMode(): void {
  scrubStates = null;
  scrubIndex = 0;
  scrubShowResume = false;
  hideReplayControls();
  updateUndoButtonState();
}

function scrubTo(index: number): void {
  if (scrubStates === null) return;
  scrubIndex = Math.max(0, Math.min(index, scrubStates.length - 1));
  renderer.resetAnimations();
  renderer.setState(scrubStates[scrubIndex]!, { white: currentDuo[0], black: currentDuo[1] });
  updateReplayControls();
}

function updateReplayControls(): void {
  const replayControls = document.getElementById("replay-controls");
  const replayCounter = document.getElementById("replay-counter");
  const replayResume = document.getElementById("replay-resume");
  if (!replayControls) return;
  replayControls.style.display = scrubStates ? "flex" : "none";
  if (replayCounter && scrubStates) {
    replayCounter.textContent = `Turn ${scrubIndex} / ${scrubStates.length - 1}`;
  }
  if (replayResume) {
    replayResume.style.display = scrubShowResume ? "block" : "none";
  }
}

function hideReplayControls(): void {
  const replayControls = document.getElementById("replay-controls");
  if (replayControls) replayControls.style.display = "none";
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

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    if (scrubStates !== null) {
      scrubTo(scrubIndex - 1);
    } else if (state.phase.kind === "playing") {
      enterScrubMode(recordedActions.length, true);
      scrubTo(scrubIndex - 1);
    }
  } else if (e.code === "ArrowRight") {
    if (scrubStates !== null) {
      scrubTo(scrubIndex + 1);
    } else if (state.phase.kind === "playing") {
      enterScrubMode(recordedActions.length, true);
    }
  } else if (e.code === "Escape" && scrubStates !== null && scrubShowResume) {
    exitScrubMode();
    renderer.setState(state, { white: currentDuo[0], black: currentDuo[1] });
    updatePanels(state);
  }
});

attachMouse(
  renderer.canvasElement,
  getState,
  doDispatch,
  (preview) => renderer.setPreview(preview),
  (cell) => renderer.setHoveredMove(cell),
  () => renderer.currentLegalMoves,
);

updatePanels(state);

// ──────────────────────────────────────────────────────────────────────────

const replayPrev = document.getElementById("replay-prev");
const replayNext = document.getElementById("replay-next");
const replayResume = document.getElementById("replay-resume");

if (replayPrev) {
  replayPrev.addEventListener("click", () => {
    if (scrubStates !== null) scrubTo(scrubIndex - 1);
  });
}

if (replayNext) {
  replayNext.addEventListener("click", () => {
    if (scrubStates !== null) scrubTo(scrubIndex + 1);
  });
}

if (replayResume) {
  replayResume.addEventListener("click", () => {
    exitScrubMode();
    updateUndoButtonState();
    renderer.setState(state, { white: currentDuo[0], black: currentDuo[1] });
    updatePanels(state);
  });
}

// ──────────────────────────────────────────────────────────────────────────

const historyBtn = document.getElementById("history-btn");
const historyBackdrop = document.getElementById("history-backdrop");
const historyClose = document.getElementById("history-close");

function openHistory(): void {
  if (!historyBackdrop) return;
  const games = loadGames();
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  historyList.innerHTML = "";

  if (games.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No games recorded yet</div>';
    historyBackdrop.classList.remove("hidden");
    return;
  }

  for (const game of games) {
    const date = new Date(game.date);
    const dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const winner = game.winner.toUpperCase();
    const names = `${game.duoNames[0].toUpperCase()} vs ${game.duoNames[1].toUpperCase()}`;

    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-item-info">
        <div class="history-item-date">${dateStr}</div>
        <div class="history-item-details">
          <span>${names}</span>
          <span class="history-item-winner">Won: ${winner}</span>
          <span class="history-item-turns">Turns: ${game.turnCount}</span>
        </div>
      </div>
      <button class="history-item-watch">Watch</button>
    `;

    const watchBtn = item.querySelector(".history-item-watch");
    if (watchBtn) {
      watchBtn.addEventListener("click", () => {
        loadReplay(game);
      });
    }

    historyList.appendChild(item);
  }

  historyBackdrop.classList.remove("hidden");
}

function closeHistory(): void {
  if (!historyBackdrop) return;
  historyBackdrop.classList.add("hidden");
}

function loadReplay(game: SavedGame): void {
  closeHistory();
  recordedSeed = game.seed;
  recordedActions = Array.from(game.actions);
  currentDuo = [game.duoNames[0], game.duoNames[1]] as typeof currentDuo;
  scrubStates = buildReplayStates(game.seed, game.actions);
  scrubIndex = scrubStates.length - 1;
  scrubShowResume = false;
  updateReplayControls();
  updateUndoButtonState();
  renderer.setState(scrubStates[scrubIndex]!, { white: currentDuo[0], black: currentDuo[1] });
  updatePanels(scrubStates[scrubIndex]!);
}

if (historyBtn) {
  historyBtn.addEventListener("click", openHistory);
}

if (historyClose) {
  historyClose.addEventListener("click", closeHistory);
}

if (historyBackdrop) {
  historyBackdrop.addEventListener("click", (e) => {
    if (e.target === historyBackdrop) closeHistory();
  });
}

// ──────────────────────────────────────────────────────────────────────────

const undoBtn = document.getElementById("undo-btn") as HTMLButtonElement | null;

function updateUndoButtonState(): void {
  if (!undoBtn) return;
  if (AI_TEAM === null) {
    undoBtn.disabled = true;
    return;
  }
  const humanTeam = AI_TEAM === "black" ? "white" : "black";
  const hasHumanMove = recordedActions.some((a: GameAction) => a.type !== "START_GAME" && a.team === humanTeam);
  const canUndo = hasHumanMove && scrubStates === null && state.phase.kind === "playing";
  undoBtn.disabled = !canUndo;
}

function undoLastMove(): void {
  if (scrubStates !== null) return;
  if (recordedActions.length === 0) return;
  if (state.phase.kind !== "playing") return;
  if (AI_TEAM === null) return;

  const humanTeam = AI_TEAM === "black" ? "white" : "black";

  let humanMoveIndex = -1;
  for (let i = recordedActions.length - 1; i >= 0; i--) {
    const action = recordedActions[i]!;
    if (action.type !== "START_GAME" && action.team === humanTeam) {
      humanMoveIndex = i;
      break;
    }
  }
  if (humanMoveIndex === -1) return;

  if (aiPendingTimer !== null) {
    clearTimeout(aiPendingTimer);
    aiPendingTimer = null;
    renderer.setAiThinking(null);
  }

  recordedActions.splice(humanMoveIndex, 1);
  state = recordedActions.length === 0 ? recordedSeed : recordedActions.reduce(dispatch, recordedSeed);
  renderer.setState(state, { white: currentDuo[0], black: currentDuo[1] });
  updatePanels(state);
  updateUndoButtonState();

  if (AI_TEAM !== null && state.phase.kind === "playing" && state.phase.activeTeam === AI_TEAM) {
    scheduleAiMove();
  }
}

if (undoBtn) {
  undoBtn.addEventListener("click", undoLastMove);
}

updateUndoButtonState();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    renderer.destroy();
    detachKeyboard();
    if (animationInterval !== null) {
      clearInterval(animationInterval);
    }
  });
}
