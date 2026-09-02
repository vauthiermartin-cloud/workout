export const DAYS = [
  { key: 1, short: "LUN", long: "LUNDI", theme: "Densité · EMOM" },
  { key: 2, short: "MAR", long: "MARDI", theme: "Volume burpees" },
  { key: 3, short: "MER", long: "MERCREDI", theme: "Rounds chronométrés" },
  { key: 4, short: "JEU", long: "JEUDI", theme: "AMRAP" },
  { key: 5, short: "VEN", long: "VENDREDI", theme: "Test + finisher" },
];

/* Stretch par défaut selon ce que la séance du jour a chargé */
export const STRETCH_BY_DAY = { 1: "hanches", 2: "post", 3: "hanches", 4: "haut", 5: "post" };

/* Les jours déjà chargés en burpees basculent vers les abdos */
export const FINISHER_BIAS = { 1: "cardio", 2: "abdos", 3: "abdos", 4: "cardio", 5: "abdos" };
