export function mountStepControl(document, onAdvance) {
  const container = document.querySelector("#time-controls");
  if (!container) return null;

  const button = document.createElement("button");
  button.className = "primary-button";
  button.type = "button";
  button.textContent = "Advance 1 hour";
  button.addEventListener("click", () => onAdvance(1));
  container.replaceChildren(button);
  return button;
}
