/* Les exercices sont des entités, pas des chaînes de caractères.
   ============================================================

   Avant, une ligne de séance portait le nom français de l'exercice comme
   identité (`r(12,"pompes")`). Trois conséquences, toutes payées :

   - « burpee » et « burpees » étaient deux exercices pour l'app, et un test
     devait comparer des étiquettes plutôt que des noms pour absorber l'écart ;
   - renommer un exercice — ce qui est précisément l'objet de l'étape 4 du plan
     de travail — voulait dire réécrire chaque ligne de chaque séance ;
   - rien ne disait dans quelle unité un exercice se compte, donc rien n'était
     éditable : « 30 s de planche » était une phrase, pas 30 secondes de
     planche.

   L'identifiant ci-dessous ne change jamais. Le libellé, lui, changera.

   `unit` — comment l'exercice se compte :
     "reps"     un nombre de répétitions
     "secondes" un maintien, compté en temps

   `perSide` — absent pour les mouvements symétriques. Sinon, il lève une
   ambiguïté qui vivait dans les notes en prose, et qui s'y contredisait :
     "reparti" le nombre est le TOTAL, à répartir entre les deux côtés
               (16 fentes croisées = 8 par jambe)
     "chaque"  le nombre s'applique à CHAQUE côté
               (30 s de gainage latéral = 30 s à droite, 30 s à gauche)

   `patterns` — les schémas moteurs, seule et unique source de l'étiquetage
   des séances. Ils ne sont jamais saisis à la main sur une séance.

   Ce que cette table ne porte pas encore, et qui viendra par les étapes
   prévues : le terme anglais et la consigne longue (étape 4, la table de
   nommage est à arbitrer ligne par ligne), les planches de positions
   (étapes 9 et 10). Les champs seront ajoutés au moment où ils auront une
   valeur à porter, pas avant.

   La table se lit en quatre parties. Au-dessus, les exercices que le catalogue
   prescrit. Puis le correctif, que seul le bloc d'isométrie emploie. En
   dessous, les variantes de régression : mêmes entités, mêmes champs, mais
   aucune séance ne les cite — on ne les atteint que par une chaîne
   (`chains.js`). La séparation n'est pas décorative, c'est elle que contrôle
   le test d'entrée morte : en haut, une entrée que plus aucune séance
   n'utilise est un oubli ; plus bas, c'est la règle. Tout en bas, les
   exercices propres à Athlean X, que le moteur classique ne voit pas
   (`exclusiveTo`). */

export const EXERCISES = {
  /* Poussée */
  pompes:                 { fr:"pompes",                          unit:"reps", patterns:["poussee"] },
  pompesPiquees:          { fr:"pompes piquées",                  unit:"reps", patterns:["poussee"], nameEn:"Pike Pushups", sourceIds:["A-2.1"] },

  /* Tirage */
  pullups:                { fr:"pull-ups",                        unit:"reps", patterns:["tirage"], nameEn:"Pullups", sourceIds:["A-4.1"] },
  chinups:                { fr:"chin-ups",                        unit:"reps", patterns:["tirage","supination"], nameEn:"Chinups", sourceIds:["B-4.1"] },
  relevesGenouxSuspendu:  { fr:"relevés de genoux suspendu",      unit:"reps", patterns:["tirage","core"] },

  /* Tirage horizontal — possible depuis le 2026-09-27, l'équipement a changé.
     La contrainte « aucun tirage horizontal » était matérielle, pas une
     décision de conception : elle tombe avec sa cause. */
  tiragesHorizontaux:     { fr:"tirages horizontaux",             unit:"reps", patterns:["tirage"], nameEn:"Australian Pullups", sourceIds:["A-4.3", "B-4.2"] },
  tiragesHorizontauxSup:  { fr:"tirages horizontaux paume vers soi", unit:"reps", patterns:["tirage","supination"] },

  /* Squat */
  airSquats:              { fr:"air squats",                      unit:"reps", patterns:["squat"] },
  jumpSquats:             { fr:"jump squats",                     unit:"reps", patterns:["squat","cardio"], nameEn:"Jump Squats", sourceIds:["A-1.3"] },

  /* Unilatéral */
  fentesArriere:          { fr:"fentes arrière",                  unit:"reps", perSide:"reparti", patterns:["unilat"], nameEn:"Alternating Sprinter Lunges", sourceIds:["A-3.2"] },
  fentesMarchees:         { fr:"fentes marchées",                 unit:"reps", perSide:"reparti", patterns:["unilat"] },
  fentesCroisees:         { fr:"fentes croisées",                 unit:"reps", perSide:"reparti", patterns:["unilat"] },

  /* Chaîne postérieure */
  hipThrusts:             { fr:"hip thrusts",                     unit:"reps", patterns:["hinge"], nameEn:"Hip Thrust", sourceIds:["B-1.3"] },
  hipThrustsUneJambe:     { fr:"hip thrusts sur une jambe",       unit:"reps", perSide:"reparti", patterns:["hinge","unilat"] },
  sdtUneJambe:            { fr:"soulevés de terre une jambe",     unit:"reps", perSide:"reparti", patterns:["hinge","unilat"] },
  superman:               { fr:"superman",                        unit:"reps", patterns:["hinge"], nameEn:"Superman", sourceIds:["A-6.1"] },

  /* Mollets */
  monteesPointes:         { fr:"montées sur pointes",             unit:"reps", patterns:["mollets"] },

  /* Cardio */
  burpees:                { fr:"burpees",                         unit:"reps", patterns:["cardio"] },
  burpeesLongueur:        { fr:"burpees sautés en longueur",      unit:"reps", patterns:["cardio"] },
  burpeesGenouDiagonal:   { fr:"burpees genou diagonal",          unit:"reps", patterns:["cardio"] },
  mountainClimbers:       { fr:"mountain climbers",               unit:"reps", patterns:["cardio","core"] },
  mountainClimbersCroises:{ fr:"mountain climbers croisés",       unit:"reps", patterns:["cardio","core"] },
  sautsMogul:             { fr:"sauts mogul",                     unit:"reps", perSide:"reparti", patterns:["cardio","core"] },

  /* Mobilité */
  swingsLateraux:         { fr:"swings latéraux",                 unit:"reps", perSide:"reparti", patterns:["core","mobilite"] },
  sweeps:                 { fr:"sweeps",                          unit:"reps", perSide:"reparti", patterns:["mobilite","core"] },
  hollowToSweep:          { fr:"hollow to sweep",                 unit:"reps", perSide:"reparti", patterns:["mobilite","core"] },
  bearCrawlThread:        { fr:"bear crawl to thread the needle", unit:"reps", perSide:"reparti", patterns:["mobilite","core"] },

  /* Sangle */
  situps:                 { fr:"sit-ups",                         unit:"reps", patterns:["core"] },
  vups:                   { fr:"V-ups",                           unit:"reps", patterns:["core"] },
  ciseaux:                { fr:"ciseaux",                         unit:"reps", patterns:["core"] },
  corkscrews:             { fr:"corkscrews",                      unit:"reps", perSide:"reparti", patterns:["core"], nameEn:"Reverse Corkscrews", sourceIds:["A-5.1"] },
  deadBugs:               { fr:"dead bugs",                       unit:"reps", patterns:["core"] },
  crunchsInverses:        { fr:"crunchs inversés",                unit:"reps", patterns:["core"] },
  relevesJambesSol:       { fr:"relevés de jambes au sol",        unit:"reps", patterns:["core"] },
  russianTwists:          { fr:"russian twists",                  unit:"reps", perSide:"reparti", patterns:["core"] },
  shoulderTaps:           { fr:"shoulder taps en gainage",        unit:"reps", patterns:["core"] },

  /* Maintiens. Ils existaient dans les séances sans exister dans la
     bibliothèque : « 30 s de planche » était du texte libre, et la planche
     n'était classée que par une expression régulière sur ce texte. */
  planche:                { fr:"planche",                         unit:"secondes", patterns:["core"] },
  hollowHold:             { fr:"hollow hold",                     unit:"secondes", patterns:["core"] },
  gainageLateral:         { fr:"gainage latéral",                 unit:"secondes", perSide:"chaque", patterns:["core"] },

  /* Correctif — aucune séance ne le prescrit non plus, et pour une autre
     raison que les variantes ci-dessous : il ne remplace rien, il se coche
     avant de lancer le chrono et se joue à part, hors des 25 minutes. Voir
     `correctif.js`, qui porte la seule prescription qui l'emploie. */
  flexionHancheIso:            { fr:"flexion de hanche",                          unit:"secondes", patterns:["core","unilat"] },

  /* Variantes de régression — aucune séance ne les prescrit.
     ------------------------------------------------------
     Elles portent les mêmes schémas moteurs que l'exercice qu'elles
     remplacent, et c'est un contrôle et non une coïncidence : une variante
     qui classerait autrement ferait mentir la couverture hebdomadaire dès
     qu'on la substituerait.

     Ce qui manque à ces lignes est ce qui manque à toutes les autres : la
     consigne. « pull-ups négatifs » vaut par la descente de 5 s, « pompes
     inclinées » par la hauteur des mains — ces précisions sont des consignes,
     pas des libellés, et elles attendent le champ de l'étape 4. Les faire
     tenir dans le nom donnerait des étiquettes que le chrono ne saurait pas
     afficher. */

  pompesMur:                   { fr:"pompes au mur",                              unit:"reps", patterns:["poussee"] },
  pompesInclinees:             { fr:"pompes inclinées",                           unit:"reps", patterns:["poussee"] },
  pompesGenoux:                { fr:"pompes sur les genoux",                      unit:"reps", patterns:["poussee"] },
  pompesPiedsSureleves:        { fr:"pompes pieds surélevés",                     unit:"reps", patterns:["poussee"], nameEn:"Elevated Feet Pushups", sourceIds:["B-2.1"] },
  pompesPiqueesPartielles:     { fr:"pompes piquées amplitude partielle",         unit:"reps", patterns:["poussee"] },
  pompesPiqueesPiedsSureleves: { fr:"pompes piquées pieds surélevés",             unit:"reps", patterns:["poussee"] },

  /* La suspension active se compte en temps, pas en répétitions : c'est le
     seul cran d'une chaîne qui change d'unité, et `chains.test.js` le tient
     pour que la substitution ne le découvre pas par accident. */
  suspensionActive:            { fr:"suspension active",                          unit:"secondes", patterns:["tirage"] },
  tiragesOmoplates:            { fr:"tirages d'omoplates",                        unit:"reps", patterns:["tirage"] },
  pullupsNegatifs:             { fr:"pull-ups négatifs",                          unit:"reps", patterns:["tirage"] },
  pullupsElastique:            { fr:"pull-ups assistés à l'élastique",            unit:"reps", patterns:["tirage"] },

  /* Les chin-ups ont leur propre chaîne au lieu de partager celle des
     pull-ups : la supination est un schéma suivi à part, et le seul travail
     de biceps disponible. Substituer un pull-up assisté à un chin-up le
     ferait disparaître de la semaine sans que rien ne le dise. */
  chinupsNegatifs:             { fr:"chin-ups négatifs",                          unit:"reps", patterns:["tirage","supination"] },
  chinupsElastique:            { fr:"chin-ups assistés à l'élastique",            unit:"reps", patterns:["tirage","supination"] },

  burpeesSansSautNiPompe:      { fr:"burpees sans saut ni pompe",                 unit:"reps", patterns:["cardio"] },
  burpeesSansPompe:            { fr:"burpees sans pompe",                         unit:"reps", patterns:["cardio"] },

  vupsGenouxFlechis:           { fr:"V-ups genoux fléchis",                       unit:"reps", patterns:["core"], nameEn:"V-Up Tucks", sourceIds:["B-5.2"] },
  vupsUneJambe:                { fr:"V-ups une jambe",                            unit:"reps", perSide:"reparti", patterns:["core"] },

  sdtUneJambeAppui:            { fr:"soulevés de terre une jambe, main en appui", unit:"reps", perSide:"reparti", patterns:["hinge","unilat"] },

  /* Athlean X — exclusifs au programme fixe.
     ----------------------------------------
     Le mode Athlean X joue Workout A et B tels que les décrit
     `perfect_home_workout_spec_v2.md`. Trente-deux identifiants de ce
     document, deux origines :

     - douze désignent un exercice que la bibliothèque avait déjà — pull-ups,
       chin-ups, tirages horizontaux (deux fois : A-4.3 et B-4.2), etc. On ne
       recrée rien : l'entité existante reçoit `nameEn` et `sourceIds`, et
       rien d'autre. Surtout pas `exclusiveTo` : le moteur classique les
       perdrait.
     - vingt n'existaient pas. Ils sont ci-dessous, et `exclusiveTo` les tient
       hors du moteur classique — ni séance, ni chaîne, ni substitution, ni
       couverture.

     `nameEn` est le nom du spec, tel quel : c'est lui qui permet de rejouer
     une séance à l'identique. `sourceIds` est une liste parce que le spec
     cite deux fois les tirages horizontaux.

     Les schémas moteurs suivent le groupe du spec (Anterior Lower — Squat,
     Upper Push, Abs…), pas une lecture du mouvement : c'est ce qui les rend
     traçables. Aucun ne compte pour la couverture tant que `exclusiveTo`
     tient. Pas de `perSide` : Athlean X se joue en fenêtres de 60 s, aucune
     quantité n'est prescrite à répartir. */

  boxSquatAlterne:             { fr:"box squat alterné",                          unit:"reps", patterns:["squat"], nameEn:"Alternating Single Leg Box Squats", sourceIds:["A-1.1"], source:"athleanX", exclusiveTo:["athleanX"] },
  squatUnEtDemiBas:            { fr:"squat 1½ (position basse)",                  unit:"reps", patterns:["squat"], nameEn:"1½ Bottomed Out Squats", sourceIds:["A-1.2"], source:"athleanX", exclusiveTo:["athleanX"] },
  pompesRotationEpaule:        { fr:"pompes rotation épaule",                     unit:"reps", patterns:["poussee"], nameEn:"Rotational Pushups", sourceIds:["A-2.2"], source:"athleanX", exclusiveTo:["athleanX"] },
  pompesCobra:                 { fr:"pompes cobra",                               unit:"reps", patterns:["poussee"], nameEn:"Cobra Pushups", sourceIds:["A-2.3"], source:"athleanX", exclusiveTo:["athleanX"] },
  squatToucherTalon:           { fr:"squat toucher-talon",                        unit:"reps", patterns:["hinge"], nameEn:"Heel Touch Squats", sourceIds:["A-3.1"], source:"athleanX", exclusiveTo:["athleanX"] },
  fenteArriereSautee:          { fr:"fente arrière sautée",                       unit:"reps", patterns:["hinge"], nameEn:"Plyo Sprinter Lunges", sourceIds:["A-3.3"], source:"athleanX", exclusiveTo:["athleanX"] },
  dragonFly:                   { fr:"dragon fly",                                 unit:"reps", patterns:["tirage"], nameEn:"Dragon Fly", sourceIds:["A-4.2"], source:"athleanX", exclusiveTo:["athleanX"] },
  plancheDynamiqueNavySeal:    { fr:"planche dynamique Navy Seal",                unit:"reps", patterns:["core"], nameEn:"Navy Seal Knee Slides", sourceIds:["A-5.2"], source:"athleanX", exclusiveTo:["athleanX"] },
  abdosCrunchUnEtDemi:         { fr:"abdos crunch 1½",                            unit:"reps", patterns:["core"], nameEn:"Levitation Crunches", sourceIds:["A-5.3"], source:"athleanX", exclusiveTo:["athleanX"] },

  pontIschioJambiersGlissant:  { fr:"pont ischio-jambiers glissant",              unit:"reps", patterns:["hinge"], nameEn:"Slick Floor Bridge Curls", sourceIds:["B-1.1"], source:"athleanX", exclusiveTo:["athleanX"] },
  marchePontJambesTendues:     { fr:"marche en pont, jambes tendues",             unit:"reps", patterns:["hinge"], nameEn:"Long Leg Marches", sourceIds:["B-1.2"], source:"athleanX", exclusiveTo:["athleanX"] },
  plancheLateraleAlternee:     { fr:"planche latérale alternée",                  unit:"reps", patterns:["poussee"], nameEn:"Alternating Side Plank", sourceIds:["B-2.2"], source:"athleanX", exclusiveTo:["athleanX"] },
  frenchPressTriceps:          { fr:"french press triceps",                       unit:"reps", patterns:["poussee"], nameEn:"Triceps Extension", sourceIds:["B-2.3"], source:"athleanX", exclusiveTo:["athleanX"] },
  stepUpHaut:                  { fr:"step up haut",                               unit:"reps", patterns:["unilat"], nameEn:"High Step Ups", sourceIds:["B-3.1"], source:"athleanX", exclusiveTo:["athleanX"] },
  /* Le spec supposait une « fente avant » déjà là : il n'y en avait pas
     (arrière, marchées, croisées seulement). Création, arbitrée par Martin. */
  fentesAvant:                 { fr:"fentes avant",                               unit:"reps", patterns:["unilat"], nameEn:"Lunges", sourceIds:["B-3.2"], source:"athleanX", exclusiveTo:["athleanX"] },
  splitSquatSaute:             { fr:"split squat sauté",                          unit:"reps", patterns:["unilat"], nameEn:"Split Squat Jumps", sourceIds:["B-3.3"], source:"athleanX", exclusiveTo:["athleanX"] },
  elevationHautDosSol:         { fr:"élévation du haut du dos au sol",            unit:"reps", patterns:["tirage"], nameEn:"Back Widows", sourceIds:["B-4.3"], source:"athleanX", exclusiveTo:["athleanX"] },
  haloAbdos:                   { fr:"halo abdos",                                 unit:"reps", patterns:["core"], nameEn:"Ab Halos", sourceIds:["B-5.1"], source:"athleanX", exclusiveTo:["athleanX"] },
  situpPousseeCoude:           { fr:"sit-up poussée de coude",                    unit:"reps", patterns:["core"], nameEn:"Sit-Up Elbow Thrusts", sourceIds:["B-5.3"], source:"athleanX", exclusiveTo:["athleanX"] },
  reverseHyperBanc:            { fr:"reverse hyper sur banc",                     unit:"reps", patterns:["hinge"], nameEn:"Reverse Hypers", sourceIds:["B-6.1"], source:"athleanX", exclusiveTo:["athleanX"] },
};

export const UNITS = ["reps", "secondes"];
export const PER_SIDE = ["reparti", "chaque"];

export const exercise = (id) => EXERCISES[id];

/* Exclu d'un mode : invisible partout ailleurs. Seul Athlean X s'en sert
   aujourd'hui. */
export const estExclusif = (id) => Boolean(EXERCISES[id] && EXERCISES[id].exclusiveTo);

/* L'identifiant maison d'un identifiant du spec Athlean X (« A-1.1 »), ou
   null. C'est par là qu'une séquence écrite avec les ids du spec retrouve ses
   exercices. */
const PAR_SOURCE = new Map(Object.entries(EXERCISES)
  .flatMap(([id, ex]) => (ex.sourceIds || []).map((sid) => [sid, id])));
export const idOfSource = (sourceId) => PAR_SOURCE.get(sourceId) ?? null;

/* Le nom affiché. Passe par la table : le jour où un libellé change, il change
   partout, y compris dans les données déjà écrites sur le disque. */
export const labelOf = (id) => (EXERCISES[id] ? EXERCISES[id].fr : id);

/* La quantité, telle qu'on la montre. Les répétitions se disent nues (« 12 »),
   un maintien porte son unité (« 30 s ») : pendant l'effort, l'écran affiche ce
   nombre en grand et il ne doit pas y avoir de doute sur ce qu'on compte. */
export function quantityOf(id, n) {
  const ex = EXERCISES[id];
  return ex && ex.unit === "secondes" ? `${n} s` : `${n}`;
}

/* La précision de latéralité, à mettre là où il y a la place — sur la fiche,
   jamais dans le chrono.

   Un total réparti peut être impair : les coefficients de mode arrondissent
   sans savoir qu'un mouvement est latéral (`scaleRep(10, 2)` donne 13). On ne
   promet alors pas un partage exact, on dit d'alterner. Faire tomber ces
   totaux sur des nombres pairs relève de l'étape des modes, pas d'ici. */
export function sideNoteOf(id, n) {
  const ex = EXERCISES[id];
  if (!ex || !ex.perSide) return null;
  if (ex.perSide === "chaque") return "par côté";
  return n % 2 === 0 ? `${n / 2} par côté` : "en alternant les côtés";
}
