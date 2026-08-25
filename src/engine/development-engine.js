function cloneValue(value) {
  return structuredClone(value);
}

function assertAction(action) {
  if (!action || typeof action !== "object" || typeof action.type !== "string") {
    throw new TypeError("Development engine actions require a type.");
  }
}

export function createDevelopmentEngine({ initialState = {}, systems = [] } = {}) {
  let state = cloneValue(initialState);
  let revision = 0;
  let actionSequence = 0;
  let eventSequence = 0;
  let events = [];
  const stateSubscribers = new Set();
  const eventSubscribers = new Set();

  function getState() {
    return cloneValue(state);
  }

  function getEvents() {
    return cloneValue(events);
  }

  function subscribe(listener) {
    stateSubscribers.add(listener);
    return () => stateSubscribers.delete(listener);
  }

  function subscribeToEvents(listener) {
    eventSubscribers.add(listener);
    return () => eventSubscribers.delete(listener);
  }

  function dispatch(input) {
    assertAction(input);
    const action = cloneValue(input);
    action.id ??= `development-action-${++actionSequence}`;
    let candidate = getState();
    const pendingEvents = [];

    for (const system of systems) {
      if (typeof system.onAction !== "function") continue;
      const response = system.onAction({
        action: cloneValue(action),
        state: cloneValue(candidate),
        emit(event) {
          pendingEvents.push({ ...cloneValue(event), source: event.source ?? system.id });
        }
      });

      if (response?.accepted === false) {
        return {
          accepted: false,
          action,
          reason: response.reason ?? `Rejected by ${system.id}`,
          revision,
          state: getState(),
          events: []
        };
      }

      if (response && Object.hasOwn(response, "state")) {
        candidate = cloneValue(response.state);
      }
    }

    state = cloneValue(candidate);
    revision += 1;
    const published = pendingEvents.map((event) => ({
      ...event,
      id: event.id ?? `development-event-${++eventSequence}`,
      tick: event.tick ?? revision,
      payload: cloneValue(event.payload ?? {}),
      metadata: cloneValue(event.metadata ?? {})
    }));
    events.push(...published);

    for (const event of published) {
      for (const listener of eventSubscribers) listener(cloneValue(event));
    }
    for (const listener of stateSubscribers) listener(getState());

    return {
      accepted: true,
      action,
      revision,
      state: getState(),
      events: cloneValue(published)
    };
  }

  function snapshot() {
    return cloneValue({
      format: "outpost-zero-development-snapshot",
      version: 1,
      revision,
      actionSequence,
      eventSequence,
      state,
      events
    });
  }

  function restore(input) {
    const next = cloneValue(input);
    if (
      !next ||
      next.format !== "outpost-zero-development-snapshot" ||
      next.version !== 1
    ) {
      throw new TypeError("Invalid development snapshot.");
    }

    state = cloneValue(next.state);
    events = cloneValue(next.events);
    revision = next.revision;
    actionSequence = next.actionSequence;
    eventSequence = next.eventSequence;
    return { restored: true, state: getState(), revision };
  }

  return Object.freeze({
    dispatch,
    getEvents,
    getState,
    restore,
    snapshot,
    subscribe,
    subscribeToEvents
  });
}
