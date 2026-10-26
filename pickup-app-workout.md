---
topic: app-workout-25
date: 2026-10-26
status: in-progress
---

# Pickup — App workout « 25 » : état technique

## État actuel (TL;DR)

Une PWA de séances au poids du corps est **en production et fonctionnelle**, hébergée sur GitHub Pages, installée sur l'écran d'accueil iPhone. Les données vivent en `localStorage` avec export/import JSON.

**Le code vit dans `app/` : Vite 8 + React 19, testé sous Vitest.** Le mono-fichier de 100 Ko avec Babel dans le navigateur appartient au passé. Le déploiement passe par `.github/workflows/deploy.yml` : `npm ci`, `npm test`, `npm run build`, publication de `app/dist` sur Pages. **Les tests sont un garde-barrière du déploiement** — un échec bloque la mise en production.

Le contenu est complet et validé : 25 séances réparties lundi→vendredi, 20 finishers, 5 séquences d'étirement, 40 exercices prescrits — plus 17 variantes de régression que le catalogue ne prescrit pas et qu'on n'atteint que par une chaîne, et 20 exercices propres à Athlean X que le mode Classique ne voit pas. Un chrono adaptatif (EMOM / Tabata / compte à rebours / chrono libre) et un générateur qui choisit la séance selon les schémas moteurs non encore couverts dans la semaine.

**Deux fils de travail coexistent depuis le 2026-09-27, et il faut le savoir avant de lire la suite.** Le phasage en douze étapes de `brief-v2-multi-user.md` reste la feuille de route officielle ; à côté, `idees-perso-backlog.md` porte les demandes nées de l'usage réel, arbitrées par Martin hors du dépôt. Cinq d'entre elles ont été livrées les 27 et 28 septembre et ne correspondent à aucune étape du brief. **Le journal de ce qui a été livré est le `## Log` de ce fichier-là** — cette note-ci en donne l'état, pas le détail.

**Un troisième fil s'est ouvert le 2026-10-26 : Athlean X**, un second mode de séance à programme fixe (Workout A/B × NORMAL/BUILD/DEFINE), spécifié dans la section « Fil Athlean X » de `idees-perso-backlog.md` en six tickets (F-11 → F-15). Le cap des 25 minutes ne vaut que pour le mode Classique. **F-11 à F-14 sont livrés, Athlean X se joue pour de vrai.** Un sélecteur CLASSIQUE / ATHLEAN X en tête de l'onglet SÉANCE, défaut Classique non enregistré (F-11). Un chrono dédié, par échéances (F-12). Les 32 exercices du spec dans `exercises.js`, 20 créations exclusives et 12 identifiants posés sur 11 exercices existants (F-12.5). Les six séances en données, aux durées du spec (F-13). Le branchement (F-14) : workout au choix à la toute première séance, puis l'opposé du dernier joué ; mode choisi à chaque séance ; journal à part dans `workout.athlean`, où une séance compte comme une séance Classique (série, semaine, mois, 28 jours et niveau, couverture, récap) ; une séance interrompue par un redémarrage se reprend. **F-16 et F-17**, demandés en cours de route : l'échauffement et les étirements du Classique branchés sur Athlean X, et un univers rouge pour Athlean X comme le Classique a son vert. **F-15 (saisie des reps) n'est pas commencé** : une séance s'enregistre avec des reps vides.

**Le chrono est reprenable** (étape 1, faite le 2026-09-07). `app/src/lib/chrono.js` sépare deux notions : le `run`, enregistrement d'une séance en cours écrit dans une clé unique (`workout.run`), et le `beat`, dernier battement réellement observé. Un trou de plus de 4 s entre deux battements ne peut venir que d'une app endormie : le chrono gèle, ne valide rien, et demande. Reprise proposée au démarrage sous 4 h, enregistrement ou abandon au-delà.

Ce qui reste : **phase 1**, perfectionner l'app mono-utilisateur (étapes 3 à 12 du brief). **Phase 2** — Supabase, comptes, leaderboard — reste en pause et n'est pas commencée.

## Ce qui est décidé (ne pas rouvrir sans raison)

- **Cap de 25 min par séance**, lundi→vendredi, matin. Seul sport pratiqué, donc la couverture hebdomadaire compte plus que la performance sur une séance.
- **Matériel disponible** : poids du corps, barre de traction, espalier, **et depuis le 2026-09-27 de quoi tirer à l'horizontale**. ~~Pas de barre basse ni d'anneaux → aucun tirage horizontal, ne pas réintroduire les tirages australiens.~~ **Cette contrainte est tombée** : elle était matérielle, pas une décision de conception, et sa cause a changé. Le catalogue nomme le mouvement « tirages horizontaux » sans nommer l'appareil — l'équipement exact est encore `[À PRÉCISER]` dans `CLAUDE.md`, et un nom d'appareil aurait figé l'inconnue dans les données.
- **Un format par jour** : lundi EMOM, mardi volume burpees en escalier, mercredi rounds chronométrés, jeudi AMRAP, vendredi test de burpees + finisher.
- **Le test de burpees du vendredi est la seule métrique de progression** conservée. Un chiffre par semaine.
- **Un exercice est une entité, pas une chaîne de caractères.** `app/src/data/exercises.js` porte les 77 exercices (57 du mode Classique, 20 exclusifs Athlean X) : identifiant stable, libellé français, unité, latéralité, schémas moteurs. Les séances citent l'identifiant, jamais le libellé — renommer se fait dans une case de table et non dans 250 lignes de données. Les identifiants partent en base dans les exports : ne pas les renommer.
- **Étiquetage des schémas moteurs dérivé automatiquement** des exercices, porté par l'entité (champ `patterns`), jamais saisi à la main sur les séances. Empêche toute désynchronisation.
- **L'unité est déclarée, jamais devinée** : `reps` ou `secondes`. Elle décide de trois choses, et il n'y a pas d'autre endroit où le dire — l'affichage (« 30 s » et non « 30 »), le total de volume (30 s de planche ne sont pas 30 répétitions), et la portée des coefficients de mode (**un maintien garde sa durée en N2 et N3** : sans cette décision explicite il prenait +50 % en silence, et une planche à 45 s déborde de la minute d'EMOM). Qu'ils progressent avec leur propre coefficient reste prévu à l'étape 5, où le plan de chrono devra suivre.
- **La latéralité se dit une fois, sur l'exercice, et s'affiche sur la fiche seulement.** Deux conventions opposées vivaient dans les consignes en prose : `reparti` signifie que le nombre est un total à partager (16 fentes croisées = 8 par jambe), `chaque` qu'il vaut pour chaque côté (30 s de gainage latéral de chaque côté). La note est calculée, donc elle suit le mode — les « 16 = 8 par jambe » écrits à la main restaient faux dès qu'on montait de niveau, ils ont été retirés. Pendant l'effort, le chrono ne l'affiche pas.
- **Les régressions sont un axe indépendant des modes, et les chaînes sont écrites.**
  `app/src/data/chains.js` porte sept chaînes ordonnées du plus accessible au plus dur.
  Quatre décisions de structure, chacune tenue par un test :
  - **Un exercice ne porte pas sa chaîne, il en est membre.** L'appartenance se déduit de la
    liste — écrire la chaîne sur chaque membre donnait cinq copies à maintenir pour les pompes.
  - **Tous les crans d'une chaîne portent les mêmes schémas moteurs.** Sans ça la couverture
    hebdomadaire mentirait dès la première substitution. C'est ce contrôle qui a forcé une
    **chaîne de chin-ups distincte de celle des pull-ups** : la supination est suivie à part,
    et un pull-up assisté substitué à un chin-up la ferait disparaître en silence.
  - **Pas de « cran de référence » par chaîne.** Le catalogue prescrit deux crans de la chaîne
    des burpees selon la séance ; la référence est ce que demande la ligne qu'on lit.
  - **Les 17 variantes vivent dans `EXERCISES`** (54 entrées au total), dans une section
    séparée : au-dessus ce que le catalogue prescrit, en dessous ce qu'on n'atteint que par une
    chaîne. Le test d'entrée morte s'appuie sur cette frontière.
- **10 schémas suivis** : poussée, tirage, supination, squat, unilatéral, chaîne postérieure, sangle, cardio, mobilité, mollets.
- **Toute séance qui contient un créneau de poussée contient un créneau de tirage** (2026-09-27). Règle dure, pas une moyenne hebdomadaire. La taille du créneau vient d'une table figée, `app/src/data/equivalences.js` : un créneau de 15 à 20 pompes s'équilibre par 3 tractions, 5 chin-ups, 6 tirages horizontaux ou 10 en supination. **Ce n'est pas un moteur** — deux règles de trois, et les nombres écrits dans le catalogue restent choisis à la main pour tenir la forme de chaque format.
- **La prise suit deux règles qui ne parlent pas du même cas** (2026-09-28). **À la barre**, une séance s'en tient à une prise : les chin-ups se feraient sur la fatigue des pull-ups. **Entre les plans**, c'est l'inverse — un tirage horizontal prend la prise que le vertical n'a pas. Jamais deux mouvements de pronation ni deux de supination dans une même séance, on alterne. Les deux contrôles coexistent, l'un dans `coherence.test.js`, l'autre dans `ratio.test.js`.
- **Le bloc pubalgie est une case à cocher, pas du contenu de séance** (2026-09-27). Cochée avant de lancer, au même endroit que l'échauffement : 4 × 45 s d'isométrie de flexion de hanche en alternant les jambes, puis 2 × 1 min de dead bug. **Hors des 25 minutes**, comme l'échauffement — `horsSeance` dans `chrono.js` porte les deux cas. Une première version le faisait entrer dans les séances par substitution des sit-ups : abandonnée le jour même, elle vidait le catalogue d'un mouvement sans atteindre la fréquence visée.
- **Le dead bug est garanti deux fois par semaine par le contenu, pas par le tirage** (2026-09-27). Toutes les séances du jeudi et du vendredi en portent une ligne, donc la semaine en voit deux quoi qu'il arrive, même quand la case reste décochée. Passer par le générateur aurait donné une préférence, pas une garantie. Lundi et mardi ne peuvent rien recevoir sans changer leur durée, mercredi est le jour le plus chargé.
- **Une zone sensible déclarée remplace des exercices, jamais la durée** (2026-09-27). Quatre zones — cervicales, genoux, pubalgie, autre — sur deux couches qui s'ajoutent : une condition chronique dans les réglages, un état du jour reposé avant chaque chrono. **Aucune n'est cochée par défaut** : une zone chronique s'affiche « TOUJOURS » dans le sélecteur du jour et ne se décoche donc pas d'un matin. La substitution garde le nombre de la ligne, ce qui laisse volume et durée intacts ; les substituts sont tenus de partager l'unité de l'exercice remplacé. La table de `app/src/data/douleurs.js` est un arbitrage de mouvement, **pas une prescription — elle attend la relecture du kiné**.
- **Le journal porte les zones appliquées** (`mal`). Sans elles, relire une séance faite genou bloqué la rejouerait en squats le jour où le genou va mieux, et la couverture de la semaine compterait un schéma que personne n'a travaillé.
- **Un schéma moteur peut devenir inatteignable, et la grille le dit.** Le genou fait disparaître le squat : aucune substitution ne le préserve. La grille le barre et le sort du compte plutôt que d'afficher une case que rien ne peut cocher, et le générateur cesse de le chercher. Même règle que celle que le brief avait tranchée pour le matériel manquant (section 2.1).
- **Une séance se note en qualité, sur trois niveaux** (2026-09-27) : « on la garde » / « rien à dire » / « ça ne va pas ». Le signalement ouvre un champ de texte, jamais obligatoire — une séance signalée sans un mot part dans la liste « à documenter » du récap. **À ne pas confondre avec le ressenti** : le ressenti parle du pratiquant, la qualité de la séance. Deux modules, deux questions, jamais posées en même temps à l'écran, et un test interdit qu'elles partagent un identifiant. Les valeurs `garder` / `normale` / `probleme` et le champ `note` partent en base : ne pas les renommer.
- **Le contenu d'une séance passée se reconstruit, il ne se stocke pas.** Le dossier de revue (`app/src/lib/revue.js`) redonne exercices, nombres et ordre à partir du nom, du mode et des zones, tous présents sur la ligne du journal. Le stocker aurait fait grossir le journal et l'aurait périmé au premier renommage d'exercice.
- **Il existe un point de passage unique pour toute substitution d'exercice** : `substituer(exercice, raison, contrainte)` dans `app/src/lib/substitution.js`. Une table par raison, et une seule aujourd'hui — la douleur. Le matériel absent (étape 8) et les chaînes de régressions (étape 9) s'y brancheront en ajoutant une entrée à `TABLES`, sans toucher à un appelant. **Ce n'est pas un moteur de génération** : le chantier « formats-comme-templates » reste hors périmètre et non arbitré.
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

### Le fil du backlog perso, ouvert le 2026-09-27

**Il ne suit pas le phasage du brief, et c'est voulu.** `idees-perso-backlog.md` porte les
demandes nées de l'usage réel, arbitrées par Martin dans une session claude.ai puis reprises
ici un ticket à la fois. Six tickets étaient en file ; cinq sont livrés, et deux restent — F-10 s'est ajouté en tête le 2026-09-28.

Le détail de chacun — écarts avec la spec, mesures, garde-fous — est dans le `## Log` de ce
fichier-là. Ce qui suit n'est que l'état.

- ~~**F-07 · Clarifier le skip pendant un repos**~~ **Fait le 2026-09-27.** Le bouton n'a
  jamais abandonné la séance, seul le libellé était générique : `sortie(run)` dans
  `chrono.js` répond `fin` / `repos` / `phase`. Garde-fou : aucun plan de chrono ne se termine
  par un repos, sans quoi « TERMINER » s'afficherait sur un écran de récupération.
- ~~**F-03 · Prévention pubalgie**~~ **Fait le 2026-09-27**, après une première version
  abandonnée le jour même. Voir la liste des décisions ci-dessus : case à cocher, hors des
  25 minutes, dead bug garanti par le contenu du jeudi et du vendredi.
- ~~**F-02 · Génération adaptée à la douleur**~~ **Fait le 2026-09-27.** Zones sensibles sur
  deux couches, moteur de substitution à la forme générique demandée, schémas moteurs
  inatteignables nommés dans la grille.
- ~~**F-04 · Flag séance incohérente**~~ **Fait le 2026-09-27, élargi en note de qualité.**
  Ce faisant, il absorbe **F-09**, qui posait la question « note séparée ou même bouton ? » :
  c'est le même bouton, à trois niveaux.
- ~~**F-06 · Ratio push/pull**~~ **Fait le 2026-09-28.** Cinq séances poussaient sans tirer,
  dont trois le mardi — c'est de là que venait le déséquilibre ressenti, pas d'un ratio mal
  réglé. Deux exercices de tirage horizontal, une table d'équivalence figée, cinq séances
  éditées à la main.
Deux tickets restent en file, dans cet ordre.

- **F-10 · Découpler format et journal du jour de la semaine — prochaine priorité**, ajouté le
  2026-09-28. C'est un **prérequis structurel** à la feuille de route « programme sur-mesure »
  discutée sur claude.ai : fréquence hebdomadaire choisie (3/4/5 séances), format différent
  chaque jour, bibliothèque qui grandit par les likes. Rien de tout ça ne tient tant que le
  format et le journal sont câblés sur le jour calendaire.

  **Le ticket ne construit aucune de ces fonctionnalités** : un seul geste, remplacer partout
  le jour de semaine (1–5) par une position dans le programme, à comportement visible
  identique. Les deux endroits sont repérés — `app/src/data/days.js` (`DAYS`,
  `STRETCH_BY_DAY`, `FINISHER_BIAS`, tables indexées sur le jour) et `app/src/lib/journal.js`
  (une ligne par date ISO référençant un `dayKey`, rattrapage de week-end compris).
- **F-01 · Fast Track Mode.** Sélecteur de durée en amont (10 min notamment), réduction du
  volume et priorisation des mouvements composés, pas un raccourcissement proportionnel. Le
  bloc pubalgie reste inclus quelle que soit la durée — comme rien ne s'ajoute en temps, il est
  présent par construction.

### Le fil Athlean X, ouvert le 2026-10-26

La section « Fil Athlean X » de `idees-perso-backlog.md` porte un second mode de séance, à
côté de la génération du jour.
Ordre d'envoi : F-11 → F-12 → F-12.5 → F-13 → F-14 → F-15, un ticket par conversation.

- ~~**F-11 · Sélecteur de mode**~~ **Fait le 2026-10-26.** `ChoixMode` et `AthleanAVenir`
  dans `app/src/components/Mode.jsx`, `MODES` et `MODE_PAR_DEFAUT` dans
  `app/src/data/modes.js`. Le mode vit dans l'état d'`App`, jamais dans `workout.settings` :
  chaque ouverture repart sur Classique. Reprendre une séance interrompue repasse en
  Classique.
- ~~**F-12 · Chrono Athlean X**~~ **Fait le 2026-10-26, non branché.** Moteur pur
  `app/src/lib/athlean.js`, sans lien avec `chrono.js` ; écran
  `app/src/components/ChronoAthlean.jsx`, que rien n'ouvre. Décisions à connaître :
  - **Horloge par échéances, et une app endormie ne gèle pas la séance** — l'inverse du
    chrono Classique. Au retour, l'écran est à l'étape où le temps l'a menée, et les signaux
    tombés pendant l'absence ne sont pas rejoués (seul un retard d'une seconde au plus sonne
    encore).
  - **Un curseur `vu` qui ne recule jamais** est la seule garantie contre le double bip.
  - **Recommencer redémarre l'étape en cours**, jamais la précédente. Passer et recommencer
    ne sonnent pas à l'instant du geste.
  - **WARNING à 10 s, constante** passée en paramètre ; pas de réglage persistant tant
    qu'aucun écran ne le commande.
  - **Les durées 34:40 / 26:00 sont tenues sur des séquences synthétiques** de 32 et 24
    exercices ; F-13 les tient aussi sur les vraies séquences.
  - **Pas de reprise après redémarrage** : `performance.now()` repart de zéro à chaque
    chargement. **Corrigé en F-14** : l'étape et le temps restant s'écrivent dans
    `workout.athleanRun`, et la séance se reprend en pause.
  - **Trois sons seulement, TICK / GO / WARNING** : la fin d'un exercice est muette, malgré
    le « fin d'effort » du spec source (arbitrage de Martin).
  - **Un interrupteur de son, non enregistré** : chaque séance repart son activé. Son coupé,
    la vibration se tait aussi — jamais seule.
  - `audio.js` gagne `deverrouiller`, `ton`, `couper`, `vibrer` ; `beep` est intact.
- ~~**F-12.5 · Fusion bibliothèque Athlean X**~~ **Fait le 2026-10-26.** Les 32 ids du
  spec (`A-1.1`…`B-6.1`) sont dans `app/src/data/exercises.js`. Décisions à connaître :
  - **La table de la spec n'a pas été appliquée telle quelle.** Sept « créations » existaient
    déjà et ont été fusionnées (jump squats, chin-ups, pompes piquées, pompes pieds
    surélevés, corkscrews, V-ups genoux fléchis, fentes arrière) ; « Lunges » n'avait pas de
    cible et a donné `fentesAvant`. Bilan : 20 créations, 12 ids sur 11 fusions. Arbitré par
    Martin. **Ne jamais recopier les ids maison de la table F-12.5** : passer par
    `idOfSource`.
  - **Une création porte `nameEn`, `sourceIds`, `source: "athleanX"`, `exclusiveTo:
    ["athleanX"]`. Une fusion ne porte que `nameEn` et `sourceIds`** — l'exclusivité sur
    `pullups` l'aurait retiré du Classique.
  - **`sourceIds` est une liste** : les tirages horizontaux portent A-4.3 et B-4.2.
  - **L'invisibilité ne coûte aucun code** : générateur, `pickVariant`, substitution et
    couverture ne lisent que séances, chaînes et tables de douleur. Un test vérifie qu'aucun
    exclusif n'y figure.
  - **Les schémas moteurs des créations suivent le groupe du spec**, pas le mouvement — ils
    comptent dans la couverture depuis F-14, voir Questions ouvertes.
- ~~**F-13 · Catalogue et séquences Athlean X**~~ **Fait le 2026-10-26**, dans la même
  conversation que F-12.5 à la demande explicite de Martin (exception à la règle d'un ticket
  par conversation). `app/src/data/seancesAthlean.js`. Décisions à connaître :
  - **Données écrites avec les ids du spec**, résolues par `idOfSource`. Par séance : les
    groupes 1 à 5, le correctif, et deux sélections de deuxième tour (BUILD, DEFINE) rangées
    à part du catalogue — spec §7, on les change sans toucher aux exercices.
  - `seanceAthlean(w, mode)` rend le format du spec §6 (phases d'ids du spec) ;
    `etapesAthlean(w, mode)` rend les étapes du chrono en passant par `deroule`, qui n'a pas
    bougé. Chaque étape d'exercice porte en plus `ex`, `sourceId` et `phase` : c'est ce que
    la saisie des reps (F-15) lira, dans l'ordre joué.
  - **Le chrono affichera le libellé français**, pas le nom anglais du spec — qui veut des
    noms anglais, mais `CLAUDE.md` interdit l'anglais dans le chrono. `nameEn` reste sur
    l'entité. Libellés de phase traduits aussi (« Tour 2 — force », « Correctif »…).
  - **Les données sont comparées au document source lui-même** : le test lit
    `perfect_home_workout_spec_v2.md` et vérifie catalogue, tours 2 et exemple du §6.
    Déplacer ou renommer ce fichier fait tomber le test, et c'est voulu.
- ~~**F-14 · Branchement, alternance A/B, journal**~~ **Fait le 2026-10-26**, dans la même
  conversation que F-12.5 et F-13, à la demande explicite de Martin. Décisions à connaître :
  - **Journal à part, clé `workout.athlean`** (arbitrage de Martin, option 2 sur trois) : une
    liste d'entrées `{ date, type: "athleanX", workoutId, mode, reps }`, plusieurs par jour
    possibles. Le journal Classique, à une ligne par date, n'est jamais écrit par Athlean X.
    Pur dans `app/src/lib/journalAthlean.js`.
  - **Une séance Athlean X compte comme une séance Classique** (Martin, révision du même
    jour) : série, points de la semaine, mois, 28 jours et donc niveau suggéré, huit dernières
    semaines, **couverture des schémas moteurs** — que le générateur lit pour tirer la séance
    Classique du lendemain —, détail du récap. `joursEntraines` fournit les compteurs,
    `patternsAthlean` la couverture. Reste au Classique seul ce qu'Athlean X n'a pas :
    ressenti, test du vendredi, finisher, étirements, revue de qualité. Le message de la fiche
    du jour (« Séance déjà enregistrée ce jour-là ») reste Classique.
  - **Reprise après redémarrage** (Martin : perdre une séance « pas possible ») : le chrono
    écrit son étape et son temps restant dans `workout.athleanRun` à chaque seconde affichée
    (`instantane`). Au démarrage, une carte comme celle du Classique : sous 4 h, REPRENDRE —
    la séance revient **en pause**, à l'étape et au temps retenus (`restaurer`), le temps
    passé app fermée ne compte pas ; au-delà, ENREGISTRER telle quelle ou ABANDONNER. Une
    séance en suspens empêche d'en lancer une autre. REPRENDRE dans le chrono rouvre aussi le
    son, puisque DÉMARRER n'a pas eu lieu.
  - **« EFFACER L'HISTORIQUE » n'efface que le Classique** — vu et accepté par Martin.
  - **`lastAthleanWorkout` n'est pas stocké, il se relit du journal** (`dernierWorkout`, la
    date départage, l'ordre d'écriture ensuite). Rien à désynchroniser, l'import compris.
  - **Seule une séance finie s'enregistre**, à sa date de départ ; fermée en route (FERMER),
    rien n'est écrit et l'alternance ne bouge pas. F-15 viendra entre la fin du chrono et l'écriture
    (`finirAthlean` dans `App.jsx`) ; d'ici là `reps` est vide.
  - **Export et import portent `athlean`** ; une sauvegarde d'avant n'a pas la clé et
    s'importe comme avant. L'import d'Athlean X dédoublonne au lieu de fusionner par date.
  - **La barre GÉNÉRER LA SÉANCE ne s'affiche plus sous Athlean X** — elle y restait depuis
    F-11 et tirait une séance Classique en arrière-plan.
- ~~**F-16 · Échauffement et étirements Athlean X**~~ et ~~**F-17 · Univers rouge**~~ **Faits
  le 2026-10-26**, demandés par Martin après F-14. Décisions à connaître :
  - **Un type d'étape « bloc »** dans le moteur Athlean : minuterie libre avec liste, un seul
    WARNING, exclu de `dureeSeance` — les durées du spec restent sans échauffement.
  - **L'échauffement vit dans `app/src/data/echauffement.js`**, partagé avec le Classique.
    Coché par défaut ; la reprise retient s'il était coché, parce qu'il décale les étapes.
  - **Étirements après la séance**, « Enchaînement complet » suggéré, AUTRE fait le tour ; un
    chrono à part, non repris après redémarrage ; inscrits en `str` sur la séance Athlean X.
  - **L'import d'Athlean X dédoublonne par date, workout et mode**, pas par entrée entière.
  - **`C.rouge` (`#F5163F`) est la couleur d'Athlean X**, `C.lime` celle du Classique,
    `C.ember` celle des alertes dans les deux. Dans le chrono Athlean, décompte rouge pendant
    l'effort, blanc pendant les temps morts. SUIVI reste vert.
- **F-15 · Saisie des reps post-séance — suivant.** Elle s'insère dans `finirAthlean` ; les
  étapes portent déjà `sourceId` dans l'ordre joué.

**F-10 et F-01 restent en file dans `idees-perso-backlog.md`** : F-11 a été pris avant F-10
sur demande explicite, les deux fils ne se bloquent pas.

**Trois choses attendent une réponse humaine, aucune n'est bloquante pour la suite** :
l'équipement de tirage horizontal exact (`[À PRÉCISER]` dans `CLAUDE.md`), la relecture de la
table des zones sensibles par le kiné, et la question du plafond de ratio (voir Questions
ouvertes).

### À prendre maintenant, côté brief — étape 4, table de nommage

**L'étape 3 n'est faite qu'à moitié, volontairement.** Les chaînes de régressions sont
écrites, testées, et invisibles : rien dans l'app ne les affiche encore, et rien ne substitue.
**L'attente est assumée** (2026-09-07) — la piste d'un affichage provisoire du cran d'en
dessous sur la fiche a été écartée, elle aurait été refaite à l'étape 9. Deux morceaux de
l'étape 3 sont reportés, chacun pour une raison différente.

- **La substitution permanente attend la bibliothèque** (étape 9). C'est de là qu'elle se
  règle — le pratiquant choisit sa variante une fois, par exercice. La poser avant l'écran qui
  la commande donnerait un réglage sans endroit où le régler.
- **La substitution sans barre de traction** (brief section 2.1) **attend l'onboarding**
  (étape 8). Elle ne dépend pas des chaînes mais du matériel déclaré, et elle demande en plus
  d'adapter la grille de couverture : sans barre, *tirage* et *supination* ne sont pas
  couvrables au même niveau, et afficher une case que personne ne peut remplir est pire que
  de ne pas l'afficher.

**L'ordre de travail complet est en tête de `brief-v2-multi-user.md`, section « Phasage ».**
Douze étapes. Les trois premières sont faites, la troisième partiellement :

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
3. ~~Chaînes de régressions~~ (brief section 8.1). **Socle fait le 2026-09-07**, sans aucune
   substitution — voir ci-dessus ce qui est reporté et pourquoi. `app/src/data/chains.js` et
   `app/test/chains.test.js`. Trois écarts avec le texte du brief, tous assumés :
   - **Les chin-ups ont gagné une chaîne à eux**, que le brief ne demandait pas. Le brief parle
     de « tractions » en bloc ; garder les schémas moteurs constants le long d'une chaîne l'a
     interdit.
   - **La chaîne des soulevés de terre une jambe n'a que deux crans**, et c'est tranché
     (2026-09-07). Le brief en listait trois — « main en appui → sans appui → amplitude
     complète » — mais les deux derniers décrivent le même geste : chercher l'amplitude est une
     consigne d'exécution, pas une marche à franchir. Deux entrées de bibliothèque pour un seul
     mouvement auraient donné deux libellés que rien ne distingue à l'écran. Ne pas ajouter le
     troisième cran en croyant réparer un oubli.
   - **La suspension active reste dans la chaîne bien qu'elle change d'unité** (secondes, là
     où les pull-ups sont des répétitions). C'est le vrai premier pas de quelqu'un qui ne tient
     pas à la barre, donc elle reste ; la conversion est une dette de l'étape 9, épinglée par
     un test qui la nomme.

Deux chantiers ont été remontés hors de leur rang, parce qu'ils ne dépendaient de rien :

- **Jauge de séance dans le chrono.** Faite le 2026-09-07. Un segment par phase, large comme
  sa durée ; largeurs égales et aucun remplissage sur un plan dont une phase dépend du
  pratiquant. Deux réserves visuelles sont consignées en questions ouvertes.
- **Signal de ressenti de fin de séance** (brief section 7.1, étape 6). Fait le 2026-09-07.
  `app/src/lib/ressenti.js`, testé. Remonté parce que **chaque semaine sans lui est une
  semaine de données de calibration perdue** : les règles de montée et de descente de mode
  (étape 12) demandent quatre semaines de ressentis réels, autant que le compteur tourne.

L'ordre convenu pour la suite du lot « 2bis » : ~~entités et typage des unités~~, puis
~~la saisie des répétitions avec le cas AMRAP~~ (brief section 6.1), et la logique de
recalibrage en dernier — elle ne sera validable qu'avec des semaines de données réelles.
Le lot est clos, et l'étape 3 a suivi.

- **Validation de séance et écran de perfs.** Fait le 2026-09-07. `app/src/lib/perfs.js` (pur,
  testé) et `app/src/components/Perfs.jsx`. La ligne du jour gagne deux champs, `perfs` et
  `valide` ; les clés de champ (`s:<exercice>`, `tours:<n>`, `score`) partent en base, ne pas
  les renommer. Trois natures de champ : un total de séance par exercice, un nombre de tours
  pour les formats ouverts, le score du test. Les notes libres n'en sont jamais.
  - La granularité est le **total de la séance**, pas la série : l'escalier du mardi aurait
    sinon demandé douze champs par jour.
  - Les perfs couvrent **la séance seule**, pas le finisher, qui est du travail en plus.
  - **Valider ramène au bilan**, pas aux stats. Enchaîner sur les stats fermait l'écran de fin
    et emportait l'offre de finisher avec lui.

- **Le bilan de séance est devenu difficile à rater.** Corrigé le 2026-09-08, après un
  usage réel où « VOIR MES STATS » a été tapé à la place du bouton de validation : l'écran de
  fin s'est fermé, et rien ne permettait de le rouvrir. Le diagnostic tient en une phrase —
  **les stats cumulées et le bilan du jour étaient en concurrence alors qu'ils sont en
  séquence**. Le bilan est le moment le plus important du parcours, il ne peut pas être une
  option parmi d'autres. Quatre corrections, et une conséquence non prévue :
  - **« VOIR MES STATS » a disparu de l'écran de fin.** L'onglet SUIVI reste à un tap une fois
    le bilan refermé ; il n'a pas à être atteignable *depuis* le bilan.
  - **Le libellé annonce le contenu** : « VALIDER LA SÉANCE » est devenu
    **« MES CHIFFRES DU JOUR »**, et « ENREGISTRER » sur l'écran de perfs est devenu
    « C'EST BON ». « Valider » et « enregistrer » sonnaient administratif et ne laissaient pas
    deviner qu'on allait voir ses chiffres et pouvoir les corriger. **L'écran de perfs
    s'appelle désormais « mes chiffres du jour », l'écran de fin reste « le bilan »** : deux
    noms distincts, à ne pas remélanger.
  - **Fermer sans être passé par ses chiffres demande une confirmation.** Une sortie subsiste
    quand même (`FERMER QUAND MÊME`) : un écran de fin sans issue a déjà été un piège une
    fois, on ne le referme pas.
  - **Le bilan se réaffiche depuis la fiche du jour**, tant que la séance du jour est
    enregistrée. La porte s'appuie sur la ligne stockée et non sur l'état de l'écran, donc
    elle survit à un redémarrage de l'app — et **la séance du jour est restaurée sur sa fiche
    au démarrage**, sans quoi la fiche repartait vide et en tirer une autre pouvait donner une
    variante différente. Le mode, lui, n'est pas restauré : c'est un réglage de l'app, pas une
    propriété de la séance.
  - **Conséquence non prévue : la ligne a gagné un champ `arrete`.** Tant que le bilan ne
    s'affichait qu'une fois, l'état de l'écran suffisait à savoir que la séance avait été
    arrêtée en route. Réaffichable, il aurait reposé la question du ressenti sur une séance
    incomplète — ce que la règle interdit. Le champ part en base : ne pas le renommer.

- **Deux façons de perdre un chiffre déjà saisi, fermées le 2026-09-08.** Les deux étaient de
  la même famille que le bilan ratable : une donnée existante rendue inaccessible ou effacée
  par un geste dont la conséquence n'était pas devinable.
  - **`RETOUR AU BILAN` jetait en silence tout ce qui venait d'être tapé.** Le score du
    vendredi passait par là. La sortie enregistre maintenant les champs modifiés
    (`correctionsDe` dans `app/src/lib/perfs.js`, pur et testé) **sans marquer la ligne
    relue** : seul « C'EST BON » la marque relue. Ne partent que les champs **réellement
    modifiés** — les champs `ex` arrivent préremplis avec le prescrit, et les écrire tous
    aurait fait passer une consigne pour une mesure. Vider un champ déjà relu l'oublie au lieu
    d'y écrire zéro.
  - **`savePending` écrasait la ligne du jour au lieu de la compléter.** Enregistrer une séance
    interrompue retrouvée au démarrage réécrivait une ligne neuve, donc `s: null` et sans
    `perfs`, `ressenti` ni `valide` : un chrono de finisher resté ouvert effaçait le score du
    test saisi juste avant. La ligne existante est maintenant reprise, les valeurs par défaut
    ne servant qu'à une date encore vide. Le champ `arrete` est écrit **après** cette reprise
    et non comme valeur par défaut, sans quoi les lignes antérieures au champ — qui n'en
    portent pas la clé — auraient été prises pour des séances arrêtées.

- **La fiche d'une séance faite ne montre plus qu'une porte, et la relecture a ses deux
  onglets.** Corrigé le 2026-09-09, après usage réel. Trois constats de suite : le bouton de
  bilan arrivait *sous* les consignes, donc trop bas ; « LANCER LE CHRONO » restait offert et
  laissait croire qu'on pouvait rejouer sa journée ; et relire les consignes d'un travail déjà
  fait n'aide personne.
  - **La fiche du jour, séance enregistrée, ne porte plus ni échauffement, ni consignes, ni
    CTA** — seulement `REVOIR MON BILAN`. Le drapeau est `faitEtEnregistre` dans `App.jsx`, qui
    compare la ligne du jour à la séance affichée.
  - **Le bouton n'ouvre plus l'écran de fin, mais une relecture** (`app/src/components/
    Revoir.jsx`). La distinction est le fond du sujet : **l'écran de fin est un moment du
    parcours** — il propose un finisher, des étirements, il demande le ressenti — et le rouvrir
    plus tard rouvrait ces décisions sur une journée déjà jouée. La relecture ne décide rien.
    Deux onglets : les chiffres (l'arrivée, la seule chose encore corrigeable) et la séance
    (bilan, schémas moteurs, consignes). **Aucun CTA, et le ressenti n'y figure pas** : il se
    répond à chaud ou pas du tout, une séance sans réponse est une séance sans signal et non
    une séance à rattraper.
  - **Les chiffres communs aux deux écrans vivent dans `app/src/components/Bilan.jsx`**
    (`BilanEntete`, `BilanPatterns`). Le libellé du total dépend de trois conditions qui se
    croisent — séance relue ou non, tours ouverts ou non, finisher enchaîné ou non — et deux
    copies de cette décision auraient fini par dire deux choses.
  - **`Perfs.jsx` s'est scindé** : `PerfsCorps` est la saisie sans son cadre, `Perfs` garde le
    plein écran de l'écran de fin. Le corps sert aux deux endroits, et `sortie` nomme la sortie
    qui n'est pas la même.
  - **La ligne a gagné un champ `dur`, le chrono réellement effectué en secondes. Il part en
    base : ne pas le renommer.** Il est **mesuré et non déduit du plan**, et c'est un point à
    ne pas « simplifier » plus tard : sur un format à durée ouverte — l'escalier 50/40/30/20/10,
    les 50 burpees — c'est le pratiquant qui arrête la phase et sa durée n'est écrite nulle
    part. Déduire du plan aurait donné la seule réponse fausse précisément là où le chiffre est
    intéressant. Le temps s'accumule donc dans le `run` (`done`, via `doneWith` et `goToPhase`
    dans `chrono.js`), **hors échauffement, hors pauses et hors suspensions** : les 25 minutes
    que promet le nom de l'app sont celles de la séance. Une séance retrouvée au démarrage et
    seulement enregistrée porte le temps observé jusqu'à son dernier battement — la seule
    mesure honnête pour une séance dont personne n'a vu la fin.
  - **Le total de répétitions et le chrono s'affichent sur l'écran des chiffres.** Le total suit
    la frappe, et **se tait tant qu'un tour ou un score manque** : additionner ce qui est connu
    donnerait un total plus faux que pas de total.
  - **Un huitième fichier de tests, `app/test/rendu.test.jsx`.** Les autres tiennent les données
    et les calculs, jamais l'affichage : une séance sans plan de chrono était attrapée, un écran
    qui plante à l'ouverture ne l'était pas. Rendu statique côté serveur — le projet n'a pas de
    `jsdom` et n'ouvre pas de navigateur en test, donc on ne peut ni taper dans un champ ni
    changer d'onglet. Ce qui s'y vérifie : la relecture se rend pour **chaque** séance du
    catalogue, elle s'ouvre sur les chiffres, elle ne propose pas de rejouer, et les morceaux
    communs ne portent ni CTA ni ressenti. **Les entités HTML y sont défaites avant comparaison**,
    sans quoi les vérifications d'absence passeraient sans rien vérifier.

- **La fiche relit sa séance du journal, par date. Le bilan de n'importe quel jour de la semaine
  en cours se relit donc, et changer d'onglet ne perd plus rien.** Corrigé le 2026-09-09, deux
  symptômes pour une seule cause : la séance affichée venait d'un tirage tenu en mémoire, donc
  un passage sur un autre onglet de jour la remplaçait et le retour ne la retrouvait plus —
  il fallait relancer l'app.
  - **La ligne du jour se cherche par date (`d`), jamais par thème (`day`).** Les deux divergent
    dès qu'on joue le thème d'un autre jour, et les exports le montrent : sur trois lignes, une
    porte une date de lundi et le thème du mercredi, et deux lignes réclament le même thème.
    Sous un modèle par thème, l'onglet mercredi aurait eu deux candidates et l'onglet mardi
    aucune. **Le journal est un agenda, pas une grille de thèmes.** `entreeDuJour` et
    `wodEnregistre` en découlent, et la fiche survit désormais au redémarrage comme au changement
    d'onglet sans rien restaurer à la main — l'effet de montage qui rejouait le tirage a disparu.
  - **La correction d'une ligne relue ne passe pas par `logSession`** mais par `corrigerLigne`,
    qui fusionne dans la ligne existante **à sa propre date**. C'est le piège qu'ouvrait la
    relecture d'un autre jour : `logSession` écrit à la date du jour avec la séance et le mode
    courants, donc relire lundi un mercredi aurait corrigé mercredi et estampillé lundi du mode
    d'aujourd'hui. Aucune valeur par défaut ne s'y applique : une ligne relue existe déjà.
  - **`isoOfWeekday` et `weekdayOf` sont sortis dans `lib/dates.js`** (neuvième fichier de tests,
    `app/test/dates.test.js`). La numérotation des onglets va de 1 = lundi à 7 = dimanche, et non
    celle de JavaScript où dimanche vaut 0. `isoOfWeekday` ne dépend que de la semaine : un onglet
    porte sa date, qu'on le regarde un mardi ou un dimanche. **Le week-end n'a pas d'onglet à lui**,
    et le réalignement de l'onglet après enregistrement reste gardé par `dowToday <= 5`, sans quoi
    un samedi désignerait un onglet inexistant et planterait l'écran.
  - **Ce que montre un onglet est décidé par `entreeDeLOnglet` (`lib/journal.js`)**, pas par un
    `find` dans `App.jsx`. Corrigé le 2026-09-12, après un bug vécu un samedi matin : le repli du
    week-end renvoyait la date du jour **pour les cinq onglets**, si bien qu'une séance de
    rattrapage s'affichait sous lundi, mardi, mercredi, jeudi et vendredi à la fois. Rien n'était
    écrasé — toutes les lignes étaient dans le journal, et les points sous les onglets, calculés
    sur les vraies dates, le montraient — mais aucune n'était lisible, ce qui revient au même pour
    qui regarde l'écran. La règle tient en deux temps : un onglet montre la séance de **sa date** ;
    à défaut, et le week-end seulement, la séance du jour s'y range **si elle a joué le thème de
    cet onglet**. Rattraper vendredi un samedi, c'est prendre la place que vendredi a laissée.
    **Limite assumée** : la place doit être libre. Un vendredi déjà entraîné garde sa ligne, et la
    séance de rattrapage ne se relit alors que dans les stats et l'export — tant qu'une date ne
    porte qu'une séance (brief 3.1). `weekDone` n'a délibérément pas bougé : y ranger le
    rattrapage sous l'onglet du thème compterait deux jours pour un, et le contrat compte des
    jours. Un samedi n'allume donc aucun point.

- **Une séance se supprime, depuis la relecture.** Fait le 2026-09-09. Le besoin de départ était
  de montrer l'app à quelqu'un — générer, lancer, finir pour voir l'écran de bilan — sans laisser
  la séance de démonstration dans les stats. Elle sert aussi à une séance loguée par erreur ou
  lancée pour voir.
  - **Elle est sous l'onglet LA SÉANCE, pas sur l'écran de fin.** Celui-là se voit tous les vrais
    matins juste après l'effort ; un geste destructeur n'y a rien à faire. La relecture ne
    s'atteint que délibérément, et couvre depuis hier tous les jours de la semaine — on peut donc
    nettoyer une démonstration faite sur l'onglet d'un autre jour.
  - **Elle s'arme, puis se confirme.** L'état d'armement vit dans `SupprimerSeance`, un composant
    à part : changer d'onglet le démonte, donc le bouton se désarme seul, et il se rend en pièce
    détachée dans les tests — le rendu statique n'atteint que l'onglet d'arrivée. Un écran qui
    s'ouvrirait déjà armé ferait de la confirmation un décor, et un test le vérifie.
  - **La ligne s'efface à sa date**, comme elle se corrige. **Rien de dérivé n'est à mettre à
    jour** : série, contrat de la semaine et couverture des schémas moteurs se recalculent du
    journal à chaque rendu. Une séance en cours à cette date est aussi oubliée (`K_RUN`,
    `pending`), sans quoi le démarrage suivant proposait de reprendre ce qu'on venait d'effacer.
    Le jour redevient vierge et le bouton de génération revient — il est conditionné à
    `!faitEtEnregistre`.
  - **`app/test/journal.test.js`** (dixième fichier) couvre `streakOf`, qui ne l'était pas, et
    épingle la propriété dont dépend l'étape à venir : **la série compte des jours, pas des
    lignes** — deux séances le même jour ne valent qu'un jour de série.

- **Jouer le thème d'un autre jour écrasait la séance du jour. Corrigé le 2026-09-09, trouvé en
  usage réel** — une séance de démonstration lancée depuis l'onglet de jeudi, un mercredi déjà
  entraîné, a suffi. `logSession` écrit **toujours** `d: todayIso`, et `writeEntry` écrit par
  remplacement : la ligne du matin partait. **Le détail qui rend le dégât sournois** : `perfs`,
  `s`, `ressenti` et `valide` retombent sur la ligne précédente et survivaient, tandis que `w`,
  `day`, `lvl` et `dur` étaient écrasés sans condition. Les chiffres du matin restaient donc là,
  **accrochés au nom d'une autre séance** — et `volumeReel` les relisait avec les clés d'exercices
  du mauvais catalogue. Une perte franche aurait été moins nocive.
  - **Le refus est la seule réponse représentable** tant qu'une date ne porte qu'une ligne :
    `ecraserait(log, d, nom)` dans `app/src/lib/journal.js`, et `logSession` sort sans écrire.
    La même séance se réécrit autant de fois qu'il faut — fin du chrono, finisher, ressenti,
    relecture complètent la même ligne — c'est un **autre** nom à la même date qui est refusé.
  - **Le refus se dit à l'écran de fin**, qui est celui où on croit sa séance enregistrée. Muet,
    il laissait croire que le travail était compté. Et `ligneDuJour` se tait alors : sans ça
    l'écran de fin affichait les chiffres, le ressenti et la relecture de la séance du matin sous
    le nom de celle qu'on venait de faire.
  - **Ce que ça dit de l'étape 3.1** : la contrainte « une ligne par date » n'était pas gardée,
    seulement supposée. Elle l'est maintenant, ce qui rend la levée de cette contrainte explicite
    le jour où on la lèvera.

- **Une séance ne mélange plus les deux prises à la barre. Règle posée le 2026-09-09, en usage
  réel.** « AMRAP 20 poussée-tirage » prescrivait 4 pull-ups **puis** 4 chin-ups dans le même
  tour, et son texte s'en félicitait. Les seconds quatre se font sur les avant-bras des premiers :
  ni la pronation ni la supination n'est chargée franchement, la séance travaille surtout la
  fatigue. Le tirage est désormais réuni sur une prise unique, **8 chin-ups**, à volume identique
  — 24 répétitions par tour en mode 1, comme les 6+4+4+10 d'avant.
  - **La supination a été gardée plutôt que la pronation, et ce n'est pas un goût** : `chinups`
    porte `tirage` **et** `supination` quand `pullups` ne porte que `tirage`. Les schémas moteurs
    de la séance sont donc inchangés (`poussee, supination, tirage`), et la simulation de
    couverture sur 500 semaines n'avait rien à revalider. Retirer les chin-ups à la place aurait
    fait tomber `supination` à quatre séances sur vingt-cinq, réparties sur les jours 1, 2, 3 et 5.
  - **Le garde-fou porte sur les familles, pas sur les deux noms nus** (`coherence.test.js`,
    « aucune séance ne mélange pronation et supination à la barre »). La bibliothèque de l'étape 9
    substituera des crans : `pullupsElastique` avec `chinupsNegatifs` serait exactement la même
    faute, et un test écrit sur `pullups`/`chinups` ne l'aurait pas vue.
  - **Répartition après coup** : la pronation tient les jours 1, 3, 4 et 5 ; la supination une
    variante par jour sur 1, 2, 3, 4 et 5. Aucune séance ne porte les deux.

**Un modèle décidé le 2026-09-09 et pas encore codé : séances ad hoc et plusieurs séances par
jour.** Écrit dans `brief-v2-multi-user.md` section 3.1. Le partage porteur est **jour actif ≠
séance** (« 3 jours actifs, 4 séances »), qui laisse le contrat et la série par jour et n'a donc
aucun chiffre existant à redéfinir. **Le piège à connaître avant d'y toucher** : `last28` et
`monthCount` comptent des *lignes*, donc des jours seulement parce qu'une date n'en porte qu'une.
Dès qu'elle en portera plusieurs, ils deviendront des compteurs de séances sans que personne
n'ait touché à ce code — et `last28` alimente `suggested`, le mode conseillé, donc le volume de
répétitions. La section liste aussi le bandeau à sept cases, le tirage ad hoc hors thème du jour,
et deux conséquences non tranchées sur la série et le gel si le contrat devient un nombre de
séances à jours libres. Une étape à elle seule, avec migration.

**Une décision prise le 2026-09-08 et pas encore codée : la seconde question de densité.** Le
ressenti actuel ne distingue pas la charge du rythme, et « trop dur » sur une séance seulement
trop serrée déclencherait une descente de mode — donc moins de répétitions, alors que le
volume était bon. La décision est écrite dans `brief-v2-multi-user.md` section 7.1b : sur les
formats à contrainte de temps, « ça rentrait dans le temps ? » avec `large` / `juste` /
`pas le temps`. **Ce signal remonte au catalogue, jamais au mode** — c'est toute sa raison
d'être. Une étape à elle, pas à mêler à autre chose.

Trois dettes ouvertes, chacune à traiter dans l'étape qui la concerne :

- **Un total `reparti` peut devenir impair sous les coefficients de mode** : `scaleRep(10, 2)`
  donne 13, qui ne se partage pas en deux côtés égaux. L'affichage bascule alors sur « en
  alternant les côtés », qui est honnête mais moins utile. Arrondir ces totaux au pair est du
  ressort de l'étape des modes (étape 5).
- **Substituer la suspension active à des pull-ups demande une conversion d'unité.** Garder le
  nombre prescrit donnerait « 4 s de suspension » là où la séance demande 4 tractions. Étape 9,
  avec la substitution. `app/test/chains.test.js` nomme le cran concerné : il est seul, et le
  test échouera si un second apparaît.
- **Une variante peut être latérale quand l'exercice prescrit ne l'est pas** (`vupsUneJambe`
  contre `vups`). Le nombre ne change pas, ce qu'il veut dire change, et la note de côté doit
  suivre la substitution. Même étape, même fichier de test.

~~**`volumeOf` sous-compte le vendredi**~~ **Réglé le 2026-09-07.** Les 50 burpees du test
sont devenus une vraie ligne de travail, et les quatre autres vendredis déclarent
`score:{ex, unit}` sur la fiche — leur volume de burpees *est* le score, `volumeReel` l'ajoute
au total une fois la séance relue. Deux pièges au passage, tous deux évités par une donnée
déclarée plutôt que devinée : sans `test:true`, la ligne de 50 burpees faisait passer le
vendredi pour un format à tours ouverts ; et sans `pas:1` sur l'escalier ouvert, un nombre de
tours saisi après coup multipliait le premier tour et sous-comptait de moitié.

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
- **La table des zones sensibles attend le même kiné** (`app/src/data/douleurs.js`, 2026-09-27). Trois entrées méritent un œil : `jumpSquats → airSquats` en pubalgie, la plus large des trois zones, qui retire le seul squat pliométrique du catalogue ; `burpees → burpees sans saut ni pompe` en genou, seul cran sans saut disponible, qui retire la pompe avec ; et `airSquats → hipThrusts` en genou, qui est ce qui fait disparaître le schéma squat.
- **Quel équipement de tirage horizontal exactement** — TRX, anneaux, sangle sur la barre ? Le catalogue nomme le mouvement sans nommer l'appareil, donc rien n'est bloqué, mais les consignes des lignes restent vagues tant que la réponse manque.
- **Le ratio poussée/tirage n'a pas de plafond, et c'est une décision à confirmer.** Mesuré après F-06, les séances qui avaient déjà du tirage sont **entre 146 % et 292 % de la parité** : par les coefficients de Martin, le catalogue tire plus qu'il ne pousse. Deux lectures — les coefficients sont généreux envers le tirage, ou le déséquilibre ressenti venait entièrement des cinq séances à zéro. Le garde-fou ne pose donc qu'un plancher à 90 %, la marge d'arrondi des nombres écrits à la main. À rouvrir si les 292 % se ressentent à l'usage.
- **Les schémas moteurs des 20 exercices Athlean X suivent le groupe du spec** (Upper Push → `poussee`, etc.), choisi sans arbitrage le 2026-10-26 pour la traçabilité. Quatre classements surprennent : `squatToucherTalon` et `fenteArriereSautee` en `hinge`, `plancheLateraleAlternee` en `poussee`, `dragonFly` en `tirage`. **Ce n'est plus sans effet depuis F-14** : Athlean X compte dans la couverture, que le générateur lit pour tirer la séance Classique — une séance A couvre « postérieure » par le squat toucher-talon, par exemple. À relire.
- **Le chrono Athlean X n'a jamais tourné sur iPhone.** Il est branché depuis F-14 ; trois choses à constater au premier usage : le son se déverrouille-t-il bien au tap sur DÉMARRER ; `performance.now()` avance-t-il écran verrouillé (sinon la séance se décale du temps de veille) ; et la vibration, absente de Safari iOS, ne se sentira pas — les sons portent seuls.
- **La règle poussée/tirage vaut-elle hors des 25 minutes ?** Aucun finisher ne prescrit de poussée aujourd'hui, donc la question ne s'est jamais posée. Un test la posera le jour où l'un en prescrira, plutôt que de laisser le cas passer sans que personne n'y pense.
- **« Gainage descendant » porte son contenu dans des libellés de phase** au lieu de lignes typées, donc rien ne le compte ni ne sait le proposer à la saisie. Anomalie antérieure, découverte le 2026-09-27 en ajoutant le contrôle de parité fiche/chrono, et inscrite comme exception dans `coherence.test.js` sous `SANS_LIGNES`. Une session séparée a été ouverte pour la traiter.

## Matériaux clés

Ordre de lecture recommandé pour reprendre le projet :

1. `pickup-app-workout.md` — cette note, l'état technique.
2. `brief-v2-multi-user.md` — l'intention produit, toutes décisions tranchées, ordre de travail en douze étapes.
3. `table-nommage-exercices.md` — les labels français, les labels courts pour le chrono et les termes anglais. Référence pour l'étape 4. **Lire l'avertissement en tête** : sa colonne « clé technique » n'est pas l'identifiant du code, trois maintiens n'y figurent pas, et trois exercices sont arrivés depuis (la flexion de hanche du bloc pubalgie, les deux tirages horizontaux).
4. `idees-perso-backlog.md` — **le second fil de travail, et le seul journal de ce qui a été livré les 27 et 28 septembre.** Sa section « Ordre d'envoi » donne les tickets restants, son `## Log` ce qui a été fait et ce qui a dévié de la spec.

Fichiers du projet :

5. `app/src/data/` — le contenu : séances, finishers, étirements, plans de chrono, schémas moteurs, niveaux, plus quatre tables arrivées en septembre — `correctif.js` (le bloc pubalgie), `douleurs.js` (les zones sensibles et leurs substitutions), `equivalences.js` (la table poussée/tirage), et les deux tirages horizontaux dans `exercises.js`. C'est là que se trouve tout ce qui se discute côté produit. **Commencer par `exercises.js`** : c'est la table des exercices, tout le reste la cite par identifiant, et elle se lit en deux parties — le prescrit, puis les variantes de régression. `chains.js` ordonne ces variantes ; il ne substitue rien. `items.js` dit la différence entre une ligne de travail (`r` en répétitions, `h` en secondes) et une note de structure (`f`) — distinction qui commande ce que l'écran de perfs saura proposer à la saisie.
6. `app/src/lib/chrono.js` — le chrono reprenable. `app/src/lib/athlean.js` — le chrono Athlean X, moteur à part, par échéances. `app/src/lib/store.js` — les clés de stockage local, dont `workout.run` pour la séance en cours et `workout.athlean` pour le journal Athlean X, `workout.athleanRun` pour sa séance en cours. `app/src/lib/journalAthlean.js` — ce journal, l'alternance A/B, et ce que la série en lit. `app/src/lib/ressenti.js` — les trois valeurs du retour de fin de séance et leurs deux règles pures. `app/src/lib/substitution.js` — le point de passage unique de toute substitution d'exercice. `app/src/lib/qualite.js` et `app/src/lib/revue.js` — la note de qualité et le dossier de revue qui part dans le récap.
7. `app/src/App.jsx` et `app/src/components/` — les écrans. `Bilan.jsx` porte ce que l'écran de fin et sa relecture ont en commun, `Revoir.jsx` la relecture à deux onglets, `Perfs.jsx` la saisie des chiffres — dont le corps sert aux deux endroits. `Mode.jsx` le sélecteur Classique / Athlean X et l'entrée d'Athlean X (workout, mode, LANCER). `ChronoAthlean.jsx` l'écran du chrono Athlean X, séance comme échauffement et étirements. `Coche.jsx` prend une couleur, verte par défaut. Les séances Athlean X sont des données : `app/src/data/seancesAthlean.js`, l'échauffement commun aux deux modes `app/src/data/echauffement.js`.
8. `app/test/` — seize fichiers, 339 tests : cohérence de la bibliothèque, générateur, chrono, table des exercices, chaînes de régressions, ressenti, perfs, rendu des écrans, dates de la semaine, journal et série, substitution et zones sensibles, note de qualité et dossier de revue, ratio poussée/tirage, sélecteur de mode, chrono Athlean X, exercices Athlean X dans la bibliothèque (dans `coherence.test.js`), séances Athlean X confrontées au spec source, journal et alternance d'Athlean X. **Les faire tourner avant de livrer** (`npm test` dans `app/`) : ils bloquent le déploiement. `test/hasard.js` n'est pas un fichier de tests mais le générateur pseudo-aléatoire déterministe que partagent les simulations hebdomadaires.
9. `app/vite.config.js` — build, et génération du service worker. **La version de cache est dérivée d'un hash du build** (`workout-<hash>`) : il n'y a plus rien à incrémenter à la main. `CLAUDE.md` le dit désormais aussi — la contradiction signalée ici le 2026-09-07 a été levée.
10. `manifest.json` et les icônes — inchangés depuis le début, servis depuis `app/public/`.
11. Export JSON de l'onglet SUIVI (`workout-2026-09-04.json`) — historique réel des séances, jeu de test pour la synchro et pour les écrans de stats.
12. Dépôt GitHub `workout` (public, Pages publié par GitHub Actions depuis `app/dist`).
13. `.claude/skills/video-to-sequence/` — skill de découpage des vidéos d'exercices en planches de positions. Chantier reporté en fin de parcours, le skill est prêt.

**Node n'est pas dans le PATH par défaut** sur cette machine (pas de Homebrew) :
`export PATH="$HOME/.local/node/bin:$PATH"`.

## Hors périmètre (ne pas s'y perdre)

- **Empaquetage en app natif iOS.** Tranché : aucune voie gratuite et durable sans compte Apple Developer à 99 $/an. La PWA sur l'écran d'accueil est la réponse.
- **Ajouter du contenu à la bibliothèque.** Elle est suffisamment fournie ; le sujet est désormais l'infrastructure. Sauf les mollets, listés en question ouverte.
- **Nutrition, suppléments, protocole kiné.** Suivis ailleurs, hors app — **à une exception près depuis le 2026-09-27** : le bloc pubalgie et les zones sensibles sont dans l'app, parce qu'ils changent ce qu'elle prescrit. Le reste du suivi kiné n'y entre pas.
- **Le moteur générique de génération (« formats-comme-templates »).** Discuté sur claude.ai, jamais arbitré, explicitement écarté du périmètre de F-06 et de F-02. Les deux tickets ont été construits en version fixe et autonome pour que ce chantier reste ouvert sans que rien ne soit à refaire.
