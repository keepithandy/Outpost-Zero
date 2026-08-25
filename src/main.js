import { createDevelopmentAdapter } from "./engine/adapter.js";
import { OUTPOST_ZERO_SCENARIO } from "./scenarios/outpost-zero.js";
import { createResourceSystem } from "./systems/resources.js";
import { mountStepControl } from "./ui/mount-step-control.js";
import { renderWorld } from "./ui/render-world.js";
import { createWorldState } from "./world/create-world.js";

const bootStatus = document.querySelector("#boot-status");
const world = createWorldState(OUTPOST_ZERO_SCENARIO);
const session = createDevelopmentAdapter({
  initialState: world,
  systems: [createResourceSystem()]
});

if (bootStatus) {
  bootStatus.textContent = session.development
    ? "Development engine connected"
    : "Pulse Engine connected";
}

renderWorld(document, session.getState());
session.subscribe((state) => renderWorld(document, state));
mountStepControl(document, (hours) => {
  session.dispatch({ type: "time/advance", hours });
});
