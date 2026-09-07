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

   La table se lit en deux parties. Au-dessus, les exercices que le catalogue
   prescrit. En dessous, les variantes de régression : mêmes entités, mêmes
   champs, mais aucune séance ne les cite — on ne les atteint que par une
   chaîne (`chains.js`). La séparation n'est pas décorative, c'est elle que
   contrôle le test d'entrée morte : au-dessus, une entrée que plus aucune
   séance n'utilise est un oubli ; en dessous, c'est la règle. */

export const EXERCISES = {
  /* Poussée */
  pompes:                 { fr:"pompes",                          unit:"reps", patterns:["poussee"] },
  pompesPiquees:          { fr:"pompes piquées",                  unit:"reps", patterns:["poussee"] },

  /* Tirage */
  pullups:                { fr:"pull-ups",                        unit:"reps", patterns:["tirage"] },
  chinups:                { fr:"chin-ups",                        unit:"reps", patterns:["tirage","supination"] },
  relevesGenouxSuspendu:  { fr:"relevés de genoux suspendu",      unit:"reps", patterns:["tirage","core"] },

  /* Squat */
  airSquats:              { fr:"air squats",                      unit:"reps", patterns:["squat"] },
  jumpSquats:             { fr:"jump squats",                     unit:"reps", patterns:["squat","cardio"] },

  /* Unilatéral */
  fentesArriere:          { fr:"fentes arrière",                  unit:"reps", perSide:"reparti", patterns:["unilat"] },
  fentesMarchees:         { fr:"fentes marchées",                 unit:"reps", perSide:"reparti", patterns:["unilat"] },
  fentesCroisees:         { fr:"fentes croisées",                 unit:"reps", perSide:"reparti", patterns:["unilat"] },

  /* Chaîne postérieure */
  hipThrusts:             { fr:"hip thrusts",                     unit:"reps", patterns:["hinge"] },
  hipThrustsUneJambe:     { fr:"hip thrusts sur une jambe",       unit:"reps", perSide:"reparti", patterns:["hinge","unilat"] },
  sdtUneJambe:            { fr:"soulevés de terre une jambe",     unit:"reps", perSide:"reparti", patterns:["hinge","unilat"] },
  superman:               { fr:"superman",                        unit:"reps", patterns:["hinge"] },

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
  corkscrews:             { fr:"corkscrews",                      unit:"reps", perSide:"reparti", patterns:["core"] },
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
  pompesPiedsSureleves:        { fr:"pompes pieds surélevés",                     unit:"reps", patterns:["poussee"] },
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

  vupsGenouxFlechis:           { fr:"V-ups genoux fléchis",                       unit:"reps", patterns:["core"] },
  vupsUneJambe:                { fr:"V-ups une jambe",                            unit:"reps", perSide:"reparti", patterns:["core"] },

  sdtUneJambeAppui:            { fr:"soulevés de terre une jambe, main en appui", unit:"reps", perSide:"reparti", patterns:["hinge","unilat"] },
};

export const UNITS = ["reps", "secondes"];
export const PER_SIDE = ["reparti", "chaque"];

export const exercise = (id) => EXERCISES[id];

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
