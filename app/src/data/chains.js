/* Les chaînes de régressions — le mouvement varie, pas le volume.
   ==============================================================

   Deux axes de difficulté existent dans l'app, et les confondre est l'erreur
   à ne pas commettre :

   - les **modes** (HUMAN / WARRIOR / BEAST) font varier le nombre de
     répétitions du même mouvement — c'est `levels.js` ;
   - les **chaînes** font varier le mouvement lui-même, à volume identique.

   Ils sont indépendants et se combinent : on peut être en BEAST sur des
   pompes sur les genoux. Le plancher d'entrée du catalogue — 4 tractions et
   12 pompes en HUMAN — n'est pas un problème de volume, et le baisser ne
   l'aurait pas réglé.

   Une chaîne est une liste ordonnée du plus accessible au plus dur. Rien
   d'autre : pas de niveau, pas de seuil, pas de « cran de référence ».
   L'exercice que le catalogue prescrit est un cran comme les autres, et il
   n'est pas forcément le premier ni le dernier — sur les burpees, le
   catalogue prescrit deux crans différents selon la séance.

   **Un exercice ne porte pas sa chaîne, il en est membre.** L'appartenance
   se déduit de la liste, comme les schémas moteurs se déduisent de
   l'exercice. Écrire la chaîne sur chaque membre aurait donné cinq copies à
   maintenir pour les pompes, et cinq occasions de divergence.

   **Tous les crans d'une chaîne portent les mêmes schémas moteurs.** Ce n'est
   pas une observation, c'est la condition pour que la substitution reste
   honnête : la grille de couverture hebdomadaire dit ce que la semaine a
   travaillé, et une variante classée autrement lui ferait dire faux. C'est
   pour ça que les chin-ups ne partagent pas la chaîne des pull-ups.

   Ce que ce fichier ne fait pas : substituer. Le choix d'une variante par le
   pratiquant, et son application à tout le catalogue, se règlent depuis
   l'écran de bibliothèque, qui n'existe pas encore (étape 9). Tant qu'il
   n'existe pas, ces chaînes sont une donnée que l'app lit sans l'appliquer. */

export const CHAINS = [
  ["pompesMur", "pompesInclinees", "pompesGenoux", "pompes", "pompesPiedsSureleves"],
  ["pompesPiqueesPartielles", "pompesPiquees", "pompesPiqueesPiedsSureleves"],
  ["suspensionActive", "tiragesOmoplates", "pullupsNegatifs", "pullupsElastique", "pullups"],
  ["chinupsNegatifs", "chinupsElastique", "chinups"],
  ["burpeesSansSautNiPompe", "burpeesSansPompe", "burpees", "burpeesLongueur"],
  ["vupsGenouxFlechis", "vupsUneJambe", "vups"],
  ["sdtUneJambeAppui", "sdtUneJambe"],
];

const PLACE = new Map();
CHAINS.forEach((chain) => chain.forEach((id, step) => PLACE.set(id, { chain, step })));

/* La chaîne d'un exercice, ou `null` s'il n'en a pas. La plupart n'en ont
   pas : un squat ou une planche se régressent en amplitude, ce qui est une
   consigne et non une autre entrée de bibliothèque. */
export const chainOf = (id) => (PLACE.has(id) ? PLACE.get(id).chain : null);

export const stepOf = (id) => (PLACE.has(id) ? PLACE.get(id).step : -1);

/* Le cran d'un plus accessible, `null` au bas de la chaîne. */
export const regressionOf = (id) => (PLACE.has(id) ? PLACE.get(id).chain[PLACE.get(id).step - 1] ?? null : null);

/* Le cran d'un plus dur, `null` en haut. C'est ce que l'app proposera de
   franchir, sur les mêmes signaux que la montée de mode (étape 12). */
export const progressionOf = (id) => (PLACE.has(id) ? PLACE.get(id).chain[PLACE.get(id).step + 1] ?? null : null);
