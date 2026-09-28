/* L'équivalence poussée / tirage.
   =============================

   Une table figée, et rien d'autre. Pas un moteur, pas une fonction
   générique : deux règles de trois sur des nombres arbitrés par Martin.

   La règle qu'elle sert est dans `CLAUDE.md` : toute séance qui contient un
   créneau de poussée contient un créneau de tirage. La table dit **de quelle
   taille** — sans elle, « ajoute du tirage » se recopierait à la main séance
   par séance et dériverait au premier ajustement.

   Lecture : un créneau de poussée de 15 à 20 pompes s'équilibre par l'un de
   ces quatre créneaux. Ce sont des équivalences d'effort, pas de répétitions :
   3 tractions coûtent ce que coûtent 17 pompes, et c'est tout ce que le
   nombre dit.

   **Ce que la table ne sait pas**, et qu'il vaut mieux lire ici que découvrir
   plus tard : elle traite toute poussée comme une pompe. Les pompes piquées
   sont plus dures et comptent pareil. Affiner demanderait un coefficient par
   exercice de poussée aussi, ce qui n'a pas été demandé — à faire le jour où
   une séance en pompes piquées pures paraîtra sous-dosée en tirage. */

/* Le créneau de poussée de référence, tel que Martin l'a posé. */
export const POUSSEE_REF = { min: 15, max: 20 };

/* Son milieu, qui sert aux calculs. Prendre le milieu plutôt qu'une borne
   évite de trancher entre deux lectures également défendables de « 15–20 ». */
export const POUSSEE_PIVOT = (POUSSEE_REF.min + POUSSEE_REF.max) / 2;

/* Combien de répétitions de ce tirage équilibrent le créneau de référence. */
export const TIRAGE_EQUIVALENT = {
  pullups: 3,
  chinups: 5,
  tiragesHorizontaux: 6,
  tiragesHorizontauxSup: 10,
};

export const estTirageCompte = (ex) => Object.prototype.hasOwnProperty.call(TIRAGE_EQUIVALENT, ex);

/* Ce que `n` répétitions de ce tirage valent en répétitions de poussée. */
export function enEquivalentPoussee(ex, n) {
  const q = TIRAGE_EQUIVALENT[ex];
  return q ? (n * POUSSEE_PIVOT) / q : 0;
}

/* Le nombre de répétitions de ce tirage qui équilibre `poussee` répétitions
   de poussée. Rendu brut, sans arrondi : c'est une cible à arbitrer, pas une
   ligne de séance — les nombres écrits dans le catalogue restent choisis à la
   main pour tenir la forme du format. */
export function tirageEquivalent(ex, poussee) {
  const q = TIRAGE_EQUIVALENT[ex];
  return q ? (poussee * q) / POUSSEE_PIVOT : null;
}
