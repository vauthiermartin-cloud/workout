/* La saisie des reps d'une séance Athlean X (F-15).
   ================================================

   Une ligne par passage, dans l'ordre où la séance s'est jouée : un exercice
   repris au deuxième tour a deux lignes, une par tour (arbitrage de Martin,
   2026-10-26). La baisse d'un tour à l'autre est ce que le suivi de
   progression voudra lire.

   Ce qui s'enregistre suit la forme de F-14, une clé par id du spec, mais la
   valeur est une liste — un nombre par passage, dans l'ordre :
     { "A-1.1": [14, 12], "A-1.3": [20] }
   Un champ laissé vide vaut `null` et garde sa place : [14, null] dit que le
   deuxième passage n'a pas été noté, pas qu'il n'y en a eu qu'un. Un
   exercice dont aucun passage n'est noté n'a pas de clé. La clé est l'id du
   spec, jamais l'id maison : un renommage dans la bibliothèque ne périme
   rien. */

import { seanceAthlean, etapesAthlean, compositionAthlean } from "../data/seancesAthlean.js";

/* Les passages de la séance jouée — pas le catalogue : seulement ses
   exercices, autant de fois qu'elle les joue, l'échauffement à part. */
export function passagesDe(workoutId, mode) {
  const s = seanceAthlean(workoutId, mode);
  if (!s) return [];
  const libelles = Object.fromEntries(s.phases.map((p) => [p.id, p.label]));
  const vus = {};
  return etapesAthlean(workoutId, mode)
    .filter((e) => e.t === "exercice")
    .map((e) => {
      vus[e.sourceId] = (vus[e.sourceId] || 0) + 1;
      return { sourceId: e.sourceId, ex: e.ex, nom: e.nom, phase: e.phase, phaseLabel: libelles[e.phase], tour: vus[e.sourceId] };
    });
}

/* Ce que vaut un champ. Aucune plausibilité (hors scope de F-15) : un
   nombre entier positif ou nul, sinon rien. */
export function lireSaisie(texte) {
  const t = String(texte ?? "").trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

/* Les champs du récap, dans l'ordre des passages, rendus en `reps`. */
export function repsDeSaisie(passages, valeurs) {
  const reps = {};
  passages.forEach((p, i) => {
    (reps[p.sourceId] = reps[p.sourceId] || []).push(lireSaisie(valeurs[i]));
  });
  Object.keys(reps).forEach((k) => { if (reps[k].every((n) => n === null)) delete reps[k]; });
  return reps;
}

/* Le récap rangé comme la fiche : par bloc, chaque exercice avec ses champs,
   un par passage. Le tour se lit à la phase — TOUR 1, TOUR 2, et FIN pour le
   correctif que BUILD et DEFINE jouent après le deuxième tour. Chaque champ
   garde l'indice de son passage : c'est toujours `repsDeSaisie` qui lit les
   valeurs, dans l'ordre joué. */
const TOURS = { round1: "TOUR 1", round2: "TOUR 2", finisher: "FIN" };

export function saisieParBloc(workoutId, mode) {
  const passages = passagesDe(workoutId, mode);
  const blocs = compositionAthlean(workoutId, mode);
  if (!blocs) return [];
  return blocs.map((b) => ({
    numero: b.numero,
    titre: b.titre,
    exercices: b.exercices.map((e) => ({
      sourceId: e.sourceId,
      nom: e.nom,
      champs: passages.flatMap((p, i) => (p.sourceId === e.sourceId
        ? [{ i, tour: TOURS[p.phase], colonne: p.phase === "round2" ? 2 : 1 }] : [])),
    })),
  }));
}
