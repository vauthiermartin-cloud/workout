import { EXERCISES } from "./exercises.js";

/* Les étiquettes ne sont jamais saisies à la main sur les séances :
   elles se déduisent des exercices, donc elles ne peuvent pas dériver. */
export const PATTERNS = [
  { id:"poussee", label:"POUSSÉE" },
  { id:"tirage", label:"TIRAGE" },
  { id:"supination", label:"SUPINATION" },
  { id:"squat", label:"SQUAT" },
  { id:"unilat", label:"UNILATÉRAL" },
  { id:"hinge", label:"POSTÉRIEURE" },
  { id:"core", label:"SANGLE" },
  { id:"cardio", label:"CARDIO" },
  { id:"mobilite", label:"MOBILITÉ" },
  { id:"mollets", label:"MOLLETS" },
];

/* Il n'y a plus de table de classification séparée : les schémas moteurs
   appartiennent à l'entité exercice. Deux tables auraient pu se
   désynchroniser, et l'une des deux le faisait déjà — « burpee » au singulier
   y était classé à part de « burpees ». */
export const patternsOfExercise = (id) => (EXERCISES[id] ? EXERCISES[id].patterns : null);

/* Il reste des lignes en texte libre qui décrivent du travail sans le compter :
   les séries en escalier (« 1, 2, 3, 4, 5 burpees »), les tests (« Max de
   burpees en 4 min »), un nom nu dans un AMRAP. Elles se classent par mot-clé
   en attendant d'être typées à leur tour.

   La règle sur les maintiens a disparu d'ici : planche, hollow hold et gainage
   latéral sont des exercices de la bibliothèque, plus des chaînes reconnues au
   passage. */
export const TXT_PATTERNS = [
  [/burpee/i, ["cardio"]],
  [/mountain climbers/i, ["cardio", "core"]],
];

const collect = (s) => (it) => {
  const ps = patternsOfExercise(it.ex);
  if (ps) ps.forEach((p) => s.add(p));
  else if (it.txt) TXT_PATTERNS.forEach(([re, x]) => { if (re.test(it.txt)) x.forEach((p) => s.add(p)); });
};

export function patternsOfWorkout(w) {
  const s = new Set();
  w.blocks.forEach((b) => b.items.forEach(collect(s)));
  return [...s];
}

/* Mêmes règles, appliquées à un plan de chrono plutôt qu'à une fiche. */
export function patternsOfTimer(phases) {
  const s = new Set();
  const item = collect(s);
  phases.forEach((p) => {
    if (p.stations) p.stations.forEach((station) => station.forEach(item));
    if (p.list) p.list.forEach(item);
    if (p.sub) TXT_PATTERNS.forEach(([re, ps]) => { if (re.test(p.sub)) ps.forEach((x) => s.add(x)); });
  });
  return [...s];
}
