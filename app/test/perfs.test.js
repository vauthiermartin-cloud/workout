import { describe, it, expect } from "vitest";
import { correctionsDe, perfsOf, valeurDe, volumeReel } from "../src/lib/perfs.js";
import { WORKOUTS } from "../src/data/workouts.js";
import { TIMERS } from "../src/data/timers.js";
import { EXERCISES } from "../src/data/exercises.js";

const allWorkouts = Object.values(WORKOUTS).flat();
const champ = (champs, k) => champs.find((c) => c.k === k);

describe("perfsOf — ce que la feuille propose de saisir", () => {
  it("agrège un EMOM par exercice, pas par station", () => {
    const champs = perfsOf("EMOM 25", 1);
    expect(champs.map((c) => c.k).sort()).toEqual(
      ["s:airSquats", "s:burpees", "s:pompes", "s:pullups", "s:sdtUneJambe"]);
    expect(champ(champs, "s:burpees").prescrit).toBe(40);   // 8 × 5 tours
    expect(champ(champs, "s:airSquats").prescrit).toBe(75);
    expect(champ(champs, "s:pullups").prescrit).toBe(20);
  });

  it("applique le mode au prescrit, sauf sur les maintiens", () => {
    const champs = perfsOf("EMOM 20 explosif", 3);
    expect(champ(champs, "s:jumpSquats").prescrit).toBe(72); // 12 → 18, × 4 tours
    /* Un maintien ne suit pas le coefficient de mode : 30 s de planche restent
       30 s tant que les durées n'ont pas leur propre progression. */
    const planche = champ(champs, "s:planche");
    expect(planche.unit).toBe("secondes");
    expect(planche.prescrit).toBe(120);
  });

  it("ne propose qu'un nombre de tours sur un format ouvert", () => {
    const champs = perfsOf("AMRAP 20", 1);
    expect(champs).toHaveLength(1);
    expect(champs[0]).toMatchObject({ kind:"tours", k:"tours:0", unit:"tours", pas:0 });
    expect(champs[0].parTour).toBe(65); // 5 + 10 + 15 + 20 + 15
  });

  it("donne un champ de tours par bloc ouvert", () => {
    const champs = perfsOf("2 × AMRAP 10", 1);
    expect(champs.map((c) => c.k)).toEqual(["tours:0", "tours:1"]);
    expect(champs.map((c) => c.label)).toEqual(["AMRAP A", "AMRAP B"]);
  });

  it("déclare le pas d'un escalier ouvert", () => {
    const champs = perfsOf("Escalier ouvert", 1);
    expect(champs).toEqual([expect.objectContaining({
      kind:"tours", pas:1, parTour:6, lignes:[1, 2, 3],
    })]);
  });

  it("ajoute le score du test le vendredi, et lui seul", () => {
    const champs = perfsOf("Test 4 min + finisher", 1);
    const score = champ(champs, "score");
    expect(score).toMatchObject({ kind:"score", unit:"reps", label:"Burpees en 4 min" });
    /* La phase de test n'a pas de ligne prescrite : rien à préremplir, le
       chiffre du score est tout ce qu'elle produit. */
    expect(champ(champs, "s:burpees")).toBeUndefined();
    expect(perfsOf("EMOM 25", 1).some((c) => c.kind === "score")).toBe(false);
  });

  it("compte les 50 burpees prescrits comme du travail, pas comme un format ouvert", () => {
    const champs = perfsOf("50 burpees for time", 1);
    expect(champ(champs, "s:burpees").prescrit).toBe(50);
    expect(champs.some((c) => c.kind === "tours")).toBe(false);
    expect(champ(champs, "score").unit).toBe("secondes");
  });

  it("ne propose jamais une note libre à la saisie", () => {
    const notes = Object.values(TIMERS).flat()
      .flatMap((p) => (p.stations ? p.stations.flat() : p.list || []))
      .filter((it) => it.ex === undefined);
    expect(notes.length).toBeGreaterThan(0);
    allWorkouts.forEach((w) => {
      perfsOf(w.name, 1).forEach((c) => {
        if (c.kind === "ex") expect(EXERCISES[c.ex]).toBeDefined();
      });
    });
  });

  it("donne un champ à chaque séance du catalogue", () => {
    allWorkouts.forEach((w) => {
      expect(perfsOf(w.name, 1).length, w.name).toBeGreaterThan(0);
    });
  });
});

describe("valeurDe — la relecture prime, le prescrit comble", () => {
  const c = { k:"s:burpees", prescrit:40 };
  it("rend le prescrit tant que rien n'a été relu", () => {
    expect(valeurDe(c, null)).toBe(40);
    expect(valeurDe(c, {})).toBe(40);
  });
  it("rend la valeur relue, y compris zéro", () => {
    expect(valeurDe(c, { "s:burpees": 33 })).toBe(33);
    expect(valeurDe(c, { "s:burpees": 0 })).toBe(0);
  });
});

describe("volumeReel — le total de ce qui a été fait", () => {
  it("suit les corrections et ignore les maintiens", () => {
    const prescrit = volumeReel("EMOM 25", 1, {}, null);
    expect(prescrit).toEqual({ total:275, complet:true });
    expect(volumeReel("EMOM 25", 1, { "s:burpees": 30 }, null).total).toBe(265);

    const explosif = volumeReel("EMOM 20 explosif", 1, {}, null);
    const avecPlanche = volumeReel("EMOM 20 explosif", 1, { "s:planche": 200 }, null);
    expect(avecPlanche.total).toBe(explosif.total);
  });

  it("multiplie un tour d'AMRAP par les tours annoncés", () => {
    expect(volumeReel("AMRAP 20", 1, { "tours:0": 4 }, null)).toEqual({ total:260, complet:true });
  });

  it("somme les paliers d'un escalier au lieu de répéter le premier tour", () => {
    /* 5 tours : 6 + 9 + 12 + 15 + 18. Multiplier le tour 1 aurait donné 30. */
    expect(volumeReel("Escalier ouvert", 1, { "tours:0": 5 }, null).total).toBe(60);
  });

  it("se déclare incomplet tant qu'un tour ou un score manque", () => {
    expect(volumeReel("AMRAP 20", 1, {}, null).complet).toBe(false);
    expect(volumeReel("Test 4 min + finisher", 1, {}, null)).toEqual({ total:200, complet:false });
  });

  it("ajoute le score du vendredi quand il est du volume, jamais quand c'est un temps", () => {
    expect(volumeReel("Test 4 min + finisher", 1, {}, 62)).toEqual({ total:262, complet:true });
    /* Un temps sur 50 burpees ne s'additionne pas à des répétitions : le total
       est complet sans lui, puisque les burpees sont déjà comptés. */
    expect(volumeReel("50 burpees for time", 1, {}, null)).toEqual({ total:179, complet:true });
  });
});

/* L'état initial du champ, tel que l'écran le préremplit. */
const prefill = (champs, entry) => {
  const o = {};
  champs.forEach((c) => {
    const v = c.kind === "score" ? entry && entry.s : valeurDe(c, entry && entry.perfs);
    o[c.k] = v === null || v === undefined ? "" : String(v);
  });
  return o;
};

describe("correctionsDe — ce que garde une sortie sans validation", () => {
  it("ne rend rien quand aucun champ n'a bougé", () => {
    const champs = perfsOf("EMOM 25", 1);
    const initial = prefill(champs, null);
    expect(correctionsDe(champs, initial, initial, null)).toBe(null);
  });

  it("n'écrit que le champ corrigé, jamais les préremplis", () => {
    /* Le cœur du sujet : les champs `ex` arrivent remplis avec le prescrit.
       Les écrire tous ferait passer une consigne pour une mesure. */
    const champs = perfsOf("EMOM 25", 1);
    const initial = prefill(champs, null);
    const o = correctionsDe(champs, { ...initial, "s:burpees": "30" }, initial, null);
    expect(o.perfs).toEqual({ "s:burpees": 30 });
    expect(o).not.toHaveProperty("s");
  });

  it("range le score du vendredi dans `s`, pas dans les perfs", () => {
    const champs = perfsOf("Test 4 min + finisher", 1);
    const initial = prefill(champs, null);
    const o = correctionsDe(champs, { ...initial, score: "45" }, initial, null);
    expect(o.s).toBe(45);
    expect(o.perfs).toEqual({});
  });

  it("garde les corrections déjà enregistrées", () => {
    const champs = perfsOf("EMOM 25", 1);
    const avant = { "s:pompes": 42 };
    const initial = prefill(champs, { perfs: avant });
    const o = correctionsDe(champs, { ...initial, "s:burpees": "30" }, initial, avant);
    expect(o.perfs).toEqual({ "s:pompes": 42, "s:burpees": 30 });
  });

  it("vider un champ relu l'oublie au lieu d'y écrire zéro", () => {
    const champs = perfsOf("EMOM 25", 1);
    const avant = { "s:pompes": 42 };
    const initial = prefill(champs, { perfs: avant });
    const o = correctionsDe(champs, { ...initial, "s:pompes": "" }, initial, avant);
    expect(o.perfs).toEqual({});
  });

  it("retient un tour saisi sur un format ouvert", () => {
    const champs = perfsOf("AMRAP 20", 1);
    const initial = prefill(champs, null);
    expect(initial["tours:0"]).toBe("");
    const o = correctionsDe(champs, { ...initial, "tours:0": "4" }, initial, null);
    expect(o.perfs).toEqual({ "tours:0": 4 });
  });
});
