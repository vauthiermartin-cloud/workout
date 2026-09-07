import { describe, it, expect } from "vitest";
import { labelOf, quantityOf, sideNoteOf } from "../src/data/exercises.js";
import { patternsOfExercise } from "../src/data/patterns.js";
import { scaleItem } from "../src/data/levels.js";
import { volumeOf } from "../src/lib/volume.js";

describe("le libellé passe par la table", () => {
  it("l'identifiant n'est jamais ce qui s'affiche", () => {
    expect(labelOf("pompesPiquees")).toBe("pompes piquées");
    expect(labelOf("sdtUneJambe")).toBe("soulevés de terre une jambe");
  });

  /* Plutôt que de faire disparaître une ligne de séance, on montre son
     identifiant : le défaut se voit et se corrige. */
  it("un identifiant inconnu s'affiche tel quel plutôt que de vider la ligne", () => {
    expect(labelOf("nexistePas")).toBe("nexistePas");
  });
});

describe("l'unité fait partie de la quantité affichée", () => {
  it("les répétitions se disent nues", () => {
    expect(quantityOf("pompes", 12)).toBe("12");
  });

  /* Pendant l'effort l'écran montre ce nombre en très grand : « 30 » seul, sur
     un maintien, se lirait comme 30 répétitions. */
  it("un maintien porte ses secondes", () => {
    expect(quantityOf("planche", 30)).toBe("30 s");
    expect(quantityOf("gainageLateral", 20)).toBe("20 s");
  });
});

describe("la latéralité", () => {
  it("rien à dire sur un mouvement symétrique", () => {
    expect(sideNoteOf("pompes", 12)).toBe(null);
  });

  /* Deux conventions opposées vivaient dans les notes en prose : ici le
     nombre est un total à partager, là il vaut pour chaque côté. */
  it("un total réparti se divise", () => {
    expect(sideNoteOf("fentesCroisees", 16)).toBe("8 par côté");
  });

  it("un maintien par côté ne se divise pas", () => {
    expect(sideNoteOf("gainageLateral", 30)).toBe("par côté");
  });

  /* Les coefficients de mode arrondissent sans savoir qu'un mouvement est
     latéral : scaleRep(10, 2) donne 13, qui ne se partage pas. */
  it("un total impair ne promet pas un partage exact", () => {
    expect(sideNoteOf("sweeps", 13)).toBe("en alternant les côtés");
  });
});

describe("le mode ne touche que les répétitions", () => {
  it("les répétitions montent", () => {
    expect(scaleItem({ ex:"pompes", n:12 }, 3).n).toBe(18);
  });

  /* Tant que les maintiens étaient du texte libre, le mode ne pouvait pas les
     atteindre. Maintenant qu'ils portent un nombre, rien à l'écran ne dirait
     qu'une planche est passée à 45 s et déborde de la minute d'EMOM. */
  it("un maintien garde sa durée", () => {
    expect(scaleItem({ ex:"planche", n:30 }, 3).n).toBe(30);
  });

  it("et ne se signale pas comme relevé", () => {
    expect(scaleItem({ ex:"planche", n:30 }, 3).montee).toBe(false);
    expect(scaleItem({ ex:"pompes", n:12 }, 3).montee).toBe(true);
  });
});

describe("les schémas moteurs viennent de l'exercice", () => {
  it("et de nulle part ailleurs", () => {
    expect(patternsOfExercise("chinups")).toEqual(["tirage", "supination"]);
  });

  it("un identifiant inconnu ne classe rien", () => {
    expect(patternsOfExercise("nexistePas")).toBe(null);
  });
});

describe("le volume ne mélange pas les unités", () => {
  /* « EMOM 20 explosif » contient 30 s de planche. Depuis que les maintiens
     sont typés ils portent un nombre, et l'addition naïve aurait ajouté 30
     répétitions au total affiché sur l'écran de fin. */
  it("30 secondes de planche ne sont pas 30 répétitions", () => {
    expect(volumeOf("EMOM 20 explosif", 1).total).toBe(152);
  });
});
