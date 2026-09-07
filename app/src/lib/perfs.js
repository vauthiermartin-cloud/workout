/* La feuille de perfs : ce qu'une séance sait faire saisir après coup.
   ====================================================================

   La séance est écrite dès la fin du chrono. Cet écran **corrige** la ligne, il
   ne la crée pas : une séance quittée avant d'y passer reste enregistrée, ce que
   « local d'abord, jamais perdue » exige.

   Trois natures de champ, et la distinction n'est pas cosmétique :

   - `ex`    un exercice et son total pour la séance. Le prescrit est connu, donc
             le champ est prérempli et on n'y touche que si la réalité a différé.
             Le total est celui de la séance entière, pas d'une série : c'est le
             seul niveau où le chiffre se retient encore une fois le chrono fermé.
   - `tours` un bloc dont le nombre de tours est le résultat, pas la consigne
             (AMRAP, escalier ouvert). Ce qu'on ajuste est le nombre de tours et
             non les répétitions d'un tour — un tour se termine ou ne se termine
             pas.
   - `score` le chiffre du test du vendredi. Il ne va pas dans `perfs` mais dans
             le champ `s` de la ligne, qui existait avant et que les stats lisent.

   Une note (`f`) n'est jamais un champ : rien à compter, rien à saisir. C'est le
   typage des lignes qui rend cette feuille possible — auparavant « 30 s de
   planche » était une phrase et l'écran n'aurait pas su quoi en proposer.

   Les clés de champ partent en base dans les exports : ne pas les renommer. */

import { TIMERS } from "../data/timers.js";
import { WORKOUT_BY_NAME } from "../data/workouts.js";
import { EXERCISES } from "../data/exercises.js";
import { scaleItem } from "../data/levels.js";
import { roundsOfPhase } from "./volume.js";

export function perfsOf(name, level) {
  const wod = WORKOUT_BY_NAME[name];
  const totaux = new Map();
  const ouverts = [];

  (TIMERS[name] || []).forEach((p) => {
    const lignes = (p.stations ? p.stations.flat() : p.list || []).filter((it) => it.ex !== undefined);
    if (!lignes.length) return;
    /* Un cycle répète toute sa séquence de stations ; une liste tient son
       nombre de tours de sa consigne, ou ne le tient pas du tout. */
    const tours = p.stations ? p.loops || 1 : roundsOfPhase(p);
    if (tours === null) {
      ouverts.push({
        kind: "tours", k: `tours:${ouverts.length}`, label: p.label, unit: "tours",
        prescrit: null, pas: p.pas || 0,
        /* Les maintiens comptent pour 0 : 30 s de planche ne sont pas
           30 répétitions, et le total d'un tour se dit en répétitions. */
        lignes: lignes.map((it) => (EXERCISES[it.ex].unit === "reps" ? scaleItem(it, level).n : 0)),
      });
      return;
    }
    lignes.forEach((it) => {
      totaux.set(it.ex, (totaux.get(it.ex) || 0) + scaleItem(it, level).n * tours);
    });
  });

  const champs = [];
  totaux.forEach((n, ex) => champs.push({
    kind: "ex", k: `s:${ex}`, ex, unit: EXERCISES[ex].unit, prescrit: n,
  }));
  ouverts.forEach((c) => champs.push({ ...c, parTour: c.lignes.reduce((a, b) => a + b, 0) }));
  if (wod && wod.test) champs.push({
    kind: "score", k: "score", label: wod.testLabel,
    unit: (wod.score && wod.score.unit) || "reps", prescrit: null,
  });
  return champs;
}

/* Ce qu'il faut afficher dans le champ : la valeur relue si elle existe, le
   prescrit sinon. Un champ jamais relu n'est pas un champ à zéro. */
export function valeurDe(champ, perfs) {
  const v = perfs ? perfs[champ.k] : undefined;
  return v === undefined || v === null ? champ.prescrit : v;
}

/* Le volume réellement fait, quand la séance a été relue. `volumeOf` dit ce qui
   était prescrit, ce qui reste la bonne réponse avant la relecture — et la seule
   possible sur un format à tours ouverts dont on ignore le nombre de tours.

   `complet` est faux dès qu'un chiffre manque encore : le total serait alors
   plus faux que le prescrit, mieux vaut ne pas le montrer. */
export function volumeReel(name, level, perfs, score) {
  let total = 0, complet = true;
  perfsOf(name, level).forEach((c) => {
    if (c.kind === "ex") {
      if (c.unit === "reps") total += valeurDe(c, perfs) || 0;
    } else if (c.kind === "tours") {
      const t = perfs ? perfs[c.k] : null;
      if (t === undefined || t === null) { complet = false; return; }
      /* Un escalier ajoute `pas` répétitions par ligne à chaque tour : la somme
         des tours 1 à t vaut t fois le tour 1, plus le triangle des paliers. */
      const lignes = c.lignes.filter((n) => n > 0);
      total += lignes.reduce((a, n) => a + n * t, 0)
        + c.pas * lignes.length * ((t * (t - 1)) / 2);
    } else if (c.kind === "score" && c.unit === "reps") {
      if (score === undefined || score === null) complet = false;
      else total += score;
    }
  });
  return { total, complet };
}
