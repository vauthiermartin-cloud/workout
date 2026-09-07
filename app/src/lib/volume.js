import { TIMERS } from "../data/timers.js";
import { EXERCISES } from "../data/exercises.js";
import { scaleRep } from "../data/levels.js";
import { iso } from "./dates.js";

/* Le nombre de tours se lit dans le libellé de la phase, pas dans une donnée
   séparée : impossible que les deux se désynchronisent. */
export function roundsOfPhase(p) {
  if (!p.list) return 0;
  /* Un test se fait une fois. Sans ce cas, les 50 burpees devenus ligne de
     travail auraient fait passer le vendredi pour un format à tours ouverts. */
  if (p.test) return 1;
  const m = (p.sub || "").match(/à répéter (\d+) fois/);
  if (m) return Number(m[1]);
  if (/une ligne à la fois/.test(p.sub || "")) return 1;
  return null; // AMRAP : le nombre de tours est le score, pas une consigne
}

/* Un maintien porte un nombre comme une série de répétitions, mais 30 secondes
   de planche ne sont pas 30 répétitions : seules les lignes comptées en reps
   entrent dans le total. Avant le typage, les maintiens étaient du texte libre
   et se trouvaient exclus par accident ; ils le sont maintenant par décision. */
const repsOf = (it, level) => {
  const ex = EXERCISES[it.ex];
  return ex && ex.unit === "reps" && it.n ? scaleRep(it.n, level) : 0;
};

export function volumeOf(name, level) {
  const phs = TIMERS[name] || [];
  let total = 0, amrap = false;
  phs.forEach((p) => {
    if (p.t === "cycle") {
      const parTour = p.stations.reduce(
        (a, s) => a + s.reduce((b, it) => b + repsOf(it, level), 0), 0);
      total += parTour * (p.loops || 1);
    } else if (p.list) {
      const n = roundsOfPhase(p);
      const parTour = p.list.reduce((a, it) => a + repsOf(it, level), 0);
      if (n === null) { amrap = true; total += parTour; } else total += parTour * n;
    }
  });
  return { total, amrap };
}

/* Série de jours ouvrés consécutifs, week-ends sautés sans casser la série. */
export function streakOf(log, today) {
  const jours = new Set(log.map((e) => e.d));
  let n = 0;
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let garde = 0; garde < 400; garde++) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) { d.setDate(d.getDate() - 1); continue; }
    if (jours.has(iso(d))) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
}
