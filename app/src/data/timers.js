import { r, h, f, st, x5 } from "./items.js";

/* Plans de chrono. Une séance = une suite de phases.
   cycle  : intervalles fixes (EMOM), une station par intervalle
   tabata : alternance effort / repos
   down   : compte à rebours (AMRAP, test, repos)
   up     : chrono qui monte, avec un plafond (travail « pour le temps ») */
export const TIMERS = {
  /* Lundi */
  "EMOM 25": [{ t:"cycle", sec:60, label:"EMOM 25", stations:[
    st(r(8,"burpees")), st(r(15,"airSquats")), st(r(12,"pompes")),
    st(r(16,"sdtUneJambe")), st(r(4,"pullups")),
  ], loops:5 }],
  "EMOM 20": [{ t:"cycle", sec:60, label:"EMOM 20", stations:[
    st(r(10,"burpees")), st(r(20,"fentesArriere")), st(r(12,"pompes")),
    st(r(5,"chinups")), st(r(20,"hipThrusts")),
  ], loops:4 }],
  "EMOM 21": [{ t:"cycle", sec:60, label:"EMOM 21", stations:[
    st(r(8,"burpees")), st(r(12,"pompes")), st(r(3,"pullups")),
  ], loops:7 }],
  "EMOM 20 sol": [{ t:"cycle", sec:60, label:"EMOM 20 sol", stations:[
    st(r(12,"swingsLateraux")), st(r(20,"sautsMogul")), st(r(8,"hollowToSweep")),
    st(r(8,"relevesGenouxSuspendu")), st(r(20,"hipThrusts")),
  ], loops:4 }],
  "EMOM 20 explosif": [{ t:"cycle", sec:60, label:"EMOM 20 explosif", stations:[
    st(r(6,"burpeesLongueur")), st(r(16,"sdtUneJambe")), st(r(12,"jumpSquats")),
    st(h(30,"planche")), st(r(4,"pullups")),
  ], loops:4 }],

  /* Mardi */
  "Escalier montant": [{ t:"cycle", sec:60, bloc:5, label:"Escalier montant", stations:[
    ...x5(st(r(2,"burpees"), r(6,"pompes"), r(8,"jumpSquats"))),
    ...x5(st(r(3,"burpees"), r(8,"pompes"), r(10,"jumpSquats"))),
    ...x5(st(r(4,"burpees"), r(10,"pompes"), r(12,"jumpSquats"))),
    ...x5(st(r(5,"burpees"), r(12,"pompes"), r(14,"jumpSquats"))),
  ], loops:1 }],
  "Escalier descendant": [{ t:"cycle", sec:60, bloc:5, label:"Escalier descendant", stations:[
    ...x5(st(r(5,"burpees"), r(12,"pompes"), r(16,"airSquats"))),
    ...x5(st(r(4,"burpees"), r(10,"pompes"), r(14,"airSquats"))),
    ...x5(st(r(3,"burpees"), r(8,"pompes"), r(16,"hipThrusts"))),
    ...x5(st(r(2,"burpees"), r(6,"pompes"), r(20,"hipThrusts"))),
  ], loops:1 }],
  /* `pas` déclare ce que la consigne dit en prose : chaque round ajoute une
     répétition à chaque ligne. Sans lui, un nombre de tours saisi après coup se
     multiplierait par le tour 1 et sous-compterait de moitié. */
  "Escalier ouvert": [{ t:"down", sec:1200, label:"Escalier ouvert", sub:"Round 1, puis +1 rep partout", pas:1, list:[
    r(1,"burpees"), r(2,"pompes"), r(3,"airSquats"),
  ] }],
  "Escalier croisé": [{ t:"cycle", sec:60, bloc:5, label:"Escalier croisé", stations:[
    ...x5(st(r(2,"burpeesGenouDiagonal"), r(10,"fentesCroisees"))),
    ...x5(st(r(3,"burpeesGenouDiagonal"), r(12,"fentesCroisees"))),
    ...x5(st(r(4,"burpeesGenouDiagonal"), r(14,"fentesCroisees"))),
    ...x5(st(r(5,"burpeesGenouDiagonal"), r(16,"fentesCroisees"))),
  ], loops:1 }],
  "Escalier tirage": [{ t:"cycle", sec:60, bloc:5, label:"Escalier tirage", stations:[
    ...x5(st(r(2,"burpees"), r(3,"chinups"), r(12,"hipThrusts"))),
    ...x5(st(r(3,"burpees"), r(3,"chinups"), r(12,"hipThrusts"))),
    ...x5(st(r(4,"burpees"), r(20,"monteesPointes"))),
    ...x5(st(r(5,"burpees"), r(20,"monteesPointes"))),
  ], loops:1 }],

  /* Mercredi */
  "5 rounds": [{ t:"up", cap:1500, label:"5 rounds", sub:"1 tour, à répéter 5 fois", list:[
    r(40,"mountainClimbers"), r(30,"airSquats"), r(20,"situps"),
    r(20,"fentesArriere"), r(10,"pompes"), r(3,"pullups"),
  ] }],
  "4 rounds lourds": [{ t:"up", cap:1500, label:"4 rounds", sub:"1 tour, à répéter 4 fois", list:[
    r(50,"mountainClimbers"), r(40,"airSquats"), r(30,"situps"),
    r(20,"fentesArriere"), r(10,"pompes"), r(5,"chinups"),
  ] }],
  "Chipper": [{ t:"up", cap:1500, label:"Chipper", sub:"Dans l'ordre, une ligne à la fois", list:[
    r(100,"mountainClimbers"), r(80,"airSquats"), r(60,"situps"),
    r(40,"fentesArriere"), r(30,"pompes"), r(20,"burpees"), r(10,"pullups"),
  ] }],
  "Tours explosifs": [{ t:"up", cap:1500, label:"4 tours explosifs", sub:"1 tour, à répéter 4 fois", list:[
    r(12,"burpeesLongueur"), r(20,"fentesMarchees"), r(20,"jumpSquats"),
    r(30,"mountainClimbers"), h(30,"planche"),
  ] }],

  "Tours au sol": [{ t:"up", cap:1500, label:"4 tours au sol", sub:"1 tour, à répéter 4 fois", list:[
    r(6,"bearCrawlThread"), r(20,"hipThrusts"), r(10,"hipThrustsUneJambe"),
    r(20,"mountainClimbersCroises"), r(12,"superman"), r(10,"pompes"),
  ] }],

  /* Jeudi */
  "2 × AMRAP 10": [
    { t:"down", sec:600, label:"AMRAP A", sub:"Max de tours", list:[
      r(5,"pullups"), r(10,"pompes"), r(15,"airSquats") ] },
    { t:"rest", sec:180, label:"Repos" },
    { t:"down", sec:600, label:"AMRAP B", sub:"Max de tours", list:[
      r(10,"fentesArriere"), r(15,"hipThrusts"), r(15,"situps"), r(20,"mountainClimbers") ] },
  ],
  "AMRAP 20": [{ t:"down", sec:1200, label:"AMRAP 20", sub:"Max de tours", list:[
    r(5,"pullups"), r(10,"burpees"), r(15,"pompes"), r(20,"airSquats"), r(15,"hipThrusts"),
  ] }],
  "3 × AMRAP 6": [
    { t:"down", sec:360, label:"Bloc A", sub:"Max de tours", list:[r(10,"pompes"), r(10,"situps")] },
    { t:"rest", sec:120, label:"Repos" },
    { t:"down", sec:360, label:"Bloc B", sub:"Max de tours", list:[r(8,"fentesArriere"), r(8,"jumpSquats"), r(12,"hipThrusts")] },
    { t:"rest", sec:120, label:"Repos" },
    { t:"down", sec:360, label:"Bloc C", sub:"Max de tours", list:[r(3,"pullups"), r(6,"burpees")] },
  ],
  "AMRAP 18 au sol": [{ t:"down", sec:1080, label:"AMRAP 18", sub:"Max de tours", list:[
    r(12,"sautsMogul"), r(8,"sweeps"), r(10,"vups"), r(15,"hipThrusts"), r(8,"pompes"),
  ] }],
  "AMRAP 20 poussée-tirage": [{ t:"down", sec:1200, label:"AMRAP 20", sub:"Max de tours", list:[
    r(6,"pompesPiquees"), r(8,"chinups"), r(10,"pompes"),
  ] }],

  /* Vendredi */
  "Test 4 min + finisher": [
    { t:"down", sec:240, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"up", cap:900, label:"4 rounds", sub:"1 tour, à répéter 4 fois", list:[
      r(15,"airSquats"), r(10,"pompes"), r(5,"pullups"), r(20,"mountainClimbers") ] },
  ],
  "Test 3 min + EMOM 12": [
    { t:"down", sec:180, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"cycle", sec:60, label:"EMOM 12", stations:[
      st(r(5,"chinups")), st(r(20,"mountainClimbers")), st(r(15,"airSquats")),
    ], loops:4 },
  ],
  "50 burpees for time": [
    { t:"up", cap:480, label:"TEST", sub:"Le plus vite possible", test:true, list:[r(50,"burpees")] },
    { t:"rest", sec:240, label:"Repos" },
    { t:"up", cap:480, label:"3 rounds", sub:"1 tour, à répéter 3 fois", list:[
      r(10,"pompes"), r(15,"airSquats"), r(3,"pullups"), r(15,"situps") ] },
  ],

  "Test 4 min + sangle": [
    { t:"down", sec:240, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"up", cap:900, label:"3 rounds", sub:"1 tour, à répéter 3 fois", list:[
      r(12,"corkscrews"), r(16,"deadBugs"), r(20,"russianTwists"),
      r(15,"crunchsInverses"), r(15,"relevesJambesSol"), r(20,"ciseaux") ] },
  ],

  "Test 4 min + chaîne postérieure": [
    { t:"down", sec:240, label:"TEST", sub:"Max de burpees", test:true },
    { t:"rest", sec:180, label:"Repos" },
    { t:"up", cap:900, label:"4 rounds", sub:"1 tour, à répéter 4 fois", list:[
      r(20,"hipThrusts"), r(10,"hipThrustsUneJambe"), r(20,"fentesArriere"),
      r(25,"monteesPointes"), r(12,"superman") ] },
  ],

  /* Finishers cardio */
  "EMOM 10 burpees": [{ t:"cycle", sec:60, bloc:10, label:"EMOM 10", stations:[st(r(5,"burpees"))], loops:10 }],
  "Montée jusqu'à l'échec": [{ t:"cycle", sec:60, label:"Montée", stations:[
    st(r(1,"burpees")), st(r(2,"burpees")), st(r(3,"burpees")), st(r(4,"burpees")), st(r(5,"burpees")),
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
    r(30,"mountainClimbers"), r(20,"jumpSquats"), r(10,"burpees"),
  ] }],
  "Descente 10 à 1": [{ t:"up", cap:600, label:"Descente 10→1", sub:"55 burpees au total", list:[
    f("10, 9, 8, 7, 6, 5, 4, 3, 2, 1"),
  ] }],
  "Explosif": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(6,"burpeesLongueur"), r(12,"fentesMarchees"), r(20,"mountainClimbers"),
  ] }],
  "Sol et saut": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(20,"sautsMogul"), r(10,"sweeps"), r(20,"mountainClimbers"),
  ] }],
  "Bboy": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(8,"burpeesGenouDiagonal"), r(10,"hollowToSweep"), r(16,"fentesCroisees"),
  ] }],
  "Quadrupédie": [{ t:"up", cap:600, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(6,"bearCrawlThread"), r(20,"sautsMogul"), r(12,"shoulderTaps"),
  ] }],

  /* Finishers abdos */
  "Le classique": [{ t:"up", cap:540, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(10,"situps"), r(20,"russianTwists"), r(10,"shoulderTaps"),
  ] }],
  "Barre de traction": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(10,"relevesGenouxSuspendu"), r(15,"situps"), r(20,"russianTwists"),
  ] }],
  "Gainage descendant": [
    { t:"down", sec:60, label:"Planche", sub:"Tour 1" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
    { t:"down", sec:45, label:"Planche", sub:"Tour 2" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
    { t:"down", sec:30, label:"Planche", sub:"Tour 3" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
    { t:"down", sec:15, label:"Planche", sub:"Tour 4" }, { t:"up", cap:60, label:"Shoulder taps", sub:"10 reps" },
  ],
  "Profond et lent": [{ t:"up", cap:540, label:"3 tours", sub:"1 tour, à répéter 3 fois", list:[
    r(20,"deadBugs"), r(15,"crunchsInverses"), h(30,"gainageLateral"),
  ] }],
  "Chaîne complète": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(12,"relevesJambesSol"), r(20,"mountainClimbersCroises"), r(12,"superman"),
  ] }],
  "Hollow et ciseaux": [{ t:"up", cap:480, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    h(20,"hollowHold"), r(20,"ciseaux"), r(10,"vups"),
  ] }],
  "V-ups et compagnie": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(12,"vups"), r(20,"sautsMogul"), r(15,"relevesJambesSol"),
  ] }],
  "Bassin et vrille": [{ t:"up", cap:540, label:"4 tours", sub:"1 tour, à répéter 4 fois", list:[
    r(20,"hipThrusts"), r(12,"corkscrews"), h(30,"planche"),
  ] }],
  "Hip thrust et gainage": [{ t:"up", cap:480, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(15,"hipThrusts"), r(10,"hipThrustsUneJambe"), r(10,"corkscrews"),
    h(20,"gainageLateral"),
  ] }],
  "Swings": [{ t:"up", cap:540, label:"5 tours", sub:"1 tour, à répéter 5 fois", list:[
    r(16,"swingsLateraux"), r(12,"vups"), h(20,"hollowHold"),
  ] }],
};
