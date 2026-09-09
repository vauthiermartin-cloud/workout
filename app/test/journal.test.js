/* Ce que le journal promet quand on lui retire une ligne.
   =====================================================

   La suppression d'une séance ne met rien à jour : la série et le compte de la
   semaine se recalculent du journal à chaque rendu. Ce fichier tient cette
   promesse par le seul chiffre qui se calcule ailleurs qu'à l'écran — la série.

   Et il en épingle une propriété dont dépend l'étape à venir : la série compte
   des **jours**, pas des lignes. Le jour où une date pourra porter plusieurs
   séances, deux séances le même jour ne devront pas valoir deux jours de série,
   sans quoi il suffirait d'enchaîner deux séances faciles pour la tenir. */

import { describe, it, expect } from "vitest";
import { streakOf } from "../src/lib/volume.js";
import { ecraserait, entreeA } from "../src/lib/journal.js";

/* La semaine du 7 septembre 2026 : lundi 07, mardi 08, mercredi 09.
   Le vendredi précédent est le 04. */
const MER = new Date(2026, 8, 9);
const LUN = new Date(2026, 8, 7);
const ligne = (d) => ({ d, w: "EMOM 21", lvl: 2 });
const sans = (log, d) => log.filter((e) => e.d !== d);

describe("la série de jours", () => {
  it("un journal vide ne porte aucune série", () => {
    expect(streakOf([], MER)).toBe(0);
  });

  /* Elle ne se lit que sur un écran de bilan, donc toujours après une séance :
     le jour en cours est forcément dans le journal quand le chiffre s'affiche. */
  it("compte les jours ouvrés consécutifs jusqu'à aujourd'hui", () => {
    expect(streakOf([ligne("2026-09-09")], MER)).toBe(1);
    expect(streakOf(["2026-09-07", "2026-09-08", "2026-09-09"].map(ligne), MER)).toBe(3);
  });

  it("s'arrête au premier jour ouvré manquant", () => {
    expect(streakOf(["2026-09-07", "2026-09-09"].map(ligne), MER)).toBe(1);
  });

  it("saute le week-end sans se casser", () => {
    expect(streakOf(["2026-09-04", "2026-09-07"].map(ligne), LUN)).toBe(2);
  });

  /* La propriété qui protège la métrique le jour où un jour portera deux
     séances. Elle tient déjà : `streakOf` travaille sur un ensemble de dates. */
  it("deux séances le même jour ne valent qu'un jour", () => {
    const deux = [ligne("2026-09-08"), ligne("2026-09-09"), ligne("2026-09-09")];
    expect(streakOf(deux, MER)).toBe(2);
  });
});

/* Le garde-fou qui manquait. Lancer le thème de jeudi un mercredi déjà entraîné
   écrivait à la date du jour, donc **remplaçait** la séance du matin : nom,
   thème, mode et chrono perdus, chiffres conservés mais accrochés au nom d'une
   autre séance. Une séance de démonstration a suffi. */
describe("ce que le journal refuse d'écraser", () => {
  const JOUR = "2026-09-09";
  const log = [{ ...ligne(JOUR), w: "EMOM 21" }];

  it("une date libre accepte n'importe quelle séance", () => {
    expect(ecraserait([], JOUR, "EMOM 21")).toBe(false);
    expect(ecraserait(log, "2026-09-10", "AMRAP 20")).toBe(false);
  });

  /* Le cas normal : la ligne se complète plusieurs fois au fil d'une séance —
     fin du chrono, finisher, ressenti, relecture. Elle ne s'écrase pas
     elle-même. */
  it("la même séance se réécrit autant de fois qu'il faut", () => {
    expect(ecraserait(log, JOUR, "EMOM 21")).toBe(false);
  });

  it("une autre séance au même jour est refusée", () => {
    expect(ecraserait(log, JOUR, "AMRAP 20")).toBe(true);
  });

  it("la ligne visée se retrouve, ou vaut null", () => {
    expect(entreeA(log, JOUR).w).toBe("EMOM 21");
    expect(entreeA(log, "2026-09-10")).toBeNull();
  });
});

describe("retirer une séance du journal", () => {
  const semaine = ["2026-09-07", "2026-09-08", "2026-09-09"].map(ligne);

  it("laisse les autres jours en place", () => {
    const apres = sans(semaine, "2026-09-08");
    expect(apres.map((e) => e.d)).toEqual(["2026-09-07", "2026-09-09"]);
  });

  /* Le point de la suppression : la série ne garde pas le souvenir du jour
     effacé. Retirer le jour du milieu la casse — c'est le résultat voulu, pas
     un dégât collatéral. */
  it("recalcule la série sans elle", () => {
    expect(streakOf(semaine, MER)).toBe(3);
    expect(streakOf(sans(semaine, "2026-09-08"), MER)).toBe(1);
    expect(streakOf(sans(semaine, "2026-09-09"), MER)).toBe(0);
  });

  it("ne retire que la date visée, jamais une autre", () => {
    expect(sans(semaine, "2026-09-06")).toHaveLength(3);
  });
});
