/* Une ligne de séance : soit un exercice compté (n reps de t), soit du texte libre. */
export const r = (n, t, d) => ({ n, t, d });
export const f = (txt, d) => ({ txt, d });

/* Une station de chrono = une liste de lignes. */
export const st = (...items) => items;
export const x5 = (s) => [s, s, s, s, s];
