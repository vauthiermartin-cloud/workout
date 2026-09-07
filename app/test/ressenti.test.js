import { describe, it, expect } from "vitest";
import { RESSENTIS, askRessenti, finisherStance, isRessenti, retourDe } from "../src/lib/ressenti.js";

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

describe("le retour affiché", () => {
  it("chaque réponse a le sien", () => {
    expect(RESSENTIS.every((r) => typeof r.retour === "string" && r.retour.length > 0)).toBe(true);
    expect(retourDe("juste")).toBe("Dans ta zone, Player!");
  });

  /* Sans réponse, il n'y a rien à dire. */
  it("rien à afficher sans réponse", () => {
    expect(retourDe(null)).toBe(null);
    expect(retourDe("moyen")).toBe(null);
  });
});

describe("effet sur la proposition de finisher", () => {
  it("trop dur ne propose aucun finisher", () => {
    expect(finisherStance("dur")).toBe("aucun");
  });

  /* « Trop facile » ne tire plus le finisher d'emblée : il est déjà l'action
     principale de l'écran, et l'ouvrir d'office noyait le retour sous un bloc
     de séance. Sa conséquence est différée à la montée de mode. */
  it("trop facile se comporte comme juste", () => {
    expect(finisherStance("facile")).toBe(finisherStance("juste"));
    expect(finisherStance("facile")).toBe("normal");
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
