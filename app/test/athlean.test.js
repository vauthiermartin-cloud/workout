/* Le chrono d'Athlean X.

   Les séquences sont synthétiques : les vraies — Workout A/B × NORMAL/BUILD/
   DEFINE — sont le contenu d'un ticket suivant, qui vérifiera qu'elles ont
   bien 32 et 24 exercices. Ici, on tient que le moteur donne les trois durées
   de la spec à partir de ces comptes, et qu'il ne double ni ne rejoue aucun
   signal. */

import { describe, it, expect } from "vitest";
import {
  RETARD, SONS, WARNING, effet, avancer, demarrer, deroule, dureeTotale, ecran, fini, mettreEnPause,
  passer, recommencer, reprendre, restantes,
} from "../src/lib/athlean.js";

const T0 = 1_000_000;
const noms = (n) => Array.from({ length: n }, (_, i) => `Exo ${i + 1}`);

/* Le battement tel que l'écran le tient : toutes les 100 ms, signaux
   collectés avec leur instant. */
const jouer = (run, de, a, pas = 100) => {
  const emis = [];
  let cur = run;
  for (let t = de; t <= a; t += pas) {
    const r = avancer(cur, t);
    r.signaux.forEach((s) => emis.push({ ...s, t }));
    cur = r.run;
  }
  return { run: cur, emis };
};

const compte = (emis, son) => emis.filter((s) => s.son === son).length;

describe("déroulé", () => {
  it("pré-départ, exercices, une transition entre chaque, aucune après le dernier", () => {
    const e = deroule(noms(3));
    expect(e.map((x) => x.t)).toEqual(["depart", "exercice", "transition", "exercice", "transition", "exercice"]);
    expect(e[0].sec).toBe(5);
    expect(e.filter((x) => x.t === "exercice").every((x) => x.sec === 60)).toBe(true);
    expect(e.filter((x) => x.t === "transition").every((x) => x.sec === 5)).toBe(true);
  });

  /* Les trois durées de la spec, tirées des comptes que F-13 annonce. */
  it.each([
    [32, 31, "34:40"],
    [24, 23, "26:00"],
  ])("%i exercices, %i transitions : %s", (n, nt, attendu) => {
    const e = deroule(noms(n));
    expect(e.filter((x) => x.t === "exercice")).toHaveLength(n);
    expect(e.filter((x) => x.t === "transition")).toHaveLength(nt);
    const d = dureeTotale(e);
    expect(`${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`).toBe(attendu);
  });

  it("une séance jouée sans geste dure exactement sa durée totale", () => {
    const e = deroule(noms(24));
    const run = demarrer(e, T0);
    const avant = jouer(run, T0, T0 + 1560 * 1000 - 100).run;
    expect(fini(avant)).toBe(false);
    expect(fini(avancer(avant, T0 + 1560 * 1000).run)).toBe(true);
  });
});

describe("signaux", () => {
  it("pré-départ : cinq TICK, un par seconde, puis GO à zéro", () => {
    const { emis } = jouer(demarrer(deroule(noms(2)), T0), T0, T0 + 5000);
    expect(emis.filter((s) => s.son === "TICK").map((s) => s.t - T0)).toEqual([0, 1000, 2000, 3000, 4000]);
    expect(emis.filter((s) => s.son === "GO").map((s) => s.t - T0)).toEqual([5000]);
  });

  it("une séance entière : chaque signal une fois, ni plus ni moins", () => {
    const n = 4;
    const { emis } = jouer(demarrer(deroule(noms(n)), T0), T0, T0 + dureeTotale(deroule(noms(n))) * 1000);
    expect(compte(emis, "TICK")).toBe(5 * n);
    expect(compte(emis, "GO")).toBe(n);
    expect(compte(emis, "WARNING")).toBe(n);
  });

  it("WARNING à 10 s de la fin par défaut, à 5 s si on le règle", () => {
    expect(WARNING).toBe(10);
    const e = deroule(noms(1));
    const dix = jouer(demarrer(e, T0), T0, T0 + 65000).emis.find((s) => s.son === "WARNING");
    expect(dix.t - T0).toBe(5000 + 50000);
    const cinq = jouer(demarrer(e, T0, 5), T0, T0 + 65000).emis.find((s) => s.son === "WARNING");
    expect(cinq.t - T0).toBe(5000 + 55000);
  });

  it("le WARNING ne coupe pas le minutage", () => {
    const e = deroule(noms(2));
    const { run } = jouer(demarrer(e, T0), T0, T0 + 5000 + 50000);
    expect(ecran(run, T0 + 5000 + 50000).restant).toBe(10);
    expect(run.idx).toBe(1);
  });

  /* La vibration double le son, jamais l'inverse. */
  it("chaque signal a un son ; aucun ne vibre seul", () => {
    expect(Object.keys(SONS).sort()).toEqual(["GO", "TICK", "WARNING"]);
    Object.values(SONS).forEach((s) => { expect(s.freq).toBeGreaterThan(0); expect(s.ms).toBeGreaterThan(0); });
  });

  /* Son coupé, la vibration se tait avec lui : sinon elle sonnerait seule. */
  it("son coupé, aucun signal ne produit rien, vibration comprise", () => {
    ["TICK", "GO", "WARNING"].forEach((son) => {
      expect(effet({ son }, true)).toBe(SONS[son]);
      expect(effet({ son }, false)).toBeNull();
    });
  });

  it("la fin d'un exercice est muette : pas de quatrième son", () => {
    const e = deroule(noms(1));
    const { emis } = jouer(demarrer(e, T0), T0, T0 + 65000);
    expect(emis.filter((s) => s.t === T0 + 65000)).toEqual([]);
  });
});

describe("arrière-plan", () => {
  /* Un bond de temps : l'app a dormi 40 s en plein exercice, puis revient. */
  it("zéro bip doublé sur un cycle arrière-plan → premier plan", () => {
    const e = deroule(noms(3));
    let { run, emis } = jouer(demarrer(e, T0), T0, T0 + 20000);
    const retour = avancer(run, T0 + 60000);
    emis = emis.concat(retour.signaux.map((s) => ({ ...s, t: T0 + 60000 })));
    emis = emis.concat(jouer(retour.run, T0 + 60100, T0 + 70000).emis);
    const cles = emis.map((s) => `${s.idx}:${s.son}:${s.t}`);
    expect(new Set(cles).size).toBe(cles.length);
    /* Même son, même étape, même seconde : jamais deux fois. */
    const parSeconde = emis.map((s) => `${s.idx}:${s.son}:${Math.floor((s.t - T0) / 1000)}`);
    expect(new Set(parSeconde).size).toBe(parSeconde.length);
  });

  it("les signaux tombés pendant l'absence ne sont pas rejoués en rafale", () => {
    const e = deroule(noms(4));
    const run = jouer(demarrer(e, T0), T0, T0 + 6000).run;
    /* Absent de 6 s à 190 s : deux transitions et deux WARNING sont tombés. */
    const { signaux } = avancer(run, T0 + 190000);
    expect(signaux.every((s) => s.son)).toBe(true);
    expect(signaux.length).toBeLessThanOrEqual(1);
  });

  it("au retour, l'écran est à l'étape où le temps l'a mené, sans dérive", () => {
    const e = deroule(noms(4));
    const run = demarrer(e, T0);
    /* 5 + 60 + 5 + 60 + 5 = 135 : le troisième exercice commence là. */
    const r = avancer(run, T0 + 135000 + 2000).run;
    expect(e[r.idx]).toMatchObject({ t: "exercice", nom: "Exo 3" });
    expect(ecran(r, T0 + 137000).restant).toBe(58);
  });

  it("un signal en retard d'une seconde au plus sonne encore", () => {
    const e = deroule(noms(2));
    const run = jouer(demarrer(e, T0), T0, T0 + 4000).run;
    const { signaux } = avancer(run, T0 + 5000 + RETARD);
    expect(signaux.map((s) => s.son)).toContain("GO");
  });
});

describe("pause", () => {
  it("conserve le temps restant exact, à la milliseconde", () => {
    const e = deroule(noms(2));
    const run = jouer(demarrer(e, T0), T0, T0 + 20000).run;
    const p = mettreEnPause(run, T0 + 20350);
    expect(p.pause).toBe(65000 - 20350);
    /* Dix minutes de pause : rien ne bouge. */
    expect(avancer(p, T0 + 620350)).toEqual({ run: p, signaux: [] });
    expect(ecran(p, T0 + 620350).restant).toBe(45);
    const r = reprendre(p, T0 + 620350);
    expect(r.fin - (T0 + 620350)).toBe(65000 - 20350);
  });

  it("la reprise ne rejoue aucune alerte déjà émise", () => {
    const e = deroule(noms(2));
    /* Pause juste après le WARNING du premier exercice. */
    let { run, emis } = jouer(demarrer(e, T0), T0, T0 + 55000);
    expect(compte(emis, "WARNING")).toBe(1);
    run = reprendre(mettreEnPause(run, T0 + 55000), T0 + 300000);
    const suite = jouer(run, T0 + 300000, T0 + 300000 + 9900).emis;
    expect(compte(suite, "WARNING")).toBe(0);
  });

  it("la reprise ne rejoue pas un TICK de transition déjà entendu", () => {
    const e = deroule(noms(2));
    let { run, emis } = jouer(demarrer(e, T0), T0, T0 + 67000);
    const ticksAvant = compte(emis, "TICK");
    run = reprendre(mettreEnPause(run, T0 + 67000), T0 + 90000);
    const suite = jouer(run, T0 + 90000, T0 + 93000).emis;
    /* Transition entamée à 65 s, pause à 67 s : restent les TICK de 68 et 69, puis GO. */
    expect(ticksAvant).toBe(5 + 3);
    expect(compte(suite, "TICK")).toBe(2);
    expect(compte(suite, "GO")).toBe(1);
  });
});

describe("passer et recommencer", () => {
  it("passer avance d'une étape et la démarre à son plein temps", () => {
    const e = deroule(noms(3));
    const run = jouer(demarrer(e, T0), T0, T0 + 30000).run;
    const p = passer(run, T0 + 30000);
    expect(p.idx).toBe(run.idx + 1);
    expect(ecran(p, T0 + 30000).restant).toBe(5);
    expect(restantes(p)).toBe(restantes(run) - 1);
  });

  it("recommencer redémarre l'étape courante, sans revenir à la précédente", () => {
    const e = deroule(noms(3));
    const run = jouer(demarrer(e, T0), T0, T0 + 40000).run;
    const r = recommencer(run, T0 + 40000);
    expect(r.idx).toBe(run.idx);
    expect(ecran(r, T0 + 40000).restant).toBe(60);
    expect(restantes(r)).toBe(restantes(run));
  });

  it("aucun des deux ne déclenche de signal en trop sur la nouvelle étape", () => {
    const e = deroule(noms(3));
    const run = jouer(demarrer(e, T0), T0, T0 + 30000).run;
    /* On passe sur une transition : son premier TICK, à l'instant du geste, ne sonne pas. */
    expect(avancer(passer(run, T0 + 30000), T0 + 30000).signaux).toEqual([]);
    expect(avancer(recommencer(run, T0 + 30000), T0 + 30000).signaux).toEqual([]);
  });

  it("le WARNING ressonne dans une étape recommencée : c'est un nouvel intervalle", () => {
    const e = deroule(noms(2));
    let { run, emis } = jouer(demarrer(e, T0), T0, T0 + 56000);
    expect(compte(emis, "WARNING")).toBe(1);
    run = recommencer(run, T0 + 56000);
    expect(compte(jouer(run, T0 + 56100, T0 + 56000 + 60000).emis, "WARNING")).toBe(1);
  });

  it("le compte d'étapes restantes ne casse sur aucun enchaînement de gestes", () => {
    const e = deroule(noms(5));
    let run = demarrer(e, T0);
    let t = T0;
    const gestes = ["passer", "recommencer", "recommencer", "passer", "passer", "recommencer", "passer"];
    gestes.forEach((g) => {
      t += 1500;
      run = avancer(run, t).run;
      const avant = restantes(run);
      run = g === "passer" ? passer(run, t) : recommencer(run, t);
      expect(restantes(run), g).toBe(g === "passer" ? avant - 1 : avant);
    });
    while (!fini(run)) run = passer(run, t);
    expect(restantes(run)).toBe(0);
    expect(passer(run, t)).toBe(run);
  });

  it("en pause, passer garde la pause et donne le plein temps de l'étape", () => {
    const e = deroule(noms(2));
    const p = mettreEnPause(jouer(demarrer(e, T0), T0, T0 + 20000).run, T0 + 20000);
    const s = passer(p, T0 + 25000);
    expect(s.pause).toBe(5000);
    expect(avancer(s, T0 + 99000).signaux).toEqual([]);
  });
});

describe("écran", () => {
  it("le pré-départ montre le premier exercice", () => {
    const e = deroule(noms(3));
    expect(ecran(demarrer(e, T0), T0)).toMatchObject({ t: "depart", titre: "Exo 1", restant: 5, ensuite: null });
  });

  it("l'exercice annonce le suivant dès la première seconde", () => {
    const e = deroule(noms(3));
    const run = avancer(demarrer(e, T0), T0 + 5000).run;
    expect(ecran(run, T0 + 5000)).toMatchObject({ t: "exercice", titre: "Exo 1", ensuite: "Exo 2", restant: 60 });
  });

  it("la transition montre l'exercice qui arrive", () => {
    const e = deroule(noms(3));
    const run = avancer(demarrer(e, T0), T0 + 66000).run;
    expect(ecran(run, T0 + 66000)).toMatchObject({ t: "transition", titre: "Exo 2" });
  });

  it("le dernier exercice n'annonce rien", () => {
    const e = deroule(noms(2));
    const run = avancer(demarrer(e, T0), T0 + 71000).run;
    expect(ecran(run, T0 + 71000)).toMatchObject({ titre: "Exo 2", ensuite: null });
  });
});
