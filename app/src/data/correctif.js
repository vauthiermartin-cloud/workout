import { f, h, st } from "./items.js";

/* Le correctif.
   ============

   Prévention de la pubalgie : une isométrie de flexion de hanche, quatre
   maintiens de 45 s, deux par jambe. Trois minutes en tout.

   Ce n'est pas du contenu de séance et ça ne se génère pas. C'est une case à
   cocher avant de lancer le chrono, au même endroit et de la même façon que
   l'échauffement — et comme lui, le bloc est **hors des 25 minutes** que
   promet le nom de l'app. Le corps de séance ne bouge pas d'une ligne.

   Il se joue après l'échauffement et avant la séance : un travail d'activation
   se fait sur un corps chaud mais pas cuit, et placé à la fin il serait celui
   qu'on passe.

   La forme est un `cycle` de quatre intervalles plutôt qu'un seul compte à
   rebours de trois minutes : c'est le chrono qui doit marquer les changements
   de jambe, sinon la prescription n'est qu'une phrase et personne ne tient les
   45 s. Le côté est une note (`f`) et non un exercice : on ne compte pas deux
   mouvements, on alterne le même. */

export const ISO_SEC = 45;
export const ISO_SERIES = 4;

const cote = (txt) => st(h(ISO_SEC, "flexionHancheIso"), f(txt));

export const CORRECTIF = {
  t: "cycle", sec: ISO_SEC, loops: 1, corr: true,
  label: "Isométrie",
  stations: [cote("Jambe droite"), cote("Jambe gauche"), cote("Jambe droite"), cote("Jambe gauche")],
};

/* L'autre moitié du correctif, et elle ne se coche pas : le dead bug vit dans
   les séances elles-mêmes. Il a pris la place du sit-up partout où une séance
   en prescrivait — le sit-up reste dans deux finishers, rien n'est perdu.

   Il est nommé ici et pas seulement dans les données de séances parce que le
   générateur doit le connaître : un correctif vaut par sa fréquence, et le
   tirage par couverture des schémas moteurs jouait contre lui. */
export const CORRECTIF_HEBDO = "deadBugs";

/* Combien de fois par semaine le générateur cherche à le faire sortir.

   Deux, et c'est un plafond mesuré, pas un souhait. Au-delà la simulation ne
   bouge plus : la couverture des schémas moteurs reste le premier critère, et
   les jours qui peuvent porter le dead bug sont au nombre de trois — lundi et
   mardi n'ont aucune ligne de sangle à lui donner. Viser trois ne ferait que
   retirer des séances de la rotation sans en faire sortir une de plus. */
export const CORRECTIF_PAR_SEMAINE = 2;
