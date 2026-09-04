---
topic: app-workout-25
date: 2026-09-02
status: in-progress
---

# Pickup — App workout « 25 » : migration vers Supabase

## État actuel (TL;DR)

Une PWA de séances au poids du corps est **en production et fonctionnelle**, hébergée sur GitHub Pages, installée sur l'écran d'accueil iPhone. Un seul fichier `index.html` (~100 Ko, React via CDN + Babel navigateur, aucune étape de build), plus `sw.js`, `manifest.json` et trois icônes. Les données vivent en `localStorage` avec export/import JSON.

Le contenu est complet et validé : 25 séances réparties lundi→vendredi, 20 finishers, 5 séquences d'étirement, 35 exercices. Un chrono adaptatif (EMOM / Tabata / compte à rebours / chrono libre) et un générateur qui choisit la séance selon les schémas moteurs non encore couverts dans la semaine.

Ce qui reste : **passer sur une vraie base (Supabase), ajouter des comptes utilisateurs, un leaderboard, et pouvoir partager l'app.** Rien de cette partie n'est commencé.

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
Douze étapes, dont les deux premières sont la seule chose à attaquer maintenant :

1. **Réparer la reprise du chrono** (brief section 0). Le seul défaut qui gâche réellement une
   séance en cours. Diagnostic complet fourni.
2. **Migrer vers Vite + tests**, en profitant de la migration pour faire des exercices de
   vraies entités. Les dix étapes suivantes en dépendent.

Ne pas lancer les douze en une fois.

**Attention au déploiement.** GitHub Pages sert aujourd'hui `index.html` depuis la racine de
`main`. Après la migration Vite il faudra un build et un workflow de publication. Garder le
fichier actuel fonctionnel sur `main` jusqu'à ce que la nouvelle chaîne de déploiement
fonctionne, pour ne jamais se retrouver sans app sur le téléphone.

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

4. `index.html` — l'app entière : données, chrono, générateur, écrans. Point de départ de la migration.
5. `sw.js` — service worker, cache versionné (`workout-v21`). **Incrémenter la version à chaque déploiement**, sinon l'app servie reste en cache.
6. `manifest.json`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — inchangés depuis le début.
7. Export JSON de l'onglet SUIVI — historique réel des séances, jeu de test pour la synchro et pour les écrans de stats.
8. Dépôt GitHub `workout` (public, Pages activé sur `main` / racine).
9. `.claude/skills/video-to-sequence/` — skill de découpage des vidéos d'exercices en planches de positions. Chantier reporté en fin de parcours, le skill est prêt.

## Hors périmètre (ne pas s'y perdre)

- **Empaquetage en app natif iOS.** Tranché : aucune voie gratuite et durable sans compte Apple Developer à 99 $/an. La PWA sur l'écran d'accueil est la réponse.
- **Ajouter du contenu à la bibliothèque.** Elle est suffisamment fournie ; le sujet est désormais l'infrastructure. Sauf les mollets, listés en question ouverte.
- **Nutrition, suppléments, protocole kiné.** Suivis ailleurs, hors app.
