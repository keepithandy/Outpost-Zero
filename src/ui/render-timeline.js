const EVENT_TITLES = Object.freeze({
  "resource/changed": "Resource level changed",
  "resource/critical": "Critical resource warning",
  "time/advanced": "Time advanced"
});

function formatDelta(delta) {
  return `${delta >= 0 ? "+" : ""}${delta}`;
}

export function createEventViewModel(event) {
  const category = event.metadata?.category ?? event.type.split("/")[0] ?? "system";
  const severity = event.metadata?.severity ?? "stable";
  let explanation = `Recorded by ${event.source ?? "system"}.`;

  if (event.type === "resource/changed") {
    explanation = `${event.payload.label} moved from ${event.payload.before} to ${event.payload.after} (${formatDelta(event.payload.delta)}) over ${event.payload.hours} hour${event.payload.hours === 1 ? "" : "s"}.`;
  } else if (event.type === "resource/critical") {
    explanation = `${event.payload.label} reached ${event.payload.value}; its critical threshold is ${event.payload.criticalAt}.`;
  } else if (event.type === "time/advanced") {
    explanation = `The simulation advanced ${event.payload.hours} hour${event.payload.hours === 1 ? "" : "s"} to Day ${event.payload.day}, ${String(event.payload.hour).padStart(2, "0")}:00.`;
  }

  return {
    id: event.id,
    type: event.type,
    title: EVENT_TITLES[event.type] ?? event.type.replaceAll("/", " · "),
    category,
    severity,
    tick: event.tick ?? 0,
    explanation
  };
}

export function selectTimelineEvents(events, filters = {}) {
  const category = filters.category ?? "all";
  const severity = filters.severity ?? "all";

  return events
    .map(createEventViewModel)
    .filter((event) => category === "all" || event.category === category)
    .filter((event) => severity === "all" || event.severity === severity)
    .reverse();
}

function createSelect(document, labelText, values, selected, onChange) {
  const label = document.createElement("label");
  label.className = "filter-field";
  const text = document.createElement("span");
  text.textContent = labelText;
  const select = document.createElement("select");

  for (const [value, labelValue] of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labelValue;
    option.selected = selected === value;
    select.append(option);
  }

  select.addEventListener("change", () => onChange(select.value));
  label.append(text, select);
  return label;
}

export function mountTimelineFilters(document, filters, onChange) {
  const container = document.querySelector("#timeline-filters");
  if (!container) return;

  const category = createSelect(
    document,
    "Category",
    [["all", "All"], ["resources", "Resources"], ["time", "Time"]],
    filters.category,
    (value) => onChange({ ...filters, category: value })
  );
  const severity = createSelect(
    document,
    "Severity",
    [["all", "All"], ["stable", "Stable"], ["warning", "Warning"], ["critical", "Critical"]],
    filters.severity,
    (value) => onChange({ ...filters, severity: value })
  );

  container.className = "timeline-filters";
  container.replaceChildren(category, severity);
}

export function renderTimeline(document, events, filters) {
  const container = document.querySelector("#event-timeline");
  if (!container) return;

  const selected = selectTimelineEvents(events, filters);
  if (selected.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = events.length === 0
      ? "No events recorded."
      : "No events match these filters.";
    container.replaceChildren(empty);
    return;
  }

  const cards = selected.map((event) => {
    const item = document.createElement("li");
    item.className = `timeline-event is-${event.severity}`;
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const title = document.createElement("strong");
    title.textContent = event.title;
    const meta = document.createElement("small");
    meta.textContent = `${event.category} · tick ${event.tick}`;
    const explanation = document.createElement("p");
    explanation.textContent = event.explanation;
    summary.append(title, meta);
    details.append(summary, explanation);
    item.append(details);
    return item;
  });

  container.replaceChildren(...cards);
}
