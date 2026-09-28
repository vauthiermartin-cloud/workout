# App workout « 25 »

PWA de séances au poids du corps, 25 minutes maximum, usage personnel quotidien du lundi au
vendredi. Hébergée sur GitHub Pages, installée sur l'écran d'accueil iPhone.

## À lire avant d'agir

1. `pickup-app-workout.md` — état technique, décisions déjà prises, questions réellement ouvertes.
2. `brief-v2-multi-user.md` — intention produit, ordre de travail en douze étapes.
3. `table-nommage-exercices.md` — labels français des 35 exercices, référence pour tout renommage.
4. `idees-perso-backlog.md` — backlog d'idées produit de Martin, issues de l'usage réel, pas
   encore dans le brief officiel. Un ticket à la fois, dans l'ordre du fichier. Mettre à jour
   le statut du ticket traité directement dans ce fichier avant de conclure la conversation.

Les décisions produit de ces documents sont tranchées. Ne pas les rouvrir sans demander.

## Règles de travail

**Une étape à la fois.** L'ordre de travail du brief compte douze étapes. Ne jamais en
attaquer plusieurs dans la même conversation : le résultat devient impossible à relire.

**Tout le code vit dans `app/` (Vite + React).** `index.html` et `sw.js` à la racine du dépôt
sont des vestiges du mono-fichier, plus servis par personne : ne pas les modifier en croyant
corriger l'app. Node n'est pas dans le PATH par défaut : `export PATH="$HOME/.local/node/bin:$PATH"`.

**La version du cache du service worker est automatique.** `app/vite.config.js` la dérive d'un
hash du build ; il n'y a plus rien à incrémenter à la main. (C'était le piège le plus fréquent
du projet, il est fermé.)

**Ne jamais laisser l'app cassée sur `main`.** Elle est utilisée tous les matins, et un push
sur `main` déclenche le déploiement. Les tests sont le garde-barrière : ils tournent dans le
workflow avant le build.

**Vérifier avant de livrer.** Le projet a des contrôles de cohérence à faire tourner après
toute modification des données de séances :

- aucune séance sans plan de chrono ;
- aucun exercice absent de la table des schémas moteurs ;
- aucun exercice présent uniquement dans les finishers ;
- la fiche et le chrono affichent les mêmes exercices et les mêmes répétitions ;
- la couverture hebdomadaire des schémas moteurs reste à 10 sur 10 en simulation.

Ces contrôles sont des tests Vitest : `npm test` dans `app/`. S'y ajoute
`app/test/chrono.test.js`, qui tient la reprise du chrono — non-cascade après un bond de
temps, position retenue au dernier battement, écran de fin inatteignable par accident.

## Contraintes du domaine

**Matériel** : poids du corps, barre de traction, espalier. **Mise à jour du 2026-09-27 :
le tirage horizontal est désormais possible** — Martin a ajouté l'équipement nécessaire
[À PRÉCISER : quel équipement — TRX, anneaux, sangle sur la barre existante]. Le catalogue
nomme le mouvement « tirages horizontaux » sans nommer l'appareil, précisément pour ne pas
figer cette inconnue. La contrainte
« pas de barre basse ni d'anneaux, aucun tirage horizontal, ne pas réintroduire les tirages
australiens » ne tient plus : c'était une décision actée pour une raison matérielle qui a
changé, pas un principe de conception. Les tirages australiens (et toute variante de tirage
horizontal) peuvent revenir dans le catalogue.

**Règle de prise (2026-09-28).** Deux règles qui ne se contredisent pas, parce qu'elles ne
parlent pas du même cas. **À la barre** : une séance s'en tient à une prise — pull-ups et
chin-ups se partagent les avant-bras, les seconds se feraient sur la fatigue des premiers.
**Entre les plans** : dès qu'un tirage horizontal accompagne un tirage vertical, il prend la
prise que l'autre n'a pas. Jamais deux mouvements de pronation ni deux de supination dans une
même séance — on alterne.

**Règle actée (2026-09-27) : toute séance qui contient un créneau poussée doit
contenir un créneau tirage.** Ratio cible de Martin, en équivalence de volume (pas un simple
minimum de créneau) : pour 15–20 pompes, 3 tractions (pronation) OU 5 chin-ups (supination),
et le double en tirage horizontal selon la prise (6 en pronation, 10 en supination). À
encoder comme coefficients d'équivalence par exercice relatifs à la poussée, pas comme un
nombre de reps fixe — voir F-06 révisé dans `idees-perso-backlog.md`, prochaine priorité.

**Cap de 25 minutes** par séance, hors échauffement et finisher. Le nom de l'app est cette
promesse.

**Deux axes de difficulté indépendants**, à ne jamais confondre : les modes
(HUMAN / WARRIOR / BEAST) font varier le volume de répétitions, les chaînes de régressions
font varier le mouvement lui-même.

**Les étiquettes de schémas moteurs se déduisent des exercices**, jamais saisies à la main
sur une séance. C'est ce qui garantit qu'elles ne dérivent pas quand on ajoute du contenu.

**Local d'abord.** Une séance faite sans réseau ne doit jamais être perdue.

## Ton des textes affichés

Français, direct, sans jargon anglophone en label principal. Le terme anglais peut figurer en
seconde ligne sur la fiche et dans la bibliothèque, jamais dans le chrono.

**Les adresses au pratiquant échappent à cette règle, et c'est assumé.** Ce sont les seuls
textes où l'app parle à quelqu'un plutôt que de décrire un mouvement : « Well done, player! »
à la fin de la séance, et les trois retours au ressenti — « Ok beast! On va monter d'un
cran. », « Dans ta zone, Player! », « Ok le sang. On adapte la suite. » La règle du français
vaut pour le contenu ; le ton de l'app, lui, est celui d'une salle de sport.

Pendant l'effort, l'écran ne montre que le nom de l'exercice et les répétitions, en grand.
Rien d'autre.
