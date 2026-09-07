/* Le retour de fin de séance : « C'était comment ? », trois réponses, un tap.
   C'est la seule donnée qui dit si le dosage est juste. Le volume de
   répétitions, lui, ne dit que ce qui était prescrit.

   Le module est pur et sans React : le moteur de calibration viendra lire ces
   mêmes valeurs sur l'historique, il n'a pas à connaître l'écran. */

/* Le `retour` est la réponse de l'app au tap. Il vit ici et non dans l'écran :
   c'est le pendant lisible de la donnée, et la seule preuve immédiate qu'on a
   été entendu. */
export const RESSENTIS = [
  { id: "facile", label: "TROP FACILE", retour: "Ok beast! On va monter d'un cran." },
  { id: "juste", label: "JUSTE", retour: "Dans ta zone, Player!" },
  { id: "dur", label: "TROP DUR", retour: "Ok le sang. On adapte la suite." },
];

export const isRessenti = (v) => RESSENTIS.some((r) => r.id === v);

export function retourDe(ressenti) {
  const r = RESSENTIS.find((x) => x.id === ressenti);
  return r ? r.retour : null;
}

/* Ce que la réponse change à la proposition de finisher.

   - dur     → aucun finisher, on passe aux étirements. Insister auprès de
               quelqu'un qui vient de dire que c'était trop dur est le
               meilleur moyen de le faire arrêter.
   - facile  → rien. Le finisher est déjà l'action principale de l'écran ; le
               tirer d'office ajoutait un bloc entier au moment précis où on
               venait de répondre, et noyait le retour. La conséquence de
               « trop facile » est différée : la montée de mode.
   - juste   → rien.
   - absent  → rien : ne pas répondre n'est pas une réponse. */
export function finisherStance(ressenti) {
  return ressenti === "dur" ? "aucun" : "normal";
}

/* La question ne se pose qu'une fois par séance, sur le premier écran de fin,
   et pas du tout si la séance a été arrêtée en route : le ressenti porterait
   alors sur quelque chose d'incomplet. */
export function askRessenti({ stage, aborted }) {
  return stage === "workout" && !aborted;
}
