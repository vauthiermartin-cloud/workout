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
