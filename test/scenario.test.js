import assert from "node:assert/strict";
import test from "node:test";

import { OUTPOST_ZERO_SCENARIO } from "../src/scenarios/outpost-zero.js";
import { createWorldViewModel } from "../src/ui/render-world.js";
import { createWorldState, validateScenario } from "../src/world/create-world.js";

test("validates and creates a defensive opening world", () => {
  assert.equal(validateScenario(OUTPOST_ZERO_SCENARIO), true);
  const world = createWorldState(OUTPOST_ZERO_SCENARIO);

  world.resources.oxygen.value = 1;

  assert.equal(OUTPOST_ZERO_SCENARIO.resources.oxygen.value, 88);
  assert.equal(world.crew.length, world.outpost.population);
});

test("rejects resources that start outside capacity", () => {
  const invalid = structuredClone(OUTPOST_ZERO_SCENARIO);
  invalid.resources.water.value = 101;

  assert.throws(() => validateScenario(invalid), /outside its capacity/);
});

test("builds a stable, readable world view model", () => {
  const model = createWorldViewModel(createWorldState(OUTPOST_ZERO_SCENARIO));
  const water = model.resources.find((resource) => resource.id === "water");

  assert.equal(model.summary.find((item) => item.label === "Crew").value, "5");
  assert.equal(water.netPerHour, -1);
  assert.equal(water.status, "stable");
});
