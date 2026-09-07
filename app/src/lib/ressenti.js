/* Le retour de fin de séance : « C'était comment ? », trois réponses, un tap.
   C'est la seule donnée qui dit si le dosage est juste. Le volume de
   répétitions, lui, ne dit que ce qui était prescrit.

   Le module est pur et sans React : le moteur de calibration viendra lire ces
   mêmes valeurs sur l'historique, il n'a pas à connaître l'écran. */

export const RESSENTIS = [
  { id: "facile", label: "TROP FACILE" },
  { id: "juste", label: "JUSTE" },
  { id: "dur", label: "TROP DUR" },
];

export const isRessenti = (v) => RESSENTIS.some((r) => r.id === v);

/* Ce que la réponse change immédiatement à l'écran. C'est ce qui empêche la
   question de ressembler à un sondage : elle a un effet visible tout de suite,
   pas seulement dans une statistique dans six semaines.

   - facile  → le finisher devient l'action principale, tiré d'emblée
   - juste    → écran inchangé, finisher proposé normalement
   - dur      → aucun finisher, on passe aux étirements. Insister auprès de
                quelqu'un qui vient de dire que c'était trop dur est le
                meilleur moyen de le faire arrêter.
   - absent  → écran inchangé : ne pas répondre n'est pas une réponse. */
export function finisherStance(ressenti) {
  if (ressenti === "dur") return "aucun";
  if (ressenti === "facile") return "principal";
  return "normal";
}

/* La question ne se pose qu'une fois par séance, sur le premier écran de fin,
   et pas du tout si la séance a été arrêtée en route : le ressenti porterait
   alors sur quelque chose d'incomplet. */
export function askRessenti({ stage, aborted }) {
  return stage === "workout" && !aborted;
}
