import { patternsOfWorkout } from "../data/patterns.js";

/* Le premier tirage cherche la meilleure couverture. Les suivants parcourent
   les autres variantes du jour avant d'en reproposer une déjà vue.
   `rand` est injectable pour rendre le tirage reproductible en test. */
export function pickVariant(pool, weekPatterns, seen, current, rand = Math.random) {
  const vus = current === null ? [] : seen;
  let dispo = pool.map((_, i) => i).filter((i) => !vus.includes(i));
  if (!dispo.length) dispo = pool.map((_, i) => i).filter((i) => i !== current);
  if (!dispo.length) dispo = pool.map((_, i) => i);

  const scored = dispo.map((i) => ({
    i,
    neuf: patternsOfWorkout(pool[i]).filter((p) => !weekPatterns.has(p)).length,
  }));
  const best = Math.max(...scored.map((s) => s.neuf));
  const candidats = scored.filter((s) => s.neuf === best).map((s) => s.i);
  const index = candidats[Math.floor(rand() * candidats.length)];

  return { index, seen: vus.includes(index) ? [index] : [...vus, index] };
}
