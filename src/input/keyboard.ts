export function attachKeyboard(reset: () => void, toggleDebug: () => void): () => void {
  const handler = (e: KeyboardEvent): void => {
    if (e.code === "KeyR") reset();
    if (e.code === "KeyD") toggleDebug();
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}
