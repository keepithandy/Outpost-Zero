import { createDevelopmentEngine } from "./development-engine.js";

export const SUPPORTED_ENGINE_API = "0.1";

const REQUIRED_METHODS = Object.freeze([
  "dispatch",
  "getEvents",
  "getState",
  "restore",
  "snapshot",
  "subscribe",
  "subscribeToEvents"
]);

function supportsVersion(version) {
  return typeof version === "string" && version.startsWith(`${SUPPORTED_ENGINE_API}.`);
}

export function connectPulseEngine({ engine, version, development = false }) {
  if (!supportsVersion(version)) {
    throw new RangeError(
      `Outpost Zero requires Pulse Engine API ${SUPPORTED_ENGINE_API}.x; received ${version}.`
    );
  }

  for (const method of REQUIRED_METHODS) {
    if (typeof engine?.[method] !== "function") {
      throw new TypeError(`Pulse Engine adapter requires method "${method}".`);
    }
  }

  return Object.freeze({
    engineVersion: version,
    development,
    dispatch: (...args) => engine.dispatch(...args),
    getEvents: (...args) => engine.getEvents(...args),
    getState: (...args) => engine.getState(...args),
    restore: (...args) => engine.restore(...args),
    snapshot: (...args) => engine.snapshot(...args),
    subscribe: (...args) => engine.subscribe(...args),
    subscribeToEvents: (...args) => engine.subscribeToEvents(...args)
  });
}

export function createDevelopmentAdapter(options = {}) {
  return connectPulseEngine({
    engine: createDevelopmentEngine(options),
    version: "0.1.0-development",
    development: true
  });
}
