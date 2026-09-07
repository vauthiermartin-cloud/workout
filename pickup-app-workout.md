---
topic: app-workout-25
date: 2026-09-07
status: in-progress
---

# Pickup — App workout « 25 » : état technique

## État actuel (TL;DR)

Une PWA de séances au poids du corps est **en production et fonctionnelle**, hébergée sur GitHub Pages, installée sur l'écran d'accueil iPhone. Les données vivent en `localStorage` avec export/import JSON.

**Le code vit dans `app/` : Vite 8 + React 19, testé sous Vitest.** Le mono-fichier de 100 Ko avec Babel dans le navigateur appartient au passé. Le déploiement passe par `.github/workflows/deploy.yml` : `npm ci`, `npm test`, `npm run build`, publication de `app/dist` sur Pages. **Les tests sont un garde-barrière du déploiement** — un échec bloque la mise en production.

Le contenu est complet et validé : 25 séances réparties lundi→vendredi, 20 finishers, 5 séquences d'étirement, 37 exercices. Un chrono adaptatif (EMOM / Tabata / compte à rebours / chrono libre) et un générateur qui choisit la séance selon les schémas moteurs non encore couverts dans la semaine.

**Le chrono est reprenable** (étape 1, faite le 2026-09-07). `app/src/lib/chrono.js` sépare deux notions : le `run`, enregistrement d'une séance en cours écrit dans une clé unique (`workout.run`), et le `beat`, dernier battement réellement observé. Un trou de plus de 4 s entre deux battements ne peut venir que d'une app endormie : le chrono gèle, ne valide rien, et demande. Reprise proposée au démarrage sous 4 h, enregistrement ou abandon au-delà.

Ce qui reste : **phase 1**, perfectionner l'app mono-utilisateur (étapes 3 à 12 du brief). **Phase 2** — Supabase, comptes, leaderboard — reste en pause et n'est pas commencée.

## Ce qui est décidé (ne pas rouvrir sans raison)

- **Cap de 25 min par séance**, lundi→vendredi, matin. Seul sport pratiqué, donc la couverture hebdomadaire compte plus que la performance sur une séance.
- **Matériel disponible** : poids du corps, barre de traction, espalier. **Pas de barre basse ni d'anneaux** → aucun tirage horizontal (les tirages australiens ont été retirés pour cette raison, ne pas les réintroduire).
- **Un format par jour** : lundi EMOM, mardi volume burpees en escalier, mercredi rounds chronométrés, jeudi AMRAP, vendredi test de burpees + finisher.
- **Le test de burpees du vendredi est la seule métrique de progression** conservée. Un chiffre par semaine.
- **Un exercice est une entité, pas une chaîne de caractères.** `app/src/data/exercises.js` porte les 37 exercices : identifiant stable, libellé français, unité, latéralité, schémas moteurs. Les séances citent l'identifiant, jamais le libellé — renommer se fait dans une case de table et non dans 250 lignes de données. Les identifiants partent en base dans les exports : ne pas les renommer.
- **Étiquetage des schémas moteurs dérivé automatiquement** des exercices, porté par l'entité (champ `patterns`), jamais saisi à la main sur les séances. Empêche toute désynchronisation.
- **L'unité est déclarée, jamais devinée** : `reps` ou `secondes`. Elle décide de trois choses, et il n'y a pas d'autre endroit où le dire — l'affichage (« 30 s » et non « 30 »), le total de volume (30 s de planche ne sont pas 30 répétitions), et la portée des coefficients de mode (**un maintien garde sa durée en N2 et N3** : sans cette décision explicite il prenait +50 % en silence, et une planche à 45 s déborde de la minute d'EMOM). Qu'ils progressent avec leur propre coefficient reste prévu à l'étape 5, où le plan de chrono devra suivre.
- **La latéralité se dit une fois, sur l'exercice, et s'affiche sur la fiche seulement.** Deux conventions opposées vivaient dans les consignes en prose : `reparti` signifie que le nombre est un total à partager (16 fentes croisées = 8 par jambe), `chaque` qu'il vaut pour chaque côté (30 s de gainage latéral de chaque côté). La note est calculée, donc elle suit le mode — les « 16 = 8 par jambe » écrits à la main restaient faux dès qu'on montait de niveau, ils ont été retirés. Pendant l'effort, le chrono ne l'affiche pas.
- **10 schémas suivis** : poussée, tirage, supination, squat, unilatéral, chaîne postérieure, sangle, cardio, mobilité, mollets.
- **Le générateur est conscient de la couverture** : il choisit la variante du jour qui apporte le plus de schémas non encore travaillés dans la semaine. Simulé sur 500 semaines → 10/10 systématiquement.
- **Fiche et chrono partagent les mêmes données** ; un contrôle automatisé vérifie qu'ils ne divergent pas.
- **Le finisher se décide à la fin**, jamais avant. Écran de bilan après la séance, puis après le finisher, avec CTA vers les stats.
- **Le ressenti de fin de séance reçoit toujours une réponse de l'app** : une phrase, immédiatement. Seul « trop dur » agit en plus sur l'écran, en retirant le finisher et en mettant les étirements en avant. « Trop facile » ne tire rien — le finisher est déjà l'action principale, et l'ouvrir d'office noyait la phrase sous un bloc de séance ; sa conséquence est différée à la montée de mode. Question non bloquante, sans réponse présélectionnée, jamais posée sur une séance arrêtée en route. Les identifiants `facile` / `juste` / `dur` partent en base et se lisent dans les exports déjà sur le disque : ne pas les renommer.
- **Le bloc du ressenti porte le liseré d'accent tant qu'il est sans réponse**, et s'éteint une fois répondu. C'est le seul élément de l'écran de bilan qui attende quelque chose ; il doit se voir.
- **Pull-ups et chin-ups sont deux exercices distincts**, la supination étant un schéma suivi à part (seul travail de biceps disponible).
- **Local-first obligatoire pour la suite** : écriture locale d'abord, synchro ensuite. Une séance faite sans réseau ne doit jamais être perdue.
- **Leaderboard uniquement sur des métriques comparables** : un classement par format de test de burpees, et éventuellement les séries de jours. Pas de classement sur le volume de reps (il dépend du niveau) ni sur le nombre de séances.
- **Supabase palier gratuit** retenu. 500 Mo de base, 50 000 MAU, 2 projets. Pause après 7 jours sans activité base — non bloquant vu un usage quotidien. Chiffres relevés en mai-juin 2026, à revérifier sur supabase.com/pricing.

## Prochaines actions, dans l'ordre

### À prendre maintenant — « le point 4 de la liste »

Une liste de quatre demandes a été formulée le 2026-09-07 sur l'écran de fin de séance. Les
trois premières sont livrées (le retour parlé au ressenti, le bloc rendu visible, « trop
facile » qui ne tire plus de finisher). **Le point 4 est le seul qui reste, et c'est la
prochaine étape :**

> « Faudrait un bouton sur ce même écran qui valide la séance pour de bon, et que l'écran
> suivant soit un passage obligatoire par tes perfs. Et c'est là que tu peux éditer les
> valeurs. "Ajuste si tu as fait plus ou moins que prévu". »

**La spécification est en section 6.1 du brief**, avec la décision d'architecture qui compte :
la séance reste écrite dès la fin du chrono, et l'écran de perfs **corrige** la ligne au lieu
de la créer — sinon une séance quittée avant cet écran serait perdue, ce que « local d'abord »
interdit. Sa dépendance au typage des unités est levée depuis le 2026-09-07. Deux points
restent à trancher dans cette étape : le champ « nombre de tours » pour l'AMRAP du jeudi, et
le score du test du vendredi, qui doit devenir une donnée au lieu de vivre dans une phrase.

**L'ordre de travail complet est en tête de `brief-v2-multi-user.md`, section « Phasage ».**
Douze étapes. Les deux premières sont faites :

1. ~~Réparer la reprise du chrono~~ (brief section 0). **Fait.** Les quatre points du brief
   sont couverts, `app/test/chrono.test.js` les tient.
2. ~~Migrer vers Vite + tests~~, **y compris le volet données** (« faire des exercices de
   vraies entités », brief section 8). **Fait le 2026-09-07.** `app/src/data/exercises.js`,
   les séances citent des identifiants, les unités sont typées, `EX_PATTERNS` a disparu.
   Trois défauts que ce modèle a fait tomber au passage : « burpee » et « burpees » étaient
   comptés comme deux exercices ; les maintiens n'étaient pas des exercices du tout, juste du
   texte libre attrapé par une expression régulière ; et un contrôle de cohérence passait à
   vide depuis le renommage d'un champ, donc ne contrôlait plus rien — d'où le garde-fou qui
   vérifie qu'il reste des lignes à contrôler.

Deux chantiers ont été remontés hors de leur rang, parce qu'ils ne dépendaient de rien :

- **Jauge de séance dans le chrono.** Faite le 2026-09-07. Un segment par phase, large comme
  sa durée ; largeurs égales et aucun remplissage sur un plan dont une phase dépend du
  pratiquant. Deux réserves visuelles sont consignées en questions ouvertes.
- **Signal de ressenti de fin de séance** (brief section 7.1, étape 6). Fait le 2026-09-07.
  `app/src/lib/ressenti.js`, testé. Remonté parce que **chaque semaine sans lui est une
  semaine de données de calibration perdue** : les règles de montée et de descente de mode
  (étape 12) demandent quatre semaines de ressentis réels, autant que le compteur tourne.

L'ordre convenu pour la suite du lot « 2bis » : ~~entités et typage des unités~~ d'abord,
puis **la saisie des répétitions avec le cas AMRAP** (brief section 6.1 — c'est l'étape
suivante), et la logique de recalibrage en dernier — elle ne sera validable qu'avec des
semaines de données réelles. Vient ensuite l'étape 3 (chaînes de régressions et substitution
sans barre de traction).

Deux dettes ouvertes par le typage, à traiter dans l'étape qui les concerne :

- **Un total `reparti` peut devenir impair sous les coefficients de mode** : `scaleRep(10, 2)`
  donne 13, qui ne se partage pas en deux côtés égaux. L'affichage bascule alors sur « en
  alternant les côtés », qui est honnête mais moins utile. Arrondir ces totaux au pair est du
  ressort de l'étape des modes (étape 5).
- **`volumeOf` sous-compte le vendredi** : les 50 burpees du test vivent dans la phrase de la
  phase (`sub`), pas dans une ligne de travail, donc ils n'entrent pas au total. Vaut pour
  les cinq séances du vendredi. À corriger avec l'écran de perfs, qui a de toute façon besoin
  d'un champ pour le score.

Ne pas lancer plusieurs étapes en une fois.

**Le déploiement n'est plus un sujet.** Il est automatisé et vérifié. Le seul piège restant :
`index.html` et `sw.js` traînent encore à la racine du dépôt, vestiges du mono-fichier. Ils ne
sont plus servis par personne. À supprimer une fois qu'on est certain de ne plus vouloir s'y
référer.

## Questions ouvertes

**Toutes les décisions produit sont tranchées dans `brief-v2-multi-user.md`.** Ne pas les rouvrir : modes, coefficients, contrat, gel, pause, séries, couverture, onboarding, nommage, illustration, accroche. Le brief est la référence.

Ce qui reste réellement ouvert :

- **Le haut de l'écran du chrono porte trois lectures**, alors que la jauge de séance était
  censée les remplacer : `PHASE x / y`, le pourcentage, et la jauge elle-même. Gardé tel quel
  le 2026-09-07 après essai — à rouvrir si à l'usage le regard ne sait pas où se poser. La
  piste écartée ce jour-là : jauge seule, collée au bord supérieur de l'écran comme une barre
  de chargement, `FERMER ✕` seul sur sa ligne.
- **Deux jauges de même grammaire visuelle** cohabitent sur l'écran du chrono : celle de la
  séance en haut, celle des blocs de 5 min sous `BLOC x / 4`. Elles disent deux choses
  différentes avec la même forme. Acceptable en l'état, à revoir si la confusion se produit
  vraiment pendant l'effort. Ne pas supprimer la jauge de blocs pour autant : elle est la
  seule à dire le bloc en cours.
- **Le récapitulatif texte de l'onglet SUIVI a reçu une ligne « Ressentis : … » qui n'était pas
  demandée**, ajoutée le 2026-09-07 en même temps que le signal de ressenti, plus une mention
  du ressenti sur chaque jour listé. Signalé, jamais arbitré : à garder ou à retirer. Le
  trancher au moment de refondre les stats (étape 11), qui reprendra ce récapitulatif de toute
  façon.
- **Mollets** : encore fragiles, présents seulement mardi et vendredi, 2 variantes sur 25. À répartir comme la chaîne postérieure l'a été. La question a été posée, jamais tranchée.
- **Interprétation de trois mouvements** issus de captures vidéo, à confirmer visuellement : les passages de jambes latéraux, le gainage cuillère vers balayage, et la marche de l'ours et passage de bras. Ce sont les trois qui ouvrent la liste du chantier illustration.
- **Badges du podium** : le premier est « THE GOAT », les deux autres restent à nommer. « THE BEAST » entrerait en collision avec le nom du mode BEAST. Sujet de phase 2, ne bloque rien.
- **Seuils de progression de mode** : la règle proposée dans le brief demande quatre semaines de ressentis réels pour être validée. Elle ne pourra l'être qu'après usage.
- **Contenu des séquences d'étirement** : à faire valider par le kiné avant d'en faire une habitude, en particulier le pigeon dans la séquence hanches, et les burpees sautés en longueur côté impact.

## Matériaux clés

Ordre de lecture recommandé pour reprendre le projet :

1. `pickup-app-workout.md` — cette note, l'état technique.
2. `brief-v2-multi-user.md` — l'intention produit, toutes décisions tranchées, ordre de travail en douze étapes.
3. `table-nommage-exercices.md` — les labels français, les labels courts pour le chrono et les termes anglais. Référence pour l'étape 4. **Lire l'avertissement en tête** : sa colonne « clé technique » n'est pas l'identifiant du code, et trois maintiens n'y figurent pas.

Fichiers du projet :

4. `app/src/data/` — le contenu : séances, finishers, étirements, plans de chrono, schémas moteurs, niveaux. C'est là que se trouve tout ce qui se discute côté produit. **Commencer par `exercises.js`** : c'est la table des 37 exercices, tout le reste la cite par identifiant. `items.js` dit la différence entre une ligne de travail (`r` en répétitions, `h` en secondes) et une note de structure (`f`) — distinction qui commande ce que l'écran de perfs saura proposer à la saisie.
5. `app/src/lib/chrono.js` — le chrono reprenable. `app/src/lib/store.js` — les clés de stockage local, dont `workout.run` pour la séance en cours. `app/src/lib/ressenti.js` — les trois valeurs du retour de fin de séance et leurs deux règles pures.
6. `app/src/App.jsx` et `app/src/components/` — les écrans.
7. `app/test/` — cinq fichiers, 62 tests : cohérence de la bibliothèque, générateur, chrono, table des exercices, ressenti. **Les faire tourner avant de livrer** (`npm test` dans `app/`) : ils bloquent le déploiement.
8. `app/vite.config.js` — build, et génération du service worker. **La version de cache est dérivée d'un hash du build** (`workout-<hash>`) : il n'y a plus rien à incrémenter à la main, contrairement à ce que dit encore `CLAUDE.md`.
9. `manifest.json` et les icônes — inchangés depuis le début, servis depuis `app/public/`.
10. Export JSON de l'onglet SUIVI (`workout-2026-09-04.json`) — historique réel des séances, jeu de test pour la synchro et pour les écrans de stats.
11. Dépôt GitHub `workout` (public, Pages publié par GitHub Actions depuis `app/dist`).
12. `.claude/skills/video-to-sequence/` — skill de découpage des vidéos d'exercices en planches de positions. Chantier reporté en fin de parcours, le skill est prêt.

**Node n'est pas dans le PATH par défaut** sur cette machine (pas de Homebrew) :
`export PATH="$HOME/.local/node/bin:$PATH"`.

## Hors périmètre (ne pas s'y perdre)

- **Empaquetage en app natif iOS.** Tranché : aucune voie gratuite et durable sans compte Apple Developer à 99 $/an. La PWA sur l'écran d'accueil est la réponse.
- **Ajouter du contenu à la bibliothèque.** Elle est suffisamment fournie ; le sujet est désormais l'infrastructure. Sauf les mollets, listés en question ouverte.
- **Nutrition, suppléments, protocole kiné.** Suivis ailleurs, hors app.
