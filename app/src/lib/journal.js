/* Ce que le journal accepte d'écrire.
   =================================

   Une date ne porte qu'une ligne, et `writeEntry` écrit par remplacement. Tant
   que la séance jouée est celle du jour, ça n'a aucune conséquence : les
   écritures successives — fin du chrono, finisher, ressenti, relecture des
   chiffres — complètent la même ligne.

   Mais la séance s'écrit à la **date du jour**, alors que l'onglet peut porter
   le thème d'un autre jour. Lancer le thème de jeudi un mercredi déjà entraîné
   écrasait donc la séance du matin : son nom, son thème, son mode et son chrono
   partaient, et ses chiffres restaient — accrochés au nom d'une autre séance,
   ce qui est pire qu'une perte franche.

   Le refus est donc la seule réponse honnête en attendant que le journal sache
   porter plusieurs séances par jour (brief section 3.1). Une séance de plus sur
   une date déjà prise n'est pas représentable : on ne l'enregistre pas, et on
   le dit. */

export const entreeA = (log, d) => log.find((e) => e.d === d) || null;

/* Vrai si écrire `nom` à cette date détruirait une autre séance déjà là.
   La même séance ne se détruit pas elle-même : c'est le cas normal, celui des
   écritures qui complètent la ligne au fil de la séance. */
export function ecraserait(log, d, nom) {
  const avant = entreeA(log, d);
  return !!(avant && avant.w !== nom);
}
