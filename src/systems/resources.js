function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function statusFor(resource) {
  if (resource.value <= resource.criticalAt) return "critical";
  if (resource.value <= resource.capacity * 0.35) return "warning";
  return "stable";
}

function advanceClock(clock, hours) {
  const totalHours = clock.totalHours + hours;
  return {
    totalHours,
    day: Math.floor(totalHours / 24) + 1,
    hour: totalHours % 24
  };
}

export function createResourceSystem() {
  return Object.freeze({
    id: "outpost-resources",
    version: "0.1.0",
    onAction({ action, emit, state }) {
      if (action.type !== "time/advance") return { state };

      const hours = action.hours ?? 1;
      if (!Number.isInteger(hours) || hours < 1) {
        return { accepted: false, reason: "Time must advance by a positive whole hour." };
      }

      const next = structuredClone(state);
      for (const [resourceId, resource] of Object.entries(next.resources)) {
        const before = resource.value;
        const netPerHour = resource.productionPerHour - resource.consumptionPerHour;
        resource.value = round(clamp(before + netPerHour * hours, 0, resource.capacity));
        const status = statusFor(resource);

        if (resource.value !== before) {
          emit({
            type: "resource/changed",
            payload: {
              resourceId,
              label: resource.label,
              before,
              after: resource.value,
              delta: round(resource.value - before),
              hours
            },
            metadata: { category: "resources", severity: status }
          });
        }

        if (before > resource.criticalAt && resource.value <= resource.criticalAt) {
          emit({
            type: "resource/critical",
            payload: {
              resourceId,
              label: resource.label,
              value: resource.value,
              criticalAt: resource.criticalAt
            },
            metadata: { category: "resources", severity: "critical" }
          });
        }
      }

      next.clock = advanceClock(next.clock, hours);
      const statuses = Object.values(next.resources).map(statusFor);
      next.outpost.condition = statuses.includes("critical")
        ? "critical"
        : statuses.includes("warning")
          ? "strained"
          : "stable";

      emit({
        type: "time/advanced",
        payload: {
          hours,
          day: next.clock.day,
          hour: next.clock.hour
        },
        metadata: { category: "time", severity: "stable" }
      });

      return { state: next };
    }
  });
}
