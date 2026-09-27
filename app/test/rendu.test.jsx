/* Le rendu des écrans.
   ==================

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
import { Revoir, SupprimerSeance } from "../src/components/Revoir.jsx";
import { Timer } from "../src/components/Timer.jsx";
import { Coche } from "../src/components/Coche.jsx";
import { CORRECTIF } from "../src/data/correctif.js";
import { newRun } from "../src/lib/chrono.js";
import { WORKOUTS } from "../src/data/workouts.js";
import { TIMERS } from "../src/data/timers.js";
import { PATTERNS, patternsOfWorkout } from "../src/data/patterns.js";
import { attenduDe, perfsOf } from "../src/lib/perfs.js";
import { labelOf } from "../src/data/exercises.js";
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

const relecture = (wod, extra, props) => html(
  <Revoir wod={wod} finisher={null} stretch={null} level={2} entry={ligne(wod, extra)}
    accent="#c8ff00" vol={volumeOf(wod.name, 2)} volFin={null}
    streak={3} weekCount={4} pats={patternsOfWorkout(wod)} manque={PATTERNS.slice(0, 2)}
    reduced onValider={() => {}} onRetour={() => {}} {...props} />
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

/* La suppression ne se teste qu'ici, en pièce détachée : elle vit sous l'onglet
   de la séance, et le rendu statique n'atteint que l'onglet d'arrivée. */
describe("la suppression d'une séance", () => {
  it("ne s'offre que si l'écran sait supprimer", () => {
    expect(html(<SupprimerSeance onSupprimer={null} />)).toBe("");
    expect(html(<SupprimerSeance onSupprimer={() => {}} />)).toContain("SUPPRIMER CETTE SÉANCE");
  });

  /* Un écran qui s'ouvrirait déjà armé ferait de la confirmation un décor. */
  it("s'ouvre désarmée : rien n'efface au premier appui", () => {
    const vu = html(<SupprimerSeance onSupprimer={() => {}} />);
    expect(vu).not.toContain("EFFACER");
    expect(vu).not.toContain("Sans retour");
  });

  it("l'arrivée de la relecture ne porte aucun geste destructeur", () => {
    const vu = relecture(CATALOGUE[0], null, { onSupprimer: () => {} });
    expect(vu).toContain("CE QUE TU AS FAIT");
    ["SUPPRIMER", "EFFACER"].forEach((m) => expect(vu).not.toContain(m));
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

/* Le sujet de ces trois-là : un AMRAP ne se relit pas qu'en tours. Le bilan
   n'en montrait que le nombre de tours, et un tour entamé puis lâché n'avait
   nulle part où se dire. */
describe("les lignes d'un bloc à tours ouverts", () => {
  const wod = CATALOGUE.find((w) => perfsOf(w.name, 2).some((c) => c.kind === "tours"));
  const champs = perfsOf(wod.name, 2);
  const tours = champs.find((c) => c.kind === "tours");
  const ligne = champs.find((c) => c.de);

  it("nomme chaque exercice du bloc, et se tait sur son total", () => {
    const vu = relecture(wod);
    champs.filter((c) => c.de).forEach((c) => expect(vu).toContain(labelOf(c.ex)));
    expect(vu).toContain("PAR TOUR");
    expect(vu).not.toContain("ATTENDU");
  });

  it("chiffre les lignes dès que les tours sont dits", () => {
    const attendu = attenduDe(ligne, 5);
    const vu = relecture(wod, { perfs: { [tours.k]: 5 } });
    expect(vu).toContain(`ATTENDU ${attendu}`);
    expect(vu).toContain(`value="${attendu}"`);
  });

  it("garde la ligne corrigée plutôt que de la redéduire", () => {
    const vu = relecture(wod, { perfs: { [tours.k]: 5, [ligne.k]: 3 } });
    expect(vu).toContain('value="3"');
    expect(vu).toContain(`ATTENDU ${attenduDe(ligne, 5)}`);
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

/* Le chrono du bloc pubalgie. Il ne se relit nulle part ailleurs : c'est le
   seul écran où la prescription se lit telle qu'on la fait, série par série. */
describe("le chrono du bloc pubalgie", () => {
  const chrono = (plan) => html(
    <Timer initial={newRun({ plan, segment:"workout" })} level={1}
      onPersist={() => {}} onDone={() => {}} />
  );

  it("nomme la série en cours et le côté, jamais la minute", () => {
    const out = chrono([...CORRECTIF, ...TIMERS["EMOM 21"]]);
    expect(out).toContain("PUBALGIE");
    expect(out).toContain("SÉRIE 1 / 4");
    expect(out).toContain("Jambe droite");
    expect(out).not.toContain("MIN 1 / 4");
  });

  it("la seconde phase compte les deux minutes de dead bug", () => {
    const out = chrono([CORRECTIF[1], ...TIMERS["EMOM 21"]]);
    expect(out).toContain("MIN 1 / 2");
    expect(out).toContain("dead bugs");
    expect(out).toContain("1:00");
  });

  /* L'EMOM garde son compte en minutes : le libellé suit la durée de
     l'intervalle, il n'a pas été remplacé partout. */
  it("un EMOM continue de compter en minutes", () => {
    expect(chrono(TIMERS["EMOM 21"])).toContain("MIN 1 / 21");
  });
});

/* Les deux cases d'avant-lancement : l'échauffement et le correctif se
   décident du même geste, au même endroit, et se cochent pareil. */
describe("les cases d'avant-lancement", () => {
  it("dit ce qu'elle coche, et si elle est cochée", () => {
    const coche = html(<Coche on titre="Isométrie" detail="3 min avant la séance" onToggle={() => {}} />);
    expect(coche).toContain("Isométrie");
    expect(coche).toContain("3 min avant la séance");
    expect(coche).toContain("✓");
    expect(html(<Coche on={false} titre="Isométrie" detail="x" onToggle={() => {}} />)).not.toContain("✓");
  });
});
