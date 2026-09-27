import { describe, it, expect } from "vitest";
import { WORKOUTS } from "../src/data/workouts.js";
import { PATTERNS, patternsOfWorkout } from "../src/data/patterns.js";
import { pickVariant, prescrit } from "../src/lib/generator.js";
import { CORRECTIF_HEBDO, CORRECTIF_PAR_SEMAINE } from "../src/data/correctif.js";

/* Générateur pseudo-aléatoire déterministe : la simulation doit être rejouable. */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Une semaine telle que l'app la vit : un tirage par jour, l'état de sélection
   repart de zéro à chaque changement de jour. Le correctif se compte au fil de
   la semaine, exactement comme `App` le relit du journal. */
function simulateWeek(rand) {
  const covered = new Set();
  let correctifs = 0;
  [1, 2, 3, 4, 5].forEach((day) => {
    const pool = WORKOUTS[day];
    const du = correctifs < CORRECTIF_PAR_SEMAINE;
    const { index } = pickVariant(pool, covered, [], null, rand, du);
    patternsOfWorkout(pool[index]).forEach((p) => covered.add(p));
    if (prescrit(pool[index], CORRECTIF_HEBDO)) correctifs++;
  });
  return { covered, correctifs };
}

describe("générateur", () => {
  it("couvre les dix qualités sur 500 semaines", () => {
    const rand = mulberry32(1);
    const manquants = [];
    for (let i = 0; i < 500; i++) {
      const { covered } = simulateWeek(rand);
      if (covered.size !== PATTERNS.length) {
        manquants.push(PATTERNS.filter((p) => !covered.has(p.id)).map((p) => p.id));
      }
    }
    expect(manquants).toEqual([]);
  });

  it("ne repropose pas la même variante deux fois de suite", () => {
    const rand = mulberry32(7);
    Object.values(WORKOUTS).forEach((pool) => {
      if (pool.length < 2) return;
      let current = null, seen = [];
      for (let i = 0; i < 20; i++) {
        const next = pickVariant(pool, new Set(), seen, current, rand);
        if (current !== null) expect(next.index).not.toBe(current);
        current = next.index; seen = next.seen;
      }
    });
  });

  it("parcourt toutes les variantes du jour avant de boucler", () => {
    const rand = mulberry32(3);
    Object.values(WORKOUTS).forEach((pool) => {
      let current = null, seen = [];
      const vus = new Set();
      for (let i = 0; i < pool.length; i++) {
        const next = pickVariant(pool, new Set(), seen, current, rand);
        vus.add(next.index);
        current = next.index; seen = next.seen;
      }
      expect(vus.size).toBe(pool.length);
    });
  });
});

/* Le correctif vaut par sa fréquence. Le mesurer est donc le seul contrôle qui
   ait du sens — et il a déjà servi : avant que le tirage ne le connaisse, le
   dead bug ne sortait aucune fois dans 40 % des semaines. */
describe("le correctif hebdomadaire", () => {
  it("sort au moins une fois par semaine, sur 500 semaines", () => {
    const rand = mulberry32(3);
    let pire = Infinity, total = 0;
    for (let i = 0; i < 500; i++) {
      const { correctifs } = simulateWeek(rand);
      pire = Math.min(pire, correctifs);
      total += correctifs;
    }
    expect(pire).toBeGreaterThanOrEqual(1);
    expect(total / 500).toBeGreaterThan(1.5);
  });

  /* Trois jours seulement peuvent le porter : lundi et mardi n'ont aucune
     ligne de sangle à lui donner sans allonger la séance. C'est ce fait, et
     non un réglage, qui plafonne la fréquence — s'il change, le plafond
     change, et il vaut mieux l'apprendre ici que par surprise. */
  it("trois jours sur cinq peuvent le porter", () => {
    const jours = Object.entries(WORKOUTS)
      .filter(([, pool]) => pool.some((w) => prescrit(w, CORRECTIF_HEBDO)))
      .map(([d]) => Number(d));
    expect(jours).toEqual([3, 4, 5]);
  });

  /* La couverture reste le premier critère : le correctif ne départage qu'à
     égalité. Une séance qui apporte un schéma moteur neuf gagne, même si
     l'autre porte le dead bug et que la semaine l'attend. */
  it("ne passe jamais devant la couverture", () => {
    const neuve = { name:"neuve", blocks:[{ tag:"1", items:[{ n:10, ex:"pompes" }] }] };
    const correctrice = { name:"correctrice", blocks:[{ tag:"1", items:[{ n:10, ex:CORRECTIF_HEBDO }] }] };
    const { index } = pickVariant([correctrice, neuve], new Set(["core"]), [], null, () => 0, true);
    expect(index).toBe(1);
  });
});
