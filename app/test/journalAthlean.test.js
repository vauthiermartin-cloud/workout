/* Le journal d'Athlean X et l'alternance A / B (F-14). */

import { describe, it, expect } from "vitest";
import {
  TYPE_ATHLEAN, entreeAthlean, dernierWorkout, workoutPropose, entreeValide, fusionner, joursEntraines,
  repriseAthlean,
} from "../src/lib/journalAthlean.js";
import { streakOf } from "../src/lib/volume.js";

/* Ce que fait App à la fin d'une séance : le workout proposé, ou celui
   qu'on a choisi la toute première fois, et une ligne de plus. */
const jouer = (entrees, date, premierChoix = "A", mode = "BUILD") =>
  [...entrees, entreeAthlean(date, workoutPropose(entrees) || premierChoix, mode)];

describe("l'alternance A / B", () => {
  it("jamais joué : rien n'est proposé, le choix revient au pratiquant", () => {
    expect(workoutPropose([])).toBe(null);
    expect(dernierWorkout([])).toBe(null);
  });

  /* Le test demandé par la spec : quatre lancements non consécutifs, avec des
     jours sautés et un week-end au milieu. L'alternance ne suit pas le
     calendrier. */
  it("A → B → A → B sur quatre lancements espacés, week-end compris", () => {
    let j = [];
    ["2026-10-26", "2026-10-29", "2026-10-31", "2026-11-04"].forEach((d) => { j = jouer(j, d); });
    expect(j.map((e) => e.workoutId)).toEqual(["A", "B", "A", "B"]);
    expect(workoutPropose(j)).toBe("A");
  });

  it("le premier choix décide de la suite, B comme A", () => {
    let j = jouer([], "2026-10-26", "B");
    j = jouer(j, "2026-10-28", "B");
    expect(j.map((e) => e.workoutId)).toEqual(["B", "A"]);
  });

  it("le mode n'influe pas sur l'alternance", () => {
    let j = jouer([], "2026-10-26", "A", "NORMAL");
    j = jouer(j, "2026-10-27", "A", "DEFINE");
    j = jouer(j, "2026-10-28", "A", "NORMAL");
    expect(j.map((e) => e.workoutId)).toEqual(["A", "B", "A"]);
  });

  /* Deux séances le même jour : la seconde écrite est la dernière. */
  it("deux séances le même jour alternent aussi", () => {
    let j = jouer([], "2026-10-26");
    j = jouer(j, "2026-10-26");
    expect(j.map((e) => e.workoutId)).toEqual(["A", "B"]);
    expect(workoutPropose(j)).toBe("A");
  });

  /* Un import peut ajouter en fin de liste une séance plus ancienne : la
     date l'emporte sur l'ordre d'écriture. */
  it("la date départage, pas l'ordre d'écriture", () => {
    const j = [entreeAthlean("2026-10-28", "B", "BUILD"), entreeAthlean("2026-10-20", "A", "BUILD")];
    expect(dernierWorkout(j)).toBe("B");
    expect(workoutPropose(j)).toBe("A");
  });
});

describe("l'entrée", () => {
  it("a la forme de la spec, reps vides tant que F-15 n'existe pas", () => {
    expect(entreeAthlean("2026-10-26", "A", "DEFINE"))
      .toEqual({ date: "2026-10-26", type: "athleanX", workoutId: "A", mode: "DEFINE", reps: {} });
    expect(TYPE_ATHLEAN).toBe("athleanX");
  });

  it("une ligne abîmée ne passe pas", () => {
    expect(entreeValide(entreeAthlean("2026-10-26", "A", "BUILD"))).toBe(true);
    [null, {}, { date: "2026-10-26", type: "athleanX", workoutId: "C" },
      { date: "2026-10-26", workoutId: "A" }, { type: "athleanX", workoutId: "A" }]
      .forEach((e) => expect(entreeValide(e)).toBe(false));
  });
});

describe("l'import", () => {
  const a = entreeAthlean("2026-10-26", "A", "BUILD");
  const b = entreeAthlean("2026-10-26", "B", "NORMAL");
  const c = entreeAthlean("2026-10-20", "B", "DEFINE");

  it("ne double pas une séance importée deux fois", () => {
    expect(fusionner([a, b], [a, b])).toEqual([a, b]);
  });

  /* Le journal Classique fusionne par date et n'en garde qu'une : ici, deux
     séances d'un même jour restent deux. */
  it("garde deux séances différentes du même jour, et range par date", () => {
    expect(fusionner([a], [b, c])).toEqual([c, a, b]);
  });

  /* Une sauvegarde faite avant les étirements porte la même séance sans
     `str` : elle ne doit pas la doubler, ni lui retirer ses étirements. */
  it("une séance sauvegardée avant ses étirements ne double pas", () => {
    const etiree = { ...a, str: "Enchaînement complet" };
    expect(fusionner([etiree], [a])).toEqual([etiree]);
    expect(fusionner([a], [etiree])).toEqual([etiree]);
  });

  it("deux fois la même séance le même jour restent deux", () => {
    expect(fusionner([a, a], [a])).toEqual([a, a]);
  });

  it("écarte ce qui n'est pas une séance Athlean X", () => {
    expect(fusionner([a], [{ d: "2026-10-26", w: "EMOM 25" }, null])).toEqual([a]);
  });
});

/* Une séance Athlean X compte comme une séance Classique, et le journal
   Classique n'en est pas changé — tous les jours, week-end compris. */
describe("les séances comptées", () => {
  const log = [{ d: "2026-10-26", w: "EMOM 25" }, { d: "2026-10-27", w: "AMRAP 20" }];

  it("sans séance Athlean X, c'est le journal Classique tel quel", () => {
    expect(joursEntraines(log, [])).toBe(log);
  });

  it("une séance Athlean X un jour ouvré prolonge la série", () => {
    const mercredi = new Date(2026, 9, 28);
    expect(streakOf(joursEntraines(log, []), mercredi)).toBe(0);
    const j = [entreeAthlean("2026-10-28", "A", "BUILD")];
    expect(streakOf(joursEntraines(log, j), mercredi)).toBe(3);
  });

  /* Le samedi ne compte pas plus en Athlean X qu'en Classique : la série
     saute les week-ends, elle ne les compte pas. */
  it("un samedi Athlean X ne casse ni ne prolonge la série", () => {
    const lundi = new Date(2026, 10, 2);
    const l = [{ d: "2026-10-30", w: "x" }, { d: "2026-11-02", w: "y" }];
    const j = [entreeAthlean("2026-10-31", "A", "BUILD")];
    expect(streakOf(joursEntraines(l, j), lundi)).toBe(streakOf(l, lundi));
  });

  it("le journal Classique n'est jamais modifié", () => {
    const avant = JSON.stringify(log);
    joursEntraines(log, [entreeAthlean("2026-10-28", "A", "BUILD")]);
    expect(JSON.stringify(log)).toBe(avant);
  });
});

describe("la séance laissée en cours", () => {
  const T = Date.UTC(2026, 9, 26, 7, 0);
  const rec = { workoutId: "A", mode: "BUILD", d: "2026-10-26", startedAt: T, idx: 7, restant: 30_000 };

  it("se reprend sous quatre heures", () => {
    expect(repriseAthlean(rec, T + 60_000)).toBe("resume");
    expect(repriseAthlean(rec, T + 4 * 3600_000)).toBe("resume");
  });

  it("au-delà, ne s'enregistre plus que telle quelle", () => {
    expect(repriseAthlean(rec, T + 4 * 3600_000 + 1)).toBe("stale");
  });

  /* BUILD compte 48 étapes : pré-départ, 24 exercices, 23 transitions. */
  it("un enregistrement illisible ou au bout n'est pas proposé", () => {
    [null, { ...rec, workoutId: "C" }, { ...rec, mode: "BEAST" }, { ...rec, d: undefined },
      { ...rec, startedAt: "hier" }, { ...rec, idx: 48 }, { ...rec, idx: -1 }, { ...rec, idx: "7" }]
      .forEach((r) => expect(repriseAthlean(r, T)).toBe(null));
    expect(repriseAthlean({ ...rec, idx: 47 }, T)).toBe("resume");
  });

  /* L'échauffement ajoute une étape en tête : sans le savoir, la reprise
     prendrait la dernière pour une étape au-delà du bout. */
  it("tient compte de l'échauffement, qui décale les étapes", () => {
    expect(repriseAthlean({ ...rec, idx: 48, echauffement: true }, T)).toBe("resume");
    expect(repriseAthlean({ ...rec, idx: 48 }, T)).toBe(null);
  });
});
