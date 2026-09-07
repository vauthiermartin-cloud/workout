import { r, h, f } from "./items.js";

/* Finishers, 10 min max. Deux familles : cardio et abdos. */
export const FINISHERS = {
  cardio: [
    { name:"EMOM 10 burpees", dur:"10 min", meta:"5 burpees au début de chaque minute · le reste, tu souffles",
      blocks:[{tag:"CHAQUE MINUTE",items:[r(5,"burpees")]},{tag:"× 10",items:[f("Dix minutes, dix départs")]}] },
    { name:"Montée jusqu'à l'échec", dur:"≤ 10 min", meta:"1 burpee la 1re minute, 2 la 2e, 3 la 3e… jusqu'à ne plus tenir",
      blocks:[
        {tag:"MIN 1",items:[r(1,"burpees")]},
        {tag:"MIN 2",items:[r(2,"burpees")]},
        {tag:"MIN 3",items:[r(3,"burpees")]},
        {tag:"→ SUITE",items:[f("+1 burpee par minute","Tu t'arrêtes à la minute que tu ne finis pas. Retiens le numéro.")]},
      ] },
    { name:"Tabata double", dur:"9 min", meta:"20 s à fond, 10 s de repos, 8 fois · 1 min entre les deux blocs",
      blocks:[
        {tag:"BLOC 1 · 4 MIN",items:[f("Burpees","Compte les reps du premier round, essaie de tenir ce chiffre sur les huit")]},
        {tag:"REPOS",items:[f("1 min")]},
        {tag:"BLOC 2 · 4 MIN",items:[f("Mountain climbers")]},
      ] },
    { name:"Pyramide burpees", dur:"≤ 8 min", meta:"Tu montes puis tu redescends, sans repos programmé",
      blocks:[
        {tag:"MONTÉE",items:[f("1, 2, 3, 4, 5 burpees","10 mountain climbers entre chaque palier")]},
        {tag:"DESCENTE",items:[f("4, 3, 2, 1 burpees","Mêmes 10 mountain climbers entre chaque")]},
      ] },
    { name:"3 tours cardio", dur:"≤ 9 min", meta:"Pour le temps · repos libre entre les tours",
      blocks:[
        {tag:"1 TOUR",items:[r(30,"mountainClimbers"),r(20,"jumpSquats"),r(10,"burpees")]},
        {tag:"× 3",items:[f("Enchaîne 3 fois")]},
      ] },
    { name:"Descente 10 à 1", dur:"≤ 10 min", meta:"10 burpees, puis 9, puis 8… jusqu'à 1",
      blocks:[
        {tag:"SÉRIES",items:[f("10, 9, 8, 7, 6, 5, 4, 3, 2, 1 burpees","55 burpees au total. Le plus dur est au début, c'est fait exprès.")]},
      ] },
    { name:"Explosif", dur:"≤ 10 min", meta:"5 tours · tout en puissance, rien en endurance",
      blocks:[
        {tag:"1 TOUR",items:[
          r(6,"burpeesLongueur","Saut vers l'avant en fin de burpee, le plus loin possible"),
          r(12,"fentesMarchees"),
          r(20,"mountainClimbers"),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
    { name:"Sol et saut", dur:"≤ 10 min", meta:"5 tours · les mains ne quittent jamais le sol",
      blocks:[
        {tag:"1 TOUR",items:[
          r(20,"sautsMogul","En planche haute, mains fixes, tu sautes les deux pieds d'un côté à l'autre, genoux repliés vers la poitrine."),
          r(10,"sweeps","Appui sur une main et un pied, hanche décollée, la jambe libre passe tendue sous toi vers l'avant."),
          r(20,"mountainClimbers"),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
    { name:"Bboy", dur:"≤ 10 min", meta:"5 tours · zéro impact, beaucoup de coordination",
      blocks:[
        {tag:"1 TOUR",items:[
          r(8,"burpeesGenouDiagonal","Burpee sans saut : tu remontes debout, puis tu lances un genou en diagonale vers le coude opposé. Alterne."),
          r(10,"hollowToSweep","Départ en hollow au sol. Tu bascules en appui sur une main et un pied, bassin haut, la jambe libre tendue vers le haut, la main opposée qui vient toucher le pied. Retour en hollow."),
          r(16,"fentesCroisees","La jambe arrière passe en diagonale derrière l'autre."),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
    { name:"Quadrupédie", dur:"≤ 10 min", meta:"5 tours · les mains restent au sol du début à la fin",
      blocks:[
        {tag:"1 TOUR",items:[
          r(6,"bearCrawlThread","4 pas de bear crawl en avant, 4 en arrière, puis depuis la quadrupédie tu passes un bras tendu sous le corps jusqu'à poser l'épaule et la tempe au sol. Alterne les côtés."),
          r(20,"sautsMogul","En planche haute, mains fixes, pieds qui sautent d'un côté à l'autre, genoux vers la poitrine"),
          r(12,"shoulderTaps","Tu touches l'épaule opposée sans laisser le bassin partir sur le côté"),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
  ],
  abdos: [
    { name:"Le classique", dur:"≤ 9 min", meta:"5 tours · repos court entre les tours",
      blocks:[
        {tag:"1 TOUR",items:[
          r(10,"situps"),
          r(20,"russianTwists","Assis, buste incliné, tu passes les mains d'un côté à l'autre."),
          r(10,"shoulderTaps","En position de planche haute, tu touches l'épaule opposée sans bouger le bassin"),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
    { name:"Barre de traction", dur:"≤ 9 min", meta:"4 tours · le premier exercice se fait suspendu",
      blocks:[
        {tag:"1 TOUR",items:[
          r(10,"relevesGenouxSuspendu","Suspendu à la barre, tu remontes les genoux vers la poitrine sans balancer"),
          r(15,"situps"),
          r(20,"russianTwists"),
        ]},
        {tag:"× 4",items:[f("Enchaîne 4 tours")]},
      ] },
    { name:"Gainage descendant", dur:"≤ 8 min", meta:"4 tours · le temps de gainage baisse à chaque tour",
      blocks:[
        {tag:"TOUR 1",items:[h(60,"planche","Coudes sous les épaules, fessiers serrés, bassin bas"),r(10,"shoulderTaps")]},
        {tag:"TOUR 2",items:[h(45,"planche"),r(10,"shoulderTaps")]},
        {tag:"TOUR 3",items:[h(30,"planche"),r(10,"shoulderTaps")]},
        {tag:"TOUR 4",items:[h(15,"planche"),r(10,"shoulderTaps")]},
      ] },
    { name:"Profond et lent", dur:"≤ 9 min", meta:"3 tours · rien de rapide, tout est contrôlé",
      blocks:[
        {tag:"1 TOUR",items:[
          r(20,"deadBugs","Sur le dos, bas du dos plaqué au sol, bras et jambe opposés qui s'éloignent"),
          r(15,"crunchsInverses","Sur le dos, tu remontes le bassin en enroulant, jambes fléchies"),
          h(30,"gainageLateral","Corps aligné, hanche haute"),
        ]},
        {tag:"× 3",items:[f("Enchaîne 3 tours")]},
      ] },
    { name:"Chaîne complète", dur:"≤ 9 min", meta:"4 tours · devant, côtés, dos",
      blocks:[
        {tag:"1 TOUR",items:[
          r(12,"relevesJambesSol","Sur le dos, mains sous les fessiers, jambes tendues qui descendent sans toucher le sol"),
          r(20,"mountainClimbersCroises","Genou vers le coude opposé"),
          r(12,"superman","Sur le ventre, bras et jambes décollés, 2 s en haut"),
        ]},
        {tag:"× 4",items:[f("Enchaîne 4 tours")]},
      ] },
    { name:"Hollow et ciseaux", dur:"≤ 8 min", meta:"5 tours · tout se passe sur le dos, bas du dos plaqué",
      blocks:[
        {tag:"1 TOUR",items:[
          h(20,"hollowHold","Sur le dos, bras tendus derrière la tête, épaules et jambes décollées, lombaires au sol"),
          r(20,"ciseaux","Jambes tendues qui se croisent en alternance, à 20 cm du sol"),
          r(10,"vups","Bras et jambes tendus qui se rejoignent au-dessus du bassin"),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
    { name:"V-ups et compagnie", dur:"≤ 9 min", meta:"4 tours · le V-up en ouverture, quand tu es encore frais",
      blocks:[
        {tag:"1 TOUR",items:[
          r(12,"vups","Bras et jambes tendus qui se rejoignent au-dessus du bassin. Trop dur ? Plie les genoux."),
          r(20,"sautsMogul","En planche haute, mains fixes, pieds qui sautent d'un côté à l'autre, genoux vers la poitrine"),
          r(15,"relevesJambesSol","Mains sous les fessiers, jambes tendues qui descendent sans toucher le sol"),
        ]},
        {tag:"× 4",items:[f("Enchaîne 4 tours")]},
      ] },
    { name:"Bassin et vrille", dur:"≤ 9 min", meta:"4 tours · fessiers et obliques, rien de sauté",
      blocks:[
        {tag:"1 TOUR",items:[
          r(20,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin jusqu'à l'alignement épaules-hanches-genoux et tu serres 1 s en haut."),
          r(12,"corkscrews","Sur le dos, jambes tendues vers le plafond. Tu décolles le bassin en vrillant vers un côté, puis vers l'autre."),
          h(30,"planche","Coudes sous les épaules, fessiers serrés"),
        ]},
        {tag:"× 4",items:[f("Enchaîne 4 tours")]},
      ] },
    { name:"Hip thrust et gainage", dur:"≤ 8 min", meta:"5 tours · chaîne postérieure et sangle profonde",
      blocks:[
        {tag:"1 TOUR",items:[
          r(15,"hipThrusts","Genoux pliés, pieds à plat, tu serres les fessiers en haut"),
          r(10,"hipThrustsUneJambe","Même mouvement, une jambe tendue en l'air."),
          r(10,"corkscrews"),
          h(20,"gainageLateral"),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
    { name:"Swings", dur:"≤ 9 min", meta:"5 tours · tout part de la sangle abdominale",
      blocks:[
        {tag:"1 TOUR",items:[
          r(16,"swingsLateraux","Mains posées au sol d'un côté. Tu fais passer les deux pieds joints de l'autre côté des mains en soulevant le bassin avec les abdos, puis tu reviens."),
          r(12,"vups","Bras et jambes tendus qui se rejoignent au-dessus du bassin"),
          h(20,"hollowHold","Bras tendus derrière la tête, lombaires plaquées au sol"),
        ]},
        {tag:"× 5",items:[f("Enchaîne 5 tours")]},
      ] },
  ],
};
