import { describe, it, expect } from "vitest";
import { WORKOUTS, WORKOUT_BY_NAME } from "../src/data/workouts.js";
import { FINISHERS } from "../src/data/finishers.js";
import { TIMERS } from "../src/data/timers.js";
import { CORRECTIF, CORRECTIF_HEBDO, JOURS_CORRECTIF } from "../src/data/correctif.js";
import { EXERCISES, UNITS, PER_SIDE, estExclusif, idOfSource } from "../src/data/exercises.js";
import { EVITE } from "../src/data/douleurs.js";
import { TIRAGE_EQUIVALENT } from "../src/data/equivalences.js";
import { CHAINS, chainOf } from "../src/data/chains.js";
import { PATTERNS, patternsOfWorkout, patternsOfTimer } from "../src/data/patterns.js";

const allWorkouts = Object.values(WORKOUTS).flat();
const allFinishers = Object.values(FINISHERS).flat();

/* Toutes les lignes de travail citées quelque part, fiches et chronos
   confondus. On collecte les lignes entières et non les seuls identifiants :
   plusieurs contrôles ci-dessous portent sur la quantité.

   Le correctif en fait partie bien qu'aucune séance ne le prescrive : c'est du
   travail réellement prescrit, simplement par une case à cocher plutôt que par
   le catalogue. Sans lui ici, son exercice passerait pour une entrée morte. */
function workLines() {
  const lines = [];
  const item = (it) => { if (it.ex !== undefined) lines.push(it); };
  [...allWorkouts, ...allFinishers].forEach((w) => w.blocks.forEach((b) => b.items.forEach(item)));
  [...Object.values(TIMERS).flat(), ...CORRECTIF].forEach((p) => {
    if (p.stations) p.stations.forEach((s) => s.forEach(item));
    if (p.list) p.list.forEach(item);
  });
  return lines;
}

const lines = workLines();
const idsUtilises = new Set(lines.map((it) => it.ex));

describe("bibliothèque", () => {
  it("aucune séance sans plan de chrono", () => {
    const sans = [...allWorkouts, ...allFinishers].map((w) => w.name).filter((n) => !TIMERS[n]);
    expect(sans).toEqual([]);
  });

  it("aucun chrono orphelin", () => {
    const noms = new Set([...allWorkouts, ...allFinishers].map((w) => w.name));
    expect(Object.keys(TIMERS).filter((n) => !noms.has(n))).toEqual([]);
  });

  /* Le bouton de droite du chrono dit « TERMINER » sur la dernière phase. Un
     plan qui finirait par un repos lui ferait dire « travail fini » alors que
     le travail l'est déjà depuis deux minutes — et ferait finir la séance sur
     un écran de récupération. Le libellé conditionnel du chrono (voir
     `sortie` dans `lib/chrono.js`) s'appuie sur cette garantie. */
  it("aucun plan de chrono ne se termine par un repos", () => {
    const finitSurRepos = Object.entries(TIMERS)
      .filter(([, plan]) => plan[plan.length - 1].t === "rest")
      .map(([nom]) => nom);
    expect(finitSurRepos).toEqual([]);
  });

  it("noms de séances uniques", () => {
    expect(Object.keys(WORKOUT_BY_NAME).length).toBe(allWorkouts.length);
  });

  /* Ce contrôle passait à vide après la bascule vers les identifiants : il
     cherchait un champ qui n'existait plus, ne trouvait aucun exercice, et
     déclarait donc qu'aucun n'était mal classé. D'où ce garde-fou. */
  it("il y a bien des lignes de travail à contrôler", () => {
    expect(lines.length).toBeGreaterThan(200);
  });

  it("aucun exercice inconnu de la bibliothèque", () => {
    expect([...idsUtilises].filter((id) => !EXERCISES[id])).toEqual([]);
  });

  /* Une entrée que plus aucune séance n'utilise signale soit une faute de
     frappe, soit un exercice retiré sans nettoyer derrière.

     Les variantes de régression sont la seule exception, et elle est bornée :
     aucune séance ne les prescrit, on ne les atteint que par une chaîne. Une
     variante hors de toute chaîne, elle, est bien morte — personne ne peut
     plus la rencontrer.

     Les exclusifs d'Athlean X sont hors du périmètre de ce contrôle : ce sont
     les séquences d'Athlean X qui les atteindront, pas le catalogue. Le bloc
     « Athlean X dans la bibliothèque » plus bas tient qu'ils y restent. */
  it("aucune entrée morte dans la bibliothèque", () => {
    const atteignable = (id) => idsUtilises.has(id) || chainOf(id) !== null || estExclusif(id);
    expect(Object.keys(EXERCISES).filter((id) => !atteignable(id))).toEqual([]);
  });

  /* Une chaîne qui ne passerait par aucun exercice prescrit ne serait jamais
     proposée : la substitution part toujours de ce qu'une séance demande. */
  it("chaque chaîne passe par un exercice que le catalogue prescrit", () => {
    const orphelines = CHAINS.filter((c) => !c.some((id) => idsUtilises.has(id)));
    expect(orphelines).toEqual([]);
  });

  /* La fiche et le chrono décrivent la même séance, et deux fichiers la
     portent. Les quantités peuvent légitimement différer de forme — un
     escalier montre un palier par ligne sur la fiche et le déplie en cinq
     minutes dans le chrono — donc le contrôle porte sur les exercices cités
     et non sur les nombres.

     « Gainage descendant » est la seule exception, et elle est antérieure :
     son chrono porte son contenu dans des libellés de phase au lieu de lignes
     typées, donc rien ne le compte. Inscrite ici pour qu'elle se voie au lieu
     de se confondre avec un oubli. */
  const SANS_LIGNES = ["Gainage descendant"];

  it("fiche et chrono citent les mêmes exercices", () => {
    const ecarts = [];
    [...allWorkouts, ...allFinishers].forEach((w) => {
      if (SANS_LIGNES.includes(w.name)) return;
      const ids = (lignes) => [...new Set(lignes.filter((it) => it.ex !== undefined).map((it) => it.ex))].sort();
      const fiche = ids(w.blocks.flatMap((b) => b.items));
      const chrono = ids((TIMERS[w.name] || []).flatMap((p) => (p.stations ? p.stations.flat() : p.list || [])));
      if (fiche.join() !== chrono.join()) ecarts.push({ name: w.name, fiche, chrono });
    });
    expect(ecarts).toEqual([]);
  });

  it("fiche et chrono couvrent les mêmes qualités", () => {
    const ecarts = [];
    allWorkouts.forEach((w) => {
      const fiche = patternsOfWorkout(w).sort();
      const chrono = patternsOfTimer(TIMERS[w.name]).sort();
      if (fiche.join() !== chrono.join()) ecarts.push({ name: w.name, fiche, chrono });
    });
    expect(ecarts).toEqual([]);
  });

  /* Pronation et supination dans la même séance ne se travaillent pas : elles
     se partagent la fatigue. Les quatre chin-ups qui suivaient quatre pull-ups
     se faisaient sur les avant-bras des premiers, donc ni l'une ni l'autre
     prise n'était chargée franchement. Une séance réunit son tirage sur une
     seule prise.

     Le contrôle porte sur les **familles** et non sur les identifiants, parce
     que la bibliothèque (étape 9) substituera des crans : `pullupsElastique`
     avec `chinupsNegatifs` serait exactement la même faute, et un test écrit
     sur les deux seuls noms nus ne l'aurait pas vue. */
  const familleDe = (id) => {
    const c = chainOf(id);
    return c ? c[c.length - 1] : id;
  };

  it("aucune séance ne mélange pronation et supination à la barre", () => {
    const fautives = [];
    [...allWorkouts, ...allFinishers].forEach((w) => {
      const ids = new Set();
      w.blocks.forEach((b) => b.items.forEach((it) => { if (it.ex !== undefined) ids.add(it.ex); }));
      (TIMERS[w.name] || []).forEach((p) => {
        const lignes = p.stations ? p.stations.flat() : p.list || [];
        lignes.forEach((it) => { if (it && it.ex !== undefined) ids.add(it.ex); });
      });
      const familles = new Set([...ids].map(familleDe));
      if (familles.has("pullups") && familles.has("chinups")) fautives.push(w.name);
    });
    expect(fautives).toEqual([]);
  });
});

/* La prescription du bloc pubalgie est chiffrée dans le ticket : 4 x 45 s
   d'isométrie en alternant les jambes, puis 2 x 1 min de dead bug. Elle ne se
   relit nulle part ailleurs — ni dans une séance, ni dans un plan de chrono —
   donc elle se tient ici. */
describe("le bloc pubalgie", () => {
  const [iso, db] = CORRECTIF;

  it("tient quatre maintiens de 45 secondes, puis deux minutes", () => {
    expect(iso.stations.length * (iso.loops || 1)).toBe(4);
    expect(iso.sec).toBe(45);
    expect(db.stations.length * (db.loops || 1)).toBe(2);
    expect(db.sec).toBe(60);
  });

  it("l'isométrie alterne les jambes, deux séries chacune", () => {
    const tenues = iso.stations.flat().filter((it) => it.ex !== undefined);
    expect(tenues.map((it) => it.n)).toEqual([45, 45, 45, 45]);
    expect(new Set(tenues.map((it) => it.ex))).toEqual(new Set(["flexionHancheIso"]));
    expect(EXERCISES.flexionHancheIso.unit).toBe("secondes");
    expect(iso.stations.map((st) => st.find((it) => it.txt).txt))
      .toEqual(["Jambe droite", "Jambe gauche", "Jambe droite", "Jambe gauche"]);
  });

  /* Le dead bug se prescrit ici au temps, donc en note : la bibliothèque le
     compte en répétitions et ne change pas d'unité pour un bloc. Son libellé
     se lit quand même dans la table, sinon un renommage le laisserait
     derrière. */
  it("le dead bug s'y nomme comme dans la bibliothèque", () => {
    expect(db.stations.every((st) => st.some((it) => it.txt === EXERCISES.deadBugs.fr))).toBe(true);
  });

  /* L'isométrie se joue à part, jamais dans une séance : l'y retrouver
     voudrait dire que quelqu'un l'a prescrite deux fois, et le cap de
     25 minutes tomberait sans que rien ne le dise. */
  it("aucune séance ne prescrit l'isométrie", () => {
    const dedans = [...allWorkouts, ...allFinishers].filter((w) =>
      w.blocks.some((b) => b.items.some((it) => it.ex === "flexionHancheIso")));
    expect(dedans.map((w) => w.name)).toEqual([]);
    expect(Object.entries(TIMERS).filter(([, plan]) => plan.some((p) =>
      (p.stations ? p.stations.flat() : p.list || []).some((it) => it.ex === "flexionHancheIso"),
    )).map(([n]) => n)).toEqual([]);
  });

  /* Le dead bug, lui, doit aussi vivre dans les séances : la case peut rester
     décochée des semaines entières. La garantie est dans le contenu et non
     dans le tirage — tout le jeudi et tout le vendredi en portent une ligne,
     donc la semaine en voit deux quoi qu'il arrive. Une séance qui arriverait
     sans, ou un jour retiré de la liste, ferait tomber la garantie en
     silence. */
  it("toutes les séances des jours correctifs prescrivent le dead bug", () => {
    const sans = [];
    JOURS_CORRECTIF.forEach((jour) => {
      WORKOUTS[jour].forEach((w) => {
        const fiche = w.blocks.some((b) => b.items.some((it) => it.ex === CORRECTIF_HEBDO));
        const chrono = (TIMERS[w.name] || []).some((p) =>
          (p.stations ? p.stations.flat() : p.list || []).some((it) => it.ex === CORRECTIF_HEBDO));
        if (!fiche || !chrono) sans.push(w.name);
      });
    });
    expect(sans).toEqual([]);
  });
});

describe("les exercices sont des entités", () => {
  it("chacun a un libellé, une unité connue et au moins un schéma moteur", () => {
    const connus = new Set(PATTERNS.map((p) => p.id));
    const fautifs = Object.entries(EXERCISES).filter(([, ex]) =>
      !ex.fr || !UNITS.includes(ex.unit) || !ex.patterns.length
      || ex.patterns.some((p) => !connus.has(p)));
    expect(fautifs.map(([id]) => id)).toEqual([]);
  });

  it("la latéralité, quand elle est déclarée, prend une valeur connue", () => {
    const fautifs = Object.entries(EXERCISES)
      .filter(([, ex]) => ex.perSide !== undefined && !PER_SIDE.includes(ex.perSide));
    expect(fautifs.map(([id]) => id)).toEqual([]);
  });

  /* Deux libellés identiques pour deux identifiants seraient indistinguables à
     l'écran. C'est ce qui est arrivé à « burpee » et « burpees », comptés comme
     deux exercices distincts. */
  it("aucun libellé en double", () => {
    const frs = Object.values(EXERCISES).map((ex) => ex.fr);
    expect(frs.length).toBe(new Set(frs).size);
  });

  /* Un total « réparti » impair ne se divise pas en deux côtés égaux. Au
     volume de base, la donnée écrite à la main doit être paire ; les
     coefficients de mode, eux, peuvent produire un impair et l'affichage
     bascule alors sur « en alternant ». */
  it("les totaux répartis entre deux côtés sont pairs au volume de base", () => {
    const impairs = lines
      .filter((it) => EXERCISES[it.ex] && EXERCISES[it.ex].perSide === "reparti" && it.n % 2 !== 0)
      .map((it) => `${it.n} ${it.ex}`);
    expect([...new Set(impairs)]).toEqual([]);
  });
});

/* F-12.5. Les exercices d'Athlean X entrent dans la même table que les autres,
   sans doublon et sans rien changer au moteur classique. */
describe("Athlean X dans la bibliothèque", () => {
  /* Les trente-deux identifiants de `perfect_home_workout_spec_v2.md` §4 :
     groupes 1 à 5 à trois exercices, un correctif en groupe 6. */
  const SPEC = ["A", "B"].flatMap((w) => [
    ...[1, 2, 3, 4, 5].flatMap((g) => [1, 2, 3].map((i) => `${w}-${g}.${i}`)),
    `${w}-6.1`,
  ]);
  const portes = Object.entries(EXERCISES).filter(([, ex]) => ex.sourceIds);
  const exclusifs = Object.keys(EXERCISES).filter(estExclusif);

  it("chaque identifiant du spec mène à un exercice, et un seul", () => {
    expect(SPEC.length).toBe(32);
    expect(SPEC.filter((sid) => idOfSource(sid) === null)).toEqual([]);
    const tous = portes.flatMap(([, ex]) => ex.sourceIds);
    expect(tous.length).toBe(new Set(tous).size);
    expect([...tous].sort()).toEqual([...SPEC].sort());
  });

  /* Les tirages horizontaux sont la seule entité citée deux fois par le spec. */
  it("vingt créations, douze identifiants fusionnés sur onze exercices existants", () => {
    expect(exclusifs.length).toBe(20);
    const fusions = portes.filter(([id]) => !estExclusif(id));
    expect(fusions.length).toBe(11);
    expect(fusions.flatMap(([, ex]) => ex.sourceIds).length).toBe(12);
    expect(EXERCISES.tiragesHorizontaux.sourceIds).toEqual(["A-4.3", "B-4.2"]);
  });

  it("aucun nom anglais en double : rien n'existe deux fois sous deux ids", () => {
    const ens = portes.map(([, ex]) => ex.nameEn);
    expect(ens.every(Boolean)).toBe(true);
    expect(ens.length).toBe(new Set(ens).size);
  });

  it("une création porte la source et l'exclusivité ; une fusion, ni l'une ni l'autre", () => {
    const creationsMalFormees = exclusifs.filter((id) =>
      EXERCISES[id].source !== "athleanX" || EXERCISES[id].exclusiveTo.join() !== "athleanX");
    expect(creationsMalFormees).toEqual([]);
    const fusionsMarquees = portes
      .filter(([id, ex]) => !estExclusif(id) && ex.source !== undefined)
      .map(([id]) => id);
    expect(fusionsMarquees).toEqual([]);
  });

  /* Le cœur du ticket : un exclusif n'existe pas pour le moteur classique.
     Aucune séance ni finisher ni chrono ne le cite (donc ni la génération,
     ni pickVariant, ni la couverture ne le voient), aucune chaîne, aucune
     table de douleur, aucun coefficient de ratio. */
  it("un exclusif n'apparaît nulle part dans le moteur classique", () => {
    const evite = Object.values(EVITE).flatMap((t) => [...Object.keys(t), ...Object.values(t)]);
    const vus = exclusifs.filter((id) =>
      idsUtilises.has(id) || chainOf(id) !== null || evite.includes(id)
      || Object.prototype.hasOwnProperty.call(TIRAGE_EQUIVALENT, id));
    expect(vus).toEqual([]);
  });

  /* L'inverse : une fusion reste ce qu'elle était. Les onze exercices
     existants restent atteignables par le catalogue ou une chaîne. */
  it("une fusion reste visible du moteur classique", () => {
    const perdus = portes
      .filter(([id]) => !estExclusif(id))
      .filter(([id]) => !idsUtilises.has(id) && chainOf(id) === null)
      .map(([id]) => id);
    expect(perdus).toEqual([]);
  });
});
