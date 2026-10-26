/* La saisie des reps d'une séance Athlean X (F-15). */

import { describe, it, expect } from "vitest";
import { passagesDe, lireSaisie, repsDeSaisie } from "../src/lib/repsAthlean.js";
import { etapesAthlean, WORKOUTS_ATHLEAN, MODES_ATHLEAN } from "../src/data/seancesAthlean.js";
import { idOfSource } from "../src/data/exercises.js";

const SEANCES = Object.keys(WORKOUTS_ATHLEAN).flatMap((w) => MODES_ATHLEAN.map((m) => [w, m]));

describe("les passages du récap", () => {
  /* La séance jouée, pas le catalogue : 32 lignes en NORMAL, 24 en BUILD et
     DEFINE, dans l'ordre exact du chrono. */
  it("listent la séance jouée, dans son ordre, et rien d'autre", () => {
    SEANCES.forEach(([w, m]) => {
      const p = passagesDe(w, m);
      expect(p.length).toBe(m === "NORMAL" ? 32 : 24);
      const joues = etapesAthlean(w, m).filter((e) => e.t === "exercice").map((e) => e.sourceId);
      expect(p.map((x) => x.sourceId)).toEqual(joues);
    });
  });

  it("n'y mettent pas ce que la séance ne joue pas", () => {
    // DEFINE A ne reprend pas A-2.3 au deuxième tour : une seule ligne
    const p = passagesDe("A", "DEFINE");
    expect(p.filter((x) => x.sourceId === "A-2.3").length).toBe(1);
    expect(p.filter((x) => x.sourceId === "A-4.1").length).toBe(2);
    expect(p.some((x) => x.sourceId.startsWith("B-"))).toBe(false);
  });

  it("numérotent le tour de chaque passage", () => {
    const p = passagesDe("A", "BUILD").filter((x) => x.sourceId === "A-1.1");
    expect(p.map((x) => [x.tour, x.phase])).toEqual([[1, "round1"], [2, "round2"]]);
  });

  it("portent le nom affiché, l'exercice et le libellé de phase", () => {
    const [premier] = passagesDe("B", "BUILD");
    expect(premier).toMatchObject({ sourceId: "B-1.1", ex: idOfSource("B-1.1"), phaseLabel: "Tour 1 — corps entier" });
    expect(passagesDe("B", "BUILD").at(-1).phaseLabel).toBe("Correctif");
  });

  it("une séance inconnue n'a pas de passage", () => {
    expect(passagesDe("C", "BUILD")).toEqual([]);
  });
});

describe("un champ", () => {
  it("vaut un entier positif ou nul, sinon rien", () => {
    expect(lireSaisie("14")).toBe(14);
    expect(lireSaisie(" 9 ")).toBe(9);
    expect(lireSaisie("0")).toBe(0);
    ["", undefined, null, "abc", "-3", "4.5", "1e3"].forEach((t) => expect(lireSaisie(t)).toBe(null));
  });
});

describe("les reps enregistrés", () => {
  const p = passagesDe("A", "BUILD");
  const i = (sid, tour = 1) => p.findIndex((x) => x.sourceId === sid && x.tour === tour);

  it("rien de noté : aucune clé, et rien ne bloque", () => {
    expect(repsDeSaisie(p, [])).toEqual({});
    expect(repsDeSaisie(p, p.map(() => ""))).toEqual({});
  });

  it("une liste par id du spec, un nombre par passage, dans l'ordre", () => {
    const v = [];
    v[i("A-1.1", 1)] = "14"; v[i("A-1.1", 2)] = "12"; v[i("A-1.3")] = "20";
    expect(repsDeSaisie(p, v)).toEqual({ "A-1.1": [14, 12], "A-1.3": [20] });
  });

  /* Un trou garde sa place : [null, 11] dit que le premier passage n'a pas
     été noté, pas qu'il n'y en a eu qu'un. */
  it("un passage non noté garde sa place", () => {
    const v = [];
    v[i("A-1.1", 2)] = "11";
    expect(repsDeSaisie(p, v)).toEqual({ "A-1.1": [null, 11] });
  });

  it("la clé est l'id du spec, jamais l'id maison", () => {
    const v = [];
    v[i("A-4.3", 1)] = "10";
    const reps = repsDeSaisie(p, v);
    expect(Object.keys(reps)).toEqual(["A-4.3"]);
    expect(reps[idOfSource("A-4.3")]).toBe(undefined);
  });
});
