import { createDevelopmentAdapter } from "./engine/adapter.js";
import { OUTPOST_ZERO_SCENARIO } from "./scenarios/outpost-zero.js";
import { renderWorld } from "./ui/render-world.js";
import { createWorldState } from "./world/create-world.js";

const bootStatus = document.querySelector("#boot-status");
const world = createWorldState(OUTPOST_ZERO_SCENARIO);
const session = createDevelopmentAdapter({
  initialState: world
});

if (bootStatus) {
  bootStatus.textContent = session.development
    ? "Development engine connected"
    : "Pulse Engine connected";
}

renderWorld(document, session.getState());
