export const pad = (x) => String(x).padStart(2, "0");
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

export function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export const daysBetween = (a, b) => Math.round((b - a) / 86400000);
export const shortFr = (s) => { const d = fromIso(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };

export const mmss = (s) => {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};
