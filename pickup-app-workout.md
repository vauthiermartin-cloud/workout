---
topic: app-workout-25
date: 2026-09-02
status: in-progress
---

# Pickup — App workout « 25 » : migration vers Supabase

## État actuel (TL;DR)

Une PWA de séances au poids du corps est **en production et fonctionnelle**, installée sur l'écran d'accueil iPhone, servie sur https://vauthiermartin-cloud.github.io/workout/. Les données vivent en `localStorage` avec export/import JSON.

Le contenu est complet et validé : 25 séances réparties lundi→vendredi, 20 finishers, 5 séquences d'étirement, 35 exercices. Un chrono adaptatif (EMOM / Tabata / compte à rebours / chrono libre) et un générateur qui choisit la séance selon les schémas moteurs non encore couverts dans la semaine.

**Le socle technique est en place** : projet Vite + React dans `app/`, bibliothèque éclatée en modules de données, contrôles de cohérence exécutés en tests, service worker généré au build, déploiement automatique par GitHub Actions à chaque poussée sur `main`.

Ce qui reste : **passer sur une vraie base (Supabase), ajouter des comptes utilisateurs, un leaderboard, et pouvoir partager l'app.** Rien de cette partie n'est commencé.

## Ce qui est décidé (ne pas rouvrir sans raison)

### Entraînement

- **Cap de 25 min par séance**, lundi→vendredi, matin. Seul sport pratiqué, donc la couverture hebdomadaire compte plus que la performance sur une séance.
- **Matériel disponible** : poids du corps, barre de traction, espalier. **Pas de barre basse ni d'anneaux** → aucun tirage horizontal (les tirages australiens ont été retirés pour cette raison, ne pas les réintroduire).
- **Un format par jour** : lundi EMOM, mardi volume burpees en escalier, mercredi rounds chronométrés, jeudi AMRAP, vendredi test de burpees + finisher.
- **Le test de burpees du vendredi est la seule métrique de progression** conservée. Un chiffre par semaine.
- **10 schémas suivis** : poussée, tirage, supination, squat, unilatéral, chaîne postérieure, sangle, cardio, mobilité, mollets.
- **Pull-ups et chin-ups sont deux exercices distincts**, la supination étant un schéma suivi à part (seul travail de biceps disponible).
- **Le finisher se décide à la fin**, jamais avant. Écran de bilan après la séance, puis après le finisher, avec CTA vers les stats.

### Architecture

- **`app/` est la seule source de vérité.** Projet Vite, React 19, sans `StrictMode` (le double appel des effets ferait sauter une phase de chrono). Chemin de base `./`, portable quel que soit le sous-répertoire de publication.
- **La bibliothèque vit dans `app/src/data/`** : `workouts.js`, `finishers.js`, `stretches.js`, `timers.js`, `patterns.js`, `days.js`, `levels.js`, `items.js`.
- **Étiquetage des schémas moteurs dérivé automatiquement** des exercices (table `EX_PATTERNS`), jamais saisi à la main sur les séances. Empêche toute désynchronisation.
- **Le générateur est conscient de la couverture** : il choisit la variante du jour qui apporte le plus de schémas non encore travaillés dans la semaine. Simulé sur 500 semaines → 10/10 systématiquement.
- **Fiche et chrono partagent les mêmes données** ; un test vérifie qu'ils ne divergent pas.
- **Pas de `vite-plugin-pwa` ni de workbox.** Les noms de fichiers hachés de Vite résolvent déjà l'invalidation de cache, qui est le problème que workbox existe pour traiter. La liste des fichiers est injectée dans `app/src/sw.js` par un plugin de build maison dans `vite.config.js` (~25 lignes, zéro dépendance, contre 318 paquets).
- **Le service worker traite une réponse en erreur comme une panne réseau.** Un 404 servi pendant un déploiement ne doit ni remplacer la coquille en cache, ni s'afficher alors qu'une version qui marche est disponible. C'était un vrai bug en production, corrigé.
- **`npm test` est un garde-barrière dans la CI**, avant le build : une bibliothèque incohérente ne doit pas atteindre le téléphone.
- **Local-first obligatoire pour la suite** : écriture locale d'abord, synchro ensuite. Une séance faite sans réseau ne doit jamais être perdue.

### Suite

- **Leaderboard uniquement sur des métriques comparables** : un classement par format de test de burpees, et éventuellement les séries de jours. Pas de classement sur le volume de reps (il dépend du niveau) ni sur le nombre de séances.
- **Supabase palier gratuit** retenu. 500 Mo de base, 50 000 MAU, 2 projets. Pause après 7 jours sans activité base — non bloquant vu un usage quotidien. Chiffres relevés en mai-juin 2026, à revérifier sur supabase.com/pricing.

## Prochaines actions, dans l'ordre

1. **Créer le projet Supabase** et écrire le schéma : `profiles`, `sessions` (une ligne par séance terminée : date, jour, nom de séance, niveau, score de test, finisher, étirement). Tout le reste se dérive.
2. **Écrire les policies RLS avant tout code client.** La clé anon est publique par nature ; toute la sécurité vit dans la base. Le leaderboard passe par une vue d'agrégats, jamais par la table `sessions`.
3. **Trancher l'authentification** — voir le piège ci-dessous, c'est le vrai risque de l'étape. Puis couche de synchro local-first : `localStorage` reste la source de vérité côté client, réconciliation à la reconnexion.
4. **Importer l'historique existant** depuis le fichier JSON exporté (bouton « TÉLÉCHARGER LE FICHIER » de l'onglet SUIVI) comme jeu de test de la synchro.
5. **Leaderboard en dernier**, une fois auth et synchro stables.

## Pièges connus

- **Le lien magique ne marche pas tel quel dans une PWA iOS autonome.** Le lien s'ouvre dans Safari, la session atterrit dans le stockage de Safari, et la PWA reste déconnectée. C'est le risque principal de l'étape d'authentification, indépendant de tout choix technique en amont. À traiter avant d'écrire du code d'auth, pas après.
- **Ne jamais modifier `index.html` ni `sw.js` à la racine du dépôt.** Ils ne sont plus servis (Pages publie `app/dist` via Actions) et leur contenu est une version périmée. Ils ne subsistent que comme voie de repli : rebasculer la source Pages sur la branche `main`. Ils ressemblent à une source alors qu'ils n'en sont plus une — c'est exactement ce qui a causé l'incident ci-dessous.
- **Incident, 2026-09-02** : la migration vers Vite est partie de la copie racine, qui était deux révisions en retard. Les modifications de la v21 ont été silencieusement perdues, et retrouvées par hasard. Elles ont été reportées par extraction automatique puis comparaison jusqu'à zéro écart, pas à la main. **Leçon** : pour tout report de contenu en volume, écrire d'abord le comparateur. Il aurait détecté l'erreur d'origine.
- **Node est installé sans `sudo`** dans `~/.local/node`, `PATH` exporté depuis `~/.zprofile`. Les processus lancés hors shell de connexion ne voient pas ce `PATH` : y mettre le chemin absolu du binaire (voir `.claude/launch.json`).
- **Pousser un fichier sous `.github/workflows/` exige un jeton avec la portée `workflow`.** Sans elle, GitHub refuse la poussée entière côté serveur. Contournement : créer ou modifier le fichier depuis l'interface web.

## Questions ouvertes

- **Mollets** : encore fragiles, présents seulement mardi et vendredi, 2 variantes sur 25. À répartir comme la chaîne postérieure l'a été ? La question était posée, pas tranchée.
- **Interprétation de trois mouvements** issus de captures vidéo, à confirmer visuellement : les « swings latéraux », le « hollow to sweep », et le « bear crawl to thread the needle ». Le nom « sweep » a été choisi côté vocabulaire bboy, le « pistol » initial a été renommé pour éviter la confusion avec le squat sur une jambe.
- **Seuils de niveau arbitraires** : N2 à 12 séances sur 28 jours, N3 à 16, majorations de +25 % et +50 %. Conventions choisies pour que ça bouge à un rythme raisonnable, pas tirées d'un protocole établi. À réévaluer avec des données réelles.
- **Périmètre du partage** : quelques amis ou app publique ? Détermine le sérieux du volet données personnelles (mention d'information, droit à la suppression, minimisation).
- **Contenu des séquences d'étirement** : à faire valider par le kiné avant d'en faire une habitude, en particulier le pigeon dans la séquence hanches et les burpees sautés en longueur côté impact.
- **Suppression des fichiers racine** : à faire quand la confiance dans le nouveau déploiement est acquise. Ils coûtent une confusion permanente pour un repli qui ne servira probablement jamais.

## Matériaux clés

1. `app/src/data/` — la bibliothèque. Toute modification de contenu passe par là.
2. `app/src/App.jsx` — chrono, générateur, écrans.
3. `app/test/` — `coherence.test.js` (bibliothèque) et `generator.test.js` (couverture hebdomadaire). 9 contrôles.
4. `app/vite.config.js` + `app/src/sw.js` — build et cache hors-ligne.
5. `.github/workflows/deploy.yml` — `npm ci` → `npm test` → `npm run build` → publication Pages.
6. `.claude/launch.json` — serveurs de prévisualisation : `app` (dev, 5173) et `dist` (build servi, 4173).
7. Export JSON de l'onglet SUIVI — historique réel des séances, jeu de test pour la synchro.
8. Dépôt GitHub `workout` (public, Pages alimenté par GitHub Actions).

## Hors périmètre (ne pas s'y perdre)

- **Empaquetage en app natif iOS.** Tranché : aucune voie gratuite et durable sans compte Apple Developer à 99 $/an. La PWA sur l'écran d'accueil est la réponse.
- **Ajouter du contenu à la bibliothèque.** Elle est suffisamment fournie ; le sujet est désormais l'infrastructure. Sauf les mollets, listés en question ouverte.
- **Nutrition, suppléments, protocole kiné.** Suivis ailleurs, hors app.
- **Les 12 avertissements de lint hérités** (`react(static-components)` : composants déclarés dans le rendu d'`App`). Réels mais sans effet visible ; à traiter le jour où `App.jsx` sera découpé, pas avant.
