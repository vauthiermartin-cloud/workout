---
topic: app-workout-25
date: 2026-09-07
status: in-progress
---

# Pickup — App workout « 25 » : état technique

## État actuel (TL;DR)

Une PWA de séances au poids du corps est **en production et fonctionnelle**, hébergée sur GitHub Pages, installée sur l'écran d'accueil iPhone. Les données vivent en `localStorage` avec export/import JSON.

**Le code vit dans `app/` : Vite 8 + React 19, testé sous Vitest.** Le mono-fichier de 100 Ko avec Babel dans le navigateur appartient au passé. Le déploiement passe par `.github/workflows/deploy.yml` : `npm ci`, `npm test`, `npm run build`, publication de `app/dist` sur Pages. **Les tests sont un garde-barrière du déploiement** — un échec bloque la mise en production.

Le contenu est complet et validé : 25 séances réparties lundi→vendredi, 20 finishers, 5 séquences d'étirement, 37 exercices prescrits — plus 17 variantes de régression que le catalogue ne prescrit pas et qu'on n'atteint que par une chaîne. Un chrono adaptatif (EMOM / Tabata / compte à rebours / chrono libre) et un générateur qui choisit la séance selon les schémas moteurs non encore couverts dans la semaine.

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

### À prendre maintenant — étape 4, table de nommage

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
    celle de JavaScript où dimanche vaut 0. **Le week-end n'a pas d'onglet** : une séance faite un
    samedi se rattache au jour de référence lui-même et garde son bilan atteignable, au lieu de
    tomber sur un lundi qui n'a rien vu — et le réalignement de l'onglet après enregistrement est
    gardé par `dowToday <= 5`, sans quoi un samedi désignait un onglet inexistant et plantait
    l'écran.

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

## Matériaux clés

Ordre de lecture recommandé pour reprendre le projet :

1. `pickup-app-workout.md` — cette note, l'état technique.
2. `brief-v2-multi-user.md` — l'intention produit, toutes décisions tranchées, ordre de travail en douze étapes.
3. `table-nommage-exercices.md` — les labels français, les labels courts pour le chrono et les termes anglais. Référence pour l'étape 4. **Lire l'avertissement en tête** : sa colonne « clé technique » n'est pas l'identifiant du code, et trois maintiens n'y figurent pas.

Fichiers du projet :

4. `app/src/data/` — le contenu : séances, finishers, étirements, plans de chrono, schémas moteurs, niveaux. C'est là que se trouve tout ce qui se discute côté produit. **Commencer par `exercises.js`** : c'est la table des exercices, tout le reste la cite par identifiant, et elle se lit en deux parties — le prescrit, puis les variantes de régression. `chains.js` ordonne ces variantes ; il ne substitue rien. `items.js` dit la différence entre une ligne de travail (`r` en répétitions, `h` en secondes) et une note de structure (`f`) — distinction qui commande ce que l'écran de perfs saura proposer à la saisie.
5. `app/src/lib/chrono.js` — le chrono reprenable. `app/src/lib/store.js` — les clés de stockage local, dont `workout.run` pour la séance en cours. `app/src/lib/ressenti.js` — les trois valeurs du retour de fin de séance et leurs deux règles pures.
6. `app/src/App.jsx` et `app/src/components/` — les écrans. `Bilan.jsx` porte ce que l'écran de fin et sa relecture ont en commun, `Revoir.jsx` la relecture à deux onglets, `Perfs.jsx` la saisie des chiffres — dont le corps sert aux deux endroits.
7. `app/test/` — dix fichiers, 135 tests : cohérence de la bibliothèque, générateur, chrono, table des exercices, chaînes de régressions, ressenti, perfs, rendu des écrans de bilan, dates de la semaine, journal et série. **Les faire tourner avant de livrer** (`npm test` dans `app/`) : ils bloquent le déploiement.
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
