import { f, h, st } from "./items.js";
import { labelOf } from "./exercises.js";

/* Le bloc pubalgie.
   ===============

   Deux mouvements, cinq minutes : une isométrie de flexion de hanche en
   quatre maintiens de 45 s, deux par jambe, puis deux minutes de dead bug.

   Ce n'est pas du contenu de séance et ça ne se génère pas. C'est une case à
   cocher avant de lancer le chrono, au même endroit et de la même façon que
   l'échauffement — et comme lui, le bloc est **hors des 25 minutes** que
   promet le nom de l'app. Le corps de séance ne bouge pas d'une ligne.

   Il se joue après l'échauffement et avant la séance : un travail d'activation
   se fait sur un corps chaud mais pas cuit, et placé à la fin il serait celui
   qu'on passe.

   Deux phases et non une, parce que les intervalles diffèrent — 45 s d'un
   côté, 60 s de l'autre. C'est le chrono qui doit marquer les changements de
   jambe et de série, sinon la prescription n'est qu'une phrase et personne ne
   tient les 45 s.

   Le dead bug se prescrit ici au temps alors que la bibliothèque le compte en
   répétitions : une minute lente n'est pas un nombre de reps, et l'exercice ne
   change pas d'unité pour autant. Sa ligne est donc une note, dont le texte se
   lit dans la table — un renommage la suivra. */

export const ISO_SEC = 45;
export const DB_SEC = 60;

const jambe = (txt) => st(h(ISO_SEC, "flexionHancheIso"), f(txt));
const serie = () => st(f(labelOf("deadBugs")));

export const CORRECTIF = [
  { t:"cycle", sec:ISO_SEC, loops:1, corr:true, label:"Pubalgie",
    stations:[jambe("Jambe droite"), jambe("Jambe gauche"), jambe("Jambe droite"), jambe("Jambe gauche")] },
  { t:"cycle", sec:DB_SEC, loops:1, corr:true, label:"Pubalgie",
    stations:[serie(), serie()] },
];

/* L'autre moitié de la prévention, et elle ne se coche pas : le dead bug est
   aussi prescrit par les séances elles-mêmes, pour les semaines où la case
   reste décochée.

   Il est garanti par le contenu et non par le tirage — toutes les séances du
   jeudi et du vendredi en portent une ligne, donc la semaine en voit deux quoi
   qu'il arrive. Passer par le générateur aurait donné une préférence, pas une
   garantie, et une préférence sur un correctif ne vaut pas grand-chose. */
export const CORRECTIF_HEBDO = "deadBugs";
export const JOURS_CORRECTIF = [4, 5];
