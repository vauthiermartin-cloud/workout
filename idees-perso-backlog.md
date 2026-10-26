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

### 6. F-10 · Découpler format et journal du jour de la semaine — statut : prochaine priorité (2026-09-28)
**Prérequis structurel à la feuille de route « programme sur-mesure »** (discutée sur claude.ai,
session du 2026-09-28) : fréquence hebdo choisie par l'utilisateur (3/4/5 séances), format
différent chaque jour, pioche dans une bibliothèque qui grandit par les likes. Rien de tout ça
ne tient tant que le format et le journal sont câblés sur le jour calendaire plutôt que sur une
position dans le programme.

**Ce ticket ne construit aucune de ces fonctionnalités.** Il ne fait qu'un seul geste : partout
où le code lit ou écrit un jour de semaine (1 à 5) pour décider du format ou de la séance,
faire lire ou écrire une position dans le programme (séance n° 1 à n) à la place. Le
comportement visible ne change pas — toujours 5 séances/semaine, mêmes formats, même
correspondance qu'aujourd'hui (position 1 = ce qu'était lundi, etc.).

**Repéré dans le code (vérifié le 2026-09-27) :**
- `app/src/data/days.js` : `DAYS`, `STRETCH_BY_DAY`, `FINISHER_BIAS` sont des tables indexées
  `{1: ..., 5: ...}` sur le jour calendaire.
- `app/src/lib/journal.js` : une ligne par date ISO, qui référence un `dayKey` (1-5) — y compris
  la logique de rattrapage de week-end (`entreeDeLOnglet`), qui range une séance de samedi sous
  l'onglet du thème qu'elle a joué.

**Explicitement hors scope, pour plus tard :**
- Le sélecteur de fréquence (3/4/5) à l'onboarding — étape suivante de la feuille de route.
- La généralisation de `pickVariant` à un pool de formats indépendant du calendrier.
- Le mécanisme de like → promotion, et le rebranchement du journal en entrée du générateur.
- **Pas de moteur générique ici non plus** — même consigne que sur F-06 : si une généralisation
  plus large te semble nécessaire en cours de route, note-la, ne la construis pas dans ce ticket.

**Un point à garder en tête sans le construire :** les futurs signaux d'apprentissage (likes,
historique) porteront un identifiant de profil (décidé le 2026-09-28, app mono-utilisateur
aujourd'hui, multi-utilisateur prévue). Rien à faire ici — juste ne pas structurer `journal.js`
d'une façon qui rendrait ça difficile à ajouter ensuite.

**Garde-fous à ajouter, dans l'esprit des contrôles existants :** la position 1 à n produit
exactement les mêmes séances et le même comportement de rattrapage de week-end qu'avant le
refactor — un test de non-régression comparant l'ancien et le nouveau comportement sur les
45 séances est probablement le plus sûr.

### 7. F-01 · Fast Track Mode — statut : à envoyer
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

## Fil Athlean X — programme fixe à côté du mode Classique (ouvert le 2026-10-26)

Vision : un deuxième mode de séance, à côté du mode classique (génération/bibliothèque), piochant dans un contenu fixe (Workout A/B × NORMAL/BUILD/DEFINE) avec son propre chrono dédié. Le cap 25 min reste la promesse du mode Classique uniquement — Athlean X est un mode à part avec sa propre promesse (sessions longues occasionnelles), pas une exception à D-09.

Source : `perfect_home_workout_spec_v2.md` (upload claude.ai, session du 2026-10-26).

### F-11 · Sélecteur de mode — statut : Shipped (2026-10-26) — voir le Log

Écran de choix **Classique / Athlean X** avant l'entrée en séance, accessible tous les jours y compris week-end (pas de restriction lun-ven). Défaut sur Classique — zéro changement de comportement pour l'usage quotidien existant. Pure routing, aucun contenu Athlean X derrière, aucune logique.

**Hors scope.** Calculs, timer, couverture.

**Tests.** Le parcours Classique est bit-for-bit identique à avant quand on le sélectionne (non-régression).

---

### F-12 · Chrono Athlean X — statut : Shipped (2026-10-26) — voir le Log

Moteur dédié, séparé du moteur existant (EMOM/Tabata/etc. intouchés).

- Pré-départ 5s : nom du 1er exo affiché en grand.
- Exercice 60s : "ENSUITE : [nom suivant]" visible dès la 1ʳᵉ seconde.
- Transition 5s entre tous les exercices (y compris entre phases/rounds) ; aucune transition après le dernier.
- 3 sons : **TICK** (chaque seconde de pré-départ + transition), **GO** (à 0 de pré-départ et de transition), **WARNING** (10s restantes dans l'exo, configurable 5/10s, une fois par intervalle, ne coupe pas le minutage).
- Vibration discrète en complément des 3 sons, jamais seule — dégrade proprement si l'appareil ne supporte pas l'API vibration.
- **Pause** : gèle immédiatement décompte et alertes ; **Reprise** : continue à la seconde restante, sans rejouer les alertes déjà émises. Disponible à tout moment.
- **Skip** (suivant) : avance l'index d'une étape, redémarre le minutage de la nouvelle étape courante à son plein temps.
- **Rewind** (précédent) : redémarre le minutage de l'étape **courante** (pas l'étape précédente) à son plein temps, index inchangé.
- Skip/rewind coupent proprement le son/vibration en cours sans en déclencher un en trop sur la nouvelle étape.
- Horloge monotone (échéances, pas comptage de ticks) → pas de double-bip au retour background/foreground.
- Déverrouillage audio au clic sur "Démarrer" (contrainte iOS).

**Hors scope.** Vrai "retour à l'étape précédente" (rewind = redémarrage de l'étape courante, pas navigation arrière dans la séquence).

**Arbitrages de Martin (2026-10-26), avant le code :**
1. **Les tests de durée de F-12 portent sur des séquences fictives** : durée attendue = 5 s de pré-départ + n × 60 s + (n − 1) × 5 s de transition. Les trois durées réelles (34:40 / 26:00 / 26:00) passent dans les tests de F-13, qui a seul les vraies séquences.
2. **WARNING fixe à 10 s restantes** : une constante, pas de réglage enregistré pour l'instant. **Écart acté avec la spec** (« configurable 5/10s »).
3. **Pas de quatrième son « fin d'effort » à 0 s d'un exercice**, bien que `perfect_home_workout_spec_v2.md` §2.2 en prévoie un : on garde les trois sons TICK / GO / WARNING du backlog.
4. **Un interrupteur Son activé / désactivé**, demandé par le spec source §2.4 et absent du backlog. Défaut : activé. **Il n'est pas enregistré** : chaque séance repart son activé. **Son coupé, la vibration se coupe aussi** : la garder seule contredirait la règle « vibration en complément des sons, jamais seule ».

**Tests.** Durées totales exactes par calcul programmatique, sur séquences fictives (voir arbitrage 1) ; zéro bip doublé sur un cycle background→foreground simulé ; pause conserve le temps restant exact ; skip et rewind ne cassent pas le compte total d'étapes restantes.

---

### F-12.5 · Fusion bibliothèque Athlean X (Workout A + B) — statut : Shipped (2026-10-26) — voir le Log (20 créations et 12 fusions après arbitrage, pas 26 et 6)

**Objectif.** Ajouter les exercices Athlean X à `exercises.js` sans dupliquer ceux déjà présents, en gardant la traçabilité vers le spec original pour pouvoir rejouer une séance Athlean X à l'identique.

**Hors scope.** Aucune éligibilité à la génération classique, à `pickVariant`, à la substitution F-02 ou au calcul de couverture 10/10. Ces exos restent invisibles du moteur classique pour l'instant (`exclusiveTo: ["athleanX"]`).

**Propriétés à ajouter sur chaque entité concernée :**
```js
{
  nameEn: "...",          // nom officiel Athlean X, jamais traduit/perdu
  sourceId: "A-1.1",      // id du spec, pour rejouer une séance stricte
  source: "athleanX",
  exclusiveTo: ["athleanX"],
}
```

**26 créations :**

| ID spec | Nom EN | id maison | Libellé FR |
|---|---|---|---|
| A-1.1 | Alternating Single Leg Box Squats | `boxSquatAlterne` | Box squat alterné |
| A-1.2 | 1½ Bottomed Out Squats | `squatUnEtDemiBas` | Squat 1½ (position basse) |
| A-1.3 | Jump Squats | `squatSaute` | Squat sauté |
| A-2.1 | Pike Pushups | `pompesEnV` | Pompes en V |
| A-2.2 | Rotational Pushups | `pompesRotationEpaule` | Pompes rotation épaule |
| A-2.3 | Cobra Pushups | `pompesCobra` | Pompes cobra |
| A-3.1 | Heel Touch Squats | `squatToucherTalon` | Squat toucher-talon |
| A-3.2 | Alternating Sprinter Lunges | `fenteArriere` | Fente arrière |
| A-3.3 | Plyo Sprinter Lunges | `fenteArriereSautee` | Fente arrière sautée |
| A-4.2 | Dragon Fly | `dragonFly` | Dragon fly |
| A-5.1 | Reverse Corkscrews | `abdosCorkscrew` | Abdos corkscrew |
| A-5.2 | Navy Seal Knee Slides | `plancheDynamiqueNavySeal` | Planche dynamique Navy Seal |
| A-5.3 | Levitation Crunches | `abdosCrunchUnEtDemi` | Abdos crunch 1½ |
| B-1.1 | Slick Floor Bridge Curls | `pontIschioJambiersGlissant` | Pont ischio-jambiers glissant |
| B-1.2 | Long Leg Marches | `marchePontJambesTendues` | Marche en pont, jambes tendues |
| B-2.1 | Elevated Feet Pushups | `pompesPiedsSureleves` | Pompes pieds surélevés |
| B-2.2 | Alternating Side Plank | `plancheLateraleAlternee` | Planche latérale alternée |
| B-2.3 | Triceps Extension | `frenchPressTriceps` | French press triceps |
| B-3.1 | High Step Ups | `stepUpHaut` | Step up haut |
| B-3.3 | Split Squat Jumps | `splitSquatSaute` | Split squat sauté |
| B-4.1 | Chinups | `tractionSupination` | Traction supination |
| B-4.3 | Back Widows | `elevationHautDosSol` | Élévation du haut du dos au sol |
| B-5.1 | Ab Halos | `haloAbdos` | Halo abdos |
| B-5.2 | V-Up Tucks | `vUpGroupe` | V-up groupé |
| B-5.3 | Sit-Up Elbow Thrusts | `situpPousseeCoude` | Sit-up poussée de coude |
| B-6.1 | Reverse Hypers | `reverseHyperBanc` | Reverse hyper sur banc |

**6 fusions (ajouter les 4 propriétés sur l'entité existante, ne rien créer) :**

| ID spec | Nom EN | Fusionner vers |
|---|---|---|
| A-4.1 | Pullups | Tractions (id existant — à confirmer contre `exercises.js`) |
| A-4.3 | Australian Pullups | `tiragesHorizontaux` |
| A-6.1 | Superman | Superman (id existant — à confirmer) |
| B-1.3 | Hip Thrust | Hip thrust (id existant — à confirmer) |
| B-3.2 | Lunges | Fente avant (id existant — à confirmer) |
| B-4.2 | Australian Pullups | `tiragesHorizontaux` |

**Note pour Claude Code** : pour les 4 fusions marquées "à confirmer", chercher l'id réel dans `exercises.js` avant d'écrire — ne pas deviner, ne pas créer de doublon si l'id diffère de ce qui est supposé ici.

**Tests.** Pas de nouveau comportement observable (ces exos restent `exclusiveTo: athleanX`, invisibles ailleurs) — vérifier que la suite existante (220 tests) reste verte et qu'aucun exo fusionné n'apparaît deux fois dans la bibliothèque.

---

### F-13 · Catalogue et séquences Athlean X — statut : Shipped (2026-10-26) — voir le Log

**Depuis F-12.5** : écrire les séquences avec les ids du spec (`A-1.1`…) et les résoudre par
`idOfSource` (`app/src/data/exercises.js`). Plusieurs ids maison de la table F-12.5 n'existent
pas — les doublons ont été fusionnés (voir le Log) : ne jamais recopier cette table.

Données statiques Workout A/B × NORMAL/BUILD/DEFINE au format JSON du §6 du spec (`perfect_home_workout_spec_v2.md`), avec les ids issus de F-12.5 (`id` maison + `sourceId`). Génère la liste chronologique `exercise`/`transition` à partir des phases.

**Hors scope.** Aucune génération dynamique — contenu figé, éditable seulement en modifiant les données.

**Tests.** Pour chaque (workout, mode) : nombre d'exercices/transitions exact (32/31, 24/23, 24/23) et durée totale conforme au spec (34:40 / 26:00 / 26:00). **Ces trois durées réelles sont à la charge de F-13** (arbitrage de Martin du 2026-10-26) : F-12 ne les a vérifiées que sur des séquences fictives de 32 et 24 exercices, faute de contenu.

---

### F-14 · Branchement, alternance A/B, journal — statut : Shipped (2026-10-26) — voir le Log

Connecte F-11 → F-13 → F-12.

- **Entrée** : Classique vs Athlean X (F-11). Si Athlean X :
  - `lastAthleanWorkout` absent (jamais joué) → écran de choix A/B.
  - `lastAthleanWorkout` présent → auto-sélection de l'opposé, pas d'écran de choix.
  - Mode (NORMAL/BUILD/DEFINE) : choix à chaque séance, pas d'auto-déduction.
- **Fin de séance** → écran récap saisie reps (F-15) → écriture journal → mise à jour `lastAthleanWorkout`.
- **Rattrapage week-end** : aucune logique dédiée à écrire — l'alternance A/B n'étant pas calée sur le calendrier, jouer un samedi fonctionne nativement. Seul prérequis : F-11 accessible tous les jours.
- **Journal** : nouvelle entrée type, à côté des entrées classiques existantes :
```js
{
  date: "...",
  type: "athleanX",
  workoutId: "A" | "B",
  mode: "NORMAL" | "BUILD" | "DEFINE",
  reps: { "A-1.1": 14, "A-1.2": 9, ... } // clé = sourceId
}
```

**Tests.** Séquence A→B→A→B sur 4 lancements non consécutifs (avec des jours sautés entre) ; premier lancement jamais joué affiche bien le choix A/B ; mode Classique inchangé tous les jours y compris week-end.

---

### F-15 · Saisie des reps post-séance Athlean X — statut : Spec prête

Écran récap en fin de séance Athlean X : liste de tous les exercices joués (dans l'ordre de la séance), un champ numérique reps par exercice, pré-rempli vide. Validation → écrit dans le journal (structure F-14) → retour écran d'accueil.

**Hors scope.** Pas de validation/plausibilité des reps saisis, pas de calcul de progression automatique (juste le stockage).

**Tests.** Récap liste bien tous les exercices de la séance jouée (pas le catalogue complet) ; champ vide accepté (reps optionnel, pas de blocage) ; `sourceId` utilisé comme clé même si l'id maison change plus tard.

---

### F-16 · Échauffement et étirements Athlean X — statut : Shipped (2026-10-26) — voir le Log

Demande de Martin après F-14 : brancher l'échauffement et les étirements du Classique sur Athlean X.
Arbitrages : **échauffement comme le Classique** (case cochée par défaut, même bloc de 5 min,
même contenu, hors de la durée annoncée) ; **étirements proposés en fin de séance**, séquence
suggérée « Enchaînement complet » (les deux workouts sont corps entier), AUTRE fait défiler les
cinq, inscrits sur la séance.

---

### F-17 · Univers rouge d'Athlean X — statut : Shipped (2026-10-26) — voir le Log

Demande de Martin : Athlean X en rouge, comme le Classique est en vert fluo. Arbitrage : **tout
Athlean X** — bouton du sélecteur, entrée, carte de reprise, chrono, échauffement et étirements
Athlean. Un rouge distinct de l'orange des alertes, qui reste l'alerte dans les deux modes ; les
transitions du chrono passent en blanc. SUIVI reste vert, commun aux deux modes.

---

### Idée — suivi de progression Athlean X (pas un ticket)
Une fois quelques semaines de reps saisis via F-15 : affichage d'évolution par exercice (sourceId). Forme à définir une fois qu'on a des données réelles à regarder — ne pas spécifier à vide.

---

**Ordre d'envoi du fil** : F-11 → F-12 → F-12.5 → F-13 → F-14 → F-15 (F-16 et F-17, demandés en cours de route, sont livrés avant F-15), une étape à la fois avec Claude Code, jamais plusieurs dans la même conversation (règle actée dans `CLAUDE.md`). Indépendant de l'ordre d'envoi
ci-dessus : les deux fils ne se bloquent pas. Les entrées de Log des deux fils vont dans le `## Log`
ci-dessous.

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

**2026-10-26 — F-11 · Sélecteur de mode (fil Athlean X).** Conforme à
la spec : pur aiguillage, aucun contenu, aucun chrono, aucune donnée Athlean X.

- Deux boutons **CLASSIQUE / ATHLEAN X** en tête de l'onglet SÉANCE, au-dessus de la rangée
  des jours. Aucune condition de date : ils s'affichent aussi le week-end.
- **Pas un écran intermédiaire, un sélecteur posé sur l'écran existant.** Un écran de choix
  à traverser aurait ajouté un tap à chaque séance du matin ; Classique étant présélectionné,
  la fiche du jour reste là où elle était.
- **Le mode n'est pas enregistré** : l'app rouvre toujours sur Classique (`MODE_PAR_DEFAUT`
  dans `app/src/data/modes.js`). Retenir Athlean X d'une veille aurait fait de l'usage
  quotidien une exception à décocher.
- Sous Athlean X, un écran vide qui dit que le programme n'est pas en place — rien à lancer.
  Passer d'un mode à l'autre ne touche à aucun état de la séance classique (tirage, cases,
  zones du jour), qu'on retrouve telle quelle au retour.
- **Écart avec la spec, un seul** : reprendre une séance interrompue depuis le bandeau
  repasse en Classique. Le bandeau s'affiche dans les deux modes ; sans ce retour, le bilan qui
  suit le chrono serait retombé sur l'écran vide d'Athlean X.
- **Non-régression** : le rendu de la branche Classique de `App.jsx` n'a pas été modifié —
  le diff se limite à la condition d'aiguillage et à l'insertion du sélecteur. `App` ne se
  rend pas en test (il touche `window`) ; le sélecteur et l'écran vide sont donc sortis dans
  `components/Mode.jsx`, testés dans `rendu.test.jsx` : défaut sur Classique, un seul mode
  marqué choisi, aucun bouton ni CTA de lancement sous Athlean X.
- 224 tests verts (221 + 3), build OK. Vérification visuelle dans un navigateur non faite :
  le renderer de preview expire sur cette machine, le repli reste le rendu statique en test.

**2026-10-26 — F-12 · Chrono Athlean X (fil Athlean X).** Moteur livré, non branché — le
branchement est F-14. Deux points tranchés avec Martin avant d'écrire du code :

- **Les durées 34:40 / 26:00 / 26:00 sont testées sur des séquences synthétiques.** Le
  document source `perfect_home_workout_spec_v2.md` n'est pas dans le dépôt, et les séquences
  réelles sont le contenu de F-13. Elles se retrouvent toutes par le calcul :
  5 + n × 60 + (n − 1) × 5, avec n = 32 (2 080 s) ou 24 (1 560 s). **F-13 reprend le test
  sur les vraies séquences**, et c'est là que se vérifieront les comptes 32/31 et 24/23.
- **Le WARNING est fixe à 10 s restantes** : une constante (`WARNING`), pas de réglage
  enregistré dans `workout.settings`. **Écart acté avec la spec**, qui le voulait
  « configurable 5/10s ». Le moteur accepte une autre valeur en paramètre de `demarrer` —
  c'est ce qui la rend testable à 5 et à 10 —, mais rien dans l'app ne la change.

Ce qui est livré :

- **`app/src/lib/athlean.js`, moteur pur.** Aucun import de `chrono.js`, qui n'a pas bougé.
  `deroule(noms)` construit pré-départ / exercice / transition, sans transition après le
  dernier. Le moteur ne lit jamais l'horloge : chaque fonction reçoit `now`. Il tient une
  **échéance** par étape, et l'étape suivante s'enchaîne sur l'échéance de la précédente,
  pas sur l'instant où le battement l'a remarquée — un battement en retard ne fait pas
  dériver la séance.
- **Un seul curseur contre le double bip** : `vu`, l'instant jusqu'où les signaux ont été
  traités. Il ne recule jamais, et un signal n'est émis que s'il tombe après lui. Pause,
  reprise, passer et recommencer le replacent à l'instant du geste.
- **Signaux** : TICK à chaque seconde affichée du pré-départ et des transitions (5, 4, 3, 2,
  1), GO à zéro, WARNING une fois par exercice. Une frontière entre deux étapes ne porte
  jamais les signaux des deux : la fin d'un exercice est muette, le GO appartient à la
  transition.
- **Passer** avance d'une étape à son plein temps ; **recommencer** redémarre l'étape en
  cours, index inchangé. Ni l'un ni l'autre ne sonne à l'instant du geste — le premier TICK
  d'une transition sur laquelle on vient de passer est sauté, c'est le « pas un de trop » de
  la spec. En pause, les deux laissent la séance en pause, étape pleine.
- **`audio.js` gagne quatre fonctions, `beep` est intact** : `deverrouiller` (appelé dans
  le geste DÉMARRER, un échantillon muet pour iOS), `ton` (retient les sons en cours),
  `couper` (passer et recommencer coupent son et vibration), `vibrer` (sans effet ni erreur
  sans API de vibration — Safari iOS n'en a pas). La vibration est déclarée dans la même
  table que le son (`SONS`) : aucun signal ne vibre sans sonner.
- **Pas de quatrième son à la fin d'un exercice** (arbitrage 3) : elle reste muette, et un
  test le vérifie.
- **Interrupteur SON ACTIVÉ / SON COUPÉ** en haut à gauche de l'écran (arbitrage 4). Il
  n'est pas enregistré : l'écran s'ouvre toujours son activé, comme l'app repart sur
  Classique. La règle tient dans une fonction pure, `effet(signal, actif)`, qui rend le son
  et sa vibration ou rien : son coupé, aucune vibration ne part seule. Couper le son coupe
  aussi celui qui est en train de jouer.
- **`app/src/components/ChronoAthlean.jsx`, l'écran**, que rien n'ouvre. Avant départ : le
  premier exercice, la durée totale, DÉMARRER. Pendant : le nom en grand, le temps, et
  « ENSUITE : … » dès la première seconde ; pré-départ et transitions montrent l'exercice qui
  arrive. Trois gestes : RECOMMENCER, PAUSE / REPRENDRE, PASSER. FERMER en deux temps.
  L'horloge est `performance.now()`.

**Écarts et choix non écrits dans la spec :**

- **Une app endormie ne gèle pas la séance**, à l'inverse du chrono Classique : les
  échéances continuent de tomber, et au retour l'écran est à l'étape où le temps l'a menée.
  C'est ce qu'impose une horloge par échéances. **Les signaux tombés pendant l'absence ne
  sont pas rejoués** : seul sonne encore un signal en retard d'une seconde au plus
  (`RETARD`).
- **La pause gèle aussi ce qui serait tombé entre le dernier battement et le doigt** (moins
  de 100 ms) : la spec dit « immédiatement ».
- **Pas de reprise après redémarrage de l'app.** La spec ne la demande pas, et
  `performance.now()` repart de zéro à chaque chargement : la persister demanderait une
  autre horloge. À trancher en F-14 si le besoin existe.

**Tests** : `app/test/athlean.test.js` (quatorzième fichier, 28 tests) — les trois durées,
chaque signal une fois sur une séance entière, zéro doublon sur un cycle arrière-plan →
premier plan simulé par un bond de temps, aucune rafale au retour, pause au temps restant
exact à la milliseconde, aucune alerte rejouée à la reprise, compte d'étapes restantes
intact sur un enchaînement de gestes, fin d'exercice muette, rien du tout (vibration
comprise) son coupé. Plus 3 tests de rendu dans `rendu.test.jsx`. Les
garde-fous ont été cassés un par un pour vérifier qu'un test tombe à chaque fois.
255 tests verts (224 + 31), build OK. **Non vérifié sur iPhone** : déverrouillage du son,
comportement de `performance.now()` écran verrouillé, et absence de vibration sur iOS sont
à constater à l'usage, une fois F-14 branché.

**2026-10-26 — F-12.5 · Fusion bibliothèque Athlean X (fil Athlean X).** Livré, non branché :
rien ne lit encore ces exercices, c'est F-13 qui les citera. **La table de la spec n'a pas été
appliquée telle quelle** : sept de ses « créations » existaient déjà, et une de ses
« fusions » visait un exercice absent. Tout a été arbitré par Martin avant d'écrire.

- **Doublons fusionnés au lieu d'être créés** (arbitrage de Martin) : A-1.3 Jump Squats →
  `jumpSquats` (et non `squatSaute`) ; B-4.1 Chinups → `chinups` (et non
  `tractionSupination` — pull-ups et chin-ups restent deux exercices, mais celui-ci existait) ;
  A-2.1 Pike Pushups → `pompesPiquees` (et non `pompesEnV`) ; B-2.1 Elevated Feet Pushups →
  `pompesPiedsSureleves`, **qui existait déjà sous ce même id** comme variante de régression —
  la création aurait écrasé la clé ; A-5.1 Reverse Corkscrews → `corkscrews` (et non
  `abdosCorkscrew`) ; B-5.2 V-Up Tucks → `vupsGenouxFlechis` (et non `vUpGroupe`) ; A-3.2
  Alternating Sprinter Lunges → `fentesArriere` (et non `fenteArriere`, à une lettre de
  l'existant).
- **Fusions confirmées contre `exercises.js`** : A-4.1 → `pullups`, A-6.1 → `superman`,
  B-1.3 → `hipThrusts`, A-4.3 et B-4.2 → `tiragesHorizontaux`.
- **B-3.2 Lunges n'avait pas de cible** : la spec supposait une « fente avant », le dépôt n'a
  que arrière, marchées et croisées. **Création de `fentesAvant`** « fentes avant »
  (arbitrage de Martin).
- **Bilan : 20 créations, 12 identifiants du spec fusionnés sur 11 exercices existants**,
  32 au total. 77 exercices dans la table (57 + 20).

**Écarts avec la spec, choisis sans arbitrage — à relire :**

- **`sourceIds`, une liste, au lieu de `sourceId`.** Le spec cite deux fois les tirages
  horizontaux (A-4.3 et B-4.2) : une seule entité, deux ids. Toutes les entités portent donc
  une liste, même d'un élément. Le journal de F-14 (clé = id du spec) n'en est pas affecté :
  ses clés viennent de la séquence jouée, pas de l'entité.
- **Une fusion ne reçoit que `nameEn` et `sourceIds`.** La spec disait « ajouter les 4
  propriétés sur l'entité existante » : `exclusiveTo: ["athleanX"]` sur `pullups` l'aurait
  retiré du moteur classique, et `source: "athleanX"` aurait menti sur son origine. Les deux
  restent réservés aux créations.
- **Les schémas moteurs des créations suivent le groupe du spec**, pas une lecture du
  mouvement : Anterior Lower — Squat → `squat`, — Lunge → `unilat`, Posterior Lower — Hinge →
  `hinge`, Upper Push → `poussee`, Upper Pull → `tirage`, Abs → `core`, Corrective → `hinge`.
  C'est traçable, et sans effet aujourd'hui (aucune couverture ne les voit), mais quatre
  classements surprennent : `squatToucherTalon` et `fenteArriereSautee` en `hinge`,
  `plancheLateraleAlternee` en `poussee`, `dragonFly` en `tirage`. À reprendre le jour où
  Athlean X entrera dans une couverture ou une substitution.
- **Libellés en minuscules**, comme le reste de la table (« box squat alterné », pas « Box
  squat alterné »). Pas de `perSide` : Athlean X se joue en fenêtres de 60 s, aucune quantité
  prescrite à répartir.
- **`nameEn` n'est pas la « seconde ligne » de la table de nommage** (étape 4 du brief) : c'est
  le nom exact du spec, pour rejouer une séance. Les deux pourront différer (`pullups` porte
  « Pullups » ici, « pull-ups » en seconde ligne). L'étape 4 n'est pas touchée.

Ce qui est livré :

- **`app/src/data/exercises.js`** : une quatrième partie, « Athlean X — exclusifs », sous les
  variantes de régression ; `nameEn` et `sourceIds` sur les onze entités fusionnées ; deux
  fonctions, `estExclusif(id)` et `idOfSource("A-1.1")` — c'est par la seconde que F-13
  résoudra ses séquences.
- **Invisibilité sans code moteur** : générateur, `pickVariant`, substitution et couverture
  ne parcourent jamais `EXERCISES`, seulement les séances, les chaînes et les tables de
  douleur. Un exercice qu'aucune d'elles ne cite n'existe pas pour eux. Le test le tient.

**Tests** (`coherence.test.js`, 261 verts = 255 + 6, build OK) : le contrôle d'entrée morte
exempte les exclusifs (les séquences de F-13 les atteindront) ; nouveau bloc « Athlean X dans
la bibliothèque » — les 32 ids du spec mènent chacun à un exercice et un seul ; 20 créations,
12 ids sur 11 fusions ; aucun `nameEn` en double ; source et exclusivité sur les créations,
ni l'une ni l'autre sur les fusions ; aucun exclusif cité par une séance, un finisher, un
chrono, une chaîne, une table de douleur ou un coefficient de ratio ; aucune fusion devenue
inatteignable pour le Classique. Les garde-fous ont été cassés un par un (exclusivité sur
`pullups`, source sur `superman`, `squatSaute` recréé, `pompesCobra` glissé dans une chaîne) :
un test tombe à chaque fois.

**2026-10-26 — F-13 · Catalogue et séquences Athlean X (fil Athlean X).** Livré, non branché
— le branchement est F-14. **Fait dans la même conversation que F-12.5, à la demande
explicite de Martin** : exception consentie à la règle d'un ticket par conversation, signalée
avant de commencer.

Ce qui est livré :

- **`app/src/data/seancesAthlean.js`, contenu figé.** Par séance (A, B) : les groupes 1 à 5
  dans l'ordre du spec §4, le correctif (groupe 6), et les sélections de deuxième tour BUILD
  et DEFINE du §5, rangées à part du catalogue — spec §7 : on les change sans toucher aux
  exercices. Tout est écrit avec les ids du spec (`A-1.1`…), jamais avec les ids maison.
- **`seanceAthlean(w, mode)`** rend la séance au format du §6 : des phases `round1` /
  `round2` (/ `finisher` en BUILD et DEFINE) portant des ids du spec. NORMAL joue deux fois
  le catalogue entier, correctif compris ; BUILD et DEFINE jouent les groupes 1 à 5, la
  sélection de 8, puis le correctif seul.
- **`etapesAthlean(w, mode)`** rend la liste chronologique pour `ChronoAthlean` en passant
  par `deroule` de F-12, inchangé. Chaque étape d'exercice reçoit `ex` (id maison, via
  `idOfSource`), `sourceId` et `phase` : c'est ce que F-15 lira, dans l'ordre joué, et la clé
  du journal de F-14 reste l'id du spec.

**Écarts avec la spec, choisis sans arbitrage — à relire :**

- **Le chrono affichera les libellés français** (« tractions… », « box squat alterné »), pas
  les noms anglais du spec, qui annonce « Noms des exercices : anglais ». `CLAUDE.md` tranche
  l'inverse — jamais d'anglais dans le chrono — et c'est la règle du dépôt qui l'emporte.
  `nameEn` reste sur chaque entité pour la traçabilité.
- **Libellés de phase traduits** : « Tour 1 — corps entier », « Tour 2 — corps entier »
  (NORMAL), « Tour 2 — force » (BUILD, *Strength Focus*), « Tour 2 — hybride » (DEFINE,
  *Hybrid Focus*), « Correctif ». L'écran de F-12 ne les affiche pas encore ; F-14 dira s'il
  doit.
- **Ids de phase du spec §6** (`round1`, `round2`, `finisher`), y compris pour NORMAL, que
  l'exemple du §6 ne couvre pas : deux phases `round1` et `round2`, le correctif dans chacune.

**Tests** (`app/test/seancesAthlean.test.js`, quinzième fichier, 23 tests ; 284 verts =
261 + 23, build OK) :

- **Comptes et durées sur les vraies séquences**, pour les six séances : 32/31 et 34:40 en
  NORMAL, 24/23 et 26:00 en BUILD et DEFINE — ce que F-12 n'avait pu tenir que sur des
  séquences fictives. Pré-départ en tête, aucune transition après le dernier exercice.
- Chaque id cité résout vers un exercice ; les 32 ids du spec sont tous joués ; une séance A
  ne joue que du A ; en BUILD et DEFINE le correctif est le dernier et n'est nulle part
  ailleurs ; NORMAL a deux tours identiques de 16 ; une sélection de deuxième tour compte 8
  ids distincts pris dans le travail du catalogue.
- **Conformité au document source lui-même** : le test lit
  `perfect_home_workout_spec_v2.md` et compare l'ordre du catalogue §4, chacun des quatre
  tableaux de deuxième tour §5 avec sa ligne de finisher, et l'exemple JSON du §6 (A BUILD).
  Les données étant recopiées à la main, c'est ce qui attrape une faute de recopie. Le
  fichier source devient donc une dépendance des tests : le déplacer fait tomber la suite.
- Ce que lira la suite : `sourceId`, `ex` et `phase` sur chaque exercice joué ; le nom affiché
  est le libellé de la bibliothèque ; A-4.3 et B-4.2 mènent au même exercice.

Garde-fous cassés un par un : deux ids permutés dans le tour 2 B BUILD, un neuvième
exercice en DEFINE A, le correctif glissé dans le tour 1 — un test tombe à chaque fois.
L'en-tête de `athlean.test.js` renvoie désormais à ce fichier pour les vraies séquences.

**2026-10-26 — F-14 · Branchement, alternance A/B, journal (fil Athlean X).** Livré : Athlean X
se joue de bout en bout. **Fait dans la même conversation que F-12.5 et F-13, à la demande
explicite de Martin.**

**Arbitrage de Martin avant le code — où vit le journal.** Trois options présentées : une clé à
part invisible du Classique ; une clé à part qui compte dans la série ; une ligne de plus dans
`workout.log`. **Retenu : clé à part, comptée dans la série et les points de la semaine.** Ce
qui a écarté `workout.log` : il ne tient qu'une séance par date, écrite par remplacement, et
l'import fusionne par date — Classique le matin et Athlean X le soir, l'une des deux était
perdue ; et chaque consommateur du journal aurait dû apprendre à ignorer Athlean X (le récap
plantait sur une ligne sans `day`).

Ce qui est livré :

- **`app/src/lib/journalAthlean.js`, pur.** `entreeAthlean` (forme de la spec F-14),
  `dernierWorkout` / `workoutPropose` (l'alternance), `entreeValide`, `fusionner` (l'import),
  `joursEntraines` (ce que lisent série et semaine). Clé `workout.athlean` dans `store.js`.
- **`lastAthleanWorkout` n'est pas stocké** : il se relit du journal, la date départageant,
  l'ordre d'écriture ensuite. Une seule source, que l'import ne peut pas désynchroniser.
  **Écart de forme avec la spec**, qui le nommait comme une donnée ; le comportement est le
  même.
- **`EntreeAthlean` dans `Mode.jsx`**, à la place de `AthleanAVenir` : jamais joué, le choix
  WORKOUT A / WORKOUT B ; ensuite « WORKOUT B · EN ALTERNANCE · DERNIÈRE SÉANCE : A », sans
  bouton de choix. Mode NORMAL / BUILD / DEFINE avec sa durée, **rien de présélectionné** ;
  LANCER n'apparaît qu'une fois workout et mode choisis, avec la durée de la séance.
- **Dans `App.jsx`** : le chrono s'ouvre sur `etapesAthlean`. **Seule une séance finie
  s'enregistre** (`finirAthlean`) ; fermée en route, rien n'est écrit et l'alternance ne
  bouge pas. Après l'enregistrement, l'écran confirme « Séance enregistrée : workout A ·
  BUILD. » et le mode repart à vide. F-15 s'insérera entre la fin du chrono et l'écriture.
- **Série et points de la semaine** lisent `joursEntraines(log, athlean)` ; le reste (niveau
  suggéré, mois, 28 jours, couverture, ressentis, revue, récap) lit le journal Classique seul.
  Le message de la fiche du jour (« Séance déjà enregistrée ce jour-là ») reste Classique : une
  séance Athlean X ne fait pas croire que le thème du jour a été joué.
- **Export et import** portent la clé `athlean` ; une sauvegarde d'avant n'en a pas et
  s'importe comme avant. L'import dédoublonne au lieu de fusionner par date : deux séances du
  même jour restent deux.
- **Correction d'un reste de F-11** : la barre GÉNÉRER LA SÉANCE du Classique s'affichait aussi
  sous Athlean X et y tirait une séance Classique en arrière-plan. Elle ne s'affiche plus.

**Choix non écrits dans la spec, à relire :**

- **« EFFACER L'HISTORIQUE » n'efface pas Athlean X.** Laissé tel quel : élargir une
  suppression irréversible ne se décide pas en passant. En Questions ouvertes du pickup.
- **Pas de reprise après redémarrage** (question laissée à F-14 par F-12) : non traitée. Une
  séance Athlean X interrompue par un redémarrage est perdue, sans trace. En Questions
  ouvertes.
- **Libellés de mode** : NORMAL / BUILD / DEFINE gardés tels quels — ce sont les noms du
  programme, comme HUMAN / WARRIOR / BEAST — avec une seconde ligne française (« deux tours
  complets », « deuxième tour force », « deuxième tour hybride »).

**Tests** (303 verts = 284 + 19, build OK) : `app/test/journalAthlean.test.js`, seizième
fichier, 15 tests — premier lancement sans proposition ; **A → B → A → B sur quatre lancements
espacés, samedi compris** ; le premier choix décide de la suite ; le mode n'influe pas ; deux
séances le même jour alternent ; la date l'emporte sur l'ordre d'écriture ; forme de l'entrée ;
lignes abîmées écartées ; import sans doublon, deux séances du jour gardées ; **sans séance
Athlean X, la série lit le journal Classique tel quel** ; un jour ouvré Athlean X prolonge la
série, un samedi ne la change pas ; le journal Classique n'est jamais modifié. Dans
`rendu.test.jsx`, le test de `AthleanAVenir` laisse place à 5 tests de l'entrée : choix A/B à
la première séance, workout imposé ensuite, mode jamais présélectionné, LANCER à la bonne
durée, confirmation d'enregistrement. Garde-fous cassés un par un (pas d'alternance, ordre
d'écriture au lieu de la date, Athlean X ignoré par la série, import sans dédoublonnage) : un
test tombe à chaque fois.

**Vérifié dans le navigateur** (aperçu local, stockage isolé de l'iPhone) : première séance au
choix A/B ; A · BUILD lancée, déroulée jusqu'au bout, enregistrée au format attendu ; WORKOUT B
imposé ensuite ; une séance B fermée en route n'écrit rien ; côté Classique, la fiche du lundi
propose toujours ses séances ; SUIVI affiche « CETTE SEMAINE · 1/5 » avec mois, 28 jours et
couverture à zéro ; le récap se génère. **Non vérifié sur iPhone** : son, vibration,
`performance.now()` écran verrouillé.

**2026-10-26 — F-14 révisé, retours de Martin sur la première livraison.** Trois points
soumis à relecture, trois réponses :

1. **« EFFACER L'HISTORIQUE » n'efface que le Classique** — accepté tel quel.
2. **Perdre une séance Athlean X sur un redémarrage : « pas possible ».** Corrigé.
   `instantane(run, now)` et `restaurer(etapes, snap, now)` dans `lib/athlean.js` : ne
   survivent que l'étape et le temps restant, l'horloge monotone repartant de zéro au
   chargement. `ChronoAthlean` reçoit `onSauver` et écrit dans `workout.athleanRun` à chaque
   seconde affichée et à chaque geste ; la clé s'efface à la fin et sur FERMER.
   `repriseAthlean(rec, now)` (`lib/journalAthlean.js`) reprend la règle du Classique : sous
   4 h « resume », au-delà « stale », null pour un enregistrement illisible ou au bout. Au
   démarrage, `RepriseAthlean` (`Mode.jsx`), même carte que le Classique : REPRENDRE ramène
   la séance **en pause** à l'étape et au temps retenus — le temps passé app fermée ne compte
   pas, comme le Classique retient la position du dernier battement ; ENREGISTRER (trop
   ancienne) l'écrit telle quelle à sa date de départ ; ABANDONNER l'efface. Une séance en
   suspens bloque LANCER. REPRENDRE dans le chrono appelle aussi `deverrouiller` : après un
   redémarrage, c'est le premier geste, DÉMARRER n'a pas eu lieu.
3. **« Que je fasse Athlean X ou le Classique, ça doit enregistrer la séance au même
   titre. »** L'option 2 retenue plus tôt ne comptait Athlean X que dans la série et les
   points de la semaine ; elle compte désormais **partout où l'app compte des séances** :
   mois, 28 jours et donc niveau suggéré, huit dernières semaines, détail du récap (lignes
   « 26/10 · Athlean X workout A · BUILD » intercalées par date). **Couverture des schémas
   moteurs comprise** (arbitrage de Martin, question posée) : `patternsAthlean(w, mode)` dans
   `seancesAthlean.js`, et le générateur en tient compte. Le stockage, lui, reste à part —
   c'est ce qui permet Classique et Athlean X le même jour. Restent au Classique seul ce
   qu'Athlean X n'a pas : ressenti, test du vendredi, finisher, étirements, revue ; la ligne
   « Finishers … (sur N séances classiques) » du récap le dit désormais.

Conséquence à connaître : les schémas des 20 créations, calqués sur les groupes du spec
(F-12.5), ne sont plus sans effet — quatre classements surprenants comptent dans la
couverture. En Questions ouvertes du pickup.

**Tests** (318 verts = 303 + 15) : 4 dans `athlean.test.js` (l'instantané en marche et en
pause ; restauration en pause sans un son ; reprise menée au bout au temps restant exact, sans
rien rejouer ; enregistrement abîmé refusé, temps hors bornes ramené) ; 3 dans
`journalAthlean.test.js` (reprenable sous 4 h, au-delà seulement enregistrable,
enregistrements illisibles ou au bout écartés) ; 4 dans `seancesAthlean.test.js` (une séance
couvre exactement les schémas de ses exercices, poussée et tirage dans chacune, supination
en B seulement, séance inconnue vide) ; 4 de rendu (LANCER bloqué par une séance en suspens,
carte de reprise sous 4 h, exercice en cours compté sans les transitions, carte au-delà).
Garde-fous cassés : restauration en marche au lieu d'en pause, fenêtre de reprise sans
limite — un test tombe à chaque fois.

**Vérifié dans le navigateur** : B · DEFINE lancée, avancée au 4ᵉ exercice, page rechargée —
carte « Tu étais à l'exercice 4 sur 24 » ; REPRENDRE rouvre le chrono en pause sur « pompes
pieds surélevés » à la dernière seconde écrite, la séance se termine et s'enregistre, la clé
de reprise s'efface. Une séance de 5 h d'âge posée à la main donne la carte « non terminée »,
ABANDONNER l'efface sans toucher au journal. SUIVI avec deux séances Athlean X : 2 ce mois,
2 sur 28 jours, couverture 8/10 et « Il manque mobilité, mollets » ; le récap les détaille.

**2026-10-26 — F-16 · Échauffement et étirements Athlean X, et F-17 · Univers rouge (fil
Athlean X).** Deux demandes de Martin après F-14, absentes du backlog, ajoutées au fil puis
livrées dans la même conversation que F-12.5 → F-14, à sa demande.

**F-16, ce qui est livré :**

- **Un type d'étape « bloc » dans le moteur** (`lib/athlean.js`) : une minuterie libre avec
  une liste, comme la phase « down » du chrono Classique. Il sonne comme un exercice — un
  seul WARNING à 10 s, fin muette — plutôt que cinq minutes de TICK. `dureeSeance(etapes)`
  l'exclut : les 34:40 et 26:00 restent ceux du spec, sans échauffement (§8). `ecran` lui
  rend son nom, sa liste, un sous-titre, et « ensuite » annonce déjà le premier exercice.
- **L'échauffement sorti d'`App.jsx`** vers `app/src/data/echauffement.js`, partagé par les
  deux modes : même contenu, même 5 min. Le Classique lit la même liste qu'avant.
- **`etapesAthlean(w, mode, { echauffement })`** met le bloc en tête, avant le pré-départ ;
  les étapes de la séance sont identiques à celles d'avant. La case « Échauffement »
  (`Coche`, qui prend désormais une couleur) est cochée par défaut, comme en Classique. La
  reprise après redémarrage retient `echauffement` (il décale les étapes) et sait dire « Tu
  étais dans l'échauffement. »
- **Étirements** : `EtirementsAthlean` sous la confirmation d'enregistrement — ÉTIREMENTS ·
  5 MIN, puis la séquence suggérée (`ETIREMENT_SUGGERE = "flow"`, « Enchaînement complet »),
  AUTRE fait le tour des cinq, LANCER ouvre un chrono à part (`etapesEtirement`, un bloc de 5
  min comme en Classique). Finis, ils s'inscrivent sur la séance Athlean X en `str` — le
  champ des lignes Classiques — et le récap les détaille. Fermés en route, rien. Le chrono
  d'étirements n'est pas repris après un redémarrage : la séance est déjà enregistrée.
- **L'import dédoublonne par séance (date, workout, mode)** et non plus par entrée entière :
  une sauvegarde faite avant les étirements portait la même séance sans `str`, et l'aurait
  doublée dans tous les compteurs. À égalité, le côté qui porte les étirements l'emporte.

**F-17, ce qui est livré :** `C.rouge` (`#F5163F`) dans `lib/theme.js`, un carmin distinct de
`C.ember` (`#FF4D2E`), qui reste la couleur des alertes — SON COUPÉ, ARRÊTER ? — dans les deux
modes. Rouge : bouton ATHLEAN X actif du sélecteur (CLASSIQUE actif reste vert), entrée
d'Athlean X, carte de reprise, case d'échauffement, bouton des étirements, chrono. **Dans le
chrono, le décompte est rouge pendant l'effort** (exercice ou bloc) **et blanc pendant les
temps morts** (pré-départ, transitions, qui étaient orange) ; le nom reste blanc. SUIVI reste
vert.

**Tests** (339 verts = 318 + 21, build OK) : 4 dans `athlean.test.js` (bloc hors de la durée
de séance ; nom, liste, premier exercice annoncé ; un WARNING puis le pré-départ qui compte 5
→ 1 et GO ; reprise d'un bloc) ; 4 dans `seancesAthlean.test.js` (échauffement en tête sans
toucher à la séance ; contenu de l'échauffement, celui du Classique ; suggestion et tour des
cinq séquences ; une séquence en un bloc) ; 3 dans `journalAthlean.test.js` (reprise avec
échauffement ; séance sauvegardée avant ses étirements non doublée, dans les deux sens ; deux
fois la même séance le même jour restent deux) ; 10 de rendu (sélecteur vert / rouge ;
entrée, reprise et chrono rouges sans un vert ; rouge ≠ orange des alertes ; case cochée et
durée sans échauffement ; chrono qui annonce l'échauffement ; sa liste pendant, pas pendant un
exercice ; les trois états des étirements ; leur place sous la confirmation ; reprise dans
l'échauffement). Garde-fous cassés : un vert remis sur DÉMARRER, un dédoublonnage par entrée
entière — un test tombe à chaque fois.

**Vérifié dans le navigateur** : entrée Athlean X en rouge, case cochée, « LANCER · 26:00 » ;
chrono ouvert sur ÉCHAUFFEMENT, liste et « ENSUITE : BOX SQUAT ALTERNÉ », décompte rouge ;
pré-départ en blanc, premier exercice en rouge ; séance finie, étirements proposés
(Enchaînement complet), AUTRE → Express, joués, inscrits (`str: "Express"`) et confirmés ;
retour en Classique, tout vert comme avant.
