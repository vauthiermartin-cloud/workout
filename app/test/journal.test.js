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
import { ecraserait, entreeA, entreeDeLOnglet } from "../src/lib/journal.js";

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

/* La ligne que montre un onglet de jour.
   ====================================

   Le bug d'un samedi matin : le repli du week-end renvoyait la date du jour pour
   les cinq onglets, si bien qu'une séance de rattrapage s'affichait sous lundi,
   mardi, mercredi, jeudi et vendredi à la fois. Rien n'était écrasé — le journal
   avait toutes ses lignes — mais aucune n'était lisible, ce qui revient au même
   pour qui regarde l'écran. */
describe("la ligne que montre un onglet de jour", () => {
  const MAR = new Date(2026, 8, 8);
  const SAM = new Date(2026, 8, 12);
  const DIM = new Date(2026, 8, 13);
  const semaine = ["2026-09-07", "2026-09-08"].map(ligne);
  /* Le samedi 12, on rejoue le thème du vendredi (onglet 5) qu'on a sauté. */
  const rattrapage = { d: "2026-09-12", w: "AMRAP 20", lvl: 2, day: 5 };

  it("en semaine, un onglet montre la séance de sa date", () => {
    expect(entreeDeLOnglet(semaine, MAR, 1).d).toBe("2026-09-07");
    expect(entreeDeLOnglet(semaine, MAR, 2).d).toBe("2026-09-08");
    expect(entreeDeLOnglet(semaine, MAR, 3)).toBeNull();
  });

  it("un samedi, la semaine reste lisible onglet par onglet", () => {
    const log = [...semaine, rattrapage];
    expect(entreeDeLOnglet(log, SAM, 1).d).toBe("2026-09-07");
    expect(entreeDeLOnglet(log, SAM, 2).d).toBe("2026-09-08");
    expect(entreeDeLOnglet(log, SAM, 3)).toBeNull();
  });

  /* Rattraper vendredi un samedi, c'est prendre la place que vendredi a
     laissée : c'est là, et nulle part ailleurs, que son bilan se retrouve. */
  it("la séance de rattrapage se range sous l'onglet du thème joué", () => {
    const log = [...semaine, rattrapage];
    expect(entreeDeLOnglet(log, SAM, 5).w).toBe("AMRAP 20");
    expect(entreeDeLOnglet(log, SAM, 4)).toBeNull();
    expect(entreeDeLOnglet([...semaine, { ...rattrapage, d: "2026-09-13" }], DIM, 5).w)
      .toBe("AMRAP 20");
  });

  /* La limite, assumée : la place doit être libre. Tant qu'une date ne porte
     qu'une séance, le vendredi réellement fait garde son onglet, et la séance
     de rattrapage ne se relit que dans les stats et l'export. */
  it("un jour déjà entraîné garde sa ligne", () => {
    const log = [...semaine, ligne("2026-09-11"), rattrapage];
    expect(entreeDeLOnglet(log, SAM, 5).d).toBe("2026-09-11");
  });

  /* Une séance de week-end tirée sur un thème n'apparaît pas sous un autre :
     sans le test du thème, elle reprendrait le premier onglet libre venu. */
  it("ne se range pas sous un onglet dont elle n'a pas joué le thème", () => {
    const log = [{ ...rattrapage, day: 2 }];
    expect(entreeDeLOnglet(log, SAM, 5)).toBeNull();
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
