## Athlean X — programme fixe en mode alternatif au mode classique

Vision : un deuxième mode de séance, à côté du mode classique (génération/bibliothèque), piochant dans un contenu fixe (Workout A/B × NORMAL/BUILD/DEFINE) avec son propre chrono dédié. Le cap 25 min reste la promesse du mode Classique uniquement — Athlean X est un mode à part avec sa propre promesse (sessions longues occasionnelles), pas une exception à D-09.

Source : `perfect_home_workout_spec_v2.md` (upload claude.ai, session du 2026-10-26).

### F-11 · Sélecteur de mode
**Statut : Shipped (2026-10-26)** — détail dans le `## Log` de `idees-perso-backlog.md`.

Écran de choix **Classique / Athlean X** avant l'entrée en séance, accessible tous les jours y compris week-end (pas de restriction lun-ven). Défaut sur Classique — zéro changement de comportement pour l'usage quotidien existant. Pure routing, aucun contenu Athlean X derrière, aucune logique.

**Hors scope.** Calculs, timer, couverture.

**Tests.** Le parcours Classique est bit-for-bit identique à avant quand on le sélectionne (non-régression).

---

### F-12 · Chrono Athlean X
**Statut : Spec prête**

Moteur dédié, séparé du moteur existant (EMOM/Tabata/etc. intouchés).

- Pré-départ 5s : nom du 1er exo affiché en grand.
- Exercice 60s : "ENSUITE : [nom suivant]" visible dès la 1ʳᵉ seconde.
- Transition 5s entre tous les exercices (y compris entre phases/rounds) ; aucune transition après le dernier.
- 3 sons : **TICK** (chaque seconde de pré-départ + transition), **GO** (à 0 de pré-départ et de transition), **WARNING** (10s restantes dans l'exo, configurable 5/10s, une fois par intervalle, ne coupe pas le minutage).
- Vibration discrète en complément des 3 sons, jamais seule — dégrade proprement si l'appareil ne supporte pas l'API vibration.
- **Pause** : gèle immédiatement décompte et alertes ; **Reprise** : continue à la seconde restante, sans rejouer les alertes déjà émises. Disponible à tout moment.
- **Skip** (suivant) : avance l'index d'une étape, redémarre le minutage de la nouvelle étape courante à son plein temps.
- **Rewind** (précédent) : redémarre le minutage de l'étape **courante** (pas l'étape précédente) à son plein temps, index inchangé.
- Skip/rewind coupent proprement le son/vibration en cours sans en déclencher un en trop sur la nouvelle étape.
- Horloge monotone (échéances, pas comptage de ticks) → pas de double-bip au retour background/foreground.
- Déverrouillage audio au clic sur "Démarrer" (contrainte iOS).

**Hors scope.** Vrai "retour à l'étape précédente" (rewind = redémarrage de l'étape courante, pas navigation arrière dans la séquence).

**Tests.** Durées totales exactes par calcul programmatique (34:40 / 26:00 / 26:00) ; zéro bip doublé sur un cycle background→foreground simulé ; pause conserve le temps restant exact ; skip et rewind ne cassent pas le compte total d'étapes restantes.

---

### F-12.5 · Fusion bibliothèque Athlean X (Workout A + B)
**Statut : Spec prête**

**Objectif.** Ajouter les exercices Athlean X à `exercises.js` sans dupliquer ceux déjà présents, en gardant la traçabilité vers le spec original pour pouvoir rejouer une séance Athlean X à l'identique.

**Hors scope.** Aucune éligibilité à la génération classique, à `pickVariant`, à la substitution F-02 ou au calcul de couverture 10/10. Ces exos restent invisibles du moteur classique pour l'instant (`exclusiveTo: ["athleanX"]`).

**Propriétés à ajouter sur chaque entité concernée :**
```js
{
  nameEn: "...",          // nom officiel Athlean X, jamais traduit/perdu
  sourceId: "A-1.1",      // id du spec, pour rejouer une séance stricte
  source: "athleanX",
  exclusiveTo: ["athleanX"],
}
```

**26 créations :**

| ID spec | Nom EN | id maison | Libellé FR |
|---|---|---|---|
| A-1.1 | Alternating Single Leg Box Squats | `boxSquatAlterne` | Box squat alterné |
| A-1.2 | 1½ Bottomed Out Squats | `squatUnEtDemiBas` | Squat 1½ (position basse) |
| A-1.3 | Jump Squats | `squatSaute` | Squat sauté |
| A-2.1 | Pike Pushups | `pompesEnV` | Pompes en V |
| A-2.2 | Rotational Pushups | `pompesRotationEpaule` | Pompes rotation épaule |
| A-2.3 | Cobra Pushups | `pompesCobra` | Pompes cobra |
| A-3.1 | Heel Touch Squats | `squatToucherTalon` | Squat toucher-talon |
| A-3.2 | Alternating Sprinter Lunges | `fenteArriere` | Fente arrière |
| A-3.3 | Plyo Sprinter Lunges | `fenteArriereSautee` | Fente arrière sautée |
| A-4.2 | Dragon Fly | `dragonFly` | Dragon fly |
| A-5.1 | Reverse Corkscrews | `abdosCorkscrew` | Abdos corkscrew |
| A-5.2 | Navy Seal Knee Slides | `plancheDynamiqueNavySeal` | Planche dynamique Navy Seal |
| A-5.3 | Levitation Crunches | `abdosCrunchUnEtDemi` | Abdos crunch 1½ |
| B-1.1 | Slick Floor Bridge Curls | `pontIschioJambiersGlissant` | Pont ischio-jambiers glissant |
| B-1.2 | Long Leg Marches | `marchePontJambesTendues` | Marche en pont, jambes tendues |
| B-2.1 | Elevated Feet Pushups | `pompesPiedsSureleves` | Pompes pieds surélevés |
| B-2.2 | Alternating Side Plank | `plancheLateraleAlternee` | Planche latérale alternée |
| B-2.3 | Triceps Extension | `frenchPressTriceps` | French press triceps |
| B-3.1 | High Step Ups | `stepUpHaut` | Step up haut |
| B-3.3 | Split Squat Jumps | `splitSquatSaute` | Split squat sauté |
| B-4.1 | Chinups | `tractionSupination` | Traction supination |
| B-4.3 | Back Widows | `elevationHautDosSol` | Élévation du haut du dos au sol |
| B-5.1 | Ab Halos | `haloAbdos` | Halo abdos |
| B-5.2 | V-Up Tucks | `vUpGroupe` | V-up groupé |
| B-5.3 | Sit-Up Elbow Thrusts | `situpPousseeCoude` | Sit-up poussée de coude |
| B-6.1 | Reverse Hypers | `reverseHyperBanc` | Reverse hyper sur banc |

**6 fusions (ajouter les 4 propriétés sur l'entité existante, ne rien créer) :**

| ID spec | Nom EN | Fusionner vers |
|---|---|---|
| A-4.1 | Pullups | Tractions (id existant — à confirmer contre `exercises.js`) |
| A-4.3 | Australian Pullups | `tiragesHorizontaux` |
| A-6.1 | Superman | Superman (id existant — à confirmer) |
| B-1.3 | Hip Thrust | Hip thrust (id existant — à confirmer) |
| B-3.2 | Lunges | Fente avant (id existant — à confirmer) |
| B-4.2 | Australian Pullups | `tiragesHorizontaux` |

**Note pour Claude Code** : pour les 4 fusions marquées "à confirmer", chercher l'id réel dans `exercises.js` avant d'écrire — ne pas deviner, ne pas créer de doublon si l'id diffère de ce qui est supposé ici.

**Tests.** Pas de nouveau comportement observable (ces exos restent `exclusiveTo: athleanX`, invisibles ailleurs) — vérifier que la suite existante (220 tests) reste verte et qu'aucun exo fusionné n'apparaît deux fois dans la bibliothèque.

---

### F-13 · Catalogue et séquences Athlean X
**Statut : Spec prête** (dépend de F-12.5 pour les ids)

Données statiques Workout A/B × NORMAL/BUILD/DEFINE au format JSON du §6 du spec (`perfect_home_workout_spec_v2.md`), avec les ids issus de F-12.5 (`id` maison + `sourceId`). Génère la liste chronologique `exercise`/`transition` à partir des phases.

**Hors scope.** Aucune génération dynamique — contenu figé, éditable seulement en modifiant les données.

**Tests.** Pour chaque (workout, mode) : nombre d'exercices/transitions exact (32/31, 24/23, 24/23) et durée totale conforme au spec (34:40 / 26:00 / 26:00).

---

### F-14 · Branchement, alternance A/B, journal
**Statut : Spec prête**

Connecte F-11 → F-13 → F-12.

- **Entrée** : Classique vs Athlean X (F-11). Si Athlean X :
  - `lastAthleanWorkout` absent (jamais joué) → écran de choix A/B.
  - `lastAthleanWorkout` présent → auto-sélection de l'opposé, pas d'écran de choix.
  - Mode (NORMAL/BUILD/DEFINE) : choix à chaque séance, pas d'auto-déduction.
- **Fin de séance** → écran récap saisie reps (F-15) → écriture journal → mise à jour `lastAthleanWorkout`.
- **Rattrapage week-end** : aucune logique dédiée à écrire — l'alternance A/B n'étant pas calée sur le calendrier, jouer un samedi fonctionne nativement. Seul prérequis : F-11 accessible tous les jours.
- **Journal** : nouvelle entrée type, à côté des entrées classiques existantes :
```js
{
  date: "...",
  type: "athleanX",
  workoutId: "A" | "B",
  mode: "NORMAL" | "BUILD" | "DEFINE",
  reps: { "A-1.1": 14, "A-1.2": 9, ... } // clé = sourceId
}
```

**Tests.** Séquence A→B→A→B sur 4 lancements non consécutifs (avec des jours sautés entre) ; premier lancement jamais joué affiche bien le choix A/B ; mode Classique inchangé tous les jours y compris week-end.

---

### F-15 · Saisie des reps post-séance Athlean X
**Statut : Spec prête**

Écran récap en fin de séance Athlean X : liste de tous les exercices joués (dans l'ordre de la séance), un champ numérique reps par exercice, pré-rempli vide. Validation → écrit dans le journal (structure F-14) → retour écran d'accueil.

**Hors scope.** Pas de validation/plausibilité des reps saisis, pas de calcul de progression automatique (juste le stockage).

**Tests.** Récap liste bien tous les exercices de la séance jouée (pas le catalogue complet) ; champ vide accepté (reps optionnel, pas de blocage) ; `sourceId` utilisé comme clé même si l'id maison change plus tard.

---

### Idée — suivi de progression Athlean X (pas un ticket)
Une fois quelques semaines de reps saisis via F-15 : affichage d'évolution par exercice (sourceId). Forme à définir une fois qu'on a des données réelles à regarder — ne pas spécifier à vide.

---

**Ordre d'envoi** : F-11 → F-12 → F-12.5 → F-13 → F-14 → F-15, une étape à la fois avec Claude Code, jamais plusieurs dans la même conversation (règle actée dans `CLAUDE.md`).
