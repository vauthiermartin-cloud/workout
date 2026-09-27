/* La note de qualité et le dossier de revue.
   ========================================

   Ce que ces tests tiennent, c'est la promesse faite au moment du tap : une
   séance gardée doit ressortir avec son contenu, une séance signalée sans note
   doit être réclamée, et une note donnée ne doit pas disparaître. */

import { describe, it, expect } from "vitest";
import {
  QUALITES, aDocumenter, aDocumenterDans, askQualite, demandeNote, gardees,
  isQualite, noteDe, retourDeQualite, signalees,
} from "../src/lib/qualite.js";
import { RESSENTIS } from "../src/lib/ressenti.js";
import { contenuDe, lignesDeRevue } from "../src/lib/revue.js";
import { WORKOUTS } from "../src/data/workouts.js";

const LOG = [
  { d:"2026-09-21", day:1, w:"EMOM 21", lvl:1, qualite:"normale" },
  { d:"2026-09-22", day:2, w:"Escalier ouvert", lvl:1, qualite:"probleme" },
  { d:"2026-09-23", day:3, w:"5 rounds", lvl:1, qualite:"probleme", note:"les sit-ups tombent trop tard" },
  { d:"2026-09-24", day:4, w:"AMRAP 20", lvl:2, qualite:"garder", mal:["pubalgie"] },
  { d:"2026-09-25", day:5, w:"Test 4 min + sangle", lvl:1 },
];

describe("les trois niveaux", () => {
  it("vont du meilleur au pire, et se distinguent du ressenti", () => {
    expect(QUALITES.map((q) => q.id)).toEqual(["garder", "normale", "probleme"]);
    /* Deux questions à trois réponses sur le même écran : si un identifiant
       était partagé, une valeur écrite dans un champ se relirait dans
       l'autre. */
    const croises = QUALITES.map((q) => q.id).filter((id) => RESSENTIS.some((r) => r.id === id));
    expect(croises).toEqual([]);
  });

  it("chacun porte un libellé et une réponse de l'app", () => {
    expect(QUALITES.filter((q) => !q.label || !q.retour)).toEqual([]);
    expect(retourDeQualite("garder")).toContain("récap");
    expect(retourDeQualite("inconnu")).toBeNull();
    expect(isQualite("garder")).toBe(true);
    expect(isQualite("flag")).toBe(false);
  });

  it("seul le signalement ouvre le champ de texte", () => {
    expect(demandeNote("probleme")).toBe(true);
    expect(demandeNote("garder")).toBe(false);
    expect(demandeNote(undefined)).toBe(false);
  });

  /* La question porte sur la séance, qui est ce que l'app génère. Le finisher
     est tiré d'une liste courte, il n'y a rien à y juger. */
  it("ne se pose que sur la séance", () => {
    expect(askQualite({ stage: "workout" })).toBe(true);
    expect(askQualite({ stage: "finisher" })).toBe(false);
  });

  it("une note vide ne compte pas comme une note", () => {
    expect(noteDe({ note: "   " })).toBe("");
    expect(aDocumenter({ qualite: "probleme", note: "  " })).toBe(true);
    expect(aDocumenter({ qualite: "probleme", note: "trop long" })).toBe(false);
    expect(aDocumenter({ qualite: "garder" })).toBe(false);
  });

  it("trie le journal par note", () => {
    expect(gardees(LOG).map((e) => e.d)).toEqual(["2026-09-24"]);
    expect(signalees(LOG).map((e) => e.d)).toEqual(["2026-09-22", "2026-09-23"]);
    expect(aDocumenterDans(LOG).map((e) => e.d)).toEqual(["2026-09-22"]);
  });
});

describe("le dossier de revue", () => {
  /* Le contenu n'est stocké nulle part : il se reconstruit du nom, du mode et
     des zones. C'est ce qui rend une séance gardée réellement rejouable — sans
     ça, « on la garde » ne garderait qu'un nom. */
  it("reconstruit le contenu prescrit d'une séance enregistrée", () => {
    const lignes = contenuDe({ w:"EMOM 21", lvl:1, day:1 });
    expect(lignes).toEqual([
      "MIN 1 : 8 burpees",
      "MIN 2 : 12 pompes",
      "MIN 3 : 3 pull-ups",
    ]);
  });

  it("applique le mode et les zones de la ligne, pas ceux d'aujourd'hui", () => {
    const base = contenuDe({ w:"AMRAP 20", lvl:1 })[0];
    const monte = contenuDe({ w:"AMRAP 20", lvl:2 })[0];
    expect(base).toContain("10 burpees");
    expect(monte).toContain("13 burpees");
    expect(contenuDe({ w:"5 rounds", lvl:1, mal:["genoux"] })[0]).toContain("soulevés de terre une jambe");
    expect(contenuDe({ w:"5 rounds", lvl:1 })[0]).toContain("fentes arrière");
  });

  it("ne rend rien d'une séance que le catalogue ne connaît plus", () => {
    expect(contenuDe({ w:"Séance disparue", lvl:1 })).toBeNull();
  });

  it("réclame d'abord les signalements sans note, contenu compris ensuite", () => {
    const txt = lignesDeRevue(LOG).join("\n");
    expect(txt.indexOf("À DOCUMENTER")).toBeGreaterThan(-1);
    expect(txt.indexOf("À DOCUMENTER")).toBeLessThan(txt.indexOf("SIGNALÉES"));
    expect(txt.indexOf("SIGNALÉES")).toBeLessThan(txt.indexOf("GARDÉES"));
    expect(txt).toContain("Escalier ouvert");
    expect(txt).toContain("note : les sit-ups tombent trop tard");
    /* Le contenu complet, c'est tout l'intérêt de la section. */
    expect(txt).toContain("40 mountain climbers");
    expect(txt).toContain("1 TOUR : 6 pull-ups");
  });

  /* Une séance signalée sans note est réclamée, mais elle n'est pas listée
     deux fois : elle sort de la section des signalements documentés. */
  it("ne liste pas deux fois une séance sans note", () => {
    const txt = lignesDeRevue(LOG).join("\n");
    expect(txt.split("Escalier ouvert").length - 1).toBe(1);
  });

  it("se tait quand rien n'est noté", () => {
    expect(lignesDeRevue([{ d:"2026-09-21", w:"EMOM 21", lvl:1 }])).toEqual([]);
    expect(lignesDeRevue([])).toEqual([]);
  });

  /* Chaque séance du catalogue doit pouvoir se relire : une fiche dont un bloc
     n'aurait ni texte ni exercice produirait une ligne vide dans le dossier. */
  it("sait relire n'importe quelle séance du catalogue", () => {
    const muettes = Object.values(WORKOUTS).flat().filter((w) => {
      const lignes = contenuDe({ w: w.name, lvl: 1 });
      return !lignes || lignes.some((l) => /: *$/.test(l));
    });
    expect(muettes.map((w) => w.name)).toEqual([]);
  });
});
