import { describe, it, expect } from "vitest";
import { WORKOUTS, WORKOUT_BY_NAME } from "../src/data/workouts.js";
import { FINISHERS } from "../src/data/finishers.js";
import { TIMERS } from "../src/data/timers.js";
import { EXERCISES, UNITS, PER_SIDE } from "../src/data/exercises.js";
import { PATTERNS, patternsOfWorkout, patternsOfTimer } from "../src/data/patterns.js";

const allWorkouts = Object.values(WORKOUTS).flat();
const allFinishers = Object.values(FINISHERS).flat();

/* Toutes les lignes de travail citées quelque part, fiches et chronos
   confondus. On collecte les lignes entières et non les seuls identifiants :
   plusieurs contrôles ci-dessous portent sur la quantité. */
function workLines() {
  const lines = [];
  const item = (it) => { if (it.ex !== undefined) lines.push(it); };
  [...allWorkouts, ...allFinishers].forEach((w) => w.blocks.forEach((b) => b.items.forEach(item)));
  Object.values(TIMERS).flat().forEach((p) => {
    if (p.stations) p.stations.forEach((s) => s.forEach(item));
    if (p.list) p.list.forEach(item);
  });
  return lines;
}

const lines = workLines();
const idsUtilises = new Set(lines.map((it) => it.ex));

describe("bibliothèque", () => {
  it("aucune séance sans plan de chrono", () => {
    const sans = [...allWorkouts, ...allFinishers].map((w) => w.name).filter((n) => !TIMERS[n]);
    expect(sans).toEqual([]);
  });

  it("aucun chrono orphelin", () => {
    const noms = new Set([...allWorkouts, ...allFinishers].map((w) => w.name));
    expect(Object.keys(TIMERS).filter((n) => !noms.has(n))).toEqual([]);
  });

  it("noms de séances uniques", () => {
    expect(Object.keys(WORKOUT_BY_NAME).length).toBe(allWorkouts.length);
  });

  /* Ce contrôle passait à vide après la bascule vers les identifiants : il
     cherchait un champ qui n'existait plus, ne trouvait aucun exercice, et
     déclarait donc qu'aucun n'était mal classé. D'où ce garde-fou. */
  it("il y a bien des lignes de travail à contrôler", () => {
    expect(lines.length).toBeGreaterThan(200);
  });

  it("aucun exercice inconnu de la bibliothèque", () => {
    expect([...idsUtilises].filter((id) => !EXERCISES[id])).toEqual([]);
  });

  /* Une entrée que plus aucune séance n'utilise signale soit une faute de
     frappe, soit un exercice retiré sans nettoyer derrière. */
  it("aucune entrée morte dans la bibliothèque", () => {
    expect(Object.keys(EXERCISES).filter((id) => !idsUtilises.has(id))).toEqual([]);
  });

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

describe("les exercices sont des entités", () => {
  it("chacun a un libellé, une unité connue et au moins un schéma moteur", () => {
    const connus = new Set(PATTERNS.map((p) => p.id));
    const fautifs = Object.entries(EXERCISES).filter(([, ex]) =>
      !ex.fr || !UNITS.includes(ex.unit) || !ex.patterns.length
      || ex.patterns.some((p) => !connus.has(p)));
    expect(fautifs.map(([id]) => id)).toEqual([]);
  });

  it("la latéralité, quand elle est déclarée, prend une valeur connue", () => {
    const fautifs = Object.entries(EXERCISES)
      .filter(([, ex]) => ex.perSide !== undefined && !PER_SIDE.includes(ex.perSide));
    expect(fautifs.map(([id]) => id)).toEqual([]);
  });

  /* Deux libellés identiques pour deux identifiants seraient indistinguables à
     l'écran. C'est ce qui est arrivé à « burpee » et « burpees », comptés comme
     deux exercices distincts. */
  it("aucun libellé en double", () => {
    const frs = Object.values(EXERCISES).map((ex) => ex.fr);
    expect(frs.length).toBe(new Set(frs).size);
  });

  /* Un total « réparti » impair ne se divise pas en deux côtés égaux. Au
     volume de base, la donnée écrite à la main doit être paire ; les
     coefficients de mode, eux, peuvent produire un impair et l'affichage
     bascule alors sur « en alternant ». */
  it("les totaux répartis entre deux côtés sont pairs au volume de base", () => {
    const impairs = lines
      .filter((it) => EXERCISES[it.ex] && EXERCISES[it.ex].perSide === "reparti" && it.n % 2 !== 0)
      .map((it) => `${it.n} ${it.ex}`);
    expect([...new Set(impairs)]).toEqual([]);
  });
});
