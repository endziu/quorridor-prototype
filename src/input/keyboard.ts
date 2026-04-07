export function attachKeyboard(reset: () => void, toggleDebug: () => void): void {
  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyR") reset();
    if (e.code === "KeyD") toggleDebug();
  });
}
