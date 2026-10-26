/* Le journal d'Athlean X.
   ======================

   Une clé à part, `workout.athlean`, et non une ligne de plus dans le journal
   Classique (arbitrage de Martin, 2026-10-26). Le journal Classique ne tient
   qu'une séance par date et l'écrit par remplacement : Athlean X le soir d'un
   matin Classique y aurait été refusé, et l'import, qui fusionne par date,
   aurait gardé l'une et perdu l'autre. Ici, une liste : autant de séances par
   jour qu'on en fait.

   Une séance Athlean X compte comme une séance Classique (Martin,
   2026-10-26) : série, semaine, mois, 28 jours et donc niveau suggéré,
   couverture des schémas moteurs, détail du récap. Ce qui reste au Classique
   seul est ce qu'Athlean X n'a pas : ressenti, test du vendredi, finisher,
   étirements, revue de qualité.

   Une entrée a la forme du spec F-14 :
     { date, type: "athleanX", workoutId: "A" | "B", mode, reps }
   plus `str`, le nom de la séquence d'étirements quand elle a été faite —
   le même champ que sur une ligne Classique.
   `reps` a pour clés les ids du spec (« A-1.1 »), jamais l'id maison : un
   renommage dans la bibliothèque ne la périme pas. Vide tant que la saisie
   (F-15) n'existe pas. */

import { RESUME_WINDOW } from "./chrono.js";
import { MODES_ATHLEAN, etapesAthlean } from "../data/seancesAthlean.js";

export const TYPE_ATHLEAN = "athleanX";

export const entreeAthlean = (date, workoutId, mode, reps = {}) =>
  ({ date, type: TYPE_ATHLEAN, workoutId, mode, reps });

/* Le dernier workout joué, ou null. La liste est écrite dans l'ordre où les
   séances se terminent, mais un import peut y mêler des séances plus
   anciennes : c'est la date qui départage, l'ordre d'écriture ensuite. */
export function dernierWorkout(entrees) {
  let dernier = null;
  entrees.forEach((e) => { if (!dernier || e.date >= dernier.date) dernier = e; });
  return dernier ? dernier.workoutId : null;
}

/* Le workout de la prochaine séance : l'opposé du dernier, ou null quand rien
   n'a jamais été joué — c'est alors au pratiquant de choisir. L'alternance ne
   suit pas le calendrier : sauter trois jours ou jouer un samedi ne change
   rien, seule compte la dernière séance faite. */
export function workoutPropose(entrees) {
  const d = dernierWorkout(entrees);
  return d === null ? null : d === "A" ? "B" : "A";
}

/* Une entrée lisible, ou rien. L'import accepte ce qu'on lui colle : mieux
   vaut écarter une ligne abîmée que d'y lire un workout « undefined » qui
   fausserait l'alternance. */
export const entreeValide = (e) =>
  !!e && e.type === TYPE_ATHLEAN && typeof e.date === "string" && (e.workoutId === "A" || e.workoutId === "B");

/* L'import fusionne sans doublon. Une séance se reconnaît à sa date, son
   workout et son mode — pas à l'entrée entière : une sauvegarde faite avant
   les étirements porte la même séance sans `str`, et la compter deux fois
   doublerait la séance dans tous les compteurs. Pour chaque séance ainsi
   reconnue, on garde le côté qui en a le plus (deux A · BUILD le même jour
   restent deux) ; à égalité, celui qui porte le plus d'étirements, puis le
   journal local. Deux séances différentes d'un
   même jour restent deux. */
const cle = (e) => `${e.date}|${e.workoutId}|${e.mode}`;
const parCle = (liste) => {
  const m = new Map();
  liste.filter(entreeValide).forEach((e) => m.set(cle(e), [...(m.get(cle(e)) || []), e]));
  return m;
};
const poids = (g) => [g.length, g.filter((e) => e.str).length];
export function fusionner(local, importees) {
  const l = parCle(local), i = parCle(importees);
  return [...new Set([...l.keys(), ...i.keys()])]
    .flatMap((k) => {
      const a = l.get(k) || [], b = i.get(k) || [];
      const [na, sa] = poids(a), [nb, sb] = poids(b);
      return na > nb || (na === nb && sa >= sb) ? a : b;
    })
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/* Les séances, Classique et Athlean X, sous la forme que lisent les
   compteurs (`d`) : série, semaine, mois, 28 jours, huit dernières semaines.
   Une entrée Athlean X vaut une séance. Sans séance Athlean X, c'est le
   journal Classique tel quel. */
export const joursEntraines = (log, entrees) =>
  (entrees.length ? [...log, ...entrees.map((e) => ({ d: e.date }))] : log);

/* La séance Athlean X laissée en cours, telle que l'écrit le chrono dans
   `workout.athleanRun` : workout, mode, date et instant de départ,
   échauffement ou non (il décale les étapes), étape et temps restant. Même règle que le chrono Classique : reprenable sous
   quatre heures, au-delà seulement enregistrable ou abandonnée. Null pour
   un enregistrement illisible ou une séance déjà au bout. */
export function repriseAthlean(rec, now = Date.now()) {
  if (!rec || (rec.workoutId !== "A" && rec.workoutId !== "B") || !MODES_ATHLEAN.includes(rec.mode)) return null;
  if (typeof rec.d !== "string" || typeof rec.startedAt !== "number" || !Number.isInteger(rec.idx)) return null;
  if (rec.idx < 0 || rec.idx >= etapesAthlean(rec.workoutId, rec.mode, { echauffement: !!rec.echauffement }).length) return null;
  return (now - rec.startedAt) / 1000 <= RESUME_WINDOW ? "resume" : "stale";
}
