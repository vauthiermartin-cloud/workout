/* Une ligne de séance. Deux formes seulement, et la distinction est nette :

   - `r` et `h` désignent du travail — un exercice de la bibliothèque et une
     quantité. C'est ce qui se compte, ce qui se met à l'échelle du mode, et ce
     qui sera éditable sur l'écran de perfs.
   - `f` est une note. Rien à compter, rien à éditer : « Enchaîne 5 tours »,
     « +1 rep par minute », une posture d'étirement.

   `f` portait les deux jusqu'ici. « 30 s de planche » était une note, donc la
   planche ne comptait pour rien et n'était classée que par une expression
   régulière sur son propre libellé.

   `ex` et non `t` : dans un plan de chrono, `t` est déjà le type de la phase.
   Deux sens pour une lettre, dans le même fichier. */

/* Travail compté en répétitions. */
export const r = (n, ex, d) => ({ n, ex, d });

/* Maintien compté en secondes. Même forme que `r` : l'unité n'est pas répétée
   sur chaque ligne, elle appartient à l'exercice. */
export const h = (n, ex, d) => ({ n, ex, d });

/* Note libre. */
export const f = (txt, d) => ({ txt, d });

/* Une station de chrono = une liste de lignes. */
export const st = (...items) => items;
export const x5 = (s) => [s, s, s, s, s];
