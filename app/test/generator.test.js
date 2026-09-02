import { describe, it, expect } from "vitest";
import { WORKOUTS } from "../src/data/workouts.js";
import { PATTERNS, patternsOfWorkout } from "../src/data/patterns.js";
import { pickVariant } from "../src/lib/generator.js";

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
   repart de zéro à chaque changement de jour. */
function simulateWeek(rand) {
  const covered = new Set();
  [1, 2, 3, 4, 5].forEach((day) => {
    const pool = WORKOUTS[day];
    const { index } = pickVariant(pool, covered, [], null, rand);
    patternsOfWorkout(pool[index]).forEach((p) => covered.add(p));
  });
  return covered;
}

describe("générateur", () => {
  it("couvre les dix qualités sur 500 semaines", () => {
    const rand = mulberry32(1);
    const manquants = [];
    for (let i = 0; i < 500; i++) {
      const covered = simulateWeek(rand);
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
