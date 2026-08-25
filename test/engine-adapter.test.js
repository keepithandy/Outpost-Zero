import assert from "node:assert/strict";
import test from "node:test";

import {
  connectPulseEngine,
  createDevelopmentAdapter
} from "../src/engine/adapter.js";

test("rejects unsupported engine versions before startup", () => {
  assert.throws(
    () => connectPulseEngine({ engine: {}, version: "2.0.0" }),
    /requires Pulse Engine API 0\.1\.x/
  );
});

test("rejects engines that do not satisfy the adapter contract", () => {
  assert.throws(
    () => connectPulseEngine({ engine: {}, version: "0.1.0" }),
    /requires method/
  );
});

test("development adapter supports state, events, snapshot, and restore", () => {
  const adapter = createDevelopmentAdapter({
    initialState: { count: 0 },
    systems: [{
      id: "counter",
      onAction({ action, emit, state }) {
        if (action.type !== "increment") return { state };
        emit({ type: "counter/changed", payload: { amount: 1 } });
        return { state: { count: state.count + 1 } };
      }
    }]
  });
  const seen = [];
  adapter.subscribeToEvents((event) => seen.push(event.type));
  const checkpoint = adapter.snapshot();

  adapter.dispatch({ type: "increment" });
  assert.deepEqual(adapter.getState(), { count: 1 });
  assert.deepEqual(seen, ["counter/changed"]);

  adapter.restore(checkpoint);
  assert.deepEqual(adapter.getState(), { count: 0 });
  assert.deepEqual(adapter.getEvents(), []);
});
