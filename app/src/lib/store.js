export const K_LOG = "workout.log";
export const K_SET = "workout.settings";
export const K_BAK = "workout.lastBackup";

/* Stockage tolérant aux pannes : si localStorage refuse (navigation privée,
   quota), on retombe en mémoire pour ne pas perdre la séance en cours. */
const mem = {};

export const store = {
  get(k) {
    try {
      const v = localStorage.getItem(k);
      return v === null ? (mem[k] ?? null) : v;
    } catch {
      return mem[k] ?? null;
    }
  },
  set(k, v) {
    mem[k] = v;
    try { localStorage.setItem(k, v); return true; } catch { return false; }
  },
};
