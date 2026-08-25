function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

export const OUTPOST_ZERO_SCENARIO = deepFreeze({
  id: "outpost-zero-opening",
  version: 1,
  seed: "outpost-zero-alpha",
  clock: {
    day: 1,
    hour: 6,
    totalHours: 6
  },
  outpost: {
    name: "Outpost Zero",
    region: "Kepler Verge",
    condition: "strained",
    population: 5
  },
  resources: {
    oxygen: {
      label: "Oxygen",
      value: 88,
      capacity: 100,
      productionPerHour: 9,
      consumptionPerHour: 7,
      criticalAt: 20
    },
    water: {
      label: "Water",
      value: 64,
      capacity: 100,
      productionPerHour: 3,
      consumptionPerHour: 4,
      criticalAt: 18
    },
    food: {
      label: "Food",
      value: 52,
      capacity: 100,
      productionPerHour: 0,
      consumptionPerHour: 2,
      criticalAt: 15
    },
    power: {
      label: "Power",
      value: 72,
      capacity: 100,
      productionPerHour: 12,
      consumptionPerHour: 10,
      criticalAt: 20
    },
    parts: {
      label: "Parts",
      value: 24,
      capacity: 50,
      productionPerHour: 0,
      consumptionPerHour: 0,
      criticalAt: 5
    }
  },
  modules: [
    { id: "life-support", name: "Life Support", status: "online", crewRequired: 1 },
    { id: "solar-array", name: "Solar Array", status: "online", crewRequired: 1 },
    { id: "hydroponics", name: "Hydroponics", status: "damaged", crewRequired: 2 },
    { id: "communications", name: "Communications", status: "offline", crewRequired: 1 }
  ],
  crew: [
    { id: "mara-vek", name: "Mara Vek", role: "Commander", morale: 68 },
    { id: "eli-ward", name: "Eli Ward", role: "Engineer", morale: 61 },
    { id: "sana-io", name: "Sana Io", role: "Life Support", morale: 72 },
    { id: "tomas-reed", name: "Tomas Reed", role: "Scout", morale: 57 },
    { id: "niko-vale", name: "Niko Vale", role: "Medic", morale: 66 }
  ],
  pointsOfInterest: [
    { id: "relay-7", name: "Relay 7", distance: 3, status: "silent" },
    { id: "ice-ravine", name: "Ice Ravine", distance: 5, status: "unscanned" }
  ]
});
