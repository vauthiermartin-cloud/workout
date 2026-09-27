import { WORKOUT_BY_NAME } from "../data/workouts.js";
import { labelOf, quantityOf } from "../data/exercises.js";
import { scaleItem } from "../data/levels.js";
import { DAYS } from "../data/days.js";
import { shortFr } from "./dates.js";
import { volumeOf } from "./volume.js";
import { ficheSubstituee, substitutionsPour } from "./substitution.js";
import { aDocumenterDans, gardees, noteDe, signalees } from "./qualite.js";

/* Le dossier de revue : ce qu'on relit à tête reposée.
   ==================================================

   Une séance notée ne vaut que par ce qu'on peut en refaire. « 5 rounds,
   ça n'allait pas » ne dit rien trois semaines plus tard : il faut le contenu
   qui a réellement été prescrit ce jour-là — les exercices, leurs nombres,
   leur ordre — et ce contenu n'est écrit nulle part. Le journal ne garde que
   le nom de la séance, le mode et les zones.

   Il se reconstruit donc, et c'est possible parce que tout est déterministe :
   le nom donne la fiche, les zones donnent les substitutions, le mode donne
   les nombres. Le reconstruire plutôt que le stocker évite un journal qui
   grossit et qui se périme — une séance relue affiche ce que la ligne dit,
   pas une copie figée qui divergerait au premier renommage.

   Ce module rend du texte. Il part dans le récap qu'on colle ailleurs, et
   c'est tout ce qu'on lui demande. */

/* Le contenu prescrit d'une séance enregistrée, bloc par bloc. */
export function contenuDe(entry) {
  const w = WORKOUT_BY_NAME[entry.w];
  if (!w) return null;
  const fiche = ficheSubstituee(w, substitutionsPour(entry.mal || []));
  const lvl = entry.lvl || 1;
  return fiche.blocks.map((b) => {
    const lignes = b.items.map((it) => (it.txt
      ? it.txt
      : `${quantityOf(it.ex, scaleItem(it, lvl).n)} ${labelOf(it.ex)}`));
    return `${b.tag} : ${lignes.join(" · ")}`;
  });
}

const entete = (e) => {
  const jour = DAYS.find((d) => d.key === e.day);
  const vol = volumeOf(e.w, e.lvl || 1);
  return `${shortFr(e.d)}${jour ? ` ${jour.short}` : ""} · ${e.w} · N${e.lvl || 1}`
    + ` · ${vol.total} reps${vol.amrap ? " par tour" : ""}`
    + (e.mal && e.mal.length ? ` · zones : ${e.mal.join(", ")}` : "");
};

const bloc = (titre, entrees, avecNote) => {
  if (!entrees.length) return [];
  const lignes = [`${titre} (${entrees.length})`];
  entrees.forEach((e) => {
    lignes.push(entete(e));
    if (avecNote) lignes.push(`  note : ${noteDe(e) || "—"}`);
    (contenuDe(e) || []).forEach((l) => lignes.push(`  ${l}`));
  });
  lignes.push("");
  return lignes;
};

/* Les trois sections du dossier, dans l'ordre où elles servent : ce qui manque
   d'abord — c'est la seule qui demande une action — puis ce qui est à revoir,
   puis ce qu'on veut garder. */
export function lignesDeRevue(log) {
  const manquantes = aDocumenterDans(log).sort((a, b) => (a.d < b.d ? 1 : -1));
  const rouges = signalees(log).filter((e) => noteDe(e)).sort((a, b) => (a.d < b.d ? 1 : -1));
  const bonnes = gardees(log).sort((a, b) => (a.d < b.d ? 1 : -1));
  if (!manquantes.length && !rouges.length && !bonnes.length) return [];
  return [
    "", "REVUE DES SÉANCES",
    ...(manquantes.length
      ? [`À DOCUMENTER (${manquantes.length}) — signalées, sans un mot pour dire pourquoi`,
        ...manquantes.map(entete), ""]
      : []),
    ...bloc("SIGNALÉES", rouges, true),
    ...bloc("GARDÉES", bonnes, false),
  ];
}
