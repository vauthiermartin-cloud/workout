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
             (AMRAP, escalier ouvert). Le nombre de tours se saisit d'abord :
             c'est lui qui commande. Le bloc rend ensuite ses exercices en
             champs `ex` ordinaires, dont l'attendu se déduit des tours au lieu
             d'être prescrit (`de` nomme le champ de tours dont ils dépendent).
             Un tour entamé et non fini se corrige alors ligne par ligne, comme
             sur n'importe quel autre bilan.
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
      const i = ouverts.length;
      const k = `tours:${i}`;
      const pas = p.pas || 0;
      const parEx = new Map();
      lignes.forEach((it) => parEx.set(it.ex, (parEx.get(it.ex) || 0) + scaleItem(it, level).n));
      ouverts.push({
        bloc: {
          kind: "tours", k, label: p.label, unit: "tours", prescrit: null, pas,
          /* Les maintiens comptent pour 0 : 30 s de planche ne sont pas
             30 répétitions, et le total d'un tour se dit en répétitions. */
          lignes: [...parEx].map(([ex, n]) => (EXERCISES[ex].unit === "reps" ? n : 0)),
        },
        exs: [...parEx].map(([ex, n]) => ({
          kind: "ex", k: `t${i}:${ex}`, ex, unit: EXERCISES[ex].unit,
          prescrit: null, de: k, n, pas,
        })),
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
  /* Le champ de tours d'abord, ses exercices ensuite : l'ordre de saisie est
     celui de la dépendance, on ne remplit pas des lignes avant leur tour. */
  ouverts.forEach(({ bloc, exs }) => {
    champs.push({ ...bloc, parTour: bloc.lignes.reduce((a, b) => a + b, 0) });
    exs.forEach((c) => champs.push(c));
  });
  if (wod && wod.test) champs.push({
    kind: "score", k: "score", label: wod.testLabel,
    unit: (wod.score && wod.score.unit) || "reps", prescrit: null,
  });
  return champs;
}

/* Ce qu'une ligne de bloc ouvert vaut pour un nombre de tours donné. Un
   escalier ajoute `pas` répétitions à chaque tour : la somme des tours 1 à t
   vaut t fois le tour 1, plus le triangle des paliers. Rend `null` tant que les
   tours ne sont pas dits — il n'y a alors pas d'attendu, pas un attendu nul. */
export function attenduDe(champ, tours) {
  if (tours === undefined || tours === null || tours === "") return null;
  const t = Number(tours);
  return champ.n * t + champ.pas * ((t * (t - 1)) / 2);
}

/* Ce qu'il faut afficher dans le champ : la valeur relue si elle existe, le
   prescrit sinon. Un champ jamais relu n'est pas un champ à zéro. Sur un bloc
   ouvert, l'attendu se déduit des tours déjà relus. */
export function valeurDe(champ, perfs) {
  const v = perfs ? perfs[champ.k] : undefined;
  if (v !== undefined && v !== null) return v;
  if (champ.de) return attenduDe(champ, perfs ? perfs[champ.de] : null);
  return champ.prescrit;
}

/* Ce que devient la feuille quand un champ change. Un champ de tours entraîne
   les lignes de son bloc : les chiffrer à la main après avoir dit ses tours
   serait faire deux fois le même calcul.

   `corriges` retient les lignes déjà touchées, qui ne suivent plus — un chiffre
   tapé est une mesure, et rectifier ses tours ne doit pas l'effacer. */
export function saisieApres(champs, saisie, k, valeur, corriges) {
  const o = { ...saisie, [k]: valeur };
  champs.forEach((c) => {
    if (c.de !== k || corriges.has(c.k)) return;
    const a = attenduDe(c, valeur);
    o[c.k] = a === null ? "" : String(a);
  });
  return o;
}

/* Ce qu'il faut écrire quand on quitte la saisie sans valider. Sortir ne doit
   rien perdre — un chiffre tapé est une donnée, et « local d'abord, jamais
   perdue » ne fait pas d'exception pour la porte de sortie.

   Mais seuls les champs **modifiés** partent. Les champs `ex` sont préremplis
   avec le prescrit : les écrire tous aurait fabriqué une mesure que personne
   n'a faite, et un total prescrit enregistré comme réel est pire qu'un total
   absent. D'où la comparaison avec l'état initial plutôt qu'avec le vide.

   Rend `null` quand rien n'a bougé : il n'y a alors rien à écrire. */
export function correctionsDe(champs, saisie, initial, perfsAvant) {
  const modifies = champs.filter((c) => saisie[c.k] !== initial[c.k]);
  if (!modifies.length) return null;
  const perfs = { ...perfsAvant };
  const o = {};
  modifies.forEach((c) => {
    const v = saisie[c.k] === "" ? null : Number(saisie[c.k]);
    if (c.kind === "score") o.s = v;
    else if (v === null) delete perfs[c.k];
    else perfs[c.k] = v;
  });
  o.perfs = perfs;
  return o;
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
      if (c.unit !== "reps") return;
      /* Un bloc ouvert compte par ses lignes et non par ses tours : c'est le
         même volume tant que rien n'est corrigé, et le bon dès qu'un tour
         entamé a été repris ligne à ligne. */
      const v = valeurDe(c, perfs);
      if (v === null || v === undefined) { complet = false; return; }
      total += v;
    } else if (c.kind === "score" && c.unit === "reps") {
      if (score === undefined || score === null) complet = false;
      else total += score;
    }
  });
  return { total, complet };
}
