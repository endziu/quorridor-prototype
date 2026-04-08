import type { SavedGame } from "./types.ts";

const STORAGE_KEY = "quoridor:games";
const MAX_GAMES = 20;

export function saveGame(game: SavedGame): void {
  const games = loadGames();
  games.unshift(game);
  if (games.length > MAX_GAMES) {
    games.pop();
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch {
    console.error("Failed to save game to localStorage");
  }
}

export function loadGames(): SavedGame[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SavedGame[];
  } catch {
    return [];
  }
}

export function deleteGame(id: string): void {
  const games = loadGames().filter((g) => g.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch {
    console.error("Failed to delete game from localStorage");
  }
}
