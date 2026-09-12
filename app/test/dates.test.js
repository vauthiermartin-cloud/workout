import { describe, it, expect } from "vitest";
import { iso, isoOfWeekday, weekdayOf } from "../src/lib/dates.js";

/* La date derrière un onglet de jour.
   =================================

   C'est ce qui permet de relire le bilan d'un autre jour de la semaine, et
   c'est aussi le calcul le plus facile à rater : dimanche vaut 0 en JavaScript,
   et une semaine à cheval sur deux mois n'a rien de particulier sauf pour du
   code qui additionne des numéros de jour. */
describe("la date derrière un onglet de jour", () => {
  const LUN = new Date(2026, 8, 7);
  const MER = new Date(2026, 8, 9);
  const DIM = new Date(2026, 8, 13);
  const SAM = new Date(2026, 8, 12);

  it("numérote la semaine du lundi au dimanche", () => {
    expect(weekdayOf(LUN)).toBe(1);
    expect(weekdayOf(MER)).toBe(3);
    expect(weekdayOf(SAM)).toBe(6);
    expect(weekdayOf(DIM)).toBe(7);
  });

  it("chaque onglet tombe sur sa date, vu d'un jour de semaine", () => {
    expect(isoOfWeekday(MER, 1)).toBe("2026-09-07");
    expect(isoOfWeekday(MER, 3)).toBe("2026-09-09");
    expect(isoOfWeekday(MER, 5)).toBe("2026-09-11");
  });

  it("le jour courant tombe sur lui-même", () => {
    [LUN, MER].forEach((d) => expect(isoOfWeekday(d, weekdayOf(d))).toBe(iso(d)));
  });

  /* Le repli du week-end renvoyait la date du jour pour les cinq onglets : vu
     d'un samedi, toute la semaine montrait la séance du samedi, et le journal
     paraissait écrasé. Un onglet porte sa date, quel que soit le jour d'où on
     le regarde. Ce que devient une séance de week-end se décide dans
     `entreeDeLOnglet`, pas ici. */
  it("le week-end regarde la semaine qu'il termine, onglet par onglet", () => {
    expect(isoOfWeekday(SAM, 1)).toBe("2026-09-07");
    expect(isoOfWeekday(SAM, 5)).toBe("2026-09-11");
    expect(isoOfWeekday(DIM, 1)).toBe("2026-09-07");
    expect(isoOfWeekday(DIM, 5)).toBe("2026-09-11");
  });

  it("une semaine à cheval sur deux mois ne dérape pas", () => {
    const jeu = new Date(2026, 9, 1);
    expect(weekdayOf(jeu)).toBe(4);
    expect(isoOfWeekday(jeu, 1)).toBe("2026-09-28");
    expect(isoOfWeekday(jeu, 5)).toBe("2026-10-02");
  });
});
