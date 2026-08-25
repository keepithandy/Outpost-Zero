function cloneValue(value) {
  return structuredClone(value);
}

function assertUniqueIds(values, label) {
  const ids = values.map((value) => value.id);
  if (ids.some((id) => typeof id !== "string" || id.trim() === "")) {
    throw new TypeError(`${label} require non-empty ids.`);
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} contain duplicate ids.`);
  }
}

export function validateScenario(scenario) {
  if (!scenario || scenario.version !== 1) {
    throw new RangeError("Outpost Zero requires scenario version 1.");
  }

  if (typeof scenario.id !== "string" || typeof scenario.seed !== "string") {
    throw new TypeError("Scenario id and seed are required.");
  }

  if (!scenario.resources || Object.keys(scenario.resources).length === 0) {
    throw new TypeError("Scenario requires at least one resource.");
  }

  for (const [id, resource] of Object.entries(scenario.resources)) {
    const numbers = [
      resource.value,
      resource.capacity,
      resource.productionPerHour,
      resource.consumptionPerHour,
      resource.criticalAt
    ];
    if (numbers.some((value) => !Number.isFinite(value))) {
      throw new TypeError(`Resource "${id}" contains invalid numeric data.`);
    }
    if (resource.capacity <= 0 || resource.value < 0 || resource.value > resource.capacity) {
      throw new RangeError(`Resource "${id}" starts outside its capacity.`);
    }
  }

  assertUniqueIds(scenario.modules ?? [], "Scenario modules");
  assertUniqueIds(scenario.crew ?? [], "Scenario crew");
  assertUniqueIds(scenario.pointsOfInterest ?? [], "Scenario points of interest");
  return true;
}

export function createWorldState(scenario) {
  validateScenario(scenario);

  return cloneValue({
    scenario: {
      id: scenario.id,
      version: scenario.version,
      seed: scenario.seed
    },
    clock: scenario.clock,
    outpost: scenario.outpost,
    resources: scenario.resources,
    modules: scenario.modules,
    crew: scenario.crew,
    pointsOfInterest: scenario.pointsOfInterest
  });
}
