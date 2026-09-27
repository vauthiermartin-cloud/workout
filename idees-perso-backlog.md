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

### 1. F-07 · Clarifier le skip pendant un repos — statut : à envoyer
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

### 2. F-03 · Prévention pubalgie — bloc correctif permanent — statut : à envoyer
Isometric Hip Flexion 3x/semaine (2x45sec/jambe) + Dead bug récurrent, garantis sur une
fenêtre hebdo glissante, indépendamment des séances choisies — y compris en Fast Track
(F-01, une fois construit). Décidé : ce bloc est non-négociable, jamais sauté par un mode
plus court.

Techniquement : la couverture hebdomadaire des schémas moteurs (10/10) existe déjà mais au
niveau des *patterns*, pas des exercices précis. Ce ticket demande un axe de garantie
supplémentaire, au niveau exercice — un nouveau mécanisme à côté de l'existant, pas une
extension de la couverture par pattern.

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
*(vide — chaque ticket traité s'y ajoute : date, ce qui a été fait, écarts éventuels avec la
spec ci-dessus.)*
