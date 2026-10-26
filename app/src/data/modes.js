/* Les deux modes de séance. Classique est la génération du jour, telle
   qu'elle existe ; Athlean X sera un programme fixe à part, avec son propre
   chrono et sa propre promesse — le cap des 25 minutes ne vaut que pour
   Classique.

   Le mode n'est pas un réglage enregistré : l'app rouvre toujours sur
   Classique. Retenir Athlean X d'une veille ferait de l'usage quotidien une
   exception à décocher chaque matin. */
export const MODES = [
  { id: "classique", label: "CLASSIQUE" },
  { id: "athleanX", label: "ATHLEAN X" },
];

export const MODE_PAR_DEFAUT = "classique";
