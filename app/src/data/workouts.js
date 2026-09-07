import { r, h, f } from "./items.js";

export const WORKOUTS = {
  1: [
    { name:"EMOM 25", dur:"25 min", meta:"5 blocs × 5 min · tu fais les reps, le reste de la minute c'est ta récup",
      blocks:[
        {tag:"MIN 1",items:[r(8,"burpees")]},
        {tag:"MIN 2",items:[r(15,"airSquats")]},
        {tag:"MIN 3",items:[r(12,"pompes")]},
        {tag:"MIN 4",items:[r(16,"sdtUneJambe","Debout sur une jambe, tu bascules le buste vers l'avant en tendant la jambe libre derrière, dos droit, jusqu'à l'horizontale.")]},
        {tag:"MIN 5",items:[r(4,"pullups")]},
      ],
      goal:"Ne rate aucun départ de minute. Si tu finis en moins de 25 s, tu es sous-dosé." },
    { name:"EMOM 20", dur:"20 min", meta:"4 blocs × 5 min · une station par minute",
      blocks:[
        {tag:"MIN 1",items:[r(10,"burpees")]},
        {tag:"MIN 2",items:[r(20,"fentesArriere")]},
        {tag:"MIN 3",items:[r(12,"pompes")]},
        {tag:"MIN 4",items:[r(5,"chinups","Paumes tournées vers toi. C'est la prise qui charge le plus les biceps.")]},
        {tag:"MIN 5",items:[r(20,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin jusqu'à l'alignement épaules-hanches-genoux et tu serres 1 s en haut.")]},
      ],
      goal:"Le bloc 3 est le mur. Passe-le sans casser le rythme." },
    { name:"EMOM 21", dur:"21 min", meta:"7 blocs × 3 min · cycle court, ça revient vite",
      blocks:[
        {tag:"MIN 1",items:[r(8,"burpees")]},
        {tag:"MIN 2",items:[r(12,"pompes")]},
        {tag:"MIN 3",items:[r(3,"pullups")]},
      ],
      goal:"Sept passages sur les burpees. Même cadence du bloc 1 au bloc 7." },
    { name:"EMOM 20 explosif", dur:"20 min", meta:"4 blocs × 5 min · tout est en puissance, sauf la planche",
      blocks:[
        {tag:"MIN 1",items:[r(6,"burpeesLongueur","Burpee classique, mais tu termines par un saut vers l'avant au lieu d'un saut sur place")]},
        {tag:"MIN 2",items:[r(16,"sdtUneJambe","Debout sur une jambe, tu bascules le buste vers l'avant en tendant la jambe libre derrière, dos droit, jusqu'à l'horizontale.")]},
        {tag:"MIN 3",items:[r(12,"jumpSquats")]},
        {tag:"MIN 4",items:[h(30,"planche","Le reste de la minute est ta récup")]},
        {tag:"MIN 5",items:[r(4,"pullups")]},
      ],
      goal:"Chaque saut est une répétition à part entière. Si tu enchaînes mou, réduis le nombre." },
    { name:"EMOM 20 sol", dur:"20 min", meta:"4 blocs × 5 min · rien en position debout, la barre en renfort",
      blocks:[
        {tag:"MIN 1",items:[r(12,"swingsLateraux","Mains posées au sol d'un côté. Tu fais passer les deux pieds joints de l'autre côté des mains en soulevant le bassin avec les abdos.")]},
        {tag:"MIN 2",items:[r(20,"sautsMogul","En planche haute, mains fixes, pieds qui sautent d'un côté à l'autre, genoux vers la poitrine")]},
        {tag:"MIN 3",items:[r(8,"hollowToSweep","Départ en hollow, bascule en appui sur une main et un pied, jambe libre tendue vers le haut, main opposée qui touche le pied.")]},
        {tag:"MIN 4",items:[r(8,"relevesGenouxSuspendu","Suspendu à la barre, tu remontes les genoux vers la poitrine sans balancer")]},
        {tag:"MIN 5",items:[r(20,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin jusqu'à l'alignement épaules-hanches-genoux et tu serres 1 s en haut.")]},
      ],
      goal:"La séance la plus technique de la semaine. Si une minute se dégrade, baisse les reps plutôt que la qualité." },
  ],
  2: [
    { name:"Escalier montant", dur:"20 min", meta:"1 tour = 1 min · 5 tours par bloc · les reps montent",
      blocks:[
        {tag:"MIN 1–5",items:[r(2,"burpees"),r(6,"pompes"),r(8,"jumpSquats")]},
        {tag:"MIN 6–10",items:[r(3,"burpees"),r(8,"pompes"),r(10,"jumpSquats")]},
        {tag:"MIN 11–15",items:[r(4,"burpees"),r(10,"pompes"),r(12,"jumpSquats")]},
        {tag:"MIN 16–20",items:[r(5,"burpees"),r(12,"pompes"),r(14,"jumpSquats")]},
      ],
      goal:"Plus tu vas vite au début, plus tu récupères à la fin. Sauf que non." },
    { name:"Escalier descendant", dur:"20 min", meta:"1 tour = 1 min · 5 tours par bloc · ça allège quand tu fatigues",
      blocks:[
        {tag:"MIN 1–5",items:[r(5,"burpees"),r(12,"pompes"),r(16,"airSquats")]},
        {tag:"MIN 6–10",items:[r(4,"burpees"),r(10,"pompes"),r(14,"airSquats")]},
        {tag:"MIN 11–15",items:[r(3,"burpees"),r(8,"pompes"),r(16,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin et tu serres 1 s en haut.")]},
        {tag:"MIN 16–20",items:[r(2,"burpees"),r(6,"pompes"),r(20,"hipThrusts")]},
      ],
      goal:"La dette est payée d'avance. Pars fort, tiens la ligne." },
    { name:"Escalier ouvert", dur:"20 min", meta:"20 min · +1 rep par exercice à chaque tour",
      blocks:[
        {tag:"ROUND 1",items:[r(1,"burpees"),r(2,"pompes"),r(3,"airSquats")]},
        {tag:"ROUND 2",items:[r(2,"burpees"),r(3,"pompes"),r(4,"airSquats")]},
        {tag:"ROUND 3",items:[r(3,"burpees"),r(4,"pompes"),r(5,"airSquats")]},
        {tag:"→ SUITE",items:[f("+1 rep partout, jusqu'à la fin des 20 min")]},
      ],
      goal:"Retiens le numéro du dernier round terminé. C'est ton score." },
    { name:"Escalier croisé", dur:"20 min", meta:"1 tour = 1 min · 5 tours par bloc · les burpees montent, les fentes suivent",
      blocks:[
        {tag:"MIN 1–5",items:[
          r(2,"burpeesGenouDiagonal","Burpee sans saut : tu remontes debout, puis tu lances un genou en diagonale vers le coude opposé. Alterne les côtés."),
          r(10,"fentesCroisees","Depuis debout, la jambe arrière passe en diagonale derrière l'autre et tu descends."),
        ]},
        {tag:"MIN 6–10",items:[r(3,"burpeesGenouDiagonal"), r(12,"fentesCroisees")]},
        {tag:"MIN 11–15",items:[r(4,"burpeesGenouDiagonal"), r(14,"fentesCroisees")]},
        {tag:"MIN 16–20",items:[r(5,"burpeesGenouDiagonal"), r(16,"fentesCroisees")]},
      ],
      goal:"70 burpees sans un seul saut. Tes genoux te remercieront, ton cardio pas du tout." },
    { name:"Escalier tirage", dur:"20 min", meta:"1 tour = 1 min · 5 tours par bloc · la barre en première moitié",
      blocks:[
        {tag:"MIN 1–5",items:[
          r(2,"burpees"),
          r(3,"chinups","Paumes tournées vers toi. C'est la prise qui charge le plus les biceps."),
          r(12,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin et tu serres 1 s en haut."),
        ]},
        {tag:"MIN 6–10",items:[r(3,"burpees"), r(3,"chinups"), r(12,"hipThrusts")]},
        {tag:"MIN 11–15",items:[r(4,"burpees"), r(20,"monteesPointes","Debout, tu montes sur la pointe des pieds et tu redescends lentement. Sur une jambe pour durcir.")]},
        {tag:"MIN 16–20",items:[r(5,"burpees"), r(20,"monteesPointes")]},
      ],
      goal:"30 chin-ups étalés sur dix minutes, plus les mollets. La seule séance qui fait les deux." },
  ],
  3: [
    { name:"5 rounds", dur:"≤ 25 min", meta:"Pour le temps · cap 25 min · repos libre entre les rounds",
      blocks:[
        {tag:"1 ROUND",items:[r(40,"mountainClimbers"),r(30,"airSquats"),r(20,"situps"),r(20,"fentesArriere"),r(10,"pompes"),r(3,"pullups")]},
        {tag:"× 5",items:[f("Enchaîne 5 fois")]},
      ],
      goal:"Note le temps total. C'est le seul chiffre à retenir." },
    { name:"4 rounds lourds", dur:"≤ 25 min", meta:"Pour le temps · rounds plus longs, moins nombreux",
      blocks:[
        {tag:"1 ROUND",items:[r(50,"mountainClimbers"),r(40,"airSquats"),r(30,"situps"),r(20,"fentesArriere"),r(10,"pompes"),r(5,"chinups","Paumes tournées vers toi. C'est la prise qui charge le plus les biceps.")]},
        {tag:"× 4",items:[f("Enchaîne 4 fois")]},
      ],
      goal:"Découpe les mountain climbers en deux séries dès le round 2." },
    { name:"Chipper", dur:"≤ 25 min", meta:"Une seule descente · une ligne finie avant de passer à la suivante",
      blocks:[
        {tag:"1",items:[r(100,"mountainClimbers")]},
        {tag:"2",items:[r(80,"airSquats")]},
        {tag:"3",items:[r(60,"situps")]},
        {tag:"4",items:[r(40,"fentesArriere")]},
        {tag:"5",items:[r(30,"pompes")]},
        {tag:"6",items:[r(20,"burpees")]},
        {tag:"7",items:[r(10,"pullups")]},
      ],
      goal:"Les burpees arrivent quand tu es cuit. C'est exactement le but." },
    { name:"Tours explosifs", dur:"≤ 25 min", meta:"4 tours · pour le temps · beaucoup de saut, repos libre entre les tours",
      blocks:[
        {tag:"1 TOUR",items:[
          r(12,"burpeesLongueur","Burpee classique, mais tu termines par un saut vers l'avant au lieu d'un saut sur place"),
          r(20,"fentesMarchees","Tu avances à chaque répétition. Pas de place ? Fentes arrière sur place."),
          r(20,"jumpSquats"),
          r(30,"mountainClimbers"),
          h(30,"planche","Coudes sous les épaules, fessiers serrés"),
        ]},
        {tag:"× 4",items:[f("Enchaîne 4 tours")]},
      ],
      goal:"Le tour le plus dur des trois du mercredi. Si le tour 2 s'écroule, tu es parti trop vite." },
    { name:"Tours au sol", dur:"≤ 25 min", meta:"4 tours · pour le temps · chaîne postérieure et quadrupédie",
      blocks:[
        {tag:"1 TOUR",items:[
          r(6,"bearCrawlThread","4 pas de bear crawl en avant, 4 en arrière, puis depuis la quadrupédie tu passes un bras tendu sous le corps jusqu'à poser l'épaule et la tempe au sol."),
          r(20,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin jusqu'à l'alignement épaules-hanches-genoux et tu serres 1 s en haut."),
          r(10,"hipThrustsUneJambe","Même mouvement, une jambe tendue en l'air."),
          r(20,"mountainClimbersCroises","Genou vers le coude opposé"),
          r(12,"superman","Sur le ventre, bras et jambes décollés, 2 s en haut"),
          r(10,"pompes"),
        ]},
        {tag:"× 4",items:[f("Enchaîne 4 tours")]},
      ],
      goal:"Aucun impact, aucun saut. C'est la séance à prendre quand les genoux tirent." },
  ],
  4: [
    { name:"2 × AMRAP 10", dur:"23 min", meta:"Max de tours en 10 min · 3 min de repos entre les blocs",
      blocks:[
        {tag:"AMRAP A",items:[r(5,"pullups"),r(10,"pompes"),r(15,"airSquats")]},
        {tag:"REPOS",items:[f("3 min")]},
        {tag:"AMRAP B",items:[r(10,"fentesArriere"),r(15,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin et tu serres 1 s en haut."),r(15,"situps"),r(20,"mountainClimbers")]},
      ],
      goal:"Deux scores : tours du bloc A, tours du bloc B." },
    { name:"AMRAP 20", dur:"20 min", meta:"Max de tours en 20 min · un seul bloc, pas de pause programmée",
      blocks:[
        {tag:"1 TOUR",items:[r(5,"pullups"),r(10,"burpees"),r(15,"pompes"),r(20,"airSquats"),r(15,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin et tu serres 1 s en haut.")]},
      ],
      goal:"Le rythme des 5 premières minutes décide de tout le reste." },
    { name:"3 × AMRAP 6", dur:"22 min", meta:"Trois blocs courts · 2 min de repos entre chaque",
      blocks:[
        {tag:"BLOC A",items:[r(10,"pompes"),r(10,"situps")]},
        {tag:"BLOC B",items:[r(8,"fentesArriere"),r(8,"jumpSquats"),r(12,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin et tu serres 1 s en haut.")]},
        {tag:"BLOC C",items:[r(3,"pullups"),r(6,"burpees")]},
      ],
      goal:"Blocs courts, donc tu peux pousser. Ne garde rien pour la fin." },
    { name:"AMRAP 18 au sol", dur:"18 min", meta:"Max de tours en 18 min · tout se passe au ras du sol",
      blocks:[
        {tag:"1 TOUR",items:[
          r(12,"sautsMogul","En planche haute, mains fixes, tu sautes les deux pieds d'un côté à l'autre, genoux repliés vers la poitrine."),
          r(8,"sweeps","Appui sur une main et un pied, hanche décollée du sol, la jambe libre passe tendue sous toi vers l'avant."),
          r(10,"vups","Bras et jambes tendus qui se rejoignent au-dessus du bassin"),
          r(15,"hipThrusts","Sur le dos, genoux pliés, pieds à plat. Tu montes le bassin et tu serres 1 s en haut."),
          r(8,"pompes"),
        ]},
      ],
      goal:"Le sweep est le mouvement le plus technique du lot. Si tu perds la forme, ralentis-le au lieu de le sauter." },
    { name:"AMRAP 20 poussée-tirage", dur:"20 min", meta:"Max de tours en 20 min · poussée verticale et les deux prises à la barre",
      blocks:[
        {tag:"1 TOUR",items:[
          r(6,"pompesPiquees","Bassin haut, tête vers le sol entre les mains, tu descends puis tu pousses. Pieds surélevés pour durcir."),
          r(4,"pullups","Paumes vers l'avant, mains un peu plus large que les épaules"),
          r(4,"chinups","Paumes tournées vers toi. C'est la prise qui charge le plus les biceps."),
          r(10,"pompes"),
        ]},
      ],
      goal:"Poussée verticale, poussée horizontale, pronation, supination. Tout dans un tour." },
  ],
  5: [
    /* `score` dit ce que le chiffre du test est réellement. Sans lui, « Burpees
       en 4 min » et « Temps sur 50 burpees » se saisissaient dans le même champ
       nu, et rien ne permettait de savoir que le premier est du volume de
       burpees — donc que le total de répétitions de la séance en dépend. */
    { name:"Test 4 min + finisher", dur:"≈ 23 min", test:true, testLabel:"Burpees en 4 min",
      score:{ ex:"burpees", unit:"reps" },
      meta:"Bloc de mesure, puis du volume propre",
      blocks:[
        {tag:"TEST",items:[f("Max de burpees en 4 min")]},
        {tag:"REPOS",items:[f("3 min")]},
        {tag:"4 ROUNDS",items:[r(15,"airSquats"),r(10,"pompes"),r(5,"pullups"),r(20,"mountainClimbers")]},
      ],
      goal:"Le chiffre du test est ta seule métrique burpees de la semaine." },
    { name:"Test 3 min + EMOM 12", dur:"≈ 18 min", test:true, testLabel:"Burpees en 3 min",
      score:{ ex:"burpees", unit:"reps" },
      meta:"Test court et violent, puis 12 min de minuterie",
      blocks:[
        {tag:"TEST",items:[f("Max de burpees en 3 min")]},
        {tag:"REPOS",items:[f("3 min")]},
        {tag:"MIN 1",items:[r(5,"chinups","Paumes tournées vers toi. C'est la prise qui charge le plus les biceps.")]},
        {tag:"MIN 2",items:[r(20,"mountainClimbers")]},
        {tag:"MIN 3",items:[r(15,"airSquats")]},
        {tag:"× 4",items:[f("Répète le cycle 4 fois")]},
      ],
      goal:"Score sur 3 min. À comparer uniquement avec d'autres tests de 3 min." },
    /* Le seul test dont le volume est prescrit : 50 burpees, et le chiffre
       mesuré est un temps. La ligne de travail les fait enfin compter — en
       phrase, ils étaient absents du total de la séance. */
    { name:"50 burpees for time", dur:"≈ 20 min", test:true, testLabel:"Temps sur 50 burpees",
      score:{ unit:"secondes" },
      meta:"Un chrono, un objectif, puis du travail léger",
      blocks:[
        {tag:"TEST",items:[r(50,"burpees","Le plus vite possible")]},
        {tag:"REPOS",items:[f("4 min")]},
        {tag:"3 ROUNDS",items:[r(10,"pompes"),r(15,"airSquats"),r(3,"pullups"),r(15,"situps")]},
      ],
      goal:"Note le temps en secondes. Sous 240 s, c'est déjà solide." },
    { name:"Test 4 min + sangle", dur:"≈ 22 min", test:true, testLabel:"Burpees en 4 min",
      score:{ ex:"burpees", unit:"reps" },
      meta:"Le même test, suivi d'un circuit lent centré sur la sangle abdominale",
      blocks:[
        {tag:"TEST",items:[f("Max de burpees en 4 min")]},
        {tag:"REPOS",items:[f("3 min")]},
        {tag:"3 ROUNDS",items:[
          r(12,"corkscrews","Sur le dos, jambes tendues vers le plafond. Tu décolles le bassin en vrillant vers un côté, puis vers l'autre."),
          r(16,"deadBugs","Sur le dos, bas du dos plaqué au sol, bras et jambe opposés qui s'éloignent lentement"),
          r(20,"russianTwists","Assis, buste incliné, tu passes les mains d'un côté à l'autre."),
          r(15,"crunchsInverses","Sur le dos, tu remontes le bassin en enroulant, jambes fléchies"),
          r(15,"relevesJambesSol","Mains sous les fessiers, jambes tendues qui descendent sans toucher le sol"),
          r(20,"ciseaux","Jambes tendues qui se croisent en alternance, à 20 cm du sol"),
        ]},
      ],
      goal:"Même chiffre de test que la version longue, comparable d'une semaine à l'autre." },
    { name:"Test 4 min + chaîne postérieure", dur:"≈ 22 min", test:true, testLabel:"Burpees en 4 min",
      score:{ ex:"burpees", unit:"reps" },
      meta:"Le même test, suivi de tout ce que la semaine oublie le plus souvent",
      blocks:[
        {tag:"TEST",items:[f("Max de burpees en 4 min")]},
        {tag:"REPOS",items:[f("3 min")]},
        {tag:"4 ROUNDS",items:[
          r(20,"hipThrusts","Genoux pliés, pieds à plat, tu montes le bassin et tu serres 1 s en haut"),
          r(10,"hipThrustsUneJambe","Une jambe tendue en l'air."),
          r(20,"fentesArriere"),
          r(25,"monteesPointes","Debout, tu montes sur la pointe des pieds et tu redescends lentement"),
          r(12,"superman","Sur le ventre, bras et jambes décollés, 2 s en haut"),
        ]},
      ],
      goal:"Fessiers, ischios, mollets. C'est ce qui te manquera le jour où le kiné te rendra la course." },
  ],
};

export const WORKOUT_BY_NAME = {};
Object.values(WORKOUTS).flat().forEach((w) => { WORKOUT_BY_NAME[w.name] = w; });
