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

   Elle sert à relire le bilan d'un autre jour de la semaine en cours, et ne
   dépend que de la semaine : un onglet porte sa date, qu'on le regarde un mardi
   ou un dimanche. Le week-end tombe dans la semaine qu'il termine, `mondayOf`
   s'en charge.

   Le week-end n'a pas d'onglet à lui pour autant. Ce que devient une séance
   faite un samedi est une question de journal, pas de calendrier : voir
   `entreeDeLOnglet` dans `lib/journal.js`. */
export const isoOfWeekday = (ref, dayKey) => {
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
