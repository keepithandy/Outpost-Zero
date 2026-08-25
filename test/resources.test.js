import assert from "node:assert/strict";
import test from "node:test";

import { createDevelopmentAdapter } from "../src/engine/adapter.js";
import { OUTPOST_ZERO_SCENARIO } from "../src/scenarios/outpost-zero.js";
import { createResourceSystem } from "../src/systems/resources.js";
import { createWorldState } from "../src/world/create-world.js";

function createSession(initialState = createWorldState(OUTPOST_ZERO_SCENARIO)) {
  return createDevelopmentAdapter({
    initialState,
    systems: [createResourceSystem()]
  });
}

test("advances resource production, consumption, and the clock", () => {
  const session = createSession();

  const result = session.dispatch({ type: "time/advance", hours: 1 });

  assert.equal(result.accepted, true);
  assert.equal(result.state.resources.oxygen.value, 90);
  assert.equal(result.state.resources.water.value, 63);
  assert.equal(result.state.resources.food.value, 50);
  assert.equal(result.state.resources.power.value, 74);
  assert.equal(result.state.clock.hour, 7);
  assert.equal(result.events.at(-1).type, "time/advanced");
});

test("clamps resource values to capacity", () => {
  const world = createWorldState(OUTPOST_ZERO_SCENARIO);
  world.resources.oxygen.value = 99;
  const session = createSession(world);

  session.dispatch({ type: "time/advance", hours: 4 });

  assert.equal(session.getState().resources.oxygen.value, 100);
});

test("emits a critical transition once the threshold is crossed", () => {
  const world = createWorldState(OUTPOST_ZERO_SCENARIO);
  world.resources.water.value = 19;
  const session = createSession(world);

  const result = session.dispatch({ type: "time/advance", hours: 1 });

  assert.equal(result.state.resources.water.value, 18);
  assert.ok(result.events.some((event) => event.type === "resource/critical"));
  assert.equal(result.state.outpost.condition, "critical");
});

test("rejects invalid time without changing state", () => {
  const session = createSession();
  const before = session.getState();

  const result = session.dispatch({ type: "time/advance", hours: 0 });

  assert.equal(result.accepted, false);
  assert.deepEqual(session.getState(), before);
});

test("crosses midnight into the next day", () => {
  const world = createWorldState(OUTPOST_ZERO_SCENARIO);
  world.clock = { day: 1, hour: 23, totalHours: 23 };
  const session = createSession(world);

  session.dispatch({ type: "time/advance", hours: 2 });

  assert.deepEqual(session.getState().clock, { day: 2, hour: 1, totalHours: 25 });
});
