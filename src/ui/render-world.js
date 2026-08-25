function resourceStatus(resource) {
  if (resource.value <= resource.criticalAt) return "critical";
  if (resource.value <= resource.capacity * 0.35) return "warning";
  return "stable";
}

export function createWorldViewModel(state) {
  return {
    summary: [
      { label: "Day", value: String(state.clock.day) },
      { label: "Local time", value: `${String(state.clock.hour).padStart(2, "0")}:00` },
      { label: "Crew", value: String(state.crew.length) },
      { label: "Condition", value: state.outpost.condition }
    ],
    resources: Object.entries(state.resources).map(([id, resource]) => ({
      id,
      label: resource.label,
      value: resource.value,
      capacity: resource.capacity,
      percentage: Math.round((resource.value / resource.capacity) * 100),
      netPerHour: resource.productionPerHour - resource.consumptionPerHour,
      status: resourceStatus(resource)
    }))
  };
}

function replaceChildren(element, children) {
  if (element) element.replaceChildren(...children);
}

export function renderWorld(document, state) {
  const model = createWorldViewModel(state);
  const summaryCards = model.summary.map((item) => {
    const card = document.createElement("article");
    card.className = "metric-card";
    const label = document.createElement("span");
    label.className = "metric-label";
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.className = "metric-value";
    value.textContent = item.value;
    card.append(label, value);
    return card;
  });

  const resourceCards = model.resources.map((resource) => {
    const card = document.createElement("article");
    card.className = `resource-card is-${resource.status}`;
    const heading = document.createElement("div");
    heading.className = "resource-heading";
    const name = document.createElement("strong");
    name.textContent = resource.label;
    const amount = document.createElement("span");
    amount.textContent = `${resource.value} / ${resource.capacity}`;
    heading.append(name, amount);

    const meter = document.createElement("progress");
    meter.className = "resource-meter";
    meter.max = resource.capacity;
    meter.value = resource.value;
    meter.setAttribute("aria-label", `${resource.label}: ${resource.percentage}%`);

    const trend = document.createElement("small");
    trend.textContent = `${resource.netPerHour >= 0 ? "+" : ""}${resource.netPerHour} per hour`;
    card.append(heading, meter, trend);
    return card;
  });

  replaceChildren(document.querySelector("#outpost-summary"), summaryCards);
  replaceChildren(document.querySelector("#resource-list"), resourceCards);
}
