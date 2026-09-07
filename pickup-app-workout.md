---
topic: app-workout-25
date: 2026-09-07
status: in-progress
---

# Pickup — App workout « 25 » : état technique

## État actuel (TL;DR)

Une PWA de séances au poids du corps est **en production et fonctionnelle**, hébergée sur GitHub Pages, installée sur l'écran d'accueil iPhone. Les données vivent en `localStorage` avec export/import JSON.

**Le code vit dans `app/` : Vite 8 + React 19, testé sous Vitest.** Le mono-fichier de 100 Ko avec Babel dans le navigateur appartient au passé. Le déploiement passe par `.github/workflows/deploy.yml` : `npm ci`, `npm test`, `npm run build`, publication de `app/dist` sur Pages. **Les tests sont un garde-barrière du déploiement** — un échec bloque la mise en production.

Le contenu est complet et validé : 25 séances réparties lundi→vendredi, 20 finishers, 5 séquences d'étirement, 35 exercices. Un chrono adaptatif (EMOM / Tabata / compte à rebours / chrono libre) et un générateur qui choisit la séance selon les schémas moteurs non encore couverts dans la semaine.

**Le chrono est reprenable** (étape 1, faite le 2026-09-07). `app/src/lib/chrono.js` sépare deux notions : le `run`, enregistrement d'une séance en cours écrit dans une clé unique (`workout.run`), et le `beat`, dernier battement réellement observé. Un trou de plus de 4 s entre deux battements ne peut venir que d'une app endormie : le chrono gèle, ne valide rien, et demande. Reprise proposée au démarrage sous 4 h, enregistrement ou abandon au-delà.

Ce qui reste : **phase 1**, perfectionner l'app mono-utilisateur (étapes 3 à 12 du brief). **Phase 2** — Supabase, comptes, leaderboard — reste en pause et n'est pas commencée.

## Ce qui est décidé (ne pas rouvrir sans raison)

- **Cap de 25 min par séance**, lundi→vendredi, matin. Seul sport pratiqué, donc la couverture hebdomadaire compte plus que la performance sur une séance.
- **Matériel disponible** : poids du corps, barre de traction, espalier. **Pas de barre basse ni d'anneaux** → aucun tirage horizontal (les tirages australiens ont été retirés pour cette raison, ne pas les réintroduire).
- **Un format par jour** : lundi EMOM, mardi volume burpees en escalier, mercredi rounds chronométrés, jeudi AMRAP, vendredi test de burpees + finisher.
- **Le test de burpees du vendredi est la seule métrique de progression** conservée. Un chiffre par semaine.
- **Étiquetage des schémas moteurs dérivé automatiquement** des exercices (table `EX_PATTERNS`), jamais saisi à la main sur les séances. Empêche toute désynchronisation.
- **10 schémas suivis** : poussée, tirage, supination, squat, unilatéral, chaîne postérieure, sangle, cardio, mobilité, mollets.
- **Le générateur est conscient de la couverture** : il choisit la variante du jour qui apporte le plus de schémas non encore travaillés dans la semaine. Simulé sur 500 semaines → 10/10 systématiquement.
- **Fiche et chrono partagent les mêmes données** ; un contrôle automatisé vérifie qu'ils ne divergent pas.
- **Le finisher se décide à la fin**, jamais avant. Écran de bilan après la séance, puis après le finisher, avec CTA vers les stats.
- **Pull-ups et chin-ups sont deux exercices distincts**, la supination étant un schéma suivi à part (seul travail de biceps disponible).
- **Local-first obligatoire pour la suite** : écriture locale d'abord, synchro ensuite. Une séance faite sans réseau ne doit jamais être perdue.
- **Leaderboard uniquement sur des métriques comparables** : un classement par format de test de burpees, et éventuellement les séries de jours. Pas de classement sur le volume de reps (il dépend du niveau) ni sur le nombre de séances.
- **Supabase palier gratuit** retenu. 500 Mo de base, 50 000 MAU, 2 projets. Pause après 7 jours sans activité base — non bloquant vu un usage quotidien. Chiffres relevés en mai-juin 2026, à revérifier sur supabase.com/pricing.

## Prochaines actions, dans l'ordre

**L'ordre de travail complet est en tête de `brief-v2-multi-user.md`, section « Phasage ».**
Douze étapes. Les deux premières sont faites :

1. ~~Réparer la reprise du chrono~~ (brief section 0). **Fait.** Les quatre points du brief
   sont couverts, `app/test/chrono.test.js` les tient.
2. **Migrer vers Vite + tests. Fait pour la chaîne de build, pas pour les données.** Le volet
   « faire des exercices de vraies entités » (brief section 8) n'a pas été traité : un
   exercice est toujours une chaîne de caractères, reliée aux schémas moteurs par la table de
   `app/src/data/patterns.js`. **C'est donc le vrai préalable aux étapes 3 à 6**, à faire
   avant les chaînes de régressions.

L'étape suivante à attaquer est donc ce reliquat d'entités, puis l'étape 3 (chaînes de
régressions et substitution sans barre de traction).

Ne pas lancer plusieurs étapes en une fois.

**Le déploiement n'est plus un sujet.** Il est automatisé et vérifié. Le seul piège restant :
`index.html` et `sw.js` traînent encore à la racine du dépôt, vestiges du mono-fichier. Ils ne
sont plus servis par personne. À supprimer une fois qu'on est certain de ne plus vouloir s'y
référer.

## Questions ouvertes

**Toutes les décisions produit sont tranchées dans `brief-v2-multi-user.md`.** Ne pas les rouvrir : modes, coefficients, contrat, gel, pause, séries, couverture, onboarding, nommage, illustration, accroche. Le brief est la référence.

Ce qui reste réellement ouvert :

- **Mollets** : encore fragiles, présents seulement mardi et vendredi, 2 variantes sur 25. À répartir comme la chaîne postérieure l'a été. La question a été posée, jamais tranchée.
- **Interprétation de trois mouvements** issus de captures vidéo, à confirmer visuellement : les passages de jambes latéraux, le gainage cuillère vers balayage, et la marche de l'ours et passage de bras. Ce sont les trois qui ouvrent la liste du chantier illustration.
- **Badges du podium** : le premier est « THE GOAT », les deux autres restent à nommer. « THE BEAST » entrerait en collision avec le nom du mode BEAST. Sujet de phase 2, ne bloque rien.
- **Seuils de progression de mode** : la règle proposée dans le brief demande quatre semaines de ressentis réels pour être validée. Elle ne pourra l'être qu'après usage.
- **Contenu des séquences d'étirement** : à faire valider par le kiné avant d'en faire une habitude, en particulier le pigeon dans la séquence hanches, et les burpees sautés en longueur côté impact.

## Matériaux clés

Ordre de lecture recommandé pour reprendre le projet :

1. `pickup-app-workout.md` — cette note, l'état technique.
2. `brief-v2-multi-user.md` — l'intention produit, toutes décisions tranchées, ordre de travail en douze étapes.
3. `table-nommage-exercices.md` — les 35 exercices avec leur label français, leur label court pour le chrono et leur terme anglais. Référence pour le remplacement dans les données.

Fichiers du projet :

4. `app/src/data/` — le contenu : séances, finishers, étirements, plans de chrono, schémas moteurs, niveaux. C'est là que se trouve tout ce qui se discute côté produit.
5. `app/src/lib/chrono.js` — le chrono reprenable. `app/src/lib/store.js` — les clés de stockage local, dont `workout.run` pour la séance en cours.
6. `app/src/App.jsx` et `app/src/components/` — les écrans.
7. `app/test/` — trois fichiers : cohérence de la bibliothèque, générateur, chrono. **Les faire tourner avant de livrer** (`npm test` dans `app/`) : ils bloquent le déploiement.
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
