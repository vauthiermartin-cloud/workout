/* Le chrono ne compte pas ses battements, il lit l'horloge : c'est ce qui le
   garde juste quand iOS ralentit l'onglet. La contrepartie est qu'une app
   suspendue puis relancée voit un bond de temps qu'il ne faut jamais
   interpréter comme des phases terminées.

   Deux notions distinctes :
   - le `run`, enregistrement d'une séance en cours, façonné comme une ligne de
     table pour survivre au verrouillage de l'écran et au redémarrage de l'app ;
   - le `beat`, dernier battement réellement observé. Un trou entre deux
     battements ne peut venir que d'une app endormie. */

/* Un trou de plus de 4 s entre deux battements signe une suspension. Le
   battement tourne à 100 ms : aucun ralentissement normal n'atteint ce seuil. */
export const SUSPEND_GAP = 4;

/* Au-delà, une séance retrouvée est trop vieille pour être reprise telle quelle. */
export const RESUME_WINDOW = 4 * 3600;

export function phaseDur(p) {
  if (p.t === "cycle") return p.sec * p.stations.length * (p.loops || 1);
  if (p.t === "tabata") return (p.work + p.rest) * p.rounds;
  if (p.t === "up") return null;
  return p.sec;
}

/* Le plafond d'un chrono libre borne la phase sans en fixer la durée. */
export const phaseLimit = (p) => (p.t === "up" ? p.cap : phaseDur(p));

export function planDur(plan) {
  const durs = plan.map(phaseDur);
  return durs.some((d) => d === null) ? null : durs.reduce((a, b) => a + b, 0);
}

export function newRun(ctx, now = Date.now()) {
  return { ...ctx, idx: 0, phaseStart: now, paused: false, suspended: false, at: 0, seenAt: now, startedAt: now, done: 0 };
}

/* Le temps de chrono réellement fait, une fois la phase en cours comptée.

   Il s'accumule dans l'enregistrement au lieu de se déduire du plan, et ce
   n'est pas de la prudence : sur un format à durée ouverte — l'escalier, les
   50 burpees — c'est le pratiquant qui arrête la phase, et sa durée n'est
   écrite nulle part. Déduire du plan aurait donné la seule réponse fausse
   précisément là où le chiffre est intéressant.

   L'échauffement en est exclu, comme partout ailleurs : les 25 minutes que
   promet le nom de l'app sont celles de la séance. Les pauses et les
   suspensions le sont aussi, `elapsed` ne comptant que le temps observé. */
export function doneWith(run, elapsed) {
  const ph = run.plan[run.idx];
  if (!ph || ph.warm) return run.done || 0;
  return (run.done || 0) + Math.min(elapsed, phaseLimit(ph));
}

export const newBeat = (now = Date.now()) => ({ at: 0, seenAt: now });

export const elapsedIn = (run, now) => (run.paused ? run.at : (now - run.phaseStart) / 1000);

/* Les quatre issues d'un battement. `suspended` est le cas du téléphone
   verrouillé : la phase n'est pas finie, l'app a seulement dormi, et la
   position à retenir est celle du dernier battement observé. */
export function verdict(run, beat, now) {
  if (run.suspended) return { kind: "suspended", elapsed: run.at };
  if (run.paused) return { kind: "paused", elapsed: run.at };
  if ((now - beat.seenAt) / 1000 > SUSPEND_GAP) return { kind: "suspended", elapsed: beat.at };
  const elapsed = elapsedIn(run, now);
  const limit = phaseLimit(run.plan[run.idx]);
  if (elapsed >= limit) return { kind: "complete", elapsed: limit };
  return { kind: "running", elapsed };
}

export const beatAt = (run, now) => ({ at: elapsedIn(run, now), seenAt: now });

export const suspendRun = (run, at) => ({ ...run, paused: true, suspended: true, at });
export const pauseRun = (run, now) => ({ ...run, paused: true, suspended: false, at: elapsedIn(run, now) });

/* Reprendre replace le départ de phase pour que la position retrouvée soit
   exactement celle qu'on affichait. */
export const resumeRun = (run, now) => ({
  ...run, paused: false, suspended: false, phaseStart: now - run.at * 1000,
});

/* Quitter une phase la solde dans le temps fait. Le chrono n'avance jamais en
   arrière, donc rien ne se recompte. */
export const goToPhase = (run, idx, now, elapsed = 0) => ({
  ...run, idx, paused: false, suspended: false, at: 0, phaseStart: now,
  done: doneWith(run, elapsed),
});

export const isOver = (run) => run.idx >= run.plan.length;

/* L'enregistrement à écrire : le run plus la position vivante du battement.
   `seenAt` en fait partie — sans lui, l'app relue croirait n'avoir jamais
   battu et se déclarerait suspendue dès le premier rendu. */
export const record = (run, beat) => ({
  ...run, at: run.paused ? run.at : beat.at, seenAt: beat.seenAt,
});

export const beatOf = (rec) => ({ at: rec.at || 0, seenAt: rec.seenAt || 0 });

export function resumableKind(rec, now = Date.now()) {
  if (!rec || !Array.isArray(rec.plan) || !rec.plan.length || isOver(rec)) return null;
  return (now - rec.startedAt) / 1000 <= RESUME_WINDOW ? "resume" : "stale";
}

/* « Tu étais à la minute 12 sur 25 » : le repère qui permet de décider s'il
   faut reprendre la phase ou passer à la suivante. L'échauffement reste hors
   du compte — les 25 minutes que promet le nom de l'app sont celles de la
   séance. Null sur un plan dont la durée dépend de toi, il n'y a alors rien
   d'honnête à afficher. */
export function position(run, elapsed) {
  const durs = run.plan.filter((p) => !p.warm).map(phaseDur);
  if (!durs.length || durs.some((d) => d === null)) return null;
  const totalMin = Math.max(1, Math.round(durs.reduce((a, b) => a + b, 0) / 60));
  const ph = run.plan[run.idx];
  if (ph.warm) return { minute: 0, total: totalMin, warm: true };
  const done = run.plan.slice(0, run.idx).filter((p) => !p.warm)
    .reduce((a, p) => a + phaseDur(p), 0);
  const secs = done + Math.min(elapsed, phaseDur(ph));
  return { minute: Math.min(Math.floor(secs / 60) + 1, totalMin), total: totalMin, warm: false };
}
