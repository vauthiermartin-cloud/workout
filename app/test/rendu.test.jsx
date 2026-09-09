/* Le rendu des écrans de bilan.
   ===========================

   Les autres tests tiennent les données et les calculs, jamais l'affichage :
   une séance sans plan de chrono est attrapée, un écran qui plante à l'ouverture
   ne l'était pas. Or l'écran de fin et sa relecture sont les seuls du parcours
   qui lisent une ligne de journal — donc les seuls dont une variante de séance
   peut faire dérailler le rendu, et le catalogue continue de grossir.

   Le rendu est statique, côté serveur : le projet n'a pas de `jsdom` et
   n'ouvre pas de navigateur en test. On ne peut donc pas taper dans un champ
   ni changer d'onglet ici. Ce qui se vérifie est ce qui se rend au premier
   coup d'oeil — et l'absence de ce qui ne doit pas s'y trouver. */

import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BilanEntete, BilanPatterns } from "../src/components/Bilan.jsx";
import { Perfs } from "../src/components/Perfs.jsx";
import { Revoir } from "../src/components/Revoir.jsx";
import { WORKOUTS } from "../src/data/workouts.js";
import { TIMERS } from "../src/data/timers.js";
import { PATTERNS, patternsOfWorkout } from "../src/data/patterns.js";
import { perfsOf } from "../src/lib/perfs.js";
import { volumeOf } from "../src/lib/volume.js";

/* Les entités sont défaites avant comparaison. Sans ça « C'EST BON » ne se
   trouve pas dans un balisage qui l'écrit `C&#x27;EST BON` — et pire, les
   vérifications de ce qui doit être *absent* passeraient sans rien vérifier. */
const html = (el) => renderToStaticMarkup(el)
  .replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const CATALOGUE = Object.values(WORKOUTS).flat().filter((w) => TIMERS[w.name]);
const ligne = (wod, extra) => ({
  d:"2026-09-04", day:5, w:wod.name, lvl:2, perfs:{}, valide:true, s:45,
  arrete:false, dur:1500, ...extra,
});

const relecture = (wod, extra) => html(
  <Revoir wod={wod} finisher={null} stretch={null} level={2} entry={ligne(wod, extra)}
    accent="#c8ff00" vol={volumeOf(wod.name, 2)} volFin={null}
    streak={3} weekCount={4} pats={patternsOfWorkout(wod)} manque={PATTERNS.slice(0, 2)}
    reduced onValider={() => {}} onRetour={() => {}} />
);

describe("le bilan partagé", () => {
  const entete = (props) => html(
    <BilanEntete stage="workout" wod={{ name:"EMOM 21" }} finisher={null} stretch={null}
      vol={{ total:100 }} volFin={null} reel={null} fait={false}
      streak={1} weekCount={3} {...props} />
  );

  it("le total dit ce qu'il est : prescrit, par tour, ou fait", () => {
    expect(entete()).toContain("RÉPÉTITIONS");
    expect(entete({ vol:{ total:100, amrap:true } })).toContain("REPS PAR TOUR");
    expect(entete({ reel:{ total:150, complet:true }, fait:true })).toContain("RÉPÉTITIONS FAITES");
  });

  it("le singulier de la série tient", () => {
    expect(entete({ streak:1 })).toContain("JOUR D'AFFILÉE");
    expect(entete({ streak:2 })).toContain("JOURS D'AFFILÉE");
  });

  /* Ce fichier existe surtout pour cette ligne. L'écran de fin porte le
     ressenti et les propositions, sa relecture ne doit rien porter de tout
     ça : ces morceaux-là sont communs aux deux, ils doivent rester muets. */
  it("les morceaux communs ne portent ni CTA ni ressenti", () => {
    const commun = entete() + html(<BilanPatterns pats={["squat"]} manque={[]} />);
    ["LANCER", "AJOUTER", "DÉMARRER", "C'ÉTAIT COMMENT", "FERMER", "<button"]
      .forEach((interdit) => expect(commun).not.toContain(interdit));
  });
});

describe("la relecture d'une séance faite", () => {
  it("se rend pour chaque séance du catalogue", () => {
    CATALOGUE.forEach((wod) => {
      const vu = relecture(wod);
      expect(vu).toContain("MES CHIFFRES");
      expect(vu).toContain("LA SÉANCE");
    });
  });

  it("s'ouvre sur les chiffres du jour, pas sur le bilan", () => {
    const vu = relecture(CATALOGUE[0]);
    expect(vu).toContain("CE QUE TU AS FAIT");
    expect(vu).not.toContain("C'EST FAIT");
  });

  /* Le chrono est mesuré et non saisi : il vient de la ligne, et une ligne
     antérieure au champ n'a rien à afficher plutôt qu'un zéro. */
  it("affiche le chrono mesuré, et se tait quand il manque", () => {
    expect(relecture(CATALOGUE[0])).toContain("25:00");
    expect(relecture(CATALOGUE[0], { dur:754 })).toContain("12:34");
    expect(relecture(CATALOGUE[0], { dur:undefined })).toContain("CHRONO EFFECTUÉ");
  });

  it("ne propose pas de rejouer la séance", () => {
    CATALOGUE.forEach((wod) => {
      const vu = relecture(wod);
      expect(vu).not.toContain("DÉMARRER");
      expect(vu).not.toContain("LANCER LE CHRONO");
    });
  });
});

describe("le total du jour", () => {
  /* Le chiffre de la carte, et pas n'importe quel tiret du balisage : les
     champs de saisie portent eux aussi « — » en placeholder, et chercher le
     tiret dans la page entière ne vérifiait rien. */
  const totalAffiche = (vu) => {
    const m = vu.match(/>([^<>]*)<\/div><div[^>]*>RÉPÉTITIONS FAITES</);
    return m ? m[1] : null;
  };
  const champs = (w) => perfsOf(w.name, 2);
  const aTours = CATALOGUE.find((w) => champs(w).some((c) => c.kind === "tours"));
  const simple = CATALOGUE.find((w) => champs(w).every((c) => c.kind === "ex"));

  /* Un format à tours ouverts ne connaît pas son total avant qu'on dise ses
     tours. Additionner ce qui est connu donnerait un total plus faux que pas
     de total du tout. */
  it("se tait tant qu'un tour n'est pas dit", () => {
    expect(aTours).toBeDefined();
    expect(totalAffiche(relecture(aTours))).toBe("—");
  });

  it("parle dès que le tour est dit", () => {
    const tours = champs(aTours).find((c) => c.kind === "tours");
    const vu = relecture(aTours, { perfs: { [tours.k]: 5 } });
    expect(totalAffiche(vu)).toMatch(/^[0-9]+$/);
  });

  it("vaut le prescrit quand aucun champ n'a été corrigé", () => {
    expect(simple).toBeDefined();
    expect(totalAffiche(relecture(simple))).toBe(String(volumeOf(simple.name, 2).total));
  });

  it("suit la correction d'un exercice", () => {
    const ex = champs(simple).find((c) => c.kind === "ex" && c.unit === "reps");
    const vu = relecture(simple, { perfs: { [ex.k]: ex.prescrit + 7 } });
    expect(totalAffiche(vu)).toBe(String(volumeOf(simple.name, 2).total + 7));
  });
});

describe("la saisie en plein écran", () => {
  it("garde sa sortie vers le bilan de fin", () => {
    const vu = html(
      <Perfs name={CATALOGUE[0].name} level={1} entry={null} accent="#c8ff00"
        onValider={() => {}} onRetour={() => {}} />
    );
    expect(vu).toContain("CE QUE TU AS FAIT");
    expect(vu).toContain("RETOUR AU BILAN");
    expect(vu).toContain("C'EST BON");
  });
});
