import { EXERCISES } from "./exercises.js";

/* Seuils conventionnels, pas issus d'un protocole établi. */
export const LEVELS = [
  { id:1, name:"REPRISE", need:0, desc:"Volume de base" },
  { id:2, name:"RÉGULIER", need:12, desc:"+25 % de reps" },
  { id:3, name:"SOLIDE", need:16, desc:"+50 % de reps" },
];

export function scaleRep(n, lvl) {
  if (lvl <= 1) return n;
  const l2 = Math.max(Math.round(n * 1.25), n + 1);
  return lvl === 2 ? l2 : Math.max(Math.round(n * 1.5), l2 + 1);
}

/* Les coefficients portent sur les répétitions, pas encore sur les durées. Tant
   que « 30 s de planche » était du texte libre, le mode ne pouvait pas
   l'atteindre ; depuis que les maintiens portent un nombre, ne rien dire aurait
   suffi à leur appliquer +50 % en silence, et une planche à 45 s déborde de la
   minute d'EMOM.

   Que les maintiens progressent eux aussi est décidé (brief section 5, étape 5
   du phasage) : ils y gagneront leur propre coefficient, et le plan de chrono
   devra suivre puisque la durée des phases ne bouge pas avec le mode. C'est ici
   que ça se branchera, et nulle part ailleurs.

   `montee` dit si le nombre affiché doit se signaler comme relevé : un maintien
   inchangé ne doit pas se colorer en mode élevé. */
export function scaleItem(it, lvl) {
  const ex = EXERCISES[it.ex];
  const fixe = !ex || ex.unit !== "reps";
  return { n: fixe ? it.n : scaleRep(it.n, lvl), montee: !fixe && lvl > 1 };
}
