import { EVITE, ZONE_IDS } from "../data/douleurs.js";

/* Le moteur de substitution.
   =========================

   Une seule question, posée de la même façon quelle que soit la raison :
   cet exercice ne convient pas — par quoi le remplacer ?

   `raison` dit pourquoi (une douleur aujourd'hui), `contrainte` dit laquelle
   (quelle zone). Les deux sont séparés parce que la table consultée dépend de
   la raison et d'elle seule : brancher la substitution d'équipement (étape 8
   du brief) ou de régression (étape 9, `chains.js` est déjà écrit) se fera en
   ajoutant une entrée à `TABLES`, sans toucher à un seul appelant. C'est tout
   ce que « moteur partagé » veut dire ici — pas un système, un point de
   passage unique.

   Ce que le moteur ne fait pas, et c'est délibéré : choisir une quantité. Une
   substitution garde le nombre de la ligne, ce qui laisse le volume et la
   durée de la séance intacts. Les substituts sont donc tenus de partager
   l'unité de l'exercice qu'ils remplacent — un test le vérifie, parce que
   « 4 s de suspension » à la place de 4 tractions est exactement la faute
   qu'une table de ce genre produit en silence. */

const TABLES = {
  douleur: (ex, zone) => (EVITE[zone] || {})[ex],
};

/* `undefined` : rien à redire sur cet exercice. `null` : à éviter, et rien ne
   le remplace — la ligne reste, à signaler. Sinon, le remplaçant. */
export function substituer(exercice, raison, contrainte) {
  const table = TABLES[raison];
  if (!table) return undefined;
  return table(exercice, contrainte);
}

/* Le remplaçant final d'un exercice pour un jeu de zones.

   Le résultat est repassé au crible : remplacer un jump squat par un squat ne
   sert à rien si le squat est lui aussi écarté. La boucle est bornée par le
   nombre de zones — une table qui tournerait en rond serait une faute de
   données, et un test la cherche plutôt que de la laisser figer l'app. */
export function remplacantDe(exercice, zones) {
  let ex = exercice, vus = new Set([exercice]);
  for (let garde = 0; garde <= ZONE_IDS.length; garde++) {
    let trouve;
    for (const zone of zones) {
      const r = substituer(ex, "douleur", zone);
      if (r !== undefined) { trouve = r; break; }
    }
    if (trouve === undefined) return ex === exercice ? undefined : ex;
    if (trouve === null) return null;
    if (vus.has(trouve)) return trouve;
    vus.add(trouve);
    ex = trouve;
  }
  return ex;
}

/* La table de correspondance d'une séance : seulement ce qui change.

   Elle se calcule une fois et se lit partout — fiche, chrono, feuille de
   perfs. C'est ce qui garantit que les trois montrent la même séance, alors
   qu'ils lisent trois structures différentes. */
export function substitutionsPour(zones) {
  const subs = {};
  if (!zones || !zones.length) return subs;
  const candidats = new Set(zones.flatMap((z) => Object.keys(EVITE[z] || {})));
  candidats.forEach((ex) => {
    const r = remplacantDe(ex, zones);
    if (r !== undefined && r !== ex) subs[ex] = r;
  });
  return subs;
}

/* Les exercices écartés sans remplaçant : la ligne reste telle quelle, et
   c'est à l'écran de le dire. Mieux vaut une consigne qu'on sait inadaptée
   qu'un trou silencieux dans la séance. */
export const sansRemplacant = (subs) => Object.keys(subs).filter((ex) => subs[ex] === null);

/* La consigne d'une ligne décrit le mouvement d'origine : la garder sur un
   autre exercice donnerait une explication qui ne correspond à rien. */
const ligneSubstituee = (it, subs) => {
  if (it.ex === undefined) return it;
  const r = subs[it.ex];
  if (!r) return it;
  const { d, ...reste } = it;
  return { ...reste, ex: r };
};

export const itemsSubstitues = (items, subs) => items.map((it) => ligneSubstituee(it, subs));

/* La fiche telle qu'elle se lit une fois les zones prises en compte. Le nom ne
   bouge pas : c'est toujours la même séance, avec d'autres mouvements. */
export function ficheSubstituee(w, subs) {
  if (!w || !Object.keys(subs).length) return w;
  return { ...w, blocks: w.blocks.map((b) => ({ ...b, items: itemsSubstitues(b.items, subs) })) };
}

/* Le plan de chrono, même travail sur une autre forme. */
export function planSubstitue(phases, subs) {
  if (!phases || !Object.keys(subs).length) return phases;
  return phases.map((p) => {
    const o = { ...p };
    if (p.stations) o.stations = p.stations.map((s) => itemsSubstitues(s, subs));
    if (p.list) o.list = itemsSubstitues(p.list, subs);
    return o;
  });
}

/* Les schémas moteurs qu'aucune séance ne peut plus couvrir une fois les
   zones prises en compte.

   Le genou est le cas qui a forcé cette fonction : sans flexion chargée il n'y
   a pas de squat, et la grille hebdomadaire affichait alors une case vide que
   rien ne pouvait remplir — pendant que le générateur cherchait indéfiniment
   une séance de squat qui n'existait plus. Le brief avait déjà tranché la même
   question pour le matériel manquant : on ne montre pas au pratiquant une case
   qu'il ne peut pas cocher. On la nomme pour ce qu'elle est.

   `pools` est passé plutôt qu'importé : ce fichier n'a pas à connaître le
   catalogue, et la règle se teste alors sur trois séances au lieu de vingt-cinq. */
export function patternsPerdus(pools, zones, patternsDe) {
  const subs = substitutionsPour(zones);
  if (!Object.keys(subs).length) return [];
  const toutes = Object.values(pools).flat();
  const avant = new Set(toutes.flatMap((w) => patternsDe(w)));
  const apres = new Set(toutes.flatMap((w) => patternsDe(ficheSubstituee(w, subs))));
  return [...avant].filter((p) => !apres.has(p));
}
