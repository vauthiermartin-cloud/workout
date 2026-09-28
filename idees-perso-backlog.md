---
topic: app-workout-25
date: 2026-09-27
status: backlog
---

# Backlog perso — idées issues de l'usage réel

Ce fichier vient d'une session de brainstorm produit menée par Martin hors de ce repo
(Claude, projet claude.ai « Fitness »). Il complète `pickup-app-workout.md` et
`brief-v2-multi-user.md` : ceux-ci restent la référence pour les décisions déjà actées,
celui-ci porte des idées nouvelles, pas encore dans le brief officiel, issues de séances
réellement vécues.

**Une étape à la fois, comme le reste du repo.** L'ordre ci-dessous est arbitré, ne pas en
prendre deux dans la même conversation.

**Après un ticket traité : mettre à jour son statut dans ce fichier** (Shipped, ou ce qui a
changé par rapport à la spec) — c'est ce qui permet à Martin de suivre l'avancement depuis
l'autre côté (claude.ai) sans repasser par le code.

## Ordre d'envoi

### 1. F-07 · Clarifier le skip pendant un repos — statut : Shipped (2026-09-27)
Ce matin (2026-09-22) : pause de 2 min entre blocs, bouton présent mais ambiguïté sur ce
qu'il fait (sauter le repos ou finir la séance).

Vérifié dans le code (`Timer.jsx`, `chrono.js`) : le comportement est déjà correct —
`goTo(run.idx + 1)` avance simplement à la phase suivante du plan, donc pendant un repos ça
mène au bloc de travail suivant, pas à la fin de séance. `TERMINER` ne s'affiche que sur la
toute dernière phase du plan. Le problème est uniquement le libellé, générique dans tous les
cas (« PASSER »).

- Label conditionnel : **« PASSER LE REPOS »** quand `ph.t === "rest"`, « PASSER » sinon,
  « TERMINER » inchangé sur la vraie dernière phase.
- Garde-fou à ajouter aux contrôles de cohérence existants : aucune séance ne doit se
  terminer sur une phase de repos — garantit que « TERMINER » veut toujours dire « travail
  fini », même après un futur changement de contenu.

### 2. F-03 · Prévention pubalgie — statut : Shipped (2026-09-27)
Isometric Hip Flexion (2x45sec/jambe) et Dead bug, garantis chacun au moins 3x/semaine.

**Révision du 2026-09-27 : pas de bloc en plus, pas de changement de durée de séance.**
Martin a été précis là-dessus : ces deux exercices remplacent un exercice déjà prévu dans le
plan du jour (slot de temps/pattern compatible), jamais ajoutés en plus. Le corps de séance
reste exactement ce qu'il est aujourd'hui, aucune minute supplémentaire.

**Seconde révision du 2026-09-27, en cours d'implémentation — c'est elle qui a été livrée.**
La substitution décrite ci-dessus est abandonnée : remplacer les sit-ups ne marchait pas. Le
bloc « pubalgie » revient, porte les deux mouvements, et le dead bug est en plus prescrit par
les séances pour les semaines où la case reste décochée. Détail dans le Log.

~~Techniquement : une substitution à fréquence hebdomadaire garantie, pas une addition de
temps — même famille d'opération que F-02 (remplacer un exercice en préservant le pattern),
mais construite ici en version simple et autonome, fixée sur ces deux exercices précis, sans
moteur générique. F-02 pourra généraliser plus tard si besoin, sans que ce ticket soit à
refaire (décidé : F-03 passe avant F-02 pour cette raison).~~

- Garde-fou : simulation hebdomadaire qui vérifie que hip flexion apparaît ≥3x/semaine et
  dead bug ≥3x/semaine, en plus de la couverture des patterns existante (10/10).
- Conséquence sur Fast Track (F-01) : plus rien à trancher — comme rien ne s'ajoute en
  temps, le correctif est présent quelle que soit la durée de la séance.

### 3. F-02 · Génération adaptée à la douleur (dynamique) — statut : Shipped (2026-09-27), table à valider — voir le Log
Sélecteur douleur en début de séance (cervicales / genoux / pubalgie / autre). Substitution
vers un exercice qui évite la zone touchée, en préservant si possible le schéma moteur.

Décidé : deux couches distinctes — une condition chronique (pubalgie, toujours prise en
compte) et un état du jour (ponctuel, ex: cervicales cette semaine), qui s'additionnent sans
s'écraser.

Décidé côté architecture : construire un **moteur de substitution léger et partagé**,
seulement ce dont F-02 a besoin maintenant — mais avec une forme générique
(`substituer(exercice, raison, contrainte)`) pensée pour être réutilisée sans réécriture par
la substitution équipement (étape 8 du brief officiel) et la substitution de régression
(étape 9, chaînes déjà écrites dans `chains.js` mais pas branchées).

### 4. F-06 · Ratio push/pull (révisé 2026-09-27) — statut : Shipped (2026-09-28) — voir le Log
**Révision du 2026-09-27 : le blocage matériel qui limitait ce ticket a disparu.** Martin a
ajouté l'équipement de tirage horizontal (voir `CLAUDE.md`, section Contraintes du domaine —
équipement exact à préciser). Le ticket change de nature : ce n'était plus une contrainte
insoluble, c'est maintenant une règle à construire.

**Deux règles actées, à implémenter ensemble :**

1. **Toute séance avec un créneau poussée contient un créneau tirage.** Règle dure, pas un
   minimum hebdomadaire — remplace toute lecture antérieure en termes de fréquence.
2. **Ratio cible de Martin, en équivalence de volume :** pour 15–20 pompes → 3 tractions
   (pronation) ou 5 chin-ups (supination), et le double en tirage horizontal selon la prise
   (6 en pronation, 10 en supination). À coder comme coefficients d'équivalence par exercice
   relatifs à la poussée (nouveau champ ou table à part dans `exercises.js`), pas comme un
   nombre de reps fixe recopié dans chaque séance.

**Scope volontairement limité — ne pas construire le moteur générique de génération
(formats-comme-templates) dans ce ticket.** Cette idée a été discutée en amont (session
claude.ai « Fitness ») comme chantier séparé, plus lourd, pas encore arbitré. Ici, même
philosophie que F-03 (deuxième révision) : éditer les séances existantes pour y ajouter ou
dimensionner les créneaux tirage horizontal manquants selon le coefficient, puis un
garde-fou de simulation hebdomadaire qui vérifie la règle 1 et le ratio de la règle 2 à une
tolérance à définir — même famille que les gardes-fous F-03 (hip flexion / dead bug ≥3x/semaine).

Pistes déjà écrites dans `brief-v2-multi-user.md`, toujours valables et à combiner avec ce
qui précède :
- Brancher la chaîne de régression tirage existante (`chains.js`) : suspension active →
  tirages d'omoplates → négatives 5s → assistées à l'élastique → tractions.
- Élastique de traction (~15€), toujours pertinent pour la progression, indépendamment du
  tirage horizontal.
- Revisiter le baseline HUMAN (4 tractions/12 pompes), noté dans le brief comme excluant
  une partie des pratiquants.

### 5. F-04 · Flag séance incohérente — statut : Shipped (2026-09-27), élargi en note de qualité — voir le Log
Bouton flag sur une séance + note optionnelle. Export incluant les séances flaguées avec
leurs paramètres complets (exercices, volumes, ordre) + la note, pour une revue à tête
reposée.

À ne pas confondre avec les contrôles de cohérence Vitest existants : ceux-là valident les
données du catalogue au build, celui-ci capture un ressenti utilisateur sur une séance
générée, en usage réel.

### 6. F-01 · Fast Track Mode — statut : à envoyer
Sélecteur de durée en amont de séance (10 min notamment). Réduction du volume + priorisation
des mouvements composés à haute valeur, pas un raccourcissement proportionnel de la séance
normale. Le bloc correctif F-03 reste inclus, toujours.

Pas de conflit avec le nom de l'app : « cap de 25 minutes » est un plafond, pas une durée
imposée — un mode plus court ne contredit pas la promesse.

### F-05 · Signal de calibration — pas un ticket
Cas de test pour F-04 une fois posé : EMOM du lundi (5 burpees + 12 pompes/min, squats entre
les deux) → rupture trop rapide. À rapprocher du baseline HUMAN (voir F-06), déjà noté dans
le brief comme trop haut pour une partie des pratiquants — pas un problème isolé du lundi.

### F-09 · Notation qualité de séance — tranché et livré avec F-04 le 2026-09-27
Martin veut pouvoir noter chaque séance en qualité (pas juste signaler une incohérence),
pour donner un signal d'amélioration au moteur de génération — pertinent surtout si/quand
le chantier moteur générique (formats-comme-templates, discuté en amont sur claude.ai) se
construit : c'est le signal qui manque pour savoir si l'enchaînement des créneaux choisis
automatiquement est bon.

~~**Distinct de F-04**~~ — **arbitré le 2026-09-27 : un seul bouton, une échelle à trois
niveaux.** Martin a tranché la question laissée ouverte ci-dessous : ce n'est pas une note
séparée, c'est la même. Le plus haut (« on la garde ») porte le signal d'apprentissage que
décrivait F-09, le plus bas (« ça ne va pas ») porte le signalement de F-04, et l'échelon
intermédiaire dit que l'app a fait le job. Voir le Log de F-04.

~~À trancher avant de spécifier : une note séparée, ou un champ ajouté à F-04 (même bouton,
deux signaux) ? Pas encore arbitré avec Martin.~~

## Log

**2026-09-27 — F-07 · Clarifier le skip pendant un repos.** Conforme à la spec, sans écart.

- Le choix du libellé est sorti du composant : `sortie(run)` dans `lib/chrono.js` répond
  `fin` / `repos` / `phase`. Le chrono affiche « TERMINER », « PASSER LE REPOS » ou
  « PASSER » ; le comportement du bouton n'a pas bougé (`goTo(run.idx + 1)`).
- L'écran « chrono interrompu » suit la même règle : « PASSER LE REPOS » y remplace
  « PASSER À LA PHASE SUIVANTE » quand la phase gelée est un repos.
- Garde-fou ajouté aux contrôles de cohérence : aucun plan de chrono ne se termine par un
  repos. Vérifié en le cassant volontairement — le test tombe bien. Le catalogue actuel le
  respecte déjà (8 plans contiennent un repos, aucun ne finit dessus).
- `sortie` est testée dans `test/chrono.test.js`, y compris le cas où la fin prime sur le
  repos.
- 158 tests verts, build OK.

**2026-09-27 — F-03 · Prévention pubalgie.** Livré dans la forme arbitrée en fin de
conversation. Deux chemins indépendants, aucun moteur de substitution.

- **Le bloc pubalgie, une case à cocher.** À côté de « Échauffement » sur l'écran
  d'avant-lancement, cochée par défaut. Cinq minutes insérées entre l'échauffement et la
  séance : 4 × 45 s d'isométrie de flexion de hanche en alternant les jambes, puis 2 × 1 min
  de dead bug. Deux phases de chrono, parce que les intervalles diffèrent et que c'est le
  chrono qui doit marquer les changements. Nouvel exercice `flexionHancheIso`, nouvelle
  donnée `app/src/data/correctif.js`.
- Le bloc est **hors des 25 minutes**, comme l'échauffement : `horsSeance` dans `chrono.js`
  porte maintenant les deux cas. La ligne « Isométries kiné » de l'échauffement a été retirée,
  elle faisait doublon.
- Le dead bug s'y prescrit au temps alors que la bibliothèque le compte en répétitions. Sa
  ligne est donc une note, dont le texte se lit dans la table des exercices pour qu'un
  renommage la suive.
- **Le dead bug dans les séances, pour les semaines sans la case.** Les sit-ups n'ont pas
  bougé d'un iota : une ligne de dead bug a été **ajoutée** aux dix séances du jeudi et du
  vendredi. Mesuré sur 2 000 semaines simulées : **exactement 2 par semaine, minimum 2**. La
  garantie est dans le contenu, pas dans le tirage — le générateur n'a pas été touché.
- Pourquoi jeudi et vendredi : lundi et mardi ne peuvent rien recevoir sans changer la durée
  (EMOM à minutes fixes, escaliers à arithmétique), et mercredi est le jour le plus chargé en
  volume. Le jeudi est entièrement en AMRAP à durée fixe, où une ligne de plus ne coûte aucune
  minute ; le vendredi absorbe la ligne dans ses blocs plafonnés. Les deux jours sont
  consécutifs, ce qui n'est pas idéal et n'était pas évitable.
- Deux séances portent une conséquence à connaître : « AMRAP 20 poussée-tirage » gagne de la
  sangle alors que son intitulé annonce poussée et tirage, et l'EMOM 12 du vendredi loge les
  dead bugs dans la minute des chin-ups plutôt que d'allonger le cycle.

**Garde-fous ajoutés** (172 tests verts, build OK) :

- le bloc tient bien 4 × 45 s puis 2 × 1 min, et alterne les jambes ;
- aucune séance ne prescrit l'isométrie — l'y trouver voudrait dire qu'elle est prescrite deux
  fois et que le cap de 25 minutes est tombé en silence ;
- toutes les séances des jours correctifs prescrivent le dead bug, fiche **et** chrono : c'est
  ce test qui porte la garantie des 2 par semaine ;
- le bloc n'entre ni dans le total annoncé ni dans le temps fait ;
- **nouveau contrôle général** : fiche et chrono citent les mêmes exercices, pour les 45
  séances. Il manquait, et neuf séances venaient d'être éditées à la main dans deux fichiers.
  Il a révélé une anomalie antérieure, inscrite comme exception : « Gainage descendant » porte
  son contenu dans des libellés de phase au lieu de lignes typées, donc rien ne le compte.

**2026-09-27 — F-02 · Génération adaptée à la douleur.** Livré conforme à la spec, y compris
la forme générique demandée pour le moteur.

- **Le moteur** : `app/src/lib/substitution.js`, `substituer(exercice, raison, contrainte)`.
  Une seule table par raison, dans `TABLES`. Brancher la substitution d'équipement (étape 8)
  ou de régression (étape 9) se fera en ajoutant une entrée à cet objet, sans toucher à un
  appelant. Le moteur ne choisit jamais une quantité : une substitution garde le nombre de la
  ligne, donc le volume et la durée de la séance ne bougent pas.
- **Les deux couches** : une condition chronique dans les réglages (onglet SUIVI, « zones
  sensibles »), et un état du jour reposé avant chaque chrono. Elles s'additionnent, aucune
  n'écrase l'autre ; une zone chronique apparaît verrouillée dans le sélecteur du jour, pour
  qu'on aille la changer là où on l'a déclarée.
- **Aucune zone chronique par défaut** (corrigé le 2026-09-28). La pubalgie l'était à la
  livraison ; Martin l'a retirée le lendemain, et la raison vaut d'être gardée : une zone
  chronique s'affiche « TOUJOURS » dans le sélecteur du jour, donc elle ne se décoche pas
  d'un matin. La cocher à la place de quelqu'un verrouille son catalogue sans qu'il l'ait
  demandé. Le besoin se coche quand il se présente, séance par séance ou en réglage.
- **Le journal porte les zones appliquées** (`mal`). Sans ça, relire une séance faite genou
  bloqué l'aurait rejouée en squats le jour où le genou va mieux. La couverture hebdomadaire
  se reconstruit elle aussi ligne par ligne avec les zones de chaque ligne.
- **Un schéma moteur peut devenir inatteignable.** Le genou fait disparaître le squat : aucune
  substitution ne le préserve, et c'est franc. La grille le barre et le sort du compte au lieu
  d'afficher une case que rien ne peut cocher, et le générateur cesse de courir après. Le
  brief avait tranché la même question pour le matériel manquant (section 2.1) ; c'est la même
  règle, appliquée ici.

**Ce qui reste à valider, et c'est le point important.** La table de `app/src/data/douleurs.js`
est un arbitrage de mouvement, pas une prescription : elle applique des principes généraux et
doit être relue par le kiné. Trois entrées méritent un œil en particulier :

- `jumpSquats → airSquats` en pubalgie, l'entrée la plus large des trois zones : elle retire
  le seul squat pliométrique de toutes les séances ;
- `burpees → burpees sans saut ni pompe` en genou : c'est le seul cran sans saut du catalogue,
  et il retire la pompe avec, donc on substitue un peu plus que la douleur ne l'exige ;
- `airSquats → hipThrusts` en genou, qui est ce qui fait disparaître le schéma squat.

**Garde-fous ajoutés** (193 tests verts, build OK) :

- aucune substitution ne change l'unité d'une ligne — « 4 s de suspension » à la place de
  4 tractions est la faute que ce genre de table produit en silence ;
- aucun remplaçant n'est écarté par sa propre zone, et toute combinaison des quatre zones se
  résout sans boucle ;
- fiche et chrono citent les mêmes exercices une fois substitués, pour chaque zone ;
- la pubalgie et les cervicales ne coûtent aucun schéma moteur ; le genou coûte le squat, et
  seulement lui ;
- aucune zone ne fait disparaître le dead bug des séances du jeudi et du vendredi — sans ce
  test, F-02 aurait pu casser la garantie de F-03 sans toucher à une ligne de F-03.

**2026-09-27 — F-04 · Flag séance incohérente, élargi en note de qualité.** Livré dans la
forme demandée en début de conversation : pas un bouton de flag, une échelle à trois niveaux.
Elle absorbe F-09, qui posait exactement la question « note séparée ou même bouton ? ».

- **Trois niveaux** (`app/src/lib/qualite.js`) : « ON LA GARDE » — cet enchaînement, tel
  qu'il est sorti, on veut le rejouer ; « RIEN À DIRE » — l'app a fait le job ; « ÇA NE VA
  PAS » — signalement, qui ouvre un champ de texte.
- **La note est facultative.** Une séance signalée sans un mot part dans la liste « à
  documenter » du récap, ce qui est plus honnête qu'un formulaire qui bloque la sortie de
  l'écran de fin.
- **Où elle se donne** : sur l'écran de fin, **après** le ressenti et jamais en même temps —
  deux rangées de trois boutons côte à côte se répondraient l'une pour l'autre. Elle se
  corrige ensuite depuis la relecture d'une séance : ce qui clochait se voit parfois le
  lendemain.
- **Ressenti et qualité restent deux choses.** Le ressenti parle du pratiquant (le dosage
  était-il juste), la qualité parle de la séance (l'enchaînement tenait-il debout). Deux
  modules, deux questions, et un test qui interdit qu'un identifiant soit partagé entre les
  deux — une valeur écrite dans un champ se relirait sinon dans l'autre.
- **Le dossier de revue** (`app/src/lib/revue.js`) part dans le récap copiable : les séances
  sans note d'abord, puis les signalées avec leur note, puis les gardées — chacune avec son
  **contenu complet**, exercices, nombres et ordre.
- Ce contenu n'est pas stocké : il se reconstruit du nom, du mode et des zones, qui sont tous
  sur la ligne du journal. Le stocker aurait fait grossir le journal et l'aurait périmé au
  premier renommage d'exercice. C'est aussi ce qui rend « on la garde » réellement utile :
  sans ça, on ne garderait qu'un nom.
- L'onglet SUIVI réclame les notes manquantes avant de proposer l'export, et dit combien de
  séances sont gardées.

**Garde-fous ajoutés** (210 tests verts, build OK) :

- aucun identifiant partagé entre ressenti et qualité ;
- une note vide ou faite d'espaces ne compte pas comme une note ;
- le dossier réclame d'abord les signalements sans note, et ne liste jamais une séance deux
  fois ;
- le contenu reconstruit applique le mode et les zones **de la ligne**, pas ceux du jour où
  on relit ;
- les 25 séances du catalogue savent se relire — un bloc sans texte ni exercice produirait
  une ligne vide dans le dossier, et personne ne le verrait avant d'exporter.

**2026-09-28 — F-06 · Ratio push/pull.** Livré dans le scope serré demandé : une table figée,
des séances éditées à la main, des garde-fous. Aucun moteur générique, `substituer()` n'a pas
été touché.

- **Deux exercices** dans `exercises.js` : `tiragesHorizontaux` (pronation, schéma `tirage`) et
  `tiragesHorizontauxSup` (supination, schémas `tirage` + `supination`). Libellés volontairement
  génériques — l'équipement exact est encore `[À PRÉCISER]` dans `CLAUDE.md`, et un nom
  d'appareil aurait figé l'inconnue dans le catalogue.
- **La table** : `app/src/data/equivalences.js`. Un créneau de 15–20 pompes s'équilibre par
  3 tractions, 5 chin-ups, 6 tirages horizontaux ou 10 en supination. Deux règles de trois,
  pas de moteur.
- **Cinq séances éditées** (fiche et chrono ensemble) — les seules qui poussaient sans tirer :
  Escalier montant et Escalier descendant (le tirage monte et descend avec le reste, 2/3/4/5 et
  5/4/3/2), Escalier ouvert (1 rep, qui grandit avec le `pas`), Tours au sol (4 par tour),
  AMRAP 18 au sol (5 par tour, en supination — la prise y était libre et ça donne au jeudi une
  seconde source de biceps).
- **Trois d'entre elles étaient le mardi.** Le déséquilibre ressenti venait de là : une journée
  entière de poussée sans tirage, sauf « Escalier tirage ».

**Ce que la mesure a montré, et qui mérite une décision.** Par les coefficients de Martin, les
séances qui avaient déjà du tirage sont **au-dessus de la parité, de 146 % à 292 %** — le
catalogue est plus lourd en tirage qu'en poussée, pas l'inverse. Deux lectures possibles : les
coefficients sont généreux envers le tirage, ou le déséquilibre ressenti venait entièrement des
cinq séances à zéro. Le garde-fou ne pose donc **qu'un plancher** (90 %, la marge d'arrondi des
nombres écrits à la main), aucun plafond : en poser un ferait tomber la moitié du catalogue sur
une règle que personne n'a demandée. À rouvrir si les 292 % se ressentent à l'usage.

**Garde-fous ajoutés** (220 tests verts, build OK), dans `app/test/ratio.test.js` :

- règle 1, sur les 25 séances : aucune poussée sans tirage, fiche **et** chrono ;
- règle 2, par séance et sur 500 semaines simulées : le tirage vaut au moins 90 % de la poussée
  en équivalence. Vérifié en le cassant — le test nomme la séance et son pourcentage ;
- la table ne cite que des exercices de tirage, rend bien les nombres arbitrés, et les classe du
  plus dur au plus accessible : une table inversée aurait donné des créneaux deux fois trop
  courts sans rien signaler ;
- **la règle de prise, précisée par Martin le 2026-09-28 et inscrite dans `CLAUDE.md`** : à la
  barre une séance garde une seule prise (contrôle d'origine, inchangé), mais dès qu'un tirage
  horizontal accompagne un vertical, il prend la prise opposée — jamais deux mouvements de
  pronation ni deux de supination dans une même séance. Le premier jet de ce ticket testait
  l'inverse ; le test a été remplacé. Aucune séance ne combine encore les deux plans, donc le
  contrôle passe à vide : un second test vérifie qu'il attraperait bien le cas, un garde-fou
  qu'on n'a jamais vu se déclencher n'en étant pas un ;
- aucun finisher ne prescrit de poussée : la question ne s'est jamais posée hors des 25 minutes,
  et le test la posera le jour où ça changera.

**Noté, pas construit** (comme demandé) :

- les deux nouveaux exercices ne sont **pas** dans `chains.js`, et l'arbitrage a eu lieu dans
  la foulée : **le tirage horizontal aura sa propre chaîne**, pas un cran dans celle des
  tractions. Une chaîne est le même mouvement à des difficultés différentes ; un tirage
  horizontal est un autre plan, et l'y glisser laisserait l'étape 9 croire qu'elle baisse la
  difficulté alors qu'elle change ce qui est travaillé. La chaîne à écrire ferait varier
  l'angle du corps — pieds surélevés, pieds au sol, genoux pliés. À faire à l'étape 9.
- la table traite toute poussée comme une pompe : les pompes piquées sont plus dures et comptent
  pareil. À affiner le jour où une séance en pompes piquées pures paraîtra sous-dosée.