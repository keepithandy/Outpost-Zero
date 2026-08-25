import { createDevelopmentAdapter } from "./engine/adapter.js";

const bootStatus = document.querySelector("#boot-status");
const session = createDevelopmentAdapter({
  initialState: { connection: "ready" }
});

if (bootStatus) {
  bootStatus.textContent = session.development
    ? "Development engine connected"
    : "Pulse Engine connected";
}
