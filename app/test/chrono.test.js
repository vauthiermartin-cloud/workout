import { describe, it, expect } from "vitest";
import {
  RESUME_WINDOW, beatAt, beatOf, goToPhase, isOver, newBeat, newRun, pauseRun, phaseDur,
  planDur, position, record, resumableKind, resumeRun, suspendRun, verdict,
} from "../src/lib/chrono.js";
import { TIMERS } from "../src/data/timers.js";

const T0 = 1_700_000_000_000;
const PLAN = [
  { t:"down", sec:300, warm:true, label:"Échauffement" },
  { t:"cycle", sec:60, label:"EMOM 21", loops:7, stations:[[{ n:8, t:"burpees" }], [{ n:12, t:"pompes" }], [{ n:3, t:"pull-ups" }]] },
];

const start = (plan = PLAN) => {
  const run = newRun({ plan, segment:"workout" }, T0);
  return { run, beat: newBeat(T0) };
};

/* Le battement tel que le composant le tient : à jour tant que l'app tourne. */
const tickTo = ({ run, beat }, ms) => {
  let cur = { run, beat };
  for (let t = beat.seenAt + 100; t <= T0 + ms; t += 100) {
    const v = verdict(cur.run, cur.beat, t);
    if (v.kind === "complete") cur = { run: goToPhase(cur.run, cur.run.idx + 1, t), beat: newBeat(t) };
    else if (v.kind === "running") cur = { run: cur.run, beat: beatAt(cur.run, t) };
    else return { ...cur, halted: v };
  }
  return cur;
};

describe("durée des phases", () => {
  it("chaque type de phase a une durée, sauf le chrono libre", () => {
    expect(phaseDur(PLAN[0])).toBe(300);
    expect(phaseDur(PLAN[1])).toBe(60 * 3 * 7);
    expect(phaseDur({ t:"tabata", work:20, rest:10, rounds:8 })).toBe(240);
    expect(phaseDur({ t:"up", cap:1500 })).toBeNull();
  });

  it("un plan à chrono libre n'a pas de durée totale", () => {
    expect(planDur(PLAN)).toBe(300 + 1260);
    expect(planDur([{ t:"up", cap:1500 }])).toBeNull();
  });

  /* Le plafond de 25 min est la promesse du nom de l'app. */
  it("aucun plan de chrono ne dépasse 25 minutes", () => {
    Object.entries(TIMERS).forEach(([nom, plan]) => {
      const d = planDur(plan);
      if (d !== null) expect(d, nom).toBeLessThanOrEqual(1500);
    });
  });
});

describe("déroulé normal", () => {
  /* Un run neuf porte déjà son battement : sans ça il se croirait suspendu
     au premier rendu, avant même d'avoir compté une seconde. */
  it("un run neuf démarre en marche, pas en suspension", () => {
    const run = newRun({ plan: PLAN }, T0);
    expect(verdict(run, newBeat(T0), T0).kind).toBe("running");
    expect(verdict(run, beatOf(record(run, newBeat(T0))), T0 + 100).kind).toBe("running");
  });

  it("un enregistrement relu retient l'heure de son dernier battement", () => {
    const rec = record(newRun({ plan: PLAN }, T0), { at: 12, seenAt: T0 + 12_000 });
    expect(beatOf(rec)).toEqual({ at: 12, seenAt: T0 + 12_000 });
  });

  it("la phase avance quand le temps s'est réellement écoulé", () => {
    const s = tickTo(start(), 300_000);
    expect(s.run.idx).toBe(1);
    expect(s.halted).toBeUndefined();
  });

  it("le battement suit l'horloge, pas le nombre de ticks", () => {
    const s = tickTo(start(), 42_000);
    expect(s.run.idx).toBe(0);
    expect(verdict(s.run, s.beat, T0 + 42_000).elapsed).toBeCloseTo(42, 1);
  });

  it("passer la dernière phase termine le plan", () => {
    const { run } = start();
    const fin = goToPhase(run, 2, T0);
    expect(isOver(fin)).toBe(true);
  });
});

describe("suspension", () => {
  /* Le cas qui a coûté une séance : l'écran se verrouille, le temps bondit,
     et l'ancien chrono enchaînait les phases jusqu'à l'écran de fin. */
  it("un bond de temps ne valide aucune phase", () => {
    const s = tickTo(start(), 30_000);
    const v = verdict(s.run, s.beat, T0 + 900_000);
    expect(v.kind).toBe("suspended");
    expect(s.run.idx).toBe(0);
  });

  it("la position retenue est celle du dernier battement, pas le bond", () => {
    const s = tickTo(start(), 30_000);
    const v = verdict(s.run, s.beat, T0 + 900_000);
    expect(v.elapsed).toBeCloseTo(30, 0);
  });

  it("une suspension en fin de phase ne termine pas la séance", () => {
    const plan = [{ t:"down", sec:20, label:"Court" }];
    const s = { run: newRun({ plan }, T0), beat: newBeat(T0) };
    const avance = tickTo(s, 15_000);
    const v = verdict(avance.run, avance.beat, T0 + 600_000);
    expect(v.kind).toBe("suspended");
    expect(isOver(avance.run)).toBe(false);
  });

  it("l'état suspendu tient jusqu'à ce qu'on tranche", () => {
    const s = tickTo(start(), 30_000);
    const gele = suspendRun(s.run, 30);
    expect(verdict(gele, s.beat, T0 + 3_600_000).kind).toBe("suspended");
    expect(verdict(gele, s.beat, T0 + 7_200_000).elapsed).toBe(30);
  });

  it("reprendre repart exactement de la position gelée", () => {
    const gele = suspendRun(tickTo(start(), 30_000).run, 30);
    const t = T0 + 900_000;
    const repris = resumeRun(gele, t);
    expect(repris.paused).toBe(false);
    expect(verdict(repris, { at:30, seenAt:t }, t).elapsed).toBeCloseTo(30, 5);
  });

  it("avancer choisit la phase suivante sans en sauter d'autres", () => {
    const gele = suspendRun(tickTo(start(), 30_000).run, 30);
    const suite = goToPhase(gele, gele.idx + 1, T0 + 900_000);
    expect(suite.idx).toBe(1);
    expect(suite.suspended).toBe(false);
  });
});

describe("pause explicite", () => {
  it("une pause fige le temps et ne déclenche pas de suspension", () => {
    const s = tickTo(start(), 30_000);
    const p = pauseRun(s.run, T0 + 30_000);
    expect(verdict(p, s.beat, T0 + 3_600_000)).toEqual({ kind:"paused", elapsed: p.at });
    expect(p.at).toBeCloseTo(30, 1);
  });

  it("reprendre après pause ne perd pas le temps déjà fait", () => {
    const p = pauseRun(tickTo(start(), 120_000).run, T0 + 120_000);
    const t = T0 + 500_000;
    const r = resumeRun(p, t);
    expect(verdict(r, { at:p.at, seenAt:t }, t + 1000).elapsed).toBeCloseTo(121, 1);
  });
});

describe("reprise au démarrage", () => {
  const rec = (over) => record(
    { ...newRun({ plan: PLAN, segment:"workout", w:"EMOM 21" }, T0 - over * 1000), idx: 1 },
    { at: 42, seenAt: T0 },
  );

  it("une séance récente est reprenable", () => {
    expect(resumableKind(rec(600), T0)).toBe("resume");
  });

  it("au-delà de la fenêtre, elle n'est plus qu'enregistrable", () => {
    expect(resumableKind(rec(RESUME_WINDOW + 60), T0)).toBe("stale");
  });

  it("un plan terminé ou absent ne propose rien", () => {
    expect(resumableKind(null, T0)).toBeNull();
    expect(resumableKind({ plan: [], startedAt: T0 }, T0)).toBeNull();
    expect(resumableKind({ plan: PLAN, idx: 2, startedAt: T0 }, T0)).toBeNull();
  });

  it("l'enregistrement garde la position vivante du battement", () => {
    expect(rec(600).at).toBe(42);
    expect(record(pauseRun(newRun({ plan: PLAN }, T0), T0 + 9000), { at: 0, seenAt: 0 }).at).toBeCloseTo(9, 1);
  });

  /* Le repère qui permet de décider : reprendre ici, ou avancer. */
  it("la position se lit en minutes sur la séance", () => {
    const run = { ...newRun({ plan: PLAN }, T0), idx: 1 };
    expect(position(run, 0)).toEqual({ minute: 1, total: 21, warm: false });
    expect(position(run, 360)).toEqual({ minute: 7, total: 21, warm: false });
    expect(position(newRun({ plan: [{ t:"up", cap:1500 }] }, T0), 10)).toBeNull();
  });

  /* Les 25 minutes promises sont celles de la séance : l'échauffement n'y
     entre pas, ni dans le total ni dans la minute annoncée. */
  it("l'échauffement reste hors du compte", () => {
    expect(position(newRun({ plan: PLAN }, T0), 120)).toEqual({ minute: 0, total: 21, warm: true });
  });

  it("la position ne dépasse jamais le total annoncé", () => {
    const run = { ...newRun({ plan: PLAN }, T0), idx: 1 };
    expect(position(run, 99_999).minute).toBe(21);
  });
});
