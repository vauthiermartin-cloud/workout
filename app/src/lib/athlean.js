/* Le chrono d'Athlean X. Un moteur à part, qui ne partage rien avec
   `chrono.js` : là-bas des formats (EMOM, Tabata, escalier) dont une phase
   peut dépendre du pratiquant ; ici une seule forme, une suite d'étapes à
   durée fixe — pré-départ, exercice, transition, exercice, …

   Le moteur ne lit jamais l'horloge lui-même : chaque fonction reçoit `now`
   en millisecondes, et l'écran lui passe une horloge monotone. Il ne compte
   pas non plus ses battements. Il tient une échéance — l'instant où l'étape
   en cours se termine — et la suivante s'enchaîne sur l'échéance de la
   précédente, jamais sur l'instant où le battement l'a remarquée : un
   battement en retard ne décale rien.

   Différence assumée avec le chrono Classique : une app endormie ne gèle pas
   la séance. Les échéances continuent de tomber, et au retour l'écran est à
   l'étape où le temps l'a menée. Ce qui ne doit jamais arriver, c'est que les
   signaux qu'on n'a pas entendus soient rejoués en rafale — voir `RETARD`. */

export const DEPART = 5;
export const EXERCICE = 60;
export const TRANSITION = 5;

/* Le WARNING sonne quand il reste 10 s d'exercice. La spec le veut réglable
   à 5 ou 10 s ; c'est un paramètre de `demarrer`, et le réglage persistant
   viendra avec l'écran qui le commande. */
export const WARNING = 10;

/* Un signal en retard de plus d'une seconde ne dit plus rien du moment qu'il
   annonçait. Au retour d'arrière-plan, tous ceux qui sont tombés pendant
   l'absence sont donc perdus, sauf ceux de la dernière seconde. */
export const RETARD = 1000;

/* Le déroulé d'une séance : pré-départ, puis les exercices séparés de
   transitions, et aucune transition après le dernier. */
export function deroule(noms, { exercice = EXERCICE } = {}) {
  const etapes = [{ t: "depart", sec: DEPART }];
  noms.forEach((nom, i) => {
    if (i > 0) etapes.push({ t: "transition", sec: TRANSITION });
    etapes.push({ t: "exercice", nom, sec: exercice });
  });
  return etapes;
}

export const dureeTotale = (etapes) => etapes.reduce((a, e) => a + e.sec, 0);

/* Un bloc libre : l'échauffement avant la séance, les étirements après. Une
   seule minuterie et une liste à suivre à ton rythme, comme dans le chrono
   Classique. Il ne compte pas dans la durée de la séance — les 34:40 et
   26:00 du spec sont sans échauffement. */
export const bloc = (nom, sec, liste, sous = null) => ({ t: "bloc", nom, sec, liste, sous });

export const dureeSeance = (etapes) => dureeTotale(etapes.filter((e) => e.t !== "bloc"));

/* Les signaux d'une étape, datés par le temps qui reste avant son échéance.
   Le pré-départ et les transitions comptent à rebours, un TICK par seconde
   affichée, puis GO à zéro. L'exercice ne sonne qu'une fois, au WARNING, et
   un bloc libre comme lui : cinq minutes de TICK n'annonceraient rien.
   Une frontière entre deux étapes ne porte jamais les signaux des deux : la
   fin d'un exercice est muette, le GO appartient à la transition. */
function signauxDe(etape, warning) {
  if (etape.t === "exercice" || etape.t === "bloc") return warning < etape.sec ? [{ son: "WARNING", r: warning }] : [];
  const s = [];
  for (let r = etape.sec; r >= 1; r--) s.push({ son: "TICK", r });
  s.push({ son: "GO", r: 0 });
  return s;
}

/* `vu` est l'instant jusqu'où les signaux ont été traités. Il ne recule
   jamais, et c'est toute la garantie contre le double bip : un signal n'est
   émis que s'il tombe après `vu`.

   Démarrer place `vu` juste avant l'instant présent, pour que le premier TICK
   du pré-départ sonne sous le doigt — c'est aussi lui qui confirme que le
   son a été déverrouillé. */
export function demarrer(etapes, now, warning = WARNING) {
  return { etapes, warning, idx: 0, fin: now + etapes[0].sec * 1000, vu: now - 1, pause: null };
}

export const fini = (run) => run.idx >= run.etapes.length;
export const restantes = (run) => run.etapes.length - run.idx;

/* Avance jusqu'à `now`, en franchissant autant d'étapes que le temps en a
   consumé, et rend les signaux à émettre. */
export function avancer(run, now) {
  if (run.pause !== null || fini(run)) return { run, signaux: [] };
  const { etapes, warning } = run;
  let { idx, fin, vu } = run;
  const signaux = [];
  while (idx < etapes.length) {
    const borne = Math.min(now, fin);
    signauxDe(etapes[idx], warning).forEach(({ son, r }) => {
      const at = fin - r * 1000;
      if (at > vu && at <= borne && at >= now - RETARD) signaux.push({ son, idx });
    });
    if (now < fin) break;
    /* Passage naturel : `vu` se pose juste avant la frontière, pour que le
       signal qui ouvre l'étape suivante — le premier TICK d'une transition —
       soit encore devant lui. */
    vu = fin - 1;
    idx += 1;
    if (idx < etapes.length) fin += etapes[idx].sec * 1000;
  }
  return { run: { ...run, idx, fin, vu: Math.max(vu, now) }, signaux };
}

/* La pause gèle tout, tout de suite : ce qui serait tombé entre le dernier
   battement et le doigt sur le bouton est perdu, et c'est voulu. */
export function mettreEnPause(run, now) {
  if (run.pause !== null || fini(run)) return run;
  const r = avancer(run, now).run;
  return fini(r) ? r : { ...r, pause: r.fin - now };
}

/* Reprendre recale l'échéance sur le temps restant exact. `vu` repart de
   l'instant de la reprise : rien d'antérieur ne peut ressonner. */
export function reprendre(run, now) {
  if (run.pause === null) return run;
  return { ...run, fin: now + run.pause, vu: now, pause: null };
}

/* Redémarre l'étape `idx` à son plein temps. En pause, elle reste en pause,
   pleine. `vu = now` : le signal qui ouvrirait l'étape ne sonne pas, le geste
   n'en déclenche aucun. */
function relancer(run, idx, now) {
  if (idx >= run.etapes.length) return { ...run, idx, pause: null, vu: now };
  const ms = run.etapes[idx].sec * 1000;
  return run.pause !== null
    ? { ...run, idx, pause: ms, fin: now + ms, vu: now }
    : { ...run, idx, fin: now + ms, vu: now };
}

/* Suivant : l'étape d'après, à son plein temps. Passer la dernière termine. */
export const passer = (run, now) => (fini(run) ? run : relancer(run, run.idx + 1, now));

/* Précédent : l'étape en cours repart de zéro. Pas de retour à l'étape
   d'avant — la spec l'exclut, et l'index ne bouge pas. */
export const recommencer = (run, now) => (fini(run) ? run : relancer(run, run.idx, now));

/* Ce qui survit à un redémarrage de l'app : l'étape, et le temps qui lui
   restait. Ni échéance ni `vu` — ils sont exprimés dans l'horloge monotone,
   qui repart de zéro à chaque chargement et ne voudrait plus rien dire. */
export const instantane = (run, now) =>
  ({ idx: run.idx, restant: run.pause !== null ? run.pause : Math.max(0, run.fin - now) });

/* La séance retrouvée, en pause, là où elle a été laissée. Le temps passé
   app fermée ne compte pas : on ne sait pas s'il a été passé à s'entraîner.
   C'est la même règle que le chrono Classique — position retenue au dernier
   battement, et c'est le pratiquant qui relance. Rien ne sonne avant. */
export function restaurer(etapes, snap, now, warning = WARNING) {
  if (!snap || !Number.isInteger(snap.idx) || snap.idx < 0 || snap.idx >= etapes.length) return null;
  const plein = etapes[snap.idx].sec * 1000;
  const restant = Math.min(plein, Math.max(0, Number(snap.restant) || 0));
  return { etapes, warning, idx: snap.idx, fin: now + restant, vu: now, pause: restant };
}

/* Ce que l'écran affiche. Le pré-départ et les transitions montrent en grand
   l'exercice qui arrive ; l'exercice montre le sien, et « ensuite » dès la
   première seconde. */
export function ecran(run, now) {
  if (fini(run)) return null;
  const { etapes, idx } = run;
  const e = etapes[idx];
  const ms = run.pause !== null ? run.pause : run.fin - now;
  const prochain = etapes.slice(idx + 1).find((x) => x.t === "exercice");
  /* Un bloc montre son propre nom et sa liste ; avant la séance, « ensuite »
     annonce déjà le premier exercice. */
  const propre = e.t === "exercice" || e.t === "bloc";
  return {
    t: e.t,
    restant: Math.max(0, Math.ceil(ms / 1000)),
    titre: propre ? e.nom : prochain ? prochain.nom : "",
    ensuite: propre && prochain ? prochain.nom : null,
    liste: e.t === "bloc" ? e.liste : null,
    sous: e.t === "bloc" ? e.sous : null,
    enPause: run.pause !== null,
  };
}

/* Les trois sons, et la vibration qui les double. Elle n'existe qu'en
   complément : aucun signal ne vibre sans sonner. Il n'y a pas de quatrième
   son à la fin d'un exercice — le spec source en prévoyait un, Martin a gardé
   les trois du backlog (2026-10-26). */
export const SONS = {
  TICK:    { freq: 880,  ms: 80,  vibre: 15 },
  GO:      { freq: 1320, ms: 320, vibre: 120 },
  WARNING: { freq: 660,  ms: 260, vibre: [60, 60, 60] },
};

/* Ce que produit un signal selon l'interrupteur de son : le son et sa
   vibration, ou rien. Son coupé, la vibration se tait avec lui — sinon elle
   deviendrait la seule alerte, ce que la règle interdit. */
export const effet = ({ son }, actif) => (actif ? SONS[son] : null);
