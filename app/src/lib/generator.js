import { patternsOfWorkout } from "../data/patterns.js";
import { CORRECTIF_HEBDO } from "../data/correctif.js";

export const prescrit = (w, ex) => w.blocks.some((b) => b.items.some((it) => it.ex === ex));

/* Le premier tirage cherche la meilleure couverture. Les suivants parcourent
   les autres variantes du jour avant d'en reproposer une déjà vue.
   `rand` est injectable pour rendre le tirage reproductible en test.

   `correctifDu` dit que la semaine n'a pas encore vu le dead bug. Il départage
   les candidats **à couverture égale**, jamais devant elle : un correctif ne
   vaut pas qu'on laisse un schéma moteur de côté.

   Sans ce départage il sortait 0,7 fois par semaine, et la couverture en était
   la cause directe — une séance qui n'apporte que de la sangle perd contre
   toutes les autres dès que la sangle est couverte, ce qui arrive vite. Le
   mécanisme qui tient la variété travaillait donc contre la répétition, qui
   est tout ce qui fait la valeur d'un correctif. */
export function pickVariant(pool, weekPatterns, seen, current, rand = Math.random, correctifDu = false) {
  const vus = current === null ? [] : seen;
  let dispo = pool.map((_, i) => i).filter((i) => !vus.includes(i));
  if (!dispo.length) dispo = pool.map((_, i) => i).filter((i) => i !== current);
  if (!dispo.length) dispo = pool.map((_, i) => i);

  const scored = dispo.map((i) => ({
    i,
    neuf: patternsOfWorkout(pool[i]).filter((p) => !weekPatterns.has(p)).length,
  }));
  const best = Math.max(...scored.map((s) => s.neuf));
  let candidats = scored.filter((s) => s.neuf === best).map((s) => s.i);
  if (correctifDu) {
    const avec = candidats.filter((i) => prescrit(pool[i], CORRECTIF_HEBDO));
    if (avec.length) candidats = avec;
  }
  const index = candidats[Math.floor(rand() * candidats.length)];

  return { index, seen: vus.includes(index) ? [index] : [...vus, index] };
}
