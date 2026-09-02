/* Les étiquettes ne sont jamais saisies à la main sur les séances :
   elles se déduisent des exercices, donc elles ne peuvent pas dériver. */
export const PATTERNS = [
  { id:"poussee", label:"POUSSÉE" },
  { id:"tirage", label:"TIRAGE" },
  { id:"supination", label:"SUPINATION" },
  { id:"squat", label:"SQUAT" },
  { id:"unilat", label:"UNILATÉRAL" },
  { id:"hinge", label:"POSTÉRIEURE" },
  { id:"core", label:"SANGLE" },
  { id:"cardio", label:"CARDIO" },
  { id:"mobilite", label:"MOBILITÉ" },
  { id:"mollets", label:"MOLLETS" },
];

export const EX_PATTERNS = {
  "pompes":["poussee"],
  "pompes piquées":["poussee"],
  "pull-ups":["tirage"],
  "chin-ups":["tirage","supination"],
  "relevés de genoux suspendu":["tirage","core"],
  "air squats":["squat"],
  "jump squats":["squat","cardio"],
  "fentes arrière":["unilat"],
  "fentes marchées":["unilat"],
  "fentes croisées":["unilat"],
  "ponts fessiers":["hinge"],
  "ponts fessiers sur une jambe":["hinge","unilat"],
  "superman":["hinge"],
  "montées sur pointes":["mollets"],
  "burpees":["cardio"],
  "burpee":["cardio"],
  "burpees sautés en longueur":["cardio"],
  "burpees genou diagonal":["cardio"],
  "mountain climbers":["cardio","core"],
  "mountain climbers croisés":["cardio","core"],
  "sauts mogul":["cardio","core"],
  "swings latéraux":["core","mobilite"],
  "sweeps":["mobilite","core"],
  "hollow to sweep":["mobilite","core"],
  "bear crawl to thread the needle":["mobilite","core"],
  "sit-ups":["core"],
  "V-ups":["core"],
  "ciseaux":["core"],
  "corkscrews":["core"],
  "dead bugs":["core"],
  "crunchs inversés":["core"],
  "relevés de jambes au sol":["core"],
  "russian twists":["core"],
  "shoulder taps en gainage":["core"],
};

/* Les lignes en texte libre (« 30 s de planche ») sont classées par mot-clé. */
export const TXT_PATTERNS = [
  [/planche|gainage|hollow/i, ["core"]],
  [/burpee/i, ["cardio"]],
];

export function patternsOfWorkout(w) {
  const s = new Set();
  w.blocks.forEach((b) => b.items.forEach((it) => {
    if (it.t && EX_PATTERNS[it.t]) EX_PATTERNS[it.t].forEach((p) => s.add(p));
    else if (it.txt) TXT_PATTERNS.forEach(([re, ps]) => { if (re.test(it.txt)) ps.forEach((p) => s.add(p)); });
  }));
  return [...s];
}

/* Mêmes règles, appliquées à un plan de chrono plutôt qu'à une fiche. */
export function patternsOfTimer(phases) {
  const s = new Set();
  const item = (it) => {
    if (it.t && EX_PATTERNS[it.t]) EX_PATTERNS[it.t].forEach((p) => s.add(p));
    else if (it.txt) TXT_PATTERNS.forEach(([re, ps]) => { if (re.test(it.txt)) ps.forEach((p) => s.add(p)); });
  };
  phases.forEach((p) => {
    if (p.stations) p.stations.forEach((station) => station.forEach(item));
    if (p.list) p.list.forEach(item);
    if (p.sub) TXT_PATTERNS.forEach(([re, ps]) => { if (re.test(p.sub)) ps.forEach((x) => s.add(x)); });
  });
  return [...s];
}
