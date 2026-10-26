# Perfect Home Workout --- Spécification fonctionnelle

Version : 2.0 — chrono avec pré-départ, aperçu et alertes sonores\
Langue de l'interface : français\
Noms des exercices : anglais

## 1. Objectif

Implémenter deux séances (**Workout A** et **Workout B**) avec trois
modes d'exécution :

-   **NORMAL** : deux rounds complets de 16 exercices.
-   **BUILD** : premier passage complet des 15 exercices principaux,
    second passage ciblé renforcement, puis correctif.
-   **DEFINE** : premier passage complet des 15 exercices principaux,
    second passage ciblé cardio + renforcement, puis correctif.

Les trois modes utilisent **60 secondes d'effort par exercice** et **5
secondes de transition entre deux exercices consécutifs**.

## 2. Expérience du chrono — exigences impératives

### 2.1 Avant le premier exercice

- Lorsque l’utilisateur touche **Démarrer**, afficher **PRÉPARATION — 5 secondes**, puis lancer automatiquement le premier exercice.
- Pendant ces 5 secondes, afficher **en grand le nom du premier exercice** (et son groupe/phase) : l’utilisateur doit savoir exactement ce qu’il va faire.
- Décompter visuellement **5, 4, 3, 2, 1** avec un bip court chaque seconde ; un signal distinct annonce **GO** au démarrage du premier exercice.
- Ces 5 secondes s’ajoutent à la durée totale de la séance. **Ne pas les confondre avec une transition entre exercices.**

### 2.2 Pendant chaque exercice (60 secondes)

- Afficher en priorité : **nom de l’exercice actuel**, **compte à rebours grand format**, phase/round, numéro de l’exercice et progression.
- Afficher **en permanence et lisiblement l’exercice suivant**, dès la première seconde de l’exercice actuel. Libellé recommandé : **ENSUITE : [nom du prochain exercice]**.
- À **10 secondes restantes**, jouer **un bip court d’avertissement** (valeur configurable à 5 ou 10 secondes ; **défaut : 10**). Ne jouer ce bip **qu’une seule fois par intervalle**.
- À **0 seconde**, jouer un signal de fin d’effort distinct et passer immédiatement à la transition de 5 secondes (ou terminer la séance s’il s’agissait du dernier exercice).
- Le chrono ne doit **pas** s’arrêter à l’avertissement et la minute d’effort doit toujours rester entière.

### 2.3 Pendant chaque transition (5 secondes)

- Afficher **TRANSITION**, le décompte **5 → 1**, et **le nom de l’exercice qui va commencer**, très visible.
- Jouer un **bip court à chaque seconde** de la transition (5, 4, 3, 2, 1), puis un **signal GO distinct** à 0 pour lancer l’exercice suivant.
- Ne pas jouer simultanément deux signaux à la même frontière temporelle : privilégier un signal de changement de phase clair.
- Conserver une transition de 5 secondes **entre tous les exercices**, y compris entre rounds/phases, et **aucune transition après le dernier exercice**.

### 2.4 Son, pause et fiabilité

- Prévoir un interrupteur **Son activé/désactivé** et, si possible, une option **Avertissement : 5 s / 10 s** ; valeur par défaut **10 s**.
- Si disponible, ajouter une vibration discrète en complément du son, sans en dépendre.
- **Pause** : geler immédiatement le décompte et les alertes ; **Reprendre** : continuer à la seconde restante, sans rejouer les alertes déjà émises.
- **Précédent / Suivant** : déplacer l’utilisateur dans la séquence sans supprimer les transitions normales à venir.
- Éviter les bips doublés lorsque l’application passe en arrière-plan puis revient au premier plan. Calculer les délais à partir d’une horloge monotone / d’échéances plutôt que du simple nombre de ticks.
- Sur mobile, initialiser/déverrouiller l’audio lors du clic utilisateur sur **Démarrer** ; tenir compte des restrictions iOS sur l’audio en arrière-plan et le verrouillage d’écran.

### 2.5 Écran recommandé

```text
WORKOUT A                  BUILD
ROUND 1 — FULL BODY       04 / 24

             00:37

          PIKE PUSHUPS

ENSUITE
Rotational Pushups

Progression : █████░░░░░░░░░░
Temps restant séance : 21:xx

[ PRÉCÉDENT ]  [ PAUSE ]  [ SUIVANT ]
```

Pendant le pré-départ et les transitions, remplacer le titre principal par **PRÉPARATION** ou **TRANSITION** et mettre l’exercice à venir au premier plan.

## 3. Règles communes du timer

-   Chaque exercice dure **60 secondes**.
-   Insérer une transition de **5 secondes** entre chaque paire
    d'exercices, y compris à la frontière entre deux rounds et avant le
    correctif final.
-   **Pas de transition avant le premier exercice ni après le dernier.**
-   La transition est un compte à rebours distinct de l'exercice, pas du
    temps de travail amputé.
-   Le passage au mouvement suivant est automatique après les 5
    secondes.
-   Afficher : séance, mode, round/phase, nom du mouvement, temps
    restant, exercice suivant, progression et temps total restant.
-   Prévoir pause/reprise, précédent/suivant, et son ou vibration aux
    changements de phase.
-   Les durées calculées ci-dessous n'incluent aucune pause manuelle ni
    échauffement.

### Formule de durée

`durationSeconds = 5 (pré-départ) + exerciseCount * 60 + (exerciseCount - 1) * 5`

  Mode     Structure      Exercices   Transitions   Durée totale
  -------- ------------ ----------- ------------- --------------
  NORMAL   16 + 16               32            31      **34:40**
  BUILD    15 + 8 + 1            24            23      **26:00**
  DEFINE   15 + 8 + 1            24            23      **26:00**

> Remarque : le format 15 + 9 + 1 représenterait 25 exercices et 24 transitions, soit **27:05** avec le pré-départ. Il ne respecte donc pas le plafond de 26 minutes.

## 4. Catalogue des exercices

Les identifiants sont stables : `A-1.1`, `B-4.2`, etc. Les noms affichés
peuvent être modifiés indépendamment.

### Workout A

  ID      Groupe                      Exercice
  ------- --------------------------- -----------------------------------
  A-1.1   Anterior Lower --- Squat    Alternating Single Leg Box Squats
  A-1.2   Anterior Lower --- Squat    1½ Bottomed Out Squats
  A-1.3   Anterior Lower --- Squat    Jump Squats
  A-2.1   Upper Push                  Pike Pushups
  A-2.2   Upper Push                  Rotational Pushups
  A-2.3   Upper Push                  Cobra Pushups
  A-3.1   Posterior Lower --- Hinge   Heel Touch Squats
  A-3.2   Posterior Lower --- Hinge   Alternating Sprinter Lunges
  A-3.3   Posterior Lower --- Hinge   Plyo Sprinter Lunges
  A-4.1   Upper Pull                  Pullups
  A-4.2   Upper Pull                  Dragon Fly
  A-4.3   Upper Pull                  Australian Pullups
  A-5.1   Abs                         Reverse Corkscrews
  A-5.2   Abs                         Navy Seal Knee Slides
  A-5.3   Abs                         Levitation Crunches
  A-6.1   Corrective                  Superman

### Workout B

  ID      Groupe                      Exercice
  ------- --------------------------- --------------------------
  B-1.1   Posterior Lower --- Hinge   Slick Floor Bridge Curls
  B-1.2   Posterior Lower --- Hinge   Long Leg Marches
  B-1.3   Posterior Lower --- Hinge   Hip Thrust
  B-2.1   Upper Push                  Elevated Feet Pushups
  B-2.2   Upper Push                  Alternating Side Plank
  B-2.3   Upper Push                  Triceps Extension
  B-3.1   Anterior Lower --- Lunge    High Step Ups
  B-3.2   Anterior Lower --- Lunge    Lunges
  B-3.3   Anterior Lower --- Lunge    Split Squat Jumps
  B-4.1   Upper Pull                  Chinups
  B-4.2   Upper Pull                  Australian Pullups
  B-4.3   Upper Pull                  Back Widows
  B-5.1   Abs                         Ab Halos
  B-5.2   Abs                         V-Up Tucks
  B-5.3   Abs                         Sit-Up Elbow Thrusts
  B-6.1   Corrective                  Reverse Hypers

## 5. Modes et séquences

### 5.1 NORMAL --- 34:40

Pour chaque séance :

1.  **Round 1** : exécuter les 16 exercices dans l'ordre du catalogue (y
    compris le correctif).
2.  **Round 2** : répéter les mêmes 16 exercices dans le même ordre.
3.  Appliquer les 5 secondes de transition entre tous les exercices, y
    compris entre les rounds.

### 5.2 BUILD --- 26:00

**Intention :** privilégier les mouvements de renforcement, tout en
conservant la variété du premier passage.

Pour chaque séance :

1.  **Round 1 --- Full Body** : les exercices des groupes 1 à 5, dans
    l'ordre, soit **15 exercices**. Exclure le groupe 6.
2.  **Round 2 --- Strength Focus** : **8 exercices** sélectionnés
    ci-dessous, dans l'ordre indiqué.
3.  **Finisher --- Corrective** : l'unique exercice du groupe 6, pendant
    **60 secondes**.

#### BUILD --- Workout A : Round 2

    Ordre ID      Exercice
  ------- ------- -----------------------------------
        1 A-1.1   Alternating Single Leg Box Squats
        2 A-1.2   1½ Bottomed Out Squats
        3 A-2.1   Pike Pushups
        4 A-2.2   Rotational Pushups
        5 A-3.1   Heel Touch Squats
        6 A-4.1   Pullups
        7 A-4.3   Australian Pullups
        8 A-5.1   Reverse Corkscrews

Finisher : **A-6.1 --- Superman**.

#### BUILD --- Workout B : Round 2

    Ordre ID      Exercice
  ------- ------- --------------------------
        1 B-1.1   Slick Floor Bridge Curls
        2 B-1.3   Hip Thrust
        3 B-2.1   Elevated Feet Pushups
        4 B-2.3   Triceps Extension
        5 B-3.1   High Step Ups
        6 B-4.1   Chinups
        7 B-4.2   Australian Pullups
        8 B-5.2   V-Up Tucks

Finisher : **B-6.1 --- Reverse Hypers**.

### 5.3 DEFINE --- 26:00

**Intention :** combiner cardio, endurance musculaire et renforcement.
Le mode DEFINE n'entraîne pas automatiquement une perte de graisse ;
celle-ci dépend aussi de l'alimentation et du bilan énergétique.

Pour chaque séance :

1.  **Round 1 --- Full Body** : les exercices des groupes 1 à 5, dans
    l'ordre, soit **15 exercices**. Exclure le groupe 6.
2.  **Round 2 --- Hybrid Focus** : **8 exercices** sélectionnés
    ci-dessous, dans l'ordre indiqué.
3.  **Finisher --- Corrective** : l'unique exercice du groupe 6, pendant
    **60 secondes**.

#### DEFINE --- Workout A : Round 2

    Ordre ID      Exercice
  ------- ------- -----------------------------
        1 A-1.3   Jump Squats
        2 A-2.1   Pike Pushups
        3 A-2.2   Rotational Pushups
        4 A-3.2   Alternating Sprinter Lunges
        5 A-3.3   Plyo Sprinter Lunges
        6 A-4.1   Pullups
        7 A-4.3   Australian Pullups
        8 A-5.3   Levitation Crunches

Finisher : **A-6.1 --- Superman**.

#### DEFINE --- Workout B : Round 2

    Ordre ID      Exercice
  ------- ------- ------------------------
        1 B-1.2   Long Leg Marches
        2 B-2.1   Elevated Feet Pushups
        3 B-2.2   Alternating Side Plank
        4 B-3.1   High Step Ups
        5 B-3.3   Split Squat Jumps
        6 B-4.1   Chinups
        7 B-4.2   Australian Pullups
        8 B-5.2   V-Up Tucks

Finisher : **B-6.1 --- Reverse Hypers**.

> Les sélections BUILD et DEFINE constituent une proposition initiale
> éditable, et non une propriété intangible du programme original. Le
> Workout B contient moins de mouvements franchement cardio ; ne pas
> ajouter d'exercices non présents dans le catalogue sans validation.

## 6. Modèle de données recommandé

``` json
{
  "workoutId": "A",
  "mode": "BUILD",
  "workSeconds": 60,
  "transitionSeconds": 5,
  "initialCountdownSeconds": 5,
  "audio": {"enabled": true, "warningSeconds": 10, "transitionCountdownBeeps": true, "startSignal": true},
  "phases": [
    {
      "id": "round1",
      "label": "Full Body",
      "exerciseIds": ["A-1.1", "A-1.2", "A-1.3", "A-2.1", "A-2.2", "A-2.3", "A-3.1", "A-3.2", "A-3.3", "A-4.1", "A-4.2", "A-4.3", "A-5.1", "A-5.2", "A-5.3"]
    },
    {
      "id": "round2",
      "label": "Strength Focus",
      "exerciseIds": ["A-1.1", "A-1.2", "A-2.1", "A-2.2", "A-3.1", "A-4.1", "A-4.3", "A-5.1"]
    },
    {
      "id": "finisher",
      "label": "Corrective",
      "exerciseIds": ["A-6.1"]
    }
  ]
}
```

**Principe d'implémentation :** générer une liste chronologique d'étapes
`exercise` et `transition` à partir des phases. Ne jamais insérer de
transition après la dernière étape d'exercice. Le temps global est la
somme de toutes les étapes. Une transition doit aussi exister entre deux
phases consécutives.

## 7. Critères d'acceptation

-   L'utilisateur peut choisir **A ou B**, puis **NORMAL / BUILD /
    DEFINE**.
-   Tous les exercices et leur ordre correspondent exactement aux
    tableaux ci-dessus.
-   Les exercices durent **60 s** dans les trois modes.
-   Les transitions durent **5 s**, y compris entre les phases.
-   **NORMAL = 34:40** pour A comme pour B, pré-départ inclus.
-   **BUILD = 26:00** pour A comme pour B, pré-départ inclus.
-   **DEFINE = 26:00** pour A comme pour B, pré-départ inclus.
-   Les modes adaptés ne placent le correctif **qu'à la fin**.
-   Les sélections du deuxième round sont configurables sans changer le
    catalogue d'exercices.
-   Pause et reprise conservent le temps restant de l'étape en cours.
-   Les temps de travail et de transition sont visibles séparément.
-   Aucun temps de transition n'est ajouté après le dernier exercice.

## 8. Notes d'entraînement

-   La durée de 60 secondes désigne une **fenêtre de travail**, pas
    l'obligation d'effectuer des répétitions sans interruption au
    détriment de la technique.
-   Prévoir un échauffement approprié en dehors du timer principal.
-   Les mouvements explosifs peuvent être remplacés ou adaptés en cas de
    douleur articulaire.
-   BUILD vise une progression mesurable des répétitions et de la
    difficulté ; DEFINE conserve une composante de renforcement pour
    préserver la masse musculaire.
