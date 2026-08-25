import assert from "node:assert/strict";
import test from "node:test";

import {
  createEventViewModel,
  selectTimelineEvents
} from "../src/ui/render-timeline.js";

const events = [
  {
    id: "event-1",
    type: "resource/changed",
    tick: 1,
    source: "outpost-resources",
    payload: {
      label: "Water",
      before: 64,
      after: 63,
      delta: -1,
      hours: 1
    },
    metadata: { category: "resources", severity: "stable" }
  },
  {
    id: "event-2",
    type: "resource/critical",
    tick: 2,
    source: "outpost-resources",
    payload: { label: "Food", value: 15, criticalAt: 15 },
    metadata: { category: "resources", severity: "critical" }
  },
  {
    id: "event-3",
    type: "time/advanced",
    tick: 2,
    source: "outpost-resources",
    payload: { hours: 1, day: 1, hour: 8 },
    metadata: { category: "time", severity: "stable" }
  }
];

test("explains resource changes in plain language", () => {
  const model = createEventViewModel(events[0]);

  assert.equal(model.title, "Resource level changed");
  assert.match(model.explanation, /Water moved from 64 to 63 \(-1\)/);
});

test("filters by category and severity", () => {
  const criticalResources = selectTimelineEvents(events, {
    category: "resources",
    severity: "critical"
  });

  assert.equal(criticalResources.length, 1);
  assert.equal(criticalResources[0].id, "event-2");
});

test("returns newest events first", () => {
  const selected = selectTimelineEvents(events);

  assert.deepEqual(selected.map((event) => event.id), ["event-3", "event-2", "event-1"]);
});
