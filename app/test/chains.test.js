import { describe, it, expect } from "vitest";
import { CHAINS, chainOf, stepOf, regressionOf, progressionOf } from "../src/data/chains.js";
import { EXERCISES } from "../src/data/exercises.js";

const membres = CHAINS.flat();
const patternsDe = (id) => [...EXERCISES[id].patterns].sort().join(",");

describe("les chaînes de régressions", () => {
  it("ne citent que des exercices de la bibliothèque", () => {
    expect(membres.filter((id) => !EXERCISES[id])).toEqual([]);
  });

  /* Un exercice placé dans deux chaînes, ou deux fois dans la même, rendrait
     « le cran suivant » ambigu : il y en aurait deux. */
  it("ne placent aucun exercice deux fois", () => {
    const vus = new Set();
    expect(membres.filter((id) => vus.size === vus.add(id).size)).toEqual([]);
  });

  it("comptent au moins deux crans", () => {
    expect(CHAINS.filter((c) => c.length < 2)).toEqual([]);
  });

  /* Le contrôle qui compte. La grille de couverture hebdomadaire se déduit
     des exercices faits ; une variante classée autrement que l'exercice
     qu'elle remplace ferait dire à la semaine qu'elle a travaillé un schéma
     qu'elle n'a pas travaillé — ou l'inverse. C'est ce test qui a forcé les
     chin-ups dans leur propre chaîne, la supination étant suivie à part. */
  it("ne changent pas les schémas moteurs d'un cran à l'autre", () => {
    const ecarts = CHAINS
      .map((c) => c.filter((id) => patternsDe(id) !== patternsDe(c[c.length - 1])))
      .flat();
    expect(ecarts).toEqual([]);
  });

  /* Une chaîne n'est pas ordonnée par un chiffre qu'on pourrait vérifier :
     l'ordre est un arbitrage de coach. Ce qui se vérifie, c'est qu'on la lit
     dans le même sens partout — du plus accessible au plus dur. */
  it("se lisent du plus accessible au plus dur", () => {
    expect(regressionOf("pompes")).toBe("pompesGenoux");
    expect(progressionOf("pompes")).toBe("pompesPiedsSureleves");
    expect(stepOf("pompesMur")).toBe(0);
  });

  it("s'arrêtent en haut et en bas", () => {
    expect(regressionOf("pompesMur")).toBe(null);
    expect(progressionOf("pompesPiedsSureleves")).toBe(null);
  });

  it("laissent tranquilles les exercices qui n'en ont pas", () => {
    expect(chainOf("airSquats")).toBe(null);
    expect(stepOf("airSquats")).toBe(-1);
    expect(regressionOf("planche")).toBe(null);
    expect(progressionOf("nexistePas")).toBe(null);
  });

  /* Le catalogue prescrit deux crans de la chaîne des burpees selon la
     séance. Un « cran de référence » unique par chaîne serait donc faux, et
     c'est pourquoi il n'existe pas : la référence est ce que prescrit la
     ligne de séance qu'on est en train de lire. */
  it("peuvent passer par plusieurs crans que le catalogue prescrit", () => {
    expect(chainOf("burpees")).toBe(chainOf("burpeesLongueur"));
    expect(progressionOf("burpees")).toBe("burpeesLongueur");
  });
});

/* Une substitution remplace un exercice dans une ligne de séance en gardant
   le nombre. Elle n'est pas encore écrite (étape 9, avec la bibliothèque),
   et deux pièges l'attendent : ils sont épinglés ici pour qu'elle ne les
   découvre pas en production. */
describe("ce qu'une chaîne peut cacher à la substitution", () => {
  /* Substituer une suspension active à 4 pull-ups donnerait « 4 s de
     suspension », qui n'est pas un exercice, c'est une erreur d'unité. Le
     cran est gardé quand même : c'est le vrai premier pas de quelqu'un qui
     ne tient pas à la barre. La conversion est le travail de l'étape 9. */
  it("un cran change d'unité, et un seul", () => {
    const ecarts = CHAINS
      .map((c) => c.filter((id) => EXERCISES[id].unit !== EXERCISES[c[c.length - 1]].unit))
      .flat();
    expect(ecarts).toEqual(["suspensionActive"]);
  });

  /* Un total « réparti » se partage entre deux côtés : 12 V-ups une jambe
     valent 6 par jambe. Substituer une variante latérale à un mouvement
     symétrique ne change donc pas le nombre prescrit, mais change ce qu'il
     veut dire, et la note de côté doit suivre. */
  it("un cran peut devenir latéral quand l'exercice prescrit ne l'est pas", () => {
    expect(EXERCISES.vups.perSide).toBe(undefined);
    expect(EXERCISES.vupsUneJambe.perSide).toBe("reparti");
  });
});
