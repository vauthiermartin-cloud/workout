# Brief v2 — App workout « 25 » : contrat, modes et calibration

Ce document décrit l'intention produit. Il complète `pickup-app-workout.md`, qui décrit
l'état technique actuel. Toutes les décisions produit sont désormais tranchées : ne pas les
rouvrir sans me demander.

---

## Phasage — lire ceci avant tout

**Phase 1, en cours : perfectionner l'app mono-utilisateur.** Pas de comptes, pas de base
distante, pas de leaderboard. Les données restent locales. C'est là que se trouve la quasi
totalité de la valeur restante, et rien n'y dépend du multi-utilisateurs.

**Phase 2, en pause : ouverture aux utilisateurs.** Authentification, Supabase, leaderboard,
badges, mention d'information. À reprendre quand l'app solo est aboutie.

Les sections **1 (arrivée et création de compte)** et **4 (leaderboard)** relèvent de la
phase 2 et sont conservées ici pour mémoire. Tout le reste est de la phase 1, y compris le
contrat, le gel, la pause, les séries, les modes et le signal de fin de séance : ces
mécanismes fonctionnent parfaitement pour un seul utilisateur, le leaderboard ne fait que les
afficher publiquement plus tard.

### Ordre de travail recommandé

1. ~~**Réparer la reprise du chrono**~~ (section 0). **Fait le 2026-09-07.**
2. ~~**Migrer vers Vite + tests.**~~ **Fait le 2026-09-07**, chaîne de build *et* volet
   données : `app/` tourne sous Vite 8 + React 19, les tests Vitest bloquent le déploiement,
   et les exercices sont devenus des entités (section 8). ~~Reste dans ce lot la saisie des
   répétitions réalisées avec le cas AMRAP (section 6.1)~~ — **faite le 2026-09-07**, elle
   attendait le typage des unités. Le lot est clos.
3. ~~**Chaînes de régressions**~~ (section 8.1) **faites le 2026-09-07**, `app/src/data/chains.js` :
   sept chaînes ordonnées, tenues par des tests. **Restent dans cette étape, reportés :** la
   **substitution permanente**, qui se règle depuis la bibliothèque et part donc avec elle
   (étape 9), et la **substitution sans barre de traction** (section 2.1), qui dépend du
   matériel déclaré à l'onboarding (étape 8) et de la grille de couverture, pas des chaînes.
   C'est ce dernier morceau qui rend l'app utilisable par quelqu'un qui n'a rien où se
   suspendre, donc par la plupart des gens à qui tu la montreras : il ne doit pas se perdre en
   route sous prétexte que « l'étape 3 est faite ».
4. **Table de nommage français** à arbitrer ligne par ligne (section 8.2). Peu de code,
   beaucoup d'effet.
5. **Renommer les modes, appliquer les coefficients**, et faire progresser les maintiens eux
   aussi (section 5). *Les maintiens sont désormais typés en secondes, mais le mode ne les
   touche pas encore* : leur donner un coefficient demande que le plan de chrono suive, la
   durée des phases ne bougeant pas avec le mode. À faire ici, dans `scaleItem`. Cette étape
   doit aussi arrondir au pair les totaux répartis entre deux côtés, qu'un coefficient rend
   impairs (`scaleRep(10, 2)` donne 13, qui ne se partage pas).
6. ~~**Ajouter le signal de fin de séance** et son effet immédiat sur la proposition de
   finisher (section 7.1).~~ **Fait le 2026-09-07**, remonté avant les étapes 3 à 5 : chaque
   semaine sans lui est une semaine de données de calibration perdue, et il ne dépendait de
   rien.
7. **Contrat, gel, pause, séries**, en local (section 3).
8. **Onboarding : ponctuel ou routine**, plus les deux questions de capacité, sans création de
   compte (sections 2 et 8.1).
9. **Écran de bibliothèque d'exercices** et présentation des démos (section 8.4).
10. **Tournage et production des planches de positions** pour la douzaine d'exercices ambigus
    (section 8.3). Chantier de production plus que de code, parallélisable avec le reste : un
    après-midi de tournage n'attend pas que Vite soit en place.
11. **Refondre les stats personnelles** en exploitant le signal (section 7.2).
12. **Règles de montée et de descente de mode** (section 7). Elles arrivent naturellement en
    dernier : elles demandent quatre semaines de ressentis réels pour être validables.

### Une seule précaution d'architecture

Même sans base distante, **façonner les données comme si elles étaient déjà des lignes de
table** : un enregistrement par séance, champs typés, identifiant, horodatage. La migration
vers Postgres devient alors un changement de transport et non une réécriture. Ne pas éparpiller
l'état dans plusieurs clés de stockage local ad hoc.

---

## 0. Priorité absolue : le chrono doit être reprenable — FAIT (2026-09-07)

> **Livré.** Les quatre points ci-dessous sont couverts et vérifiés, `app/test/chrono.test.js`
> les tient. Le diagnostic reste ici parce qu'il explique pourquoi le chrono est écrit comme
> il l'est.
>
> **La logique est dans `app/src/lib/chrono.js`, sans dépendance à React**, ce qui la rend
> testable sans monter de composant. Elle distingue le `run` — enregistrement d'une séance en
> cours, façonné comme une ligne de table, écrit dans la clé unique `workout.run` — du `beat`,
> dernier battement réellement observé.
>
> **Le déclencheur retenu n'est pas celui du brief, il est plus large.** Le brief proposait de
> détecter un dépassement de la fin de phase ; ça laisse passer une suspension en milieu de
> phase (écran verrouillé à 10 minutes de la fin d'une phase de 25 : le temps est mangé en
> silence). Le chrono compare donc l'écart entre deux battements consécutifs : au-delà de 4 s
> (`SUSPEND_GAP`), à 100 ms de cadence, l'app a dormi. Le dépassement de fin de phase est
> conservé en second garde-fou.
>
> **La position annoncée exclut l'échauffement** : les 25 minutes que promet le nom de l'app
> sont celles de la séance. Une phase marquée `warm: true` sort du décompte, et pendant
> l'échauffement l'écran dit « tu étais dans l'échauffement » plutôt qu'un numéro de minute.

Ce matin, l'écran du téléphone s'est verrouillé pendant une séance. Au retour, l'app
affichait l'écran de fin qui proposait un finisher. La séance en cours était perdue.

**Diagnostic probable.** Le chrono ne compte pas ses propres battements, il calcule le temps
écoulé depuis un horodatage (`Date.now() - phaseStart`). C'était un choix volontaire pour
rester juste quand iOS ralentit l'onglet. Mais quand l'app est suspendue puis relancée,
le temps écoulé fait un bond qui dépasse la durée de la phase. La phase se marque comme
terminée, passe à la suivante, qui est elle aussi immédiatement dépassée, et l'enchaînement
cascade jusqu'à l'écran de fin en une fraction de seconde.

**Ce qu'il faut donc corriger, dans cet ordre :**

1. **Ne jamais enchaîner en cascade.** Si le temps écoulé dépasse la fin de la phase de plus
   d'une marge raisonnable (quelques secondes), c'est que l'app a été suspendue, pas que la
   phase s'est terminée normalement. Dans ce cas : mettre en pause, ne rien valider, et
   afficher un écran « tu étais à la minute 12 sur 25 — reprendre ici, ou avancer ? ».
2. **Persister l'état du chrono à chaque changement** : le plan complet, l'index de phase,
   l'horodatage de départ de phase, l'état de pause, le segment en cours (séance / finisher /
   étirement). En local d'abord, comme le reste.
3. **Proposer la reprise au démarrage.** Si une séance non terminée existe et date de moins
   de quelques heures, l'app s'ouvre sur « séance en cours, reprendre ». Au-delà, proposer
   de l'abandonner ou de l'enregistrer telle quelle.
4. **L'écran de fin ne doit jamais être atteignable sans action explicite** ou sans que la
   dernière phase soit réellement arrivée à son terme.

Le verrouillage d'écran est le cas normal, pas un cas limite : le téléphone est posé par
terre pendant 25 minutes.

---

## 0.5 Positionnement et accroche

Le nom de l'app est **25**. Il doit être visible sur le tableau de bord, avec un accueil du
type « Bienvenue sur 25 ».

**Le nom impose une promesse : 25 minutes.** Le catalogue le respecte — les séances vont de
18 à 25 minutes, plafonnées à 25. Annoncer « 20 minutes » créerait une contradiction avec le
nom et avec le contenu réel. Le chiffre à afficher est donc 25, une fois, à côté du nom, puis
plus jamais.

**Accroche retenue, sous le nom :**

> Une séance par jour. 25 minutes. Ton corps suffit.

Neuf mots qui portent les trois arguments qui décident quelqu'un : c'est quotidien, c'est
court, il n'y a rien à acheter.

**Trois lignes au niveau inférieur**, pour l'écran d'accueil au premier lancement ou une page
« c'est quoi » :

- Poids du corps, aucun matériel — juste une barre de traction si tu en as une
- Générée chaque jour, calibrée sur ton niveau
- Échauffement et finisher en plus, si tu les veux

**Ce qui ne doit pas figurer dans l'accroche** mais se découvre à l'usage : le contrat
hebdomadaire, les schémas moteurs, les modes. Ce sont les mécanismes qui font revenir, pas
ceux qui font entrer. Les annoncer d'emblée transforme une promesse simple en cahier des
charges.

---

## 1. Arrivée et création de compte — PHASE 2

L'utilisateur arrive sur une page d'accueil et peut se connecter ou créer un compte.

- **Google en authentification unique**, plus une option e-mail simple.
- **Minimum d'informations demandées.** Pas de nom, pas d'âge, pas de poids, pas de taille.
  Rien qui ne serve pas immédiatement à faire fonctionner l'app.
- Un pseudonyme est nécessaire, uniquement pour le leaderboard. Il peut être choisi plus tard,
  au moment où l'utilisateur consulte le classement pour la première fois.

À partir du moment où l'app a des utilisateurs, il faut une mention d'information et un
chemin de suppression de compte qui supprime réellement les données.

---

## 2. Onboarding — trois écrans, cinq taps

En phase 1, l'onboarding se déclenche au premier lancement, sans compte ni identification.
Les réponses sont stockées localement.

**Écran 1 — le matériel.** « Tu as une barre de traction ? » Oui / Non. Cette question passe
en premier parce qu'elle conditionne la suivante et une partie du catalogue. C'est le seul
équipement dont l'app ait besoin.

**Écran 2 — la capacité.** « Combien de pompes d'affilée ? » avec trois ou quatre paliers, et
« Tu fais une traction ? » — cette seconde question n'apparaît que si la barre existe. Une
option « je ne sais pas » sur chacune, qui part sur la variante intermédiaire.

Ces deux questions remplacent l'ancienne « tu t'entraînes déjà, à quelle fréquence ? », qui
était plus vague et moins informative. Le nombre de pompes dit tout ce que la fréquence
suggérait, en plus d'être directement utilisable pour calibrer les chaînes de régressions.

**Écran 3 — l'usage.** « Séances ponctuelles ou routine hebdomadaire ? »

- **Ponctuel** : l'utilisateur génère une séance piochée dans l'ensemble du catalogue, tous
  jours confondus. Les plus accessibles sont proposées d'abord.
- **Routine hebdomadaire** — c'est le cœur de l'app. On lui demande alors quels jours de la
  semaine il compte s'entraîner. Il cochera les jours. Le texte doit expliquer pourquoi ça
  compte : **tout commence par un contrat avec soi-même.** Ce n'est pas un réglage, c'est un
  engagement, et c'est ce qui alimente les séries.

**Le basculement entre les deux modes d'usage doit être accessible à tout moment** depuis
l'interface, sans repasser par l'onboarding.

**Le moteur de couverture reste actif en mode ponctuel**, sur une fenêtre glissante des
**5 dernières séances** au lieu de la semaine calendaire. Quelqu'un qui s'entraîne sans
structure a encore plus besoin de ne pas répéter les mêmes schémas. Le désactiver ferait du
mode ponctuel un simple tirage aléatoire. Même code, autre fenêtre.

### 2.1 Sans barre de traction

Onze séances sur vingt-cinq contiennent des tractions ou des chin-ups. Il faut donc un plan
de repli, et il faut être honnête sur ses limites.

**Substitution retenue, par ordre de préférence :**

1. **Tirages sous une table** solide, corps gainé, talons au sol. C'est le seul vrai tirage
   disponible sans rien acheter, et presque tout le monde a une table qui convient.
2. À défaut, **travail dorsal au sol** : relevés de torse à plat ventre, et bras en Y puis en
   T décollés du sol. Ça travaille le schéma sans charge réelle.

**Et il faut le dire clairement à l'utilisateur.** Le tirage est le trou béant de
l'entraînement au poids du corps : il n'existe aucun équivalent à une traction sans quelque
chose à quoi se suspendre. L'app ne doit pas prétendre le contraire. Le bon message est qu'un
élastique ou une barre de porte à une quinzaine d'euros débloque tout un pan de
l'entraînement — pas de culpabilisation, juste l'information.

**Conséquence technique à ne pas rater :** la grille de couverture doit s'adapter au matériel.
Sans barre, les schémas **tirage** et **supination** ne sont pas couvrables au même niveau.
Soit on les retire de la grille de cet utilisateur, soit on les marque comme couverts par
substitution — mais on ne lui affiche pas une case vide qu'il ne peut pas remplir.

---

## 3. Le contrat

L'utilisateur choisit ses jours. Il peut revoir son contrat à tout moment et passer de 5 à
4 jours, ou l'inverse.

**Règle anti-triche nécessaire** : un changement de contrat prend effet **la semaine
suivante**. Sinon il suffit de passer de 5 à 3 jours un vendredi soir pour sauver une série
en train de se casser, et la métrique ne veut plus rien dire.

**La pause du contrat est validée, avec des bornes.** Sans elle, deux semaines de vacances
détruisent une série de soixante jours et la personne arrête. Illimitée, la série ne veut plus
rien dire.

- **Deux semaines de pause maximum par trimestre.**
- **Activable à l'avance uniquement**, jamais rétroactivement. Même logique anti-triche que le
  changement de contrat.
- Pendant la pause, la série **gèle** : elle ne se casse pas, elle ne progresse pas.
- La pause est un état visible de l'app, pas un réglage caché.

**Pause et gel sont deux mécanismes distincts, qui ne se remplacent pas :**

| | Gel | Pause |
|---|---|---|
| Couvre | un jour de contrat manqué | une absence assumée |
| Quota | 1 par semaine | 2 semaines par trimestre |
| Déclenchement | automatique | choisi à l'avance |
| Effet sur la série | la préserve | la gèle |
| Cumulable | non | non |

---

## 4. Leaderboard — PHASE 2

Deux fenêtres : **mensuel** et **depuis toujours**. Quatre métriques :

1. **Nombre de séances.**
2. **Série (streak).** Elle compte les jours de contrat honorés à la suite. Contrat de 5 jours
   par semaine, 3 jours consécutifs faits → série à 3. Deux semaines complètes d'un contrat
   de 5 jours → série à 10. Elle se casse quand un jour de contrat est manqué.
3. **Minutes d'entraînement.**
4. **Nombre de répétitions.**

**Un gel par semaine**, automatique et visible. Il absorbe le premier jour de contrat manqué
de la semaine. Non cumulable d'une semaine sur l'autre. Une pastille indique s'il est encore
disponible. Il est distinct de la pause du contrat (voir section 3).

**Règles tranchées, à implémenter telles quelles :**

- **Le classement des séries se trie sur le taux de fidélité au contrat**, avec la série brute
  affichée à côté. Un contrat de 2 jours tenu parfaitement fait 100 %, un contrat de 5 jours
  tenu 3 fois fait 60 %. Le classement porte donc sur le respect de la parole donnée, ce qui
  colle à l'intention du contrat. Le volume est déjà récompensé par les trois autres
  métriques. Départage à la série brute.
- **Les répétitions sont comptées réelles, pas normalisées.** Quelqu'un en BEAST qui fait 40 %
  de répétitions en plus en a réellement fait 40 % en plus. Normaliser rendrait le choix du
  mode invisible au classement, donc sans récompense. Le mode est affiché à côté du pseudonyme
  pour que la colonne reste lisible.
- **Les minutes se calculent sur les phases réellement terminées du plan**, jamais sur le temps
  écoulé à l'écran. Sinon il suffit de lancer le chrono et d'aller déjeuner.
- **Une séance faite en dehors des jours du contrat** compte dans le nombre de séances, les
  minutes et les répétitions, mais **ne prolonge pas la série** — qui mesure la fidélité au
  contrat, pas le volume.

**Badges du podium.** Le premier reçoit **« THE GOAT »**. Propositions pour les deux autres,
à valider :

- THE GOAT / THE BEAST / THE MACHINE
- THE GOAT / THE SHARK / THE WOLF
- THE GOAT / THE ANIMAL / THE ENGINE

---

## 5. Les modes remplacent les niveaux

Le terme « niveau » disparaît, on parle de **mode**. **Le mode doit être affiché sur l'écran
d'accueil**, c'est une identité, pas un réglage caché.

**Les trois modes sont HUMAN, WARRIOR, BEAST.** Décidé, ne pas rediscuter. Progression lisible
sans qu'aucun palier ne soit humiliant, et aucun nom emprunté à une marque existante.

**Coefficients validés : +20 % en WARRIOR, +40 % en BEAST.** Avec deux plafonds durs, parce
que les pourcentages s'effondrent sur les petits nombres :

- **Jamais plus de 2 répétitions d'écart** sur les mouvements à la barre, entre HUMAN et BEAST.
- **Jamais plus de 1 répétition d'écart** sur tout mouvement à 5 répétitions ou moins en HUMAN.

Trois chin-ups qui passent à 4 puis 5, c'est déjà +33 % puis +67 % dans la réalité. Sur un
mouvement où l'on progresse par répétition unique, le pourcentage n'a pas de sens.

**Les maintiens en temps ne sont pas majorés du tout aujourd'hui.** Trente secondes de planche
restent trente secondes en BEAST, parce que ce sont des lignes de texte libre et non des
répétitions. C'est un trou à combler : les faire progresser par paliers de cinq secondes, ce
qui suppose de les traiter comme une vraie donnée typée et non comme du texte.

**À revérifier après implémentation :** que les séances les plus denses du catalogue tiennent
toujours dans les 25 minutes en mode BEAST.

---

## 6. Écran de fin de séance

Le message devient **« Well done, player! »**.

Note : le reste de l'app est en français. **Les adresses au pratiquant sont une exception de
ton assumée** (confirmé le 2026-09-07) : ce message et les trois retours au ressenti.

L'écran conserve ce qu'il affiche déjà : volume de répétitions, série de jours, progression
dans la semaine, schémas moteurs travaillés, ce qui manque à la semaine. Puis la proposition
de finisher, d'étirements, ou de terminer.

### 6.1 Validation de la séance et écran de perfs — décidé et fait le 2026-09-07

Un bouton qui **valide la séance pour de bon**, et l'écran suivant est un **passage obligé par
les perfs** : la liste de ce qui était prescrit, éditable. « Ajuste si tu as fait plus ou moins
que prévu. »

**La séance reste écrite dès la fin du chrono ; l'écran de perfs corrige la ligne au lieu de la
créer.** Si la validation conditionnait l'enregistrement, une séance faite puis quittée avant
cet écran serait perdue — ce que « local d'abord, jamais perdue » interdit. La validation
marque donc la ligne comme relue, elle ne la fait pas naître.

~~Dépend du typage des unités~~ **(section 8, fait le 2026-09-07 — cette dépendance est
levée).** Sans lui on aurait su éditer `r(10,"burpees")` mais pas `f("30 s de planche")`, où
la durée était dans la chaîne. Ce que le typage apporte à cet écran :

- **La distinction travail / note est explicite.** `r()` et `h()` sont des lignes de travail,
  donc éditables ; `f()` est une note de structure, donc pas une ligne à saisir. Auparavant
  `f()` mélangeait les deux et l'écran n'aurait pas su quoi proposer.
- **Chaque ligne sait dans quelle unité elle se saisit**, et le clavier peut en tenir compte.
- **La question du côté est tranchée** : sur un mouvement `reparti`, on édite le total, pas la
  moitié — c'est le total qui est la donnée, la note « 8 par côté » n'en est que la lecture.

Les deux points qui restaient à trancher, tranchés :

- **Le format AMRAP du jeudi a un champ distinct.** Ce qu'on ajuste est le **nombre de tours**,
  pas les répétitions d'un tour : un tour se termine ou ne se termine pas. Le champ affiche ce
  que vaut un tour (« 1 TOUR = 65 REPS ») et le total se recalcule.
- **Le test du vendredi est devenu une donnée.** Les 50 burpees sont une vraie ligne de
  travail ; les quatre autres vendredis déclarent `score:{ex, unit}` sur la fiche, parce que
  leur volume de burpees *est* le score. `volumeOf` ne sous-compte plus.

Ce que l'écran a coûté en plus de ce qui était prévu, et qui vaut d'être retenu :

- **La granularité est le total de la séance, pas la série.** L'escalier du mardi aurait sinon
  demandé douze champs quotidiens.
- **Un escalier ouvert monte d'un cran par tour.** Sans le déclarer (`pas`), un nombre de tours
  saisi après coup multiplie le premier tour et sous-compte de moitié.
- **Valider ramène au bilan, pas aux stats.** Partir aux stats fermait l'écran de fin et
  emportait l'offre de finisher avec lui.
- **Le total affiché ne bascule sur « ce qui a été fait » que si tous les chiffres sont là.**
  Un total partiel serait plus faux que le prescrit.

---

## 7. Proposition de montée en mode

L'idée de départ : au bout d'un mois avec au moins 2 séances par semaine, proposer le mode
supérieur dans l'écran de fin. C'est le bon endroit et le bon moment, mais la règle mesure
l'assiduité, pas la capacité. Quelqu'un peut venir régulièrement en survivant à peine.

**Signaux déjà disponibles dans l'app, sans rien ajouter :**

- Taux de respect du contrat sur les 4 dernières semaines, plutôt qu'un simple décompte.
- Tendance du test de burpees du vendredi. C'est la seule métrique comparable de l'app. Une
  progression ou un plateau haut indique une marge ; une régression indique le contraire.
- Fréquence d'ajout d'un finisher. Ajouter volontairement 10 minutes de travail est le meilleur
  aveu d'avoir eu du jus.
- Usage de la pause et des sauts de phase pendant le chrono. Beaucoup de pauses veut dire que
  le dosage actuel est déjà limite.

**Décidé le 2026-09-07 — une première règle, courte, avant le moteur complet.** Trois « trop
facile » et **quelque chose doit se passer**. Sans ça le retour « Ok beast! On va monter d'un
cran. » annonce une conséquence qui n'arrive jamais, et la question redevient un sondage au
bout de trois semaines. À écrire une fois le typage des unités posé, et à tenir par un test.
Restent à trancher au moment de l'écrire : trois d'affilée ou trois sur une fenêtre glissante,
et ce qui se passe exactement — proposer la montée de mode, ou l'appliquer en l'annonçant.

### 7.1 Le retour de fin de séance — FAIT (2026-09-07)

> `app/src/lib/ressenti.js` porte les trois valeurs (`facile` / `juste` / `dur`) et les deux
> règles pures : ce que la réponse change à l'écran (`finisherStance`) et quand la question se
> pose (`askRessenti`). `app/test/ressenti.test.js` les tient. La réponse s'écrit sur la ligne
> de séance dans le champ `ressenti`, reporté d'une écriture à l'autre comme le finisher —
> sans ce report, enchaîner un finisher effaçait la réponse donnée juste avant.
>
> **L'effet immédiat de la réponse n'est pas celui du texte d'origine.** Il a d'abord été
> implémenté à la lettre, essayé, puis revu à l'usage le 2026-09-07 :
>
> - **La réponse de l'app est une phrase**, portée par `RESSENTIS[].retour` : « Ok beast! On
>   va monter d'un cran. » / « Dans ta zone, Player! » / « Ok le sang. On adapte la suite. »
>   C'est elle qui empêche la question d'être un sondage, pas un changement de mise en page.
> - **« Trop facile » ne tire pas le finisher** et ne change pas la mise en page : le bouton
>   est déjà l'action principale de l'écran. Un premier essai le tirait d'emblée ; le bloc de
>   séance qui s'ouvrait alors juste sous la question noyait la phrase de retour. La
>   conséquence de « trop facile » est donc **différée à la montée de mode** (étape 12) — le
>   texte du retour l'annonce, et engage cette étape.
> - **« Trop dur » reste la seule réponse qui agit sur l'écran** : le finisher est retiré, les
>   étirements deviennent l'action principale.
> - **Le bloc porte le liseré d'accent tant qu'il est sans réponse**, et s'éteint une fois
>   répondu : c'est le seul élément de l'écran de bilan qui attende quelque chose.
>
> Un écart de plus, indépendant : **une sortie a été ouverte dans le bloc de proposition**
> (`SANS FINISHER`). Il n'en avait aucune — tirer une proposition enfermait l'écran, sans
> étirements, sans stats et sans fermeture. Ce piège préexistait au ressenti.
>
> La question ne se pose pas si le chrono a été arrêté par `FERMER ✕` : `Timer` distingue
> désormais terminer et arrêter en route (`onDone({ aborted })`).
>
> Reste à faire, hors périmètre de cette étape : l'exploitation statistique (section 7.2) et
> les règles de montée et de descente de mode (étape 12). En attendant, le récap texte de
> l'onglet SUIVI affiche la répartition des ressentis et le ressenti de chaque séance : sans
> ça la donnée existerait sans être lisible nulle part.

**Texte d'origine, conservé comme référence :**

Une question d'un seul geste sur l'écran de fin : **« C'était comment ? »** avec trois
réponses — **TROP FACILE / JUSTE / TROP DUR**. Un tap, aucune saisie. C'est la donnée qui
permet de calibrer honnêtement, et elle n'existe pas aujourd'hui.

**Où et quand.** Sur le premier écran de fin, juste après les chiffres de la séance et
**avant** la proposition de finisher. Placée après les chiffres, elle arrive à un moment de
recul naturel. Placée avant le finisher, elle peut en orienter la proposition.

**Jamais bloquante.** Pas de réponse obligatoire, pas de fenêtre modale. L'utilisateur peut
ignorer la question et enchaîner. Une séance sans réponse est simplement une séance sans
signal.

**Ne pas la poser** si la séance a été abandonnée en cours de route : le ressenti porterait
sur quelque chose d'incomplet.

**Stockage.** Un champ sur la ligne de séance, trois valeurs possibles. La ligne portant déjà
le mode utilisé, le signal reste interprétable — « trop facile en mode HUMAN » et « trop
facile en mode BEAST » ne disent pas la même chose.

**Usage immédiat, pas seulement statistique.** C'est ce qui empêche la question de ressembler
à un sondage :

- **TROP FACILE** → la proposition de finisher devient l'action principale de l'écran.
- **JUSTE** → l'écran reste tel quel, finisher proposé normalement.
- **TROP DUR** → aucun finisher proposé, on passe directement aux étirements. Insister
  serait absurde, et c'est le meilleur moyen de faire arrêter quelqu'un.

**Départ à froid.** La règle de montée demande 4 semaines de données, ce qui est le bon
rythme. Mais la **descente** doit pouvoir se déclencher beaucoup plus vite : trois séances
notées « trop dur » dans les deux premières semaines suffisent à proposer un mode inférieur.
Un nouvel utilisateur mal calibré est celui qui abandonne le plus vite, il ne faut pas
attendre un mois pour le rattraper.

**Anti-réflexe.** Le risque est le tap automatique sur « juste » par habitude. Deux
mitigations : ne présélectionner aucune réponse, et ne pas placer la question sur le chemin
du pouce vers le bouton « terminer ».

**Règle proposée :** offrir la montée quand au moins trois conditions sur quatre sont
réunies sur 4 semaines — contrat respecté à 80 % ou plus, au moins deux séances notées
« trop facile » et aucune « trop dur », finisher ajouté sur au moins un quart des séances,
test de burpees non régressif.

**Et la descente doit exister aussi.** Si le contrat s'effondre ou que les séances sont
notées trop dures à répétition, proposer de redescendre d'un mode — formulé comme un
ajustement, jamais comme un échec. Une app qui ne sait que monter finit par pousser les
gens à arrêter.

**Deux garde-fous :** la montée est toujours une proposition, jamais automatique. Et si elle
est refusée, ne pas reposer la question avant deux semaines.

---

### 7.1b Distinguer la charge du rythme — DÉCIDÉ le 2026-09-08, PAS ENCORE FAIT

Constat d'usage : une séance n'était pas trop dure, elle était **trop serrée**. Le volume
passait, mais il fallait courir pour faire rentrer tous les mouvements dans la minute. Les
trois réponses actuelles ne savent pas dire ça, et c'est un défaut de la donnée, pas de
l'utilisateur : répondre « trop dur » aurait déclenché une **descente de mode**, donc moins de
répétitions — et **masqué un défaut de calibration de la séance derrière un ajustement de
l'utilisateur**.

Deux axes à ne jamais confondre, comme les modes et les régressions ailleurs :

- **La charge** — « est-ce que c'était trop lourd pour moi ». C'est le ressenti actuel, il
  parle de l'utilisateur et il alimente le mode.
- **La densité** — « est-ce que ça rentrait dans le temps ». Un EMOM peut être parfaitement
  dosé en volume et infaisable dans la minute.

**Ce qui est décidé.** Sur les formats à contrainte de temps — EMOM, notamment — une seconde
question d'un tap : **« ça rentrait dans le temps ? »**, avec **LARGE / JUSTE / PAS LE TEMPS**.
Posée uniquement quand elle a un sens, donc deux taps sur ces séances et un seul sur les
autres. Mêmes règles que la première question : jamais bloquante, aucune réponse
présélectionnée, jamais posée sur une séance arrêtée en route.

**Où va l'information, et c'est le point important.** Cette donnée ne parle pas de
l'utilisateur, elle parle du **catalogue**. Une séance signalée « pas le temps » à plusieurs
reprises par la même personne est une séance mal dosée : le signal remonte au **contenu**, pas
au mode. C'est le troisième cas de recalibrage déjà identifié — l'écart systématique sur une
séance précise — mais **capté directement au lieu d'être déduit**, ce que la section 7.2
attendait du croisement ressenti / séance.

**Elle ne doit jamais alimenter une descente de mode.** Ce serait exactement la confusion que
cette question existe pour éviter.

---

## 7.2 Stats personnelles — chantier à reprendre

L'onglet de suivi actuel est perfectible et doit être repensé dans cette v2. En particulier,
**le retour de fin de séance doit y être exploité** : c'est une donnée riche qui ne servirait
sinon qu'au moteur de calibration, alors qu'elle a une valeur propre pour l'utilisateur.

Pistes à arbitrer au moment de la conception de l'écran :

- Répartition des ressentis sur les 4 dernières semaines, et son évolution après un changement
  de mode. C'est la lecture la plus parlante : passer de « trop dur » à « juste » à mode
  constant est une preuve de progrès qu'aucun autre chiffre ne montre.
- Croisement ressenti / jour de la semaine, pour repérer les jours mal calibrés.
- Croisement ressenti / séance, pour identifier les variantes du catalogue mal dosées.
- Le taux de fidélité au contrat, à côté de la série brute.

---

## 8. Les exercices deviennent des entités — SOCLE FAIT (2026-09-07)

Un exercice était une chaîne de caractères dans un bloc de séance. Les quatre chantiers
ci-dessous exigeaient qu'il devienne une entité à part entière.

**Le socle est posé** : `app/src/data/exercises.js` tient 37 exercices avec identifiant
stable, libellé français, unité, latéralité et schémas moteurs. Les séances citent
l'identifiant. Ce qui reste à ajouter sur l'entité relève des sections ci-dessous : le nom
anglais et la consigne longue (8.2, 8.4), le média (8.3), la chaîne de régressions (8.1).

Ce que le typage a fait apparaître, et qui n'était pas dans le brief :

- **L'unité devait être déclarée.** « 30 s de planche » était du texte libre. Une fois
  l'exercice devenu une entité, ce texte devenait une ligne de travail portant le nombre 30 —
  et l'addition naïve l'aurait comptée comme 30 répétitions. L'unité (`reps` ou `secondes`)
  décide de l'affichage, du total de volume, et du fait qu'**un maintien ne s'allonge pas
  avec le mode**.
- **La latéralité aussi.** Onze exercices se pratiquent côté par côté, et les consignes en
  prose employaient deux conventions opposées : ici le nombre était un total à partager, là
  il valait pour chaque côté. Désormais déclaré sur l'entité, calculé à l'affichage, donc
  juste même en N2 et N3 — ce que les « 16 = 8 par jambe » écrits à la main ne pouvaient pas
  être. La note ne s'affiche que sur la fiche : pendant l'effort, l'écran ne montre que le
  mouvement et le nombre.
- **Les identifiants ne sont pas les libellés.** C'est ce qui rend la section 8.2 faisable :
  renommer se fait dans une case de table, pas dans 250 lignes de données.

### 8.1 Chaînes de régressions — CHAÎNES FAITES (2026-09-07), SUBSTITUTION REPORTÉE

> **Livré : `app/src/data/chains.js`**, sept chaînes ordonnées du plus accessible au plus dur,
> et 17 variantes ajoutées à la table des exercices dans une section à part — le catalogue ne
> les prescrit pas, on ne les atteint que par une chaîne.
>
> **Un exercice ne porte pas sa chaîne, il en est membre** : l'appartenance se déduit de la
> liste, comme les schémas moteurs se déduisent de l'exercice. Cinq copies de la chaîne des
> pompes auraient été cinq occasions de divergence.
>
> **Tous les crans d'une chaîne portent les mêmes schémas moteurs**, et c'est un test. Sans
> cette règle, la grille de couverture hebdomadaire mentirait dès la première substitution.
> Elle a eu une conséquence que le texte ci-dessous n'avait pas prévue : **les chin-ups ont
> leur propre chaîne**, séparée de celle des pull-ups. Le brief parle de « tractions » en bloc,
> mais la supination est un schéma suivi à part — et le seul travail de biceps disponible.
> Substituer un pull-up assisté à un chin-up le ferait disparaître de la semaine en silence.
>
> **Aucun « cran de référence » par chaîne** : le catalogue prescrit deux crans de la chaîne
> des burpees selon la séance. La référence est ce que demande la ligne qu'on est en train de
> lire, pas une propriété de la chaîne.
>
> **Deux crans mordent sur la substitution, et sont épinglés par des tests** en attendant
> l'étape 9 : la suspension active se compte en secondes là où les pull-ups sont des
> répétitions (substituer sans convertir donnerait « 4 s de suspension »), et les V-ups une
> jambe sont latéraux là où les V-ups ne le sont pas.
>
> **Un écart avec le texte ci-dessous, tranché le 2026-09-07** : la chaîne des soulevés de
> terre une jambe n'a que deux crans, et c'est définitif. « Sans appui » et « amplitude
> complète » décrivent le même geste, le second n'étant qu'une consigne d'exécution du premier ;
> deux entrées de bibliothèque pour un seul mouvement auraient donné deux libellés que rien ne
> distingue à l'écran. Le troisième cran du texte d'origine ne doit pas être rajouté.
>
> **Rien n'affiche encore ces chaînes, et l'attente est assumée.** Le pratiquant ne choisit pas
> sa variante : la substitution permanente se règle depuis la bibliothèque (section 8.4,
> étape 9), et la poser avant l'écran qui la commande donnerait un réglage sans endroit où le
> régler. Un affichage provisoire du cran d'en dessous sur la fiche a été proposé puis écarté
> le 2026-09-07 — il aurait été refait à l'étape 9.

### Texte d'origine — le plancher d'entrée est trop haut

Le mode HUMAN suppose déjà 4 tractions et 12 pompes, ce qui exclut une grande partie des
débutants. Le problème n'est pas genré et ne doit pas être traité comme tel : une version
« femmes » serait à la fois fausse et vexante. Ce qu'il faut, c'est une chaîne de variantes
par exercice, utile à tout le monde.

**Distinction structurante : les régressions ne sont pas les modes.** Les modes font varier le
**volume** (plus de répétitions du même mouvement). Les régressions font varier le **mouvement
lui-même**. Deux axes indépendants et combinables : on peut être en BEAST sur des pompes
genoux.

Chaînes à écrire, de la plus accessible à la plus dure :

- **Pompes** : au mur → inclinées, mains surélevées → sur les genoux → complètes → pieds surélevés
- **Burpees** : sans saut ni pompe → sans pompe → complets → avec saut en longueur
- **Tractions** : suspension active → tirages d'omoplates → négatives de 5 s → assistées à
  l'élastique → complètes
- **V-ups** : genoux fléchis → une jambe → tendus
- **Pompes piquées** : chien tête en bas, amplitude partielle → complètes → pieds surélevés
- **Soulevés de terre une jambe** : main en appui → sans appui → amplitude complète

**Recommandation matérielle.** La chaîne de tirage est pauvre faute de barre basse et
d'anneaux. Un élastique passé sur la barre de traction coûte une quinzaine d'euros et débloque
la traction assistée avec une vraie progressivité. C'est le seul achat recommandé, et il
bénéficie surtout aux débutants.

**Substitution permanente.** L'utilisateur choisit sa variante par exercice, une fois, et
l'app la substitue partout. Réglable depuis l'écran de bibliothèque (section 8.4). L'app
propose de passer à la variante supérieure selon les mêmes signaux que la montée de mode.

**Onboarding.** Deux questions de plus, plus informatives que « tu t'entraînes ? » : combien de
pompes d'affilée, et est-ce que tu réalises une traction. Avec une option « je ne sais pas »
qui part sur la variante intermédiaire.

### 8.2 Nommage — sortir du jargon anglophone

Des utilisateurs français ne savent pas ce qu'est un chin-up ou un pull-up. À trancher, car
deux demandes se contredisent : « hip thrust » avait été préféré à « pont fessier », alors
que c'est exactement le même problème d'opacité.

**Règle proposée :** nom français en label principal, terme anglais en seconde ligne discrète
quand il existe et qu'il est répandu. La consigne d'une ligne, déjà présente, fait l'essentiel
du travail de compréhension — plus que le nom lui-même.

**Une trentaine de noms sont à passer en revue**, dont beaucoup choisis par Martin lui-même
(sweeps, hollow to sweep, sauts mogul, corkscrews, swings latéraux, bear crawl to thread the
needle). Ne pas les réécrire unilatéralement : préparer la table complète et la faire arbitrer
ligne par ligne.

### 8.3 Illustration — séquence de positions, tournée puis restylisée

**Format principal retenu : une image par exercice montrant 3 ou 4 positions du mouvement
côte à côte**, sans texte, sur fond sombre. Référence de style : les planches d'anatomie
figurine sur fond gris que l'on trouve dans le commerce, adaptées à la palette de l'app.

Ce format raconte un mouvement presque aussi bien qu'une vidéo, pèse 30 à 50 Ko en WebP,
n'a aucun problème de lecture sur iOS, et reste lisible en vignette dans le chrono.

**Vidéo réservée aux exceptions.** Trois ou quatre mouvements où c'est la transition
elle-même qui porte l'information et qu'une séquence fixe ne rend pas : bear crawl to thread
the needle, sweeps, hollow to sweep. Format MP4 muet en boucle, 2 à 4 secondes, basse
résolution, 50 à 150 Ko, avec `muted playsinline loop autoplay`. Jamais de GIF : un GIF
correct pèse 300 Ko à 1 Mo, incompatible avec un fonctionnement hors ligne.

**Source : tournage personnel. Point non négociable.**

Découper les clips d'autres personnes trouvés en ligne produit une œuvre dérivée de leur
vidéo. Le style d'une planche, lui, n'est pas protégeable et peut être reproduit librement.
La distinction est là : on copie l'esthétique, jamais les images sources. Sur 35 exercices,
une bibliothèque construite sur des sources tierces devient une dette impossible à nettoyer
au moment d'ouvrir l'app à des utilisateurs.

**Pipeline :**

1. Filmer de profil, fond uni, vêtements près du corps — la détection de silhouette en dépend
   directement. Une prise par exercice.
2. `ffmpeg` extrait 3 ou 4 frames clés aux instants choisis.
3. Détourage du fond.
4. Passage Krea en **image-à-image**, prompt de style figé, faible force de débruitage.
5. Composition des frames côte à côte, barre et ligne de sol en éléments vectoriels et non en
   pixels.
6. Export WebP.

**Pourquoi l'image-à-image est sans risque ici, contrairement à la génération vidéo.** La
pose provient d'une photo réelle : le modèle ne fait que la restyliser, il n'invente aucune
anatomie. La mise en garde contre les gestes anatomiquement faux vaut pour le texte-vers-vidéo,
pas pour cet usage.

**Cohérence de la bibliothèque.** Le style doit être une recette figée : même prompt, mêmes
paramètres, même palette, mêmes angles de caméra pour les 35 exercices. Sans ça, la
bibliothèque devient un patchwork. Palette : figure en lime sur fond ink, matériel en blanc
cassé — cohérent avec l'identité visuelle existante.

**Trois positions suffisent** pour la plupart des mouvements, quatre pour les mouvements
composés. Privilégier la lisibilité de la silhouette sur le détail musculaire : l'image sera
souvent vue en petit.

**Pas de texte dans les images.** La consigne d'une ligne existe déjà dans l'app, elle se
traduit et se redimensionne, une image non.

**Priorisation.** Une douzaine d'exercices sont réellement ambigus et passent en premier :
hollow to sweep, sweeps, bear crawl to thread the needle, swings latéraux, sauts mogul,
corkscrews, V-ups, dead bugs, shoulder taps, burpees genou diagonal, soulevés de terre une
jambe, hip thrust une jambe. Les autres peuvent attendre, personne n'a besoin d'une démo de
squat.

### 8.4 Présentation dans l'expérience — trois surfaces, trois profondeurs

**Pendant l'effort, dans le chrono :** le nom et les répétitions, en grand, rien d'autre. On ne
regarde pas une vidéo en faisant des burpees. Au mieux une vignette tapable qui met le chrono
en pause.

**Sur la fiche, avant de lancer :** nom, consigne d'une ligne, et la planche de positions.
C'est le seul moment où l'utilisateur a le temps d'apprendre, donc c'est là que ça se joue.
Pour les trois ou quatre exercices en vidéo, la boucle se lance à l'ouverture de la fiche.

**Nouvel écran de bibliothèque :** tous les exercices, cherchables, avec clip, consigne, chaîne
de régressions et schémas moteurs travaillés. C'est aussi l'endroit où l'utilisateur règle ses
substitutions permanentes, ce qui relie cette section à 9.1.

**Règle de première fois :** quand un exercice apparaît pour la première fois chez un
utilisateur, la fiche le signale et propose la démo d'elle-même. Ensuite, à la demande
uniquement. Jamais de tutoriel bloquant.

---

## 9. Ce qui ne change pas

- Cap de 25 minutes par séance.
- Le catalogue actuel : 25 séances, 20 finishers, 5 séquences d'étirement, 35 exercices.
- L'étiquetage des schémas moteurs dérivé automatiquement des exercices, jamais saisi à la main.
- Le moteur de couverture hebdomadaire.
- Le local d'abord : une séance faite sans réseau ne doit jamais être perdue.
- Le finisher se décide à la fin, jamais avant.
