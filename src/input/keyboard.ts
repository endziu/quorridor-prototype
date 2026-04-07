export function attachKeyboard(reset: () => void): void {
  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyR") reset();
  });
}
