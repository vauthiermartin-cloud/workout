import { EXERCISES, idOfSource, labelOf } from "./exercises.js";
import { bloc, deroule } from "../lib/athlean.js";
import { ECHAUFFEMENT, ECHAUFFEMENT_SEC } from "./echauffement.js";
import { STRETCHES } from "./stretches.js";

/* Les séances d'Athlean X : Workout A et B, chacun en trois modes.
   =================================================================

   Contenu figé, recopié de `perfect_home_workout_spec_v2.md` (§4 et §5) et
   écrit avec les identifiants de ce document — « A-1.1 », jamais l'id
   maison. C'est `idOfSource` qui fait le lien avec la bibliothèque : la table
   de F-12.5 proposait des ids maison dont sept n'existent pas, les doublons
   ayant été fusionnés.

   Rien ne se génère : changer une séance, c'est changer ces données.

   Le catalogue d'une séance est rangé par groupe, dans l'ordre du spec : les
   groupes 1 à 5 sont le travail, le groupe 6 le correctif. Les trois modes
   s'en déduisent :

     NORMAL  le catalogue entier, deux fois — 16 + 16
     BUILD   les groupes 1 à 5, puis la sélection BUILD, puis le correctif
     DEFINE  les groupes 1 à 5, puis la sélection DEFINE, puis le correctif

   Les sélections du deuxième tour sont à part du catalogue (spec §7) : on les
   change sans toucher à la liste des exercices. */

export const WORKOUTS_ATHLEAN = {
  A: {
    groupes: [
      ["A-1.1", "A-1.2", "A-1.3"],
      ["A-2.1", "A-2.2", "A-2.3"],
      ["A-3.1", "A-3.2", "A-3.3"],
      ["A-4.1", "A-4.2", "A-4.3"],
      ["A-5.1", "A-5.2", "A-5.3"],
    ],
    correctif: "A-6.1",
    /* Le nom de chaque bloc, dans l'ordre des groupes : français d'abord,
       le groupe du spec en seconde ligne. */
    titres: [
      { fr: "Squat", en: "Anterior Lower — Squat" },
      { fr: "Poussée", en: "Upper Push" },
      { fr: "Postérieure", en: "Posterior Lower — Hinge" },
      { fr: "Tirage", en: "Upper Pull" },
      { fr: "Abdos", en: "Abs" },
    ],
    tour2: {
      BUILD:  ["A-1.1", "A-1.2", "A-2.1", "A-2.2", "A-3.1", "A-4.1", "A-4.3", "A-5.1"],
      DEFINE: ["A-1.3", "A-2.1", "A-2.2", "A-3.2", "A-3.3", "A-4.1", "A-4.3", "A-5.3"],
    },
  },
  B: {
    groupes: [
      ["B-1.1", "B-1.2", "B-1.3"],
      ["B-2.1", "B-2.2", "B-2.3"],
      ["B-3.1", "B-3.2", "B-3.3"],
      ["B-4.1", "B-4.2", "B-4.3"],
      ["B-5.1", "B-5.2", "B-5.3"],
    ],
    correctif: "B-6.1",
    titres: [
      { fr: "Postérieure", en: "Posterior Lower — Hinge" },
      { fr: "Poussée", en: "Upper Push" },
      { fr: "Fente", en: "Anterior Lower — Lunge" },
      { fr: "Tirage", en: "Upper Pull" },
      { fr: "Abdos", en: "Abs" },
    ],
    tour2: {
      BUILD:  ["B-1.1", "B-1.3", "B-2.1", "B-2.3", "B-3.1", "B-4.1", "B-4.2", "B-5.2"],
      DEFINE: ["B-1.2", "B-2.1", "B-2.2", "B-3.1", "B-3.3", "B-4.1", "B-4.2", "B-5.2"],
    },
  },
};

export const MODES_ATHLEAN = ["NORMAL", "BUILD", "DEFINE"];

export const TITRE_CORRECTIF = { fr: "Correctif", en: "Corrective" };

/* Les libellés de phase sont en français, comme tout ce que montre le
   chrono ; le spec les donne en anglais (Full Body, Strength Focus, Hybrid
   Focus, Corrective). */
const PHASES = {
  round1:   "Tour 1 — corps entier",
  normal2:  "Tour 2 — corps entier",
  build2:   "Tour 2 — force",
  define2:  "Tour 2 — hybride",
  finisher: "Correctif",
};

const phase = (id, label, exerciseIds) => ({ id, label, exerciseIds });

/* La séance au format du spec §6 : des phases d'ids du spec. */
export function seanceAthlean(workoutId, mode) {
  const w = WORKOUTS_ATHLEAN[workoutId];
  if (!w || !MODES_ATHLEAN.includes(mode)) return null;
  const travail = w.groupes.flat();
  const phases = mode === "NORMAL"
    ? [
        phase("round1", PHASES.round1, [...travail, w.correctif]),
        phase("round2", PHASES.normal2, [...travail, w.correctif]),
      ]
    : [
        phase("round1", PHASES.round1, travail),
        phase("round2", mode === "BUILD" ? PHASES.build2 : PHASES.define2, w.tour2[mode]),
        phase("finisher", PHASES.finisher, [w.correctif]),
      ];
  return { workoutId, mode, phases };
}

/* La liste chronologique que joue le chrono : pré-départ, exercices,
   transitions — y compris entre deux phases, jamais après le dernier.
   `deroule` fait la forme ; chaque étape d'exercice reçoit en plus son id
   maison, son id du spec et sa phase, que la saisie des reps (F-15) lira dans
   l'ordre où la séance a été jouée. Le nom est le libellé français de la
   bibliothèque.

   Avec `echauffement`, le bloc d'échauffement du Classique ouvre la liste,
   avant le pré-départ. Il ne change rien à la séance elle-même : mêmes
   exercices, même `dureeSeance`. */
export function etapesAthlean(workoutId, mode, { echauffement = false } = {}) {
  const s = seanceAthlean(workoutId, mode);
  if (!s) return null;
  const tete = echauffement ? [bloc("Échauffement", ECHAUFFEMENT_SEC, ECHAUFFEMENT, "À ton rythme")] : [];
  const joues = s.phases.flatMap((p) => p.exerciseIds.map((sourceId) => ({ sourceId, phase: p.id, phaseLabel: p.label })));
  const ids = joues.map(({ sourceId }) => idOfSource(sourceId));
  let i = 0;
  return [...tete, ...deroule(ids.map(labelOf)).map((e) => {
    if (e.t !== "exercice") return e;
    const k = i++;
    return { ...e, ex: ids[k], sourceId: joues[k].sourceId, phase: joues[k].phase, phaseLabel: joues[k].phaseLabel };
  })];
}

/* Les schémas moteurs qu'une séance Athlean X a travaillés : ceux de ses
   exercices, comme pour une séance Classique. Ils comptent dans la
   couverture de la semaine. */
export function patternsAthlean(workoutId, mode) {
  const e = etapesAthlean(workoutId, mode);
  if (!e) return [];
  return [...new Set(e.filter((x) => x.t === "exercice").flatMap((x) => EXERCISES[x.ex].patterns))];
}

/* Les étirements après une séance Athlean X : les mêmes séquences que le
   Classique, jouées comme lui — un bloc de cinq minutes qui en déroule la
   liste. Les deux workouts sont corps entier : on suggère l'enchaînement
   complet (Martin, 2026-10-26), les autres restent à un geste. */
export const ETIREMENT_SUGGERE = "flow";

export const etirementSuggere = () => STRETCHES.find((s) => s.id === ETIREMENT_SUGGERE);

export const etirementSuivant = (courant) =>
  STRETCHES[(STRETCHES.findIndex((s) => s.id === courant.id) + 1) % STRETCHES.length];

export const etapesEtirement = (seq) =>
  [bloc("Étirements", 300, seq.blocks.map((b) => ({ txt: `${b.items[0].txt} — ${b.tag.toLowerCase()}` })), seq.name)];

/* La composition d'une séance, telle que la montre la fiche avant de lancer :
   les six blocs du programme — trois exercices chacun, le correctif seul —,
   et pour chaque exercice le nombre de fois que la séance le joue. Sans mode
   choisi, ce nombre est inconnu (`null`) : le programme est le même, seul le
   deuxième tour change. */
export function compositionAthlean(workoutId, mode = null) {
  const w = WORKOUTS_ATHLEAN[workoutId];
  if (!w) return null;
  const s = mode ? seanceAthlean(workoutId, mode) : null;
  const joues = s ? s.phases.flatMap((p) => p.exerciseIds) : null;
  const exercice = (sourceId) => {
    const ex = idOfSource(sourceId);
    return { sourceId, ex, nom: labelOf(ex), nameEn: EXERCISES[ex].nameEn,
      passages: joues ? joues.filter((x) => x === sourceId).length : null };
  };
  return [
    ...w.groupes.map((ids, i) => ({ numero: i + 1, titre: w.titres[i], exercices: ids.map(exercice) })),
    { numero: w.groupes.length + 1, titre: TITRE_CORRECTIF, exercices: [exercice(w.correctif)] },
  ];
}
