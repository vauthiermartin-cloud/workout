/* Les séances d'Athlean X (F-13). Le chrono de F-12 avait tenu les trois
   durées sur des séquences synthétiques ; ici, ce sont les vraies. */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { WORKOUTS_ATHLEAN, MODES_ATHLEAN, seanceAthlean, etapesAthlean } from "../src/data/seancesAthlean.js";
import { EXERCISES, idOfSource, labelOf } from "../src/data/exercises.js";
import { dureeTotale } from "../src/lib/athlean.js";

const SEANCES = Object.keys(WORKOUTS_ATHLEAN).flatMap((w) => MODES_ATHLEAN.map((m) => [w, m]));
const exercices = (w, m) => etapesAthlean(w, m).filter((e) => e.t === "exercice");
const ids = (w, m) => seanceAthlean(w, m).phases.flatMap((p) => p.exerciseIds);

describe("comptes et durées, sur les vraies séquences", () => {
  const ATTENDU = {
    NORMAL: { exercices: 32, transitions: 31, duree: 34 * 60 + 40 },
    BUILD:  { exercices: 24, transitions: 23, duree: 26 * 60 },
    DEFINE: { exercices: 24, transitions: 23, duree: 26 * 60 },
  };

  it.each(SEANCES)("%s %s", (w, m) => {
    const e = etapesAthlean(w, m);
    expect(e.filter((x) => x.t === "exercice").length).toBe(ATTENDU[m].exercices);
    expect(e.filter((x) => x.t === "transition").length).toBe(ATTENDU[m].transitions);
    expect(dureeTotale(e)).toBe(ATTENDU[m].duree);
  });

  it("pré-départ en tête, aucune transition après le dernier exercice", () => {
    SEANCES.forEach(([w, m]) => {
      const e = etapesAthlean(w, m);
      expect(e[0].t).toBe("depart");
      expect(e[e.length - 1].t).toBe("exercice");
    });
  });

  it("une séance ou un mode inconnu ne rend rien", () => {
    expect(seanceAthlean("C", "NORMAL")).toBe(null);
    expect(etapesAthlean("A", "BEAST")).toBe(null);
  });
});

describe("le contenu", () => {
  it("chaque id cité mène à un exercice de la bibliothèque", () => {
    const perdus = SEANCES.flatMap(([w, m]) => ids(w, m)).filter((sid) => idOfSource(sid) === null);
    expect(perdus).toEqual([]);
  });

  it("les 32 ids du spec sont tous joués par au moins une séance", () => {
    const joues = new Set(SEANCES.flatMap(([w, m]) => ids(w, m)));
    const spec = Object.keys(EXERCISES).flatMap((id) => EXERCISES[id].sourceIds || []);
    expect(spec.length).toBe(32);
    expect(spec.filter((sid) => !joues.has(sid))).toEqual([]);
  });

  it("une séance A ne joue que du A, une séance B que du B", () => {
    const etrangers = SEANCES.flatMap(([w, m]) => ids(w, m).filter((sid) => !sid.startsWith(`${w}-`)));
    expect(etrangers).toEqual([]);
  });

  /* Spec §7 : les modes adaptés ne placent le correctif qu'à la fin. */
  it("BUILD et DEFINE : le correctif est le dernier exercice, et le seul à la fin", () => {
    SEANCES.filter(([, m]) => m !== "NORMAL").forEach(([w, m]) => {
      const c = WORKOUTS_ATHLEAN[w].correctif;
      const s = ids(w, m);
      expect(s.indexOf(c)).toBe(s.length - 1);
    });
  });

  it("NORMAL : deux tours identiques de 16, correctif compris", () => {
    ["A", "B"].forEach((w) => {
      const [r1, r2] = seanceAthlean(w, "NORMAL").phases;
      expect(r1.exerciseIds.length).toBe(16);
      expect(r2.exerciseIds).toEqual(r1.exerciseIds);
    });
  });

  it("le deuxième tour ne pioche que dans le travail du catalogue, sans doublon", () => {
    Object.entries(WORKOUTS_ATHLEAN).forEach(([, w]) => {
      const travail = w.groupes.flat();
      Object.values(w.tour2).forEach((sel) => {
        expect(sel.length).toBe(8);
        expect(new Set(sel).size).toBe(8);
        expect(sel.filter((sid) => !travail.includes(sid))).toEqual([]);
      });
    });
  });
});

/* Spec §7 : « tous les exercices et leur ordre correspondent exactement aux
   tableaux ». Les données ayant été recopiées à la main, on les compare au
   document source lui-même, qui est dans le dépôt. */
describe("conforme au spec source", () => {
  const spec = readFileSync(new URL("../../perfect_home_workout_spec_v2.md", import.meta.url), "utf8");

  /* Les ids d'un passage, dans l'ordre où ils apparaissent. */
  const idsDans = (debut, fin) => {
    const i = spec.indexOf(debut);
    const j = fin ? spec.indexOf(fin, i + debut.length) : spec.length;
    expect(i).toBeGreaterThanOrEqual(0);
    return [...spec.slice(i, j).matchAll(/\b([AB]-\d\.\d)\b/g)].map((m) => m[1]);
  };

  it("catalogue §4, dans l'ordre", () => {
    expect(idsDans("### Workout A", "### Workout B"))
      .toEqual([...WORKOUTS_ATHLEAN.A.groupes.flat(), WORKOUTS_ATHLEAN.A.correctif]);
    expect(idsDans("### Workout B", "## 5."))
      .toEqual([...WORKOUTS_ATHLEAN.B.groupes.flat(), WORKOUTS_ATHLEAN.B.correctif]);
  });

  /* Chaque tableau de deuxième tour est suivi de sa ligne « Finisher : … ». */
  it.each([
    ["A", "BUILD"], ["B", "BUILD"], ["A", "DEFINE"], ["B", "DEFINE"],
  ])("deuxième tour %s %s §5, puis son correctif", (w, m) => {
    const lu = idsDans(`#### ${m} --- Workout ${w} : Round 2`, "Finisher");
    expect(lu).toEqual(WORKOUTS_ATHLEAN[w].tour2[m]);
    const apres = spec.slice(spec.indexOf("Finisher", spec.indexOf(`#### ${m} --- Workout ${w} : Round 2`)));
    expect(apres.match(/[AB]-\d\.\d/)[0]).toBe(WORKOUTS_ATHLEAN[w].correctif);
  });

  /* L'exemple du §6 est la séance A BUILD : mêmes phases, mêmes ids. */
  it("modèle de données §6", () => {
    const ouvre = spec.indexOf("```", spec.indexOf("## 6."));
    const json = JSON.parse(spec.slice(spec.indexOf("{", ouvre), spec.indexOf("```", ouvre + 3)));
    expect(seanceAthlean("A", "BUILD").phases.map((p) => [p.id, p.exerciseIds]))
      .toEqual(json.phases.map((p) => [p.id, p.exerciseIds]));
  });
});

describe("ce que lira la suite", () => {
  it("chaque exercice joué porte son id maison, son id du spec, sa phase", () => {
    SEANCES.forEach(([w, m]) => {
      const e = exercices(w, m);
      expect(e.map((x) => x.sourceId)).toEqual(ids(w, m));
      expect(e.every((x) => x.ex === idOfSource(x.sourceId))).toBe(true);
      expect(e.every((x) => x.phase)).toBe(true);
    });
  });

  /* Le chrono affiche le libellé français, pas le nom du spec (CLAUDE.md :
     jamais d'anglais dans le chrono). */
  it("le nom affiché est le libellé de la bibliothèque", () => {
    const e = exercices("B", "BUILD");
    expect(e.every((x) => x.nom === labelOf(x.ex))).toBe(true);
    expect(e.find((x) => x.sourceId === "B-4.1").nom).toBe(labelOf("chinups"));
  });

  /* Les tirages horizontaux sont joués deux fois en BUILD A (A-4.3, une par
     tour), et sous deux ids d'un workout à l'autre : la clé de saisie reste
     l'id du spec, pas l'exercice. */
  it("A-4.3 et B-4.2 sont le même exercice, sous deux ids", () => {
    const a = exercices("A", "BUILD").filter((x) => x.sourceId === "A-4.3");
    const b = exercices("B", "BUILD").filter((x) => x.sourceId === "B-4.2");
    expect(a.length).toBe(2);
    expect(a[0].ex).toBe(b[0].ex);
  });
});
