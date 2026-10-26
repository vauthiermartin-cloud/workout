/* Le chrono d'Athlean X.

   Les séquences sont synthétiques : les vraies — Workout A/B × NORMAL/BUILD/
   DEFINE — sont tenues par `seancesAthlean.test.js` (F-13), comptes et
   durées compris. Ici, on tient que le moteur donne les trois durées de la
   spec à partir de ces comptes, et qu'il ne double ni ne rejoue aucun
   signal. */

import { describe, it, expect } from "vitest";
import {
  RETARD, SONS, WARNING, effet, avancer, demarrer, deroule, dureeTotale, ecran, fini, mettreEnPause,
  passer, recommencer, reprendre, restantes, instantane, restaurer, bloc, dureeSeance, progression,
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

/* La reprise après un redémarrage de l'app. L'horloge monotone repart de
   zéro au chargement : on ne garde que l'étape et le temps restant, et la
   séance revient en pause. */
describe("reprise après redémarrage", () => {
  const e = deroule(noms(3));
  const APRES = 5_000; // l'horloge du nouveau chargement

  it("l'instantané retient l'étape et le temps restant, en marche comme en pause", () => {
    const run = avancer(demarrer(e, T0), T0 + 25_000).run; // 5 s de départ, 20 s du 1er exercice
    expect(instantane(run, T0 + 25_000)).toEqual({ idx: 1, restant: 40_000 });
    const pause = mettreEnPause(run, T0 + 25_000);
    expect(instantane(pause, T0 + 99_000)).toEqual({ idx: 1, restant: 40_000 });
  });

  it("la séance revient en pause, à l'étape et au temps retenus, sans un son", () => {
    const run = restaurer(e, { idx: 1, restant: 40_000 }, APRES);
    expect(run.pause).toBe(40_000);
    expect(run.idx).toBe(1);
    expect(ecran(run, APRES)).toMatchObject({ t: "exercice", restant: 40, enPause: true });
    expect(jouer(run, APRES, APRES + 60_000).emis).toEqual([]);
  });

  it("reprendre la mène au bout au temps restant exact, sans rien rejouer", () => {
    const run = reprendre(restaurer(e, { idx: 1, restant: 40_000 }, APRES), APRES);
    // reste : 40 s, transition 5, exercice 60, transition 5, exercice 60
    const { run: fin, emis } = jouer(run, APRES, APRES + 170_000);
    expect(fini(fin)).toBe(true);
    expect(compte(emis, "WARNING")).toBe(3);
    expect(compte(emis, "GO")).toBe(2);
    expect(fini(jouer(run, APRES, APRES + 169_000).run)).toBe(false);
  });

  it("un enregistrement abîmé ne restaure rien, un temps hors bornes est ramené", () => {
    [null, {}, { idx: -1, restant: 1000 }, { idx: 6, restant: 1000 }, { idx: 1.5, restant: 1000 }]
      .forEach((snap) => expect(restaurer(e, snap, APRES)).toBe(null));
    expect(restaurer(e, { idx: 1, restant: 999_999 }, APRES).pause).toBe(60_000);
    expect(restaurer(e, { idx: 1, restant: -3 }, APRES).pause).toBe(0);
  });
});

/* Le bloc libre : l'échauffement avant la séance, les étirements après. */
describe("bloc libre", () => {
  const liste = [{ txt: "Squats latéraux" }, { txt: "Deep squat" }];
  const e = [bloc("Échauffement", 300, liste, "À ton rythme"), ...deroule(noms(2))];

  it("ne compte pas dans la durée de la séance", () => {
    expect(dureeSeance(e)).toBe(dureeTotale(deroule(noms(2))));
    expect(dureeTotale(e)).toBe(dureeSeance(e) + 300);
  });

  it("montre son nom, sa liste, et annonce déjà le premier exercice", () => {
    const run = demarrer(e, T0);
    expect(ecran(run, T0 + 1000)).toMatchObject({
      t: "bloc", titre: "Échauffement", sous: "À ton rythme", liste, ensuite: "Exo 1", restant: 299,
    });
    expect(ecran(avancer(run, T0 + 300_000).run, T0 + 300_000).liste).toBe(null);
  });

  /* Cinq minutes de TICK n'annonceraient rien : un seul WARNING, comme un
     exercice. Sa fin est muette, le pré-départ qui suit compte 5 → 1 puis GO. */
  it("sonne une fois à 10 s de la fin, puis laisse le pré-départ compter", () => {
    const { emis } = jouer(demarrer(e, T0), T0, T0 + 305_000);
    const duBloc = emis.filter((s) => s.idx === 0);
    expect(duBloc.map((s) => s.son)).toEqual(["WARNING"]);
    expect(duBloc[0].t).toBe(T0 + 290_000);
    const duDepart = emis.filter((s) => s.idx === 1).map((s) => s.son);
    expect(duDepart).toEqual(["TICK", "TICK", "TICK", "TICK", "TICK", "GO"]);
  });

  it("se reprend comme une autre étape", () => {
    const run = restaurer(e, { idx: 0, restant: 120_000 }, 0);
    expect(ecran(run, 0)).toMatchObject({ t: "bloc", restant: 120, enPause: true });
  });
});

/* La jauge : un segment par tour, le pourcentage de la séance seule. */
describe("progression", () => {
  const e = [
    bloc("Échauffement", 300, []),
    ...deroule(noms(4)).map((x, i, all) => {
      if (x.t !== "exercice") return x;
      const k = all.slice(0, i).filter((y) => y.t === "exercice").length;
      return { ...x, phase: k < 2 ? "round1" : "round2", phaseLabel: k < 2 ? "Tour 1" : "Tour 2" };
    }),
  ];
  // séance : départ 5 + ex 60 + tr 5 + ex 60 | tr 5 + ex 60 + tr 5 + ex 60 = 130 + 130

  it("ignore l'échauffement : 0 % pendant, aucun tour annoncé", () => {
    expect(progression(e, 0, 200_000)).toMatchObject({ pct: 0, phase: null, numero: 1, total: 4 });
  });

  it("un segment par tour, large comme sa durée, pré-départ et transitions compris", () => {
    expect(progression(e, 1, 0).segments.map((s) => [s.id, s.grow])).toEqual([["round1", 130_000], ["round2", 130_000]]);
  });

  it("une transition appartient au tour de l'exercice qu'elle annonce", () => {
    // idx 5 : la transition entre l'exercice 2 (tour 1) et l'exercice 3 (tour 2)
    expect(e[5].t).toBe("transition");
    expect(progression(e, 5, 0)).toMatchObject({ phase: "Tour 2", numero: 3, pct: 50 });
  });

  it("compte le temps passé dans l'étape en cours", () => {
    expect(progression(e, 2, 30_000).pct).toBe(Math.round((35_000 / 260_000) * 100));
    expect(progression(e, 2, 30_000).segments[0].fill).toBeCloseTo(35 / 130);
  });

  it("au bout : 100 %, tous les tours faits", () => {
    const fin = progression(e, e.length - 1, 60_000);
    expect(fin.pct).toBe(100);
    expect(fin.segments.every((s) => s.done)).toBe(true);
  });

  it("des étirements seuls n'ont pas de progression", () => {
    expect(progression([bloc("Étirements", 300, [])], 0, 0)).toBe(null);
  });
});
