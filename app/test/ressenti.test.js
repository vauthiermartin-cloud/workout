import { describe, it, expect } from "vitest";
import { RESSENTIS, askRessenti, finisherStance, isRessenti } from "../src/lib/ressenti.js";

describe("les trois réponses", () => {
  it("trois valeurs, pas plus, et des identifiants stables", () => {
    expect(RESSENTIS.map((r) => r.id)).toEqual(["facile", "juste", "dur"]);
  });

  /* Ces identifiants partiront en base et se liront dans les exports JSON déjà
     sur le disque : les renommer casserait l'historique. */
  it("une valeur inconnue n'est pas un ressenti", () => {
    expect(isRessenti("juste")).toBe(true);
    expect(isRessenti("moyen")).toBe(false);
    expect(isRessenti(null)).toBe(false);
  });
});

describe("effet sur la proposition de finisher", () => {
  it("trop dur ne propose aucun finisher", () => {
    expect(finisherStance("dur")).toBe("aucun");
  });

  it("trop facile en fait l'action principale", () => {
    expect(finisherStance("facile")).toBe("principal");
  });

  it("juste laisse l'écran tel quel", () => {
    expect(finisherStance("juste")).toBe("normal");
  });

  /* Ne pas répondre n'est pas une réponse : l'écran ne doit pas se mettre à
     supposer quoi que ce soit. */
  it("l'absence de réponse laisse l'écran tel quel", () => {
    expect(finisherStance(null)).toBe("normal");
    expect(finisherStance(undefined)).toBe("normal");
  });
});

describe("quand poser la question", () => {
  it("sur le premier écran de fin", () => {
    expect(askRessenti({ stage: "workout", aborted: false })).toBe(true);
  });

  /* Une seule fois par séance. Après le finisher, l'écran de fin se rouvre :
     reposer la question ferait deux signaux pour une seule séance. */
  it("pas une seconde fois après le finisher", () => {
    expect(askRessenti({ stage: "finisher", aborted: false })).toBe(false);
  });

  /* Le ressenti porterait sur quelque chose d'incomplet. */
  it("pas sur une séance arrêtée en route", () => {
    expect(askRessenti({ stage: "workout", aborted: true })).toBe(false);
  });
});
