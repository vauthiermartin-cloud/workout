# App workout « 25 »

PWA de séances au poids du corps, 25 minutes maximum, usage personnel quotidien du lundi au
vendredi. Hébergée sur GitHub Pages, installée sur l'écran d'accueil iPhone.

## À lire avant d'agir

1. `pickup-app-workout.md` — état technique, décisions déjà prises, questions réellement ouvertes.
2. `brief-v2-multi-user.md` — intention produit, ordre de travail en douze étapes.
3. `table-nommage-exercices.md` — labels français des 35 exercices, référence pour tout renommage.

Les décisions produit de ces documents sont tranchées. Ne pas les rouvrir sans demander.

## Règles de travail

**Une étape à la fois.** L'ordre de travail du brief compte douze étapes. Ne jamais en
attaquer plusieurs dans la même conversation : le résultat devient impossible à relire.

**Toujours incrémenter la version du cache dans `sw.js`** quand un fichier servi change.
Sans ça le téléphone continue de servir l'ancienne version et on cherche un bug qui n'existe
pas. C'est le piège le plus fréquent de ce projet.

**Ne jamais laisser l'app cassée sur `main`.** Elle est utilisée tous les matins. Pendant la
migration Vite, garder le déploiement actuel fonctionnel jusqu'à ce que la nouvelle chaîne de
publication soit vérifiée.

**Vérifier avant de livrer.** Le projet a des contrôles de cohérence à faire tourner après
toute modification des données de séances :

- aucune séance sans plan de chrono ;
- aucun exercice absent de la table des schémas moteurs ;
- aucun exercice présent uniquement dans les finishers ;
- la fiche et le chrono affichent les mêmes exercices et les mêmes répétitions ;
- la couverture hebdomadaire des schémas moteurs reste à 10 sur 10 en simulation.

Ces contrôles existent aujourd'hui sous forme de scripts jetables. Les porter en tests
(Vitest) fait partie de l'étape 2.

## Contraintes du domaine

**Matériel** : poids du corps, barre de traction, espalier. **Pas de barre basse ni
d'anneaux** — aucun tirage horizontal n'est possible, ne pas réintroduire les tirages
australiens.

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
seconde ligne sur la fiche et dans la bibliothèque, jamais dans le chrono. Une seule exception
assumée : le message de fin de séance, « Well done, player! ».

Pendant l'effort, l'écran ne montre que le nom de l'exercice et les répétitions, en grand.
Rien d'autre.
