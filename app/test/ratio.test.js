/* La règle poussée / tirage.
   ========================

   Deux règles, posées dans `CLAUDE.md` le 2026-09-27 quand l'équipement de
   tirage horizontal est arrivé :

   1. toute séance qui contient un créneau de poussée contient un créneau de
      tirage — règle dure, pas une moyenne hebdomadaire ;
   2. le tirage pèse ce que pèse la poussée, à l'équivalence de la table de
      `data/equivalences.js`.

   Ce que « pèse » veut dire est arbitré là-bas, et la tolérance ici. */

import { describe, it, expect } from "vitest";
import { WORKOUTS } from "../src/data/workouts.js";
import { FINISHERS } from "../src/data/finishers.js";
import { TIMERS } from "../src/data/timers.js";
import { EXERCISES } from "../src/data/exercises.js";
import { PATTERNS, patternsOfWorkout } from "../src/data/patterns.js";
import { TIRAGE_EQUIVALENT, enEquivalentPoussee, estTirageCompte, tirageEquivalent } from "../src/data/equivalences.js";
import { roundsOfPhase } from "../src/lib/volume.js";
import { pickVariant } from "../src/lib/generator.js";
import { mulberry32 } from "./hasard.js";

/* La tolérance, et pourquoi elle n'est pas nulle : les nombres du catalogue
   sont choisis à la main pour tenir la forme du format — un escalier monte de
   1 en 1, une minute d'EMOM doit rester tenable — donc ils ne tombent jamais
   juste sur la cible. Dix pour cent en dessous est de l'arrondi ; plus bas,
   c'est un créneau sous-dimensionné.

   Aucun plafond, et c'est délibéré. Le catalogue mesuré va de 109 % à 292 % :
   par les coefficients de Martin, il est **plus lourd en tirage qu'en
   poussée**, pas l'inverse. Poser un plafond ferait tomber la moitié des
   séances sur une règle que personne n'a demandée — le déséquilibre ressenti
   venait des cinq séances qui n'avaient aucun tirage, pas d'un excès. */
const PLANCHER = 0.9;

const estPoussee = (ex) => EXERCISES[ex] && EXERCISES[ex].patterns.includes("poussee");

/* La poussée et le tirage d'une séance, en répétitions de poussée.

   Les tours comptent : un EMOM répète ses stations, un bloc à tours annoncés
   les multiplie. Un AMRAP n'a pas de nombre de tours — on compare alors un
   tour à un tour, ce qui est exactement ce que le pratiquant vit. */
export function balanceDe(nom) {
  let poussee = 0, tirage = 0, lignes = 0;
  (TIMERS[nom] || []).forEach((p) => {
    const items = (p.stations ? p.stations.flat() : p.list || []).filter((it) => it.ex !== undefined);
    if (!items.length) return;
    const tours = p.stations ? p.loops || 1 : roundsOfPhase(p);
    const t = tours === null ? 1 : tours;
    items.forEach((it) => {
      if (estPoussee(it.ex)) poussee += it.n * t;
      if (estTirageCompte(it.ex)) { tirage += enEquivalentPoussee(it.ex, it.n * t); lignes++; }
    });
  });
  return { poussee, tirage, lignes, couverture: poussee ? tirage / poussee : null };
}

const seances = Object.values(WORKOUTS).flat();

describe("la table d'équivalence", () => {
  it("ne cite que des exercices de tirage de la bibliothèque", () => {
    const fautifs = Object.keys(TIRAGE_EQUIVALENT).filter((id) =>
      !EXERCISES[id] || !EXERCISES[id].patterns.includes("tirage"));
    expect(fautifs).toEqual([]);
  });

  /* Les nombres de Martin, dans l'autre sens : un créneau de 17,5 pompes
     s'équilibre par 3 tractions, 5 chin-ups, 6 tirages horizontaux ou 10 en
     supination. Si la table dérive, c'est ici qu'on l'apprend. */
  it("rend les nombres arbitrés", () => {
    expect(tirageEquivalent("pullups", 17.5)).toBe(3);
    expect(tirageEquivalent("chinups", 17.5)).toBe(5);
    expect(tirageEquivalent("tiragesHorizontaux", 17.5)).toBe(6);
    expect(tirageEquivalent("tiragesHorizontauxSup", 17.5)).toBe(10);
    expect(tirageEquivalent("pompes", 17.5)).toBeNull();
  });

  /* Le tirage horizontal vaut moins qu'une traction : il en faut plus pour le
     même effort. Une table qui inverserait cet ordre ferait des créneaux de
     tirage deux fois trop courts sans que rien ne le signale. */
  it("classe les tirages du plus dur au plus accessible", () => {
    const n = (id) => TIRAGE_EQUIVALENT[id];
    expect(n("pullups")).toBeLessThan(n("chinups"));
    expect(n("chinups")).toBeLessThan(n("tiragesHorizontaux"));
    expect(n("tiragesHorizontaux")).toBeLessThan(n("tiragesHorizontauxSup"));
  });
});

describe("règle 1 — jamais de poussée sans tirage", () => {
  it("tient sur les vingt-cinq séances", () => {
    const sans = seances.filter((w) => {
      const b = balanceDe(w.name);
      return b.poussee > 0 && b.lignes === 0;
    });
    expect(sans.map((w) => w.name)).toEqual([]);
  });

  /* La fiche doit le dire aussi, sinon la séance se lit sans son tirage et se
     joue avec. Le contrôle général de parité vaut pour tout le catalogue ;
     celui-ci nomme la règle, pour qu'un échec dise laquelle est tombée. */
  it("la fiche porte le tirage autant que le chrono", () => {
    const ecarts = seances.filter((w) => {
      const surFiche = w.blocks.some((b) => b.items.some((it) => estTirageCompte(it.ex)));
      return balanceDe(w.name).lignes > 0 && !surFiche;
    });
    expect(ecarts.map((w) => w.name)).toEqual([]);
  });

  /* Aucun finisher ne prescrit de poussée aujourd'hui, donc la question ne
     s'est jamais posée pour eux. Le jour où l'un en prescrira, ce test
     tombera et il faudra décider si la règle vaut hors des 25 minutes —
     plutôt que de laisser le cas passer sans que personne n'y pense. */
  it("aucun finisher ne prescrit de poussée, la question reste ouverte", () => {
    const avec = Object.values(FINISHERS).flat().filter((w) =>
      w.blocks.some((b) => b.items.some((it) => estPoussee(it.ex))));
    expect(avec.map((w) => w.name)).toEqual([]);
  });
});

/* La prise, et deux règles qui ne disent pas la même chose.

   **À la barre**, une séance s'en tient à une prise : pull-ups et chin-ups se
   partagent les avant-bras, et les seconds se feraient sur la fatigue des
   premiers. C'est le contrôle d'origine, dans `coherence.test.js`, et il n'a
   pas bougé.

   **Dès qu'un tirage horizontal entre dans la séance**, la règle s'inverse : il
   prend la prise que le tirage vertical n'a pas. Deux mouvements de pronation,
   ou deux de supination, c'est la même chose chargée deux fois ; un de chaque,
   c'est l'équilibre. On alterne.

   Les deux tiennent ensemble parce qu'elles ne parlent pas du même cas : la
   première interdit deux mouvements *à la barre*, la seconde impose des prises
   opposées *entre les plans*.

   Le contrôle porte sur les mouvements de tirage réels — ceux de la table
   d'équivalence. Les relevés de genoux suspendus portent le schéma `tirage`
   mais ne tirent pas : les compter comme une prise interdirait des séances que
   personne ne trouve déséquilibrées. */
describe("les prises s'alternent dans une séance", () => {
  const prisesDe = (w) => {
    const ids = new Set();
    w.blocks.forEach((b) => b.items.forEach((it) => { if (estTirageCompte(it.ex)) ids.add(it.ex); }));
    (TIMERS[w.name] || []).forEach((p) => {
      (p.stations ? p.stations.flat() : p.list || [])
        .forEach((it) => { if (it && estTirageCompte(it.ex)) ids.add(it.ex); });
    });
    const liste = [...ids];
    return {
      pronation: liste.filter((ex) => !EXERCISES[ex].patterns.includes("supination")),
      supination: liste.filter((ex) => EXERCISES[ex].patterns.includes("supination")),
    };
  };

  it("jamais deux mouvements de la même prise", () => {
    const fautives = seances
      .map((w) => ({ name: w.name, ...prisesDe(w) }))
      .filter((p) => p.pronation.length > 1 || p.supination.length > 1)
      .map((p) => `${p.name} · pronation ${p.pronation.join("+") || "—"} · supination ${p.supination.join("+") || "—"}`);
    expect(fautives).toEqual([]);
  });

  /* Aucune séance ne combine encore les deux plans, donc le contrôle
     ci-dessus passe sans avoir rien à examiner. Celui-ci vérifie qu'il
     attraperait le cas le jour où il arrivera — un garde-fou qu'on n'a jamais
     vu se déclencher n'est pas un garde-fou. */
  it("attraperait un horizontal de la même prise que le vertical", () => {
    const faux = { name:"faux", blocks:[{ tag:"1", items:[
      { n:5, ex:"pullups" }, { n:8, ex:"tiragesHorizontaux" },
    ] }] };
    expect(prisesDe(faux).pronation.length).toBe(2);
    const juste = { name:"juste", blocks:[{ tag:"1", items:[
      { n:5, ex:"pullups" }, { n:10, ex:"tiragesHorizontauxSup" },
    ] }] };
    expect(prisesDe(juste).pronation.length).toBe(1);
    expect(prisesDe(juste).supination.length).toBe(1);
  });
});

describe("règle 2 — le tirage pèse ce que pèse la poussée", () => {
  it("chaque séance tient le plancher", () => {
    const faibles = seances
      .map((w) => ({ name: w.name, ...balanceDe(w.name) }))
      .filter((b) => b.poussee > 0 && b.couverture < PLANCHER)
      .map((b) => `${b.name} ${Math.round(b.couverture * 100)} %`);
    expect(faibles).toEqual([]);
  });

  /* Une semaine entière, tirée comme l'app la tire. La règle est par séance,
     mais c'est la semaine que Martin vit — et c'est elle qui portait le
     déséquilibre ressenti. */
  it("chaque semaine simulée tient le plancher, sur 500 semaines", () => {
    const rand = mulberry32(11);
    let pire = Infinity;
    for (let i = 0; i < 500; i++) {
      const couverte = new Set();
      let poussee = 0, tirage = 0;
      [1, 2, 3, 4, 5].forEach((jour) => {
        const pool = WORKOUTS[jour];
        const { index } = pickVariant(pool, couverte, [], null, rand);
        patternsOfWorkout(pool[index]).forEach((p) => couverte.add(p));
        const b = balanceDe(pool[index].name);
        poussee += b.poussee;
        tirage += b.tirage;
      });
      if (poussee > 0) pire = Math.min(pire, tirage / poussee);
    }
    expect(pire).toBeGreaterThanOrEqual(PLANCHER);
  });

  /* Le tirage n'est pas un schéma moteur qu'on couvre une fois : il revient
     dans chaque séance qui pousse. Cette mesure le dit en clair — si le
     catalogue repartait vers le déséquilibre, elle baisserait avant que la
     règle 1 ne tombe. */
  it("le catalogue reste au-dessus de la parité", () => {
    const avec = seances.map((w) => balanceDe(w.name)).filter((b) => b.poussee > 0);
    const moyenne = avec.reduce((a, b) => a + b.couverture, 0) / avec.length;
    expect(moyenne).toBeGreaterThan(1);
    expect(PATTERNS.some((p) => p.id === "tirage")).toBe(true);
  });
});
