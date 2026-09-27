/* Le moteur de substitution et sa table de zones.
   =============================================

   La table est un arbitrage de mouvement, et aucun test ne peut dire si elle
   est juste — c'est le kiné qui le dira. Ce qui se vérifie ici, c'est qu'elle
   est *cohérente* : qu'elle ne fabrique pas de ligne impossible, qu'elle ne
   tourne pas en rond, et qu'elle ne laisse pas un exercice écarté revenir par
   la porte de son propre remplaçant. */

import { describe, it, expect } from "vitest";
import { EVITE, ZONES, ZONE_IDS } from "../src/data/douleurs.js";
import { EXERCISES } from "../src/data/exercises.js";
import { WORKOUTS } from "../src/data/workouts.js";
import { TIMERS } from "../src/data/timers.js";
import { PATTERNS, patternsOfWorkout } from "../src/data/patterns.js";
import { CORRECTIF_HEBDO, JOURS_CORRECTIF } from "../src/data/correctif.js";
import {
  ficheSubstituee, patternsPerdus, planSubstitue, remplacantDe, substituer, substitutionsPour,
} from "../src/lib/substitution.js";

const paires = ZONE_IDS.flatMap((z) => Object.entries(EVITE[z]).map(([de, vers]) => ({ z, de, vers })));

describe("la table des zones sensibles", () => {
  it("ne cite que des exercices de la bibliothèque", () => {
    const inconnus = paires.flatMap(({ de, vers }) => [de, vers].filter((id) => id !== null && !EXERCISES[id]));
    expect(inconnus).toEqual([]);
  });

  /* Le contrôle qui compte. Une substitution garde le nombre de la ligne :
     remplacer 4 tractions par « suspension active » donnerait 4 secondes de
     suspension, et le volume de la séance mentirait sans que rien ne bronche.
     C'est la faute que la même table a déjà failli produire côté chaînes de
     régressions, épinglée là-bas par le même genre de test. */
  it("ne change jamais l'unité de la ligne", () => {
    const ecarts = paires.filter(({ de, vers }) => vers && EXERCISES[de].unit !== EXERCISES[vers].unit);
    expect(ecarts).toEqual([]);
  });

  it("ne remplace pas un exercice par lui-même", () => {
    expect(paires.filter(({ de, vers }) => de === vers)).toEqual([]);
  });

  /* Un remplaçant lui-même écarté par la même zone ferait boucler la
     résolution, ou pire, la ferait s'arrêter sur un exercice interdit. */
  it("aucun remplaçant n'est écarté par sa propre zone", () => {
    const fautifs = paires.filter(({ z, vers }) => vers && EVITE[z][vers] !== undefined);
    expect(fautifs).toEqual([]);
  });

  it("toute combinaison de zones se résout, sans boucle", () => {
    const combinaisons = [];
    for (let m = 1; m < 1 << ZONE_IDS.length; m++) {
      combinaisons.push(ZONE_IDS.filter((_, i) => m & (1 << i)));
    }
    combinaisons.forEach((zones) => {
      const subs = substitutionsPour(zones);
      Object.entries(subs).forEach(([de, vers]) => {
        expect(vers).not.toBe(de);
        /* Le point d'arrivée ne doit plus rien avoir à redire. */
        if (vers !== null) expect(remplacantDe(vers, zones)).toBeUndefined();
      });
    });
  });

  it("chaque zone déclarée a un libellé", () => {
    expect(ZONES.map((z) => z.id).sort()).toEqual(Object.keys(EVITE).sort());
    expect(ZONES.filter((z) => !z.label || !z.detail)).toEqual([]);
  });
});

describe("le moteur", () => {
  it("distingue « rien à redire » de « rien ne le remplace »", () => {
    expect(substituer("pompes", "douleur", "genoux")).toBeUndefined();
    expect(substituer("jumpSquats", "douleur", "genoux")).toBe("hipThrusts");
  });

  it("ignore une raison qu'il ne connaît pas encore", () => {
    expect(substituer("pullups", "materiel", "barre")).toBeUndefined();
  });

  /* L'enchaînement sert entre zones : la pubalgie renvoie la fente croisée
     vers la fente arrière, que le genou écarte à son tour. Aucune des deux
     tables ne connaît l'autre, et c'est le moteur qui fait le pont. */
  it("enchaîne jusqu'à un exercice que plus aucune zone n'écarte", () => {
    expect(remplacantDe("fentesCroisees", ["pubalgie"])).toBe("fentesArriere");
    expect(remplacantDe("fentesCroisees", ["pubalgie", "genoux"])).toBe("sdtUneJambe");
    expect(remplacantDe("jumpSquats", ["pubalgie"])).toBe("airSquats");
  });

  it("sans zone, rien ne bouge", () => {
    expect(substitutionsPour([])).toEqual({});
    const w = WORKOUTS[1][0];
    expect(ficheSubstituee(w, {})).toBe(w);
    expect(planSubstitue(TIMERS[w.name], {})).toBe(TIMERS[w.name]);
  });

  /* La consigne décrit le mouvement d'origine. La laisser sur un autre
     exercice donnerait une explication qui ne correspond à rien de ce qui est
     écrit au-dessus. */
  it("la ligne substituée perd la consigne de l'exercice remplacé", () => {
    const subs = { situps: "crunchsInverses" };
    const items = [{ n: 20, ex: "situps", d: "Tu montes le buste" }];
    expect(ficheSubstituee({ name: "x", blocks: [{ tag: "1", items }] }, subs).blocks[0].items[0])
      .toEqual({ n: 20, ex: "crunchsInverses" });
  });
});

describe("ce que les zones coûtent au catalogue", () => {
  /* La condition chronique est celle qui s'applique tous les jours : si elle
     rendait un schéma moteur inatteignable, la grille afficherait un trou
     permanent. Elle ne le fait pas, et c'est ce qui permet de la laisser
     active sans rien changer d'autre. */
  it("la pubalgie ne coûte aucun schéma moteur", () => {
    expect(patternsPerdus(WORKOUTS, ["pubalgie"], patternsOfWorkout)).toEqual([]);
    expect(patternsPerdus(WORKOUTS, ["cervicales"], patternsOfWorkout)).toEqual([]);
  });

  /* Le genou, lui, en coûte un — et c'est franc : sans flexion chargée il n'y
     a pas de squat. L'app le nomme au lieu d'afficher une case vide. Si un
     jour le catalogue gagne un squat sans genou, ce test tombera et ce sera
     une bonne nouvelle à constater plutôt qu'à découvrir. */
  it("le genou coûte le squat, et seulement lui", () => {
    expect(patternsPerdus(WORKOUTS, ["genoux"], patternsOfWorkout)).toEqual(["squat"]);
  });

  it("aucune zone ne vide une séance de ses lignes", () => {
    const vides = [];
    ZONE_IDS.forEach((z) => {
      const subs = substitutionsPour([z]);
      Object.values(WORKOUTS).flat().forEach((w) => {
        const apres = ficheSubstituee(w, subs);
        if (patternsOfWorkout(apres).length === 0) vides.push(`${z}/${w.name}`);
      });
    });
    expect(vides).toEqual([]);
  });

  /* Fiche et chrono lisent deux structures différentes ; la substitution doit
     les emmener au même endroit, sinon l'écran et le chrono montreraient deux
     séances. */
  it("fiche et chrono citent les mêmes exercices une fois substitués", () => {
    const ecarts = [];
    const ids = (lignes) => [...new Set(lignes.filter((it) => it.ex !== undefined).map((it) => it.ex))].sort();
    ZONE_IDS.forEach((z) => {
      const subs = substitutionsPour([z]);
      Object.values(WORKOUTS).flat().forEach((w) => {
        const fiche = ids(ficheSubstituee(w, subs).blocks.flatMap((b) => b.items));
        const chrono = ids(planSubstitue(TIMERS[w.name] || [], subs)
          .flatMap((p) => (p.stations ? p.stations.flat() : p.list || [])));
        if (fiche.join() !== chrono.join()) ecarts.push({ z, name: w.name, fiche, chrono });
      });
    });
    expect(ecarts).toEqual([]);
  });

  /* F-03 garantit deux dead bugs par semaine par le contenu des séances du
     jeudi et du vendredi. Une zone qui les remplacerait ferait tomber cette
     garantie sans toucher à une ligne de F-03 — exactement le genre de
     couplage qu'on ne voit pas venir. */
  it("aucune zone ne fait disparaître le correctif des séances", () => {
    const perdu = [];
    ZONE_IDS.forEach((z) => {
      const subs = substitutionsPour([z]);
      JOURS_CORRECTIF.forEach((jour) => {
        WORKOUTS[jour].forEach((w) => {
          const dedans = ficheSubstituee(w, subs).blocks
            .some((b) => b.items.some((it) => it.ex === CORRECTIF_HEBDO));
          if (!dedans) perdu.push(`${z}/${w.name}`);
        });
      });
    });
    expect(perdu).toEqual([]);
  });

  it("les schémas perdus sortent du compte, jamais des schémas connus", () => {
    const connus = new Set(PATTERNS.map((p) => p.id));
    ZONE_IDS.forEach((z) => {
      patternsPerdus(WORKOUTS, [z], patternsOfWorkout).forEach((p) => expect(connus.has(p)).toBe(true));
    });
  });
});
