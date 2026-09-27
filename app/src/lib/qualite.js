/* La note de qualité d'une séance : « et la séance, elle valait quoi ? ».

   À ne pas confondre avec le ressenti, et c'est la confusion qu'il faut tenir
   à l'écran comme ici : le ressenti parle du **pratiquant** — le dosage
   était-il juste — la qualité parle de la **séance** — l'enchaînement
   généré tenait-il debout. Les deux ont trois valeurs, les deux se donnent
   d'un tap sur le même écran, et rien d'autre ne les distingue que ce qu'on
   en dit. D'où deux modules séparés plutôt qu'un champ de plus.

   Trois niveaux, du meilleur au pire :

   - `garder`   cet enchaînement, tel qu'il est sorti, on veut le rejouer.
                C'est la seule note qui demande à l'app de retenir le contenu
                complet de la séance et pas seulement son nom.
   - `normale`  ni à garder ni à jeter. L'app a fait le job.
   - `probleme` quelque chose ne va pas. Une note est attendue — et tant
                qu'elle manque, le récap le redemande plutôt que de laisser le
                signal se perdre.

   Les contrôles de cohérence Vitest valident le catalogue au build ; ceci
   capture un jugement d'usage sur une séance réellement générée. Les deux
   attrapent des choses différentes et aucun ne remplace l'autre. */

export const QUALITES = [
  { id: "garder", label: "ON LA GARDE",
    retour: "Gardée. Elle ressort dans le récap, avec son contenu complet." },
  { id: "normale", label: "RIEN À DIRE",
    retour: "Noté. L'app a fait le job." },
  { id: "probleme", label: "ÇA NE VA PAS",
    retour: "Dis ce qui cloche. Sans note, le récap te le redemandera." },
];

export const isQualite = (v) => QUALITES.some((q) => q.id === v);

export function retourDeQualite(q) {
  const x = QUALITES.find((v) => v.id === q);
  return x ? x.retour : null;
}

/* Le champ de texte ne s'ouvre que sur un signalement. L'afficher toujours
   ferait un formulaire d'une question à un tap. */
export const demandeNote = (q) => q === "probleme";

export const noteDe = (e) => (e && typeof e.note === "string" ? e.note.trim() : "");

/* Une séance signalée sans un mot est un signal qu'on ne saura pas relire
   dans trois semaines. Le récap la liste à part pour qu'elle se documente
   pendant qu'on s'en souvient encore. */
export const aDocumenter = (e) => e.qualite === "probleme" && !noteDe(e);

export const gardees = (log) => log.filter((e) => e.qualite === "garder");
export const signalees = (log) => log.filter((e) => e.qualite === "probleme");
export const aDocumenterDans = (log) => log.filter(aDocumenter);

/* La question se pose sur la séance, pas sur le finisher — c'est la séance
   qui est générée. Une séance arrêtée en route reste notable : « ça ne va
   pas » est parfois précisément la raison pour laquelle on s'est arrêté. */
export const askQualite = ({ stage }) => stage === "workout";
