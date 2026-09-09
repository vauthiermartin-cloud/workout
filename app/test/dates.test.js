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

  /* Sans quoi le bilan d'une séance du samedi deviendrait inatteignable : aucun
     onglet ne porte sa date, et « jamais perdue » ne fait pas d'exception. */
  it("le week-end, faute d'onglet, se rattache au jour courant", () => {
    [1, 3, 5].forEach((k) => {
      expect(isoOfWeekday(SAM, k)).toBe("2026-09-12");
      expect(isoOfWeekday(DIM, k)).toBe("2026-09-13");
    });
  });

  it("une semaine à cheval sur deux mois ne dérape pas", () => {
    const jeu = new Date(2026, 9, 1);
    expect(weekdayOf(jeu)).toBe(4);
    expect(isoOfWeekday(jeu, 1)).toBe("2026-09-28");
    expect(isoOfWeekday(jeu, 5)).toBe("2026-10-02");
  });
});
