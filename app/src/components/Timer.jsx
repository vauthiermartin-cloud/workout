import React, { useState, useEffect, useRef } from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { scaleRep } from "../data/levels.js";
import { mmss } from "../lib/dates.js";
import { beep } from "../lib/audio.js";
import {
  beatOf, goToPhase, newBeat, pauseRun, phaseDur, position, record, resumeRun, suspendRun, verdict,
} from "../lib/chrono.js";

/* Un battement enregistré toutes les 5 s : assez fin pour retrouver sa place
   après un redémarrage, assez rare pour ne pas marteler le stockage. */
const SAVE_EVERY = 5000;

export function Timer({ initial, level, onPersist, onDone }) {
  const [run, setRun] = useState(initial);
  /* Horloge et dernier battement observé vont ensemble : c'est leur écart qui
     révèle une app endormie, donc ils changent d'un seul mouvement. */
  const [pulse, setPulse] = useState(() => ({ now: Date.now(), beat: beatOf(initial) }));
  const [confirmClose, setConfirmClose] = useState(false);
  const pulseRef = useRef(pulse);
  const beepRef = useRef(-1);

  const phases = run.plan;
  const ph = phases[run.idx];
  const v = verdict(run, pulse.beat, pulse.now);
  const elapsed = v.elapsed;
  const suspended = v.kind === "suspended";
  const running = v.kind === "running" || v.kind === "complete";

  useEffect(() => { pulseRef.current = pulse; }, [pulse]);

  /* Écran allumé pendant la séance */
  useEffect(() => {
    let lock = null;
    const req = () => {
      try {
        if (navigator.wakeLock) navigator.wakeLock.request("screen").then((l) => { lock = l; }).catch(() => {});
      } catch {}
    };
    req();
    /* Au retour au premier plan, relire l'horloge tout de suite : le battement
       peut être mort et c'est là que la suspension doit être détectée. */
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      req();
      setPulse((p) => ({ ...p, now: Date.now() }));
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      try { if (lock) lock.release(); } catch {}
    };
  }, []);

  /* Battement : on lit l'horloge plutôt que de compter les ticks, pour rester
     juste même si le téléphone ralentit l'onglet. Le battement n'avance que
     tant que la phase tourne pour de bon : c'est lui qui garde la position à
     laquelle il faudra reprendre. */
  useEffect(() => {
    if (run.paused || run.suspended) return;
    const id = setInterval(() => setPulse((p) => {
      const now = Date.now();
      const cur = verdict(run, p.beat, now);
      return { now, beat: cur.kind === "running" ? { at: cur.elapsed, seenAt: now } : p.beat };
    }), 100);
    return () => clearInterval(id);
  }, [run]);

  /* Écrit la position en cours pour qu'un redémarrage la retrouve. */
  useEffect(() => {
    if (run.paused || run.suspended) return;
    const id = setInterval(() => onPersist(record(run, pulseRef.current.beat)), SAVE_EVERY);
    return () => clearInterval(id);
  }, [run]);

  const commit = (next, beat) => {
    setRun(next);
    setPulse({ now: Date.now(), beat });
    onPersist(record(next, beat));
  };

  const goTo = (i) => {
    if (i >= phases.length) { onDone({ aborted: false }); return; }
    const t = Date.now();
    beepRef.current = -1;
    commit(goToPhase(run, i, t), newBeat(t));
  };

  const toggle = () => {
    const t = Date.now();
    beepRef.current = -1;
    if (run.paused || run.suspended) {
      const next = resumeRun(run, t);
      commit(next, { at: next.at, seenAt: t });
    } else {
      commit(pauseRun(run, t), pulse.beat);
    }
  };

  /* Une phase dépassée n'est validée que si le temps s'est écoulé pour de vrai.
     Sinon l'app a dormi : on gèle, on ne valide rien, on demande. */
  useEffect(() => {
    if (v.kind === "complete") { beep(1320, 260); goTo(run.idx + 1); }
    else if (v.kind === "suspended" && !run.suspended) {
      const next = suspendRun(run, v.elapsed);
      setRun(next);
      onPersist(record(next, pulse.beat));
    }
  }, [v.kind]);

  const durs = phases.map(phaseDur);
  const determine = durs.every((d) => d !== null);
  const totalSec = determine ? durs.reduce((a, b) => a + b, 0) : null;

  /* État courant de la phase */
  let big = "", label = ph.label, sub = ph.sub || "", progress = "", station = null, next = null;
  let isRest = ph.t === "rest", isWork = true, remaining = null;
  let segTotal = 0, segCur = 0, segLabel = "";

  if (ph.t === "cycle") {
    const total = ph.stations.length * (ph.loops || 1);
    const k = Math.min(Math.floor(elapsed / ph.sec), total - 1);
    remaining = ph.sec - (elapsed % ph.sec);
    big = mmss(remaining);
    progress = `MIN ${k + 1} / ${total}`;
    station = ph.stations[k % ph.stations.length];
    next = k + 1 < total ? ph.stations[(k + 1) % ph.stations.length] : null;
    /* Un bloc = un cycle complet de stations, sauf indication contraire */
    let bloc = ph.bloc || ph.stations.length;
    if (bloc < 2) bloc = total;
    segTotal = bloc;
    segCur = k % bloc;
    const nbBlocs = Math.ceil(total / bloc);
    if (nbBlocs > 1) segLabel = `BLOC ${Math.floor(k / bloc) + 1} / ${nbBlocs}`;
  } else if (ph.t === "tabata") {
    const cyc = ph.work + ph.rest;
    const i = Math.min(Math.floor(elapsed / cyc), ph.rounds - 1);
    const inCycle = elapsed % cyc;
    isWork = inCycle < ph.work;
    isRest = !isWork;
    remaining = isWork ? ph.work - inCycle : cyc - inCycle;
    big = mmss(remaining);
    progress = `ROUND ${i + 1} / ${ph.rounds}`;
    label = isWork ? ph.label : "Repos";
    segTotal = ph.rounds;
    segCur = i;
  } else if (ph.t === "down" || ph.t === "rest") {
    remaining = ph.sec - elapsed;
    big = mmss(remaining);
    progress = `SUR ${mmss(ph.sec)}`;
  } else if (ph.t === "up") {
    big = mmss(elapsed);
    remaining = ph.cap - elapsed;
    progress = `PLAFOND ${mmss(ph.cap)}`;
  }

  const faits = determine ? durs.slice(0, run.idx).reduce((a, b) => a + b, 0) : 0;
  const pct = determine ? Math.min(100, Math.round(((faits + Math.min(elapsed, durs[run.idx])) / totalSec) * 100)) : null;

  /* Jauge de séance : un segment par phase, large comme sa durée. Elle porte à
     elle seule les trois repères qu'il fallait lire séparément — où j'en suis,
     dans quelle phase, et combien il en reste. Essoufflé, téléphone par terre,
     un pourcentage en petit ne se lit pas.

     Sur un plan dont une phase dépend du pratiquant, la progression réelle est
     inconnue : largeurs égales, phase courante soulignée, aucun remplissage.
     On garde la structure et on ne prétend pas mesurer ce qu'on ignore. */
  const gauge = phases.map((p, i) => ({
    grow: determine ? durs[i] : 1,
    done: i < run.idx,
    fill: i < run.idx ? 1
      : i > run.idx || !determine ? 0
      : Math.min(elapsed, durs[i]) / durs[i],
    marque: !determine && i === run.idx,
  }));

  /* Bips : trois avant la bascule, un long à la bascule */
  useEffect(() => {
    if (!running || remaining === null) return;
    const s = Math.ceil(remaining);
    if (s <= 3 && s >= 1 && beepRef.current !== s) { beepRef.current = s; beep(880, 90); }
  }, [elapsed, running, remaining]);

  const accent = isRest ? C.ember : C.lime;
  const pos = position(run, elapsed);
  const last = run.idx + 1 >= phases.length;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:C.ink, display:"flex",
      flexDirection:"column", padding:"max(20px, env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom))" }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash }}>
        <span>PHASE {run.idx + 1} / {phases.length}</span>
        <button onClick={() => setConfirmClose(true)} style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash }}>FERMER ✕</button>
      </div>

      {pct !== null && (
        <div style={{ fontFamily:MONO, fontSize:13, letterSpacing:".06em", color:C.ash,
          textAlign:"right", marginTop:10, flexShrink:0, fontVariantNumeric:"tabular-nums" }}>
          {pct} %
        </div>
      )}

      {/* `flexShrink: 0` n'est pas cosmétique : dans cette colonne, un élément
          de 7 px est le premier que le navigateur écrase quand le contenu
          déborde, et la jauge disparaissait entièrement. */}
      <div style={{ display:"flex", gap:2, height:7, marginTop:8, flexShrink:0 }}>
        {gauge.map((g, i) => (
          <div key={i} style={{ flexGrow:g.grow, flexBasis:0, background:C.line, borderRadius:2,
            overflow:"hidden", boxShadow: g.marque ? `inset 0 -2px 0 ${accent}` : undefined }}>
            <div style={{ height:"100%", width:`${g.fill * 100}%`,
              background: g.done ? C.bone : accent, transition:"width .3s linear" }} />
          </div>
        ))}
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center" }}>
        <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:".16em", color:accent, marginBottom:6 }}>
          {label.toUpperCase()}
        </div>
        <div style={{ fontFamily:DISPLAY, fontSize:"clamp(76px, 26vw, 132px)", lineHeight:.9,
          color: running ? C.bone : C.ash, fontVariantNumeric:"tabular-nums" }}>
          {big}
        </div>
        <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash, marginTop:8 }}>
          {progress}{!running ? " · EN PAUSE" : ""}
        </div>

        {segTotal > 1 && (
          <div style={{ width:"100%", maxWidth:300, marginTop:16 }}>
            {segLabel && (
              <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:".16em", color:accent, marginBottom:8 }}>
                {segLabel}
              </div>
            )}
            <div style={{ display:"flex", gap:4, alignItems:"center", height:10 }}>
              {Array.from({ length: segTotal }).map((_, i) => (
                <div key={i} style={{ flex:1, borderRadius:2,
                  height: i === segCur ? 10 : 4,
                  background: i < segCur ? C.bone : i === segCur ? accent : C.line }} />
              ))}
            </div>
          </div>
        )}

        {station && (
          <div style={{ marginTop:28 }}>
            {station.map((it, j) => (
              <div key={j} style={{ fontFamily:DISPLAY, fontSize:28, lineHeight:1.2 }}>
                {it.txt ? it.txt : (
                  <React.Fragment>
                    <span style={{ color:accent }}>{scaleRep(it.n, level)}</span> {it.t}
                  </React.Fragment>
                )}
              </div>
            ))}
          </div>
        )}
        {!station && ph.list && (
          <div style={{ marginTop:26 }}>
            {sub && (
              <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash, marginBottom:10 }}>
                {sub.toUpperCase()}
              </div>
            )}
            {ph.list.map((it, j) => (
              <div key={j} style={{ fontFamily:DISPLAY, fontSize:23, lineHeight:1.3 }}>
                {it.txt ? it.txt : (
                  <React.Fragment>
                    <span style={{ color:accent }}>{scaleRep(it.n, level)}</span> {it.t}
                  </React.Fragment>
                )}
              </div>
            ))}
          </div>
        )}
        {!station && !ph.list && sub && (
          <div style={{ marginTop:24, fontFamily:DISPLAY, fontSize:24, color:C.bone }}>{sub}</div>
        )}
        {next && (
          <div style={{ marginTop:18, fontFamily:MONO, fontSize:10, letterSpacing:".1em", color:C.ash }}>
            ENSUITE · {next.map((it) => it.txt ? it.txt : `${scaleRep(it.n, level)} ${it.t}`).join(" · ")}
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={toggle} style={{ flex:1, padding:"18px 0", background: running ? "transparent" : accent,
          border: running ? `1px solid ${C.line}` : "none", color: running ? C.bone : C.ink,
          fontFamily:DISPLAY, fontSize:17, letterSpacing:".04em", borderRadius:2 }}>
          {running ? "PAUSE" : "REPRENDRE"}
        </button>
        <button onClick={() => goTo(run.idx + 1)} style={{ flex:1, padding:"18px 0", border:`1px solid ${C.line}`,
          color:C.bone, fontFamily:DISPLAY, fontSize:17, letterSpacing:".04em", borderRadius:2 }}>
          {last ? "TERMINER" : "PASSER"}
        </button>
      </div>

      {/* L'app a dormi : rien n'est validé, c'est toi qui décides. */}
      {suspended && !confirmClose && (
        <div style={{ position:"absolute", inset:0, background:"rgba(11,11,12,.96)", display:"flex",
          flexDirection:"column", justifyContent:"center",
          padding:"max(28px, env(safe-area-inset-top)) 24px calc(28px + env(safe-area-inset-bottom))" }}>
          <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".16em", color:C.ember, marginBottom:10 }}>
            CHRONO INTERROMPU
          </div>
          <div style={{ fontFamily:DISPLAY, fontSize:38, lineHeight:.95, marginBottom:12 }}>
            {!pos ? "TU ÉTAIS EN PLEINE SÉANCE"
              : pos.warm ? "TU ÉTAIS DANS L'ÉCHAUFFEMENT"
              : `TU ÉTAIS À LA MINUTE ${pos.minute} SUR ${pos.total}`}
          </div>
          <p style={{ fontSize:13.5, color:C.ash, lineHeight:1.55, margin:"0 0 26px" }}>
            L'écran s'est verrouillé ou l'app est passée en arrière-plan. Rien n'a été validé :
            {ph.label ? ` ${ph.label.toLowerCase()}` : " la phase en cours"} t'attend à {mmss(elapsed)}.
          </p>
          <button onClick={toggle} style={{ width:"100%", padding:"18px 0", marginBottom:8, background:C.lime,
            color:C.ink, fontFamily:DISPLAY, fontSize:19, letterSpacing:".04em", borderRadius:2 }}>
            REPRENDRE ICI
          </button>
          <button onClick={() => goTo(run.idx + 1)} style={{ width:"100%", padding:"16px 0",
            border:`1px solid ${C.line}`, color:C.bone, fontFamily:DISPLAY, fontSize:16,
            letterSpacing:".04em", borderRadius:2 }}>
            {last ? "TERMINER LA SÉANCE" : "PASSER À LA PHASE SUIVANTE"}
          </button>
        </div>
      )}

      {confirmClose && (
        <div style={{ position:"absolute", inset:0, background:"rgba(11,11,12,.96)", display:"flex",
          flexDirection:"column", justifyContent:"center",
          padding:"max(28px, env(safe-area-inset-top)) 24px calc(28px + env(safe-area-inset-bottom))" }}>
          <div style={{ fontFamily:DISPLAY, fontSize:34, lineHeight:.95, marginBottom:12 }}>
            ARRÊTER LE CHRONO ?
          </div>
          <p style={{ fontSize:13.5, color:C.ash, lineHeight:1.55, margin:"0 0 26px" }}>
            {!pos ? "" : pos.warm ? "Tu es encore dans l'échauffement. "
              : `Tu es à la minute ${pos.minute} sur ${pos.total}. `}
            Le chrono s'arrête et l'écran de bilan s'ouvre.
          </p>
          <button onClick={() => setConfirmClose(false)} style={{ width:"100%", padding:"18px 0", marginBottom:8,
            background:C.lime, color:C.ink, fontFamily:DISPLAY, fontSize:19, letterSpacing:".04em", borderRadius:2 }}>
            CONTINUER LA SÉANCE
          </button>
          {/* Arrêter en route n'est pas terminer : l'écran de bilan a besoin de
              la distinction pour ne pas demander un ressenti sur une séance
              incomplète. */}
          <button onClick={() => onDone({ aborted: true })} style={{ width:"100%", padding:"16px 0",
            border:`1px solid ${C.ember}`, color:C.ember, fontFamily:DISPLAY, fontSize:16,
            letterSpacing:".04em", borderRadius:2 }}>
            ARRÊTER
          </button>
        </div>
      )}
    </div>
  );
}
