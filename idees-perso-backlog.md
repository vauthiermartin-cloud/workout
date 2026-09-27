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

### 3. F-02 · Génération adaptée à la douleur (dynamique) — statut : à envoyer
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

### 4. F-04 · Flag séance incohérente — statut : à envoyer
Bouton flag sur une séance + note optionnelle. Export incluant les séances flaguées avec
leurs paramètres complets (exercices, volumes, ordre) + la note, pour une revue à tête
reposée.

À ne pas confondre avec les contrôles de cohérence Vitest existants : ceux-là valident les
données du catalogue au build, celui-ci capture un ressenti utilisateur sur une séance
générée, en usage réel.

### 5. F-06 · Ratio push/pull — statut : à envoyer
Déséquilibre réel (plus de poussée que de tirage), mais **pas de solution horizontale
possible** — pas de barre basse ni d'anneaux, décision déjà actée dans ce repo, ne pas la
rouvrir. La piste retenue est déjà écrite dans `brief-v2-multi-user.md` et pas construite :

- Brancher la chaîne de régression tirage existante (`chains.js`) : suspension active →
  tirages d'omoplates → négatives 5s → assistées à l'élastique → tractions.
- Élastique de traction (~15€), seul achat matériel recommandé dans le brief — pas encore
  acheté.
- Revisiter le baseline HUMAN (4 tractions/12 pompes), noté dans le brief comme excluant
  une partie des pratiquants — pourrait expliquer une partie du ressenti de déséquilibre.

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