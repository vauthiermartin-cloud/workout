import { r, f, st, x5 } from "./items.js";

/* Plans de chrono. Une séance = une suite de phases.
   cycle  : intervalles fixes (EMOM), une station par intervalle
   tabata : alternance effort / repos
   down   : compte à rebours (AMRAP, test, repos)
   up     : chrono qui monte, avec un plafond (travail « pour le temps ») */
export const TIMERS = {
  /* Lundi */
  "EMOM 25": [{ t:"cycle", sec:60, label:"EMOM 25", stations:[
    st(r(8,"burpees")), st(r(15,"air squats")), st(r(12,"pompes")),
    st(r(20,"fentes arrière")), st(r(4,"pull-ups")),
  ], loops:5 }],
  "EMOM 20": [{ t:"cycle", sec:60, label:"EMOM 20", stations:[
    st(r(10,"burpees")), st(r(20,"fentes arrière")), st(r(12,"pompes")),
    st(r(5,"chin-ups")), st(r(30,"mountain climbers")),
  ], loops:4 }],
  "EMOM 21": [{ t:"cycle", sec:60, label:"EMOM 21", stations:[
    st(r(8,"burpees")), st(r(12,"pompes")), st(r(3,"pull-ups")),
  ], loops:7 }],
  "EMOM 20 sol": [{ t:"cycle", sec:60, label:"EMOM 20 sol", stations:[
    st(r(12,"swings latéraux")), st(r(20,"sauts mogul")), st(r(8,"hollow to sweep")),
    st(r(8,"relevés de genoux suspendu")), st(r(20,"shoulder taps en gainage")),
  ], loops:4 }],
  "EMOM 20 explosif": [{ t:"cycle", sec:60, label:"EMOM 20 explosif", stations:[
    st(r(6,"burpees sautés en longueur")), st(r(16,"fentes marchées")), st(r(12,"jump squats")),
    st(f("30 s de planche")), st(r(4,"pull-ups")),
  ], loops:4 }],

  /* Mardi */
  "Escalier montant": [{ t:"cycle", sec:60, bloc:5, label:"Escalier montant", stations:[
    ...x5(st(r(2,"burpees"), r(6,"pompes"), r(8,"jump squats"))),
    ...x5(st(r(3,"burpees"), r(8,"pompes"), r(10,"jump squats"))),
    ...x5(st(r(4,"burpees"), r(10,"pompes"), r(12,"jump squats"))),
    ...x5(st(r(5,"burpees"), r(12,"pompes"), r(14,"jump squats"))),
  ], loops:1 }],
  "Escalier descendant": [{ t:"cycle", sec:60, bloc:5, label:"Escalier descendant", stations:[
    ...x5(st(r(5,"burpees"), r(12,"pompes"), r(16,"air squats"))),
    ...x5(st(r(4,"burpees"), r(10,"pompes"), r(14,"air squats"))),
    ...x5(st(r(3,"burpees"), r(8,"pompes"), r(12,"air squats"))),
    ...x5(st(r(2,"burpees"), r(6,"pompes"), r(10,"air squats"))),
  ], loops:1 }],
  "Escalier ouvert": [{ t:"down", sec:1200, label:"Escalier ouvert", sub:"Round 1, puis +1 rep partout", list:[
    r(1,"burpee"), r(2,"pompes"), r(3,"air squats"),
  ] }],
  "Escalier croisé": [{ t:"cycle", sec:60, bloc:5, label:"Escalier croisé", stations:[
    ...x5(st(r(2,"burpees genou diagonal"), r(10,"fentes croisées"))),
    ...x5(st(r(3,"burpees genou diagonal"), r(12,"fentes croisées"))),
    ...x5(st(r(4,"burpees genou diagonal"), r(14,"fentes croisées"))),
    ...x5(st(r(5,"burpees genou diagonal"), r(16,"fentes croisées"))),
  ], loops:1 }],
  "Escalier tirage": [{ t:"cycle", sec:60, bloc:5, label:"Escalier tirage", stations:[
    ...x5(st(r(2,"burpees"), r(3,"chin-ups"))),
    ...x5(st(r(3,"burpees"), r(3,"chin-ups"))),
    ...x5(st(r(4,"burpees"), r(20,"montées sur pointes"))),
    ...x5(st(r(5,"burpees"), r(20,"montées sur pointes"))),
  ], loops:1 }],

  /* Mercredi */
  "5 rounds": [{ t:"up", cap:1500, label:"5 rounds", sub:"1 tour, à répéter 5 fois", list:[
    r(40,"mountain climbers"), r(30,"air squats"), r(20,"sit-ups"),
    r(20,"fentes arrière"), r(10,"pompes"), r(3,"pull-ups"),
  ] }],
  "4 rounds lourds": [{ t:"up", cap:1500, label:"4 rounds", sub:"1 tour, à répéter 4 fois", list:[
    r(50,"mountain climbers"), r(40,"air squats"), r(30,"sit-ups"),
    r(20,"fentes arrière"), r(10,"pompes"), r(5,"chin-ups"),
  ] }],
  "Chipper": [{ t:"up", cap:1500, label:"Chipper", sub:"Dans l'ordre, une ligne à la fois", list:[
    r(100,"mountain climbers"), r(80,"air squats"), r(60,"sit-ups"),
    r(40,"fentes arrière"), r(30,"pompes"), r(20,"burpees"), r(10,"pull-ups"),
  ] }],
  "Tours explosifs": [{ t:"up", cap:1500, label:"4 tours explosifs", sub:"1 tour, à répéter 4 fois", list:[
    r(12,"burpees sautés en longueur"), r(20,"fentes marchées"), r(20,"jump squats"),
    r(30,"mountain climbers"), f("30 s de planche"),
  ] }],
  "Tours au sol": [{ t:"up", cap:1500, label:"4 tours au sol", sub:"1 tour, à répéter 4 fois", list:[
    r(6,"bear crawl to thread the needle"), r(20,"ponts fessiers"), r(10,"ponts fessiers sur une jambe"),
    r(20,"mountain climbers croisés"), r(12,"superman"), r(10,"pompes"),
  ] }],

  /* Jeudi */
  "2 × AMRAP 10": [
    { t:"down", sec:600, label:"AMRAP A", sub:"Max de tours", list:[
      r(5,"pull-ups"), r(10,"pompes"), r(15,"air squats") ] },
    { t:"rest", sec:180, label:"Repos" },
    { t:"down", sec:600, label:"AMRAP B", sub:"Max de tours", list:[
      r(10,"fentes arrière"), r(15,"sit-ups"), r(20,"mountain climbers") ] },
  ],
  "AMRAP 20": [{ t:"down", sec:1200, label:"AMRAP 20", sub:"Max de tours", list:[
    r(5,"pull-ups"), r(10,"burpees"), r(15,"pompes"), r(20,"air squats"),
  ] }],
  "3 × AMRAP 6": [
    { t:"down", sec:360, label:"Bloc A", sub:"Max de tours", list:[r(10,"pompes"), r(10,"sit-ups")] },
    { t:"rest", sec:120, label:"Repos" },
    { t:"down", sec:360, label:"Bloc B", sub:"Max de tours", list:[r(8,"fentes arrière"), r(8,"jump squats")] },
    { t:"rest", sec:120, label:"Repos" },
    { t:"down", sec:360, label:"Bloc C", sub:"Max de tours", list:[r(3,"pull-ups"), r(6,"burpees")] },
  ],
  "AMRAP 18 au sol": [{ t:"down", sec:1080, label:"AMRAP 18", sub:"Max de tours", list:[
    r(12,"sauts mogul"), r(8,"sweeps"), r(10,"V-ups"), r(8,"pompes"),
  ] }],
  "AMRAP 20 poussée-tirage": [{ t:"down", sec:1200, label:"AMRAP 20", sub:"Max de tours", list:[
    r(6,"pompes piquées"), r(4,"pull-ups"), r(4,"chin-ups"), r(10,"pompes"),
  ] }],

  /* Vendredi */
  "Test 4 min + finisher": [
    { t:"down", sec:240, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"up", cap:900, label:"4 rounds", sub:"1 tour, à répéter 4 fois", list:[
      r(15,"air squats"), r(10,"pompes"), r(5,"pull-ups"), r(20,"mountain climbers") ] },
  ],
  "Test 3 min + EMOM 12": [
    { t:"down", sec:180, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"cycle", sec:60, label:"EMOM 12", stations:[
      st(r(5,"chin-ups")), st(r(20,"mountain climbers")), st(r(15,"air squats")),
    ], loops:4 },
  ],
  "50 burpees for time": [
    { t:"up", cap:480, label:"TEST", sub:"50 burpees le plus vite possible", test:true },
    { t:"rest", sec:240, label:"Repos" },
    { t:"up", cap:480, label:"3 rounds", sub:"1 tour, à répéter 3 fois", list:[
      r(10,"pompes"), r(15,"air squats"), r(3,"pull-ups"), r(15,"sit-ups") ] },
  ],
  "Test 4 min + sangle": [
    { t:"down", sec:240, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"up", cap:900, label:"3 rounds", sub:"1 tour, à répéter 3 fois", list:[
      r(12,"corkscrews"), r(16,"dead bugs"), r(20,"russian twists"),
      r(15,"crunchs inversés"), r(15,"relevés de jambes au sol"), r(20,"ciseaux") ] },
  ],
  "Test 4 min + chaîne postérieure": [
    { t:"down", sec:240, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"up", cap:900, label:"4 rounds", sub:"1 tour, à répéter 4 fois", list:[
      r(20,"ponts fessiers"), r(10,"ponts fessiers sur une jambe"), r(20,"fentes arrière"),
      r(25,"montées sur pointes"), r(12,"superman") ] },
  ],

  /* Finishers cardio */
  "EMOM 10 burpees": [{ t:"cycle", sec:60, bloc:10, label:"EMOM 10", stations:[st(r(5,"burpees"))], loops:10 }],
  "Montée jusqu'à l'échec": [{ t:"cycle", sec:60, label:"Montée", stations:[
    st(r(1,"burpee")), st(r(2,"burpees")), st(r(3,"burpees")), st(r(4,"burpees")), st(r(5,"burpees")),
    st(r(6,"burpees")), st(r(7,"burpees")), st(r(8,"burpees")), st(r(9,"burpees")), st(r(10,"burpees")),
  ], loops:1 }],
  "Tabata double": [
    { t:"tabata", work:20, rest:10, rounds:8, label:"Tabata 1", sub:"Burpees" },
    { t:"rest", sec:60, label:"Repos" },
    { t:"tabata", work:20, rest:10, rounds:8, label:"Tabata 2", sub:"Mountain climbers" },
  ],
  "Pyramide burpees": [{ t:"up", cap:480, label:"Pyramide", sub:"10 mountain climbers entre chaque palier", list:[
    f("1, 2, 3, 4, 5 burpees"), f("puis 4, 3, 2, 1 burpees"),
  ] }],
  "3 tours cardio": [{ t:"up", cap:540, label:"3 tours", sub:"1 tour, à répéter 3 fois", list:[
    r(30,"mountain climbers"), r(20,"jump squats"), r(10,"burpees"),
  ] }],
  "Descente 10 à 1": [{ t:"up", cap:600, label:"Descente 10→1", sub:"55 burpees au total", list:[
    f("10, 9, 8, 7, 6, 5, 4, 3, 2, 1"),
  ] }],
  "Explosif": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(6,"burpees sautés en longueur"), r(12,"fentes marchées"), r(20,"mountain climbers"),
  ] }],
  "Sol et saut": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(20,"sauts mogul"), r(10,"sweeps"), r(20,"mountain climbers"),
  ] }],
  "Bboy": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(8,"burpees genou diagonal"), r(10,"hollow to sweep"), r(16,"fentes croisées"),
  ] }],
  "Quadrupédie": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(6,"bear crawl to thread the needle"), r(20,"sauts mogul"), r(12,"shoulder taps en gainage"),
  ] }],

  /* Finishers abdos */
  "Le classique": [{ t:"up", cap:540, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(10,"sit-ups"), r(20,"russian twists"), r(10,"shoulder taps en gainage"),
  ] }],
  "Barre de traction": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(10,"relevés de genoux suspendu"), r(15,"sit-ups"), r(20,"russian twists"),
  ] }],
  "Gainage descendant": [
    { t:"down", sec:60, label:"Planche", sub:"Tour 1" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
    { t:"down", sec:45, label:"Planche", sub:"Tour 2" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
    { t:"down", sec:30, label:"Planche", sub:"Tour 3" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
    { t:"down", sec:15, label:"Planche", sub:"Tour 4" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
  ],
  "Profond et lent": [{ t:"up", cap:540, label:"3 tours", sub:"1 tour, à répéter 3 fois", list:[
    r(20,"dead bugs"), r(15,"crunchs inversés"), f("30 s gainage latéral par côté"),
  ] }],
  "Chaîne complète": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(12,"relevés de jambes au sol"), r(20,"mountain climbers croisés"), r(12,"superman"),
  ] }],
  "Hollow et ciseaux": [{ t:"up", cap:480, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    f("20 s hollow hold"), r(20,"ciseaux"), r(10,"V-ups"),
  ] }],
  "V-ups et compagnie": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(12,"V-ups"), r(20,"sauts mogul"), r(15,"relevés de jambes au sol"),
  ] }],
  "Bassin et vrille": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(20,"ponts fessiers"), r(12,"corkscrews"), f("30 s de planche"),
  ] }],
  "Pont et gainage": [{ t:"up", cap:480, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(15,"ponts fessiers"), r(10,"ponts fessiers sur une jambe"), r(10,"corkscrews"),
    f("20 s gainage latéral par côté"),
  ] }],
  "Swings": [{ t:"up", cap:540, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(16,"swings latéraux"), r(12,"V-ups"), f("20 s hollow hold"),
  ] }],
};
