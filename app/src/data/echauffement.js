import { f } from "./items.js";

/* L'échauffement, le même pour les deux modes : cinq minutes à ton rythme,
   hors de la séance — hors des 25 minutes du Classique comme des durées
   d'Athlean X (le spec source §8 le veut hors du timer principal). */
export const ECHAUFFEMENT_SEC = 300;

export const ECHAUFFEMENT = [
  f("Squats latéraux"), f("Élévations latérales de jambe"),
  f("30 s de deep squat", "Talons au sol, coudes contre l'intérieur des genoux, tu pousses vers l'extérieur"),
];
