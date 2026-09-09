export const pad = (x) => String(x).padStart(2, "0");
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

export function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/* Le jour de semaine dans la numérotation des onglets : 1 = lundi, 7 = dimanche.
   Pas celle de JavaScript, où dimanche vaut 0 et casse tout tri naïf. */
export const weekdayOf = (d) => ((d.getDay() + 6) % 7) + 1;

/* La date derrière un onglet de jour, dans la semaine de `ref`.
   ==========================================================

   Elle sert à relire le bilan d'un autre jour de la semaine en cours. Le
   week-end n'a pas d'onglet — l'app va du lundi au vendredi — et une séance
   faite un samedi doit malgré tout garder son bilan atteignable : elle se
   rattache donc au jour de `ref` lui-même, et non à un lundi qui n'a rien vu. */
export const isoOfWeekday = (ref, dayKey) => {
  if (weekdayOf(ref) > 5) return iso(ref);
  const d = mondayOf(ref);
  d.setDate(d.getDate() + dayKey - 1);
  return iso(d);
};

export const daysBetween = (a, b) => Math.round((b - a) / 86400000);
export const shortFr = (s) => { const d = fromIso(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };

export const mmss = (s) => {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};
