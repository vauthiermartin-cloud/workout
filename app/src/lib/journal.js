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

import { iso, isoOfWeekday, weekdayOf } from "./dates.js";

export const entreeA = (log, d) => log.find((e) => e.d === d) || null;

/* La ligne que montre un onglet de jour.
   ====================================

   Un onglet montre la séance faite à **sa date**. C'est la règle, et elle ne
   souffre pas d'exception : sans ça le journal cesse d'être un agenda.

   Le week-end n'a pas d'onglet. `isoOfWeekday` repliait donc les cinq onglets
   sur la date du jour, pour qu'une séance faite un samedi garde un bilan
   atteignable. Le prix était la semaine entière : les cinq onglets montraient la
   même ligne, et le journal paraissait écrasé alors qu'il était intact.

   Une séance de week-end se range donc sous l'onglet du thème qu'elle a joué.
   Rattraper vendredi un samedi, c'est prendre la place que vendredi a laissée —
   encore faut-il qu'elle soit libre. Un vendredi déjà entraîné garde sa ligne,
   et la séance de rattrapage n'est alors relisible que dans les stats et
   l'export, en attendant qu'un jour sache porter deux séances (brief 3.1). */
export function entreeDeLOnglet(log, ref, dayKey) {
  const propre = entreeA(log, isoOfWeekday(ref, dayKey));
  if (propre || weekdayOf(ref) <= 5) return propre;
  const rattrapage = entreeA(log, iso(ref));
  return rattrapage && rattrapage.day === dayKey ? rattrapage : null;
}

/* Vrai si écrire `nom` à cette date détruirait une autre séance déjà là.
   La même séance ne se détruit pas elle-même : c'est le cas normal, celui des
   écritures qui complètent la ligne au fil de la séance. */
export function ecraserait(log, d, nom) {
  const avant = entreeA(log, d);
  return !!(avant && avant.w !== nom);
}
