import { describe, it, expect } from "vitest";
import { WORKOUTS, WORKOUT_BY_NAME } from "../src/data/workouts.js";
import { FINISHERS } from "../src/data/finishers.js";
import { TIMERS } from "../src/data/timers.js";
import { EX_PATTERNS, patternsOfWorkout, patternsOfTimer } from "../src/data/patterns.js";

const allWorkouts = Object.values(WORKOUTS).flat();
const allFinishers = Object.values(FINISHERS).flat();

/* Tous les noms d'exercices cités quelque part, fiches et chronos confondus. */
function exerciseNames() {
  const names = new Set();
  const item = (it) => { if (it.t) names.add(it.t); };
  [...allWorkouts, ...allFinishers].forEach((w) => w.blocks.forEach((b) => b.items.forEach(item)));
  Object.values(TIMERS).flat().forEach((p) => {
    if (p.stations) p.stations.forEach((s) => s.forEach(item));
    if (p.list) p.list.forEach(item);
  });
  return [...names];
}

describe("bibliothèque", () => {
  it("aucune séance sans plan de chrono", () => {
    const sans = [...allWorkouts, ...allFinishers].map((w) => w.name).filter((n) => !TIMERS[n]);
    expect(sans).toEqual([]);
  });

  it("aucun chrono orphelin", () => {
    const noms = new Set([...allWorkouts, ...allFinishers].map((w) => w.name));
    expect(Object.keys(TIMERS).filter((n) => !noms.has(n))).toEqual([]);
  });

  it("aucun exercice non classé", () => {
    expect(exerciseNames().filter((n) => !EX_PATTERNS[n])).toEqual([]);
  });

  it("aucun exercice absent des séances principales", () => {
    const utilises = new Set();
    allWorkouts.forEach((w) => w.blocks.forEach((b) => b.items.forEach((it) => { if (it.t) utilises.add(it.t); })));
    expect(Object.keys(EX_PATTERNS).filter((n) => !utilises.has(n))).toEqual([]);
  });

  it("noms de séances uniques", () => {
    expect(Object.keys(WORKOUT_BY_NAME).length).toBe(allWorkouts.length);
  });

  /* On compare les étiquettes plutôt que les noms : la fiche peut écrire
     « burpee » au singulier là où le chrono met « burpees ». */
  it("fiche et chrono couvrent les mêmes qualités", () => {
    const ecarts = [];
    allWorkouts.forEach((w) => {
      const fiche = patternsOfWorkout(w).sort();
      const chrono = patternsOfTimer(TIMERS[w.name]).sort();
      if (fiche.join() !== chrono.join()) ecarts.push({ name: w.name, fiche, chrono });
    });
    expect(ecarts).toEqual([]);
  });
});
