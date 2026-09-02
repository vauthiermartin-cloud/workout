import React, { useState, useEffect, useRef } from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { scaleRep } from "../data/levels.js";
import { mmss } from "../lib/dates.js";
import { beep } from "../lib/audio.js";

export function Timer({ phases, level, onDone }) {
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const startRef = useRef(Date.now());
  const pausedRef = useRef(0);
  const beepRef = useRef(-1);

  const ph = phases[idx];

  /* Écran allumé pendant la séance */
  useEffect(() => {
    let lock = null;
    const req = () => {
      try {
        if (navigator.wakeLock) navigator.wakeLock.request("screen").then((l) => { lock = l; }).catch(() => {});
      } catch {}
    };
    req();
    const onVis = () => { if (document.visibilityState === "visible") req(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      try { if (lock) lock.release(); } catch {}
    };
  }, []);

  /* Battement : on lit l'horloge plutôt que de compter les ticks,
     pour rester juste même si le téléphone met l'onglet en veille. */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100);
    return () => clearInterval(id);
  }, [running, idx]);

  const goTo = (i) => {
    if (i >= phases.length) { onDone(); return; }
    setIdx(i); setElapsed(0); beepRef.current = -1;
    startRef.current = Date.now(); pausedRef.current = 0;
    setRunning(true);
  };

  const toggle = () => {
    if (running) { pausedRef.current = elapsed; setRunning(false); }
    else { startRef.current = Date.now() - pausedRef.current * 1000; setRunning(true); }
  };

  /* Durée d'une phase, ou null si elle dépend de toi (chrono qui monte) */
  const phaseDur = (p) =>
    p.t === "cycle" ? p.sec * p.stations.length * (p.loops || 1)
    : p.t === "tabata" ? (p.work + p.rest) * p.rounds
    : p.t === "up" ? null
    : p.sec;

  const durs = phases.map(phaseDur);
  const determine = durs.every((d) => d !== null);
  const totalSec = determine ? durs.reduce((a, b) => a + b, 0) : null;

  /* État courant de la phase */
  let big = "", label = ph.label, sub = ph.sub || "", progress = "", station = null, next = null;
  let isRest = ph.t === "rest", isWork = true, remaining = null, done = false;
  let segTotal = 0, segCur = 0, segLabel = "";

  if (ph.t === "cycle") {
    const total = ph.stations.length * (ph.loops || 1);
    const i = Math.floor(elapsed / ph.sec);
    if (i >= total) done = true;
    const k = Math.min(i, total - 1);
    remaining = ph.sec - (elapsed % ph.sec);
    big = mmss(remaining);
    progress = `MIN ${Math.min(i + 1, total)} / ${total}`;
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
    const i = Math.floor(elapsed / cyc);
    if (i >= ph.rounds) done = true;
    const inCycle = elapsed % cyc;
    isWork = inCycle < ph.work;
    isRest = !isWork;
    remaining = isWork ? ph.work - inCycle : cyc - inCycle;
    big = mmss(remaining);
    progress = `ROUND ${Math.min(i + 1, ph.rounds)} / ${ph.rounds}`;
    label = isWork ? ph.label : "Repos";
    segTotal = ph.rounds;
    segCur = Math.min(i, ph.rounds - 1);
  } else if (ph.t === "down" || ph.t === "rest") {
    remaining = ph.sec - elapsed;
    if (remaining <= 0) done = true;
    big = mmss(remaining);
    progress = `SUR ${mmss(ph.sec)}`;
  } else if (ph.t === "up") {
    big = mmss(elapsed);
    remaining = ph.cap - elapsed;
    if (remaining <= 0) done = true;
    progress = `PLAFOND ${mmss(ph.cap)}`;
  }

  const faits = determine ? durs.slice(0, idx).reduce((a, b) => a + b, 0) : 0;
  const pct = determine ? Math.min(100, Math.round(((faits + Math.min(elapsed, durs[idx])) / totalSec) * 100)) : null;

  /* Bips : trois avant la bascule, un long à la bascule */
  useEffect(() => {
    if (!running || remaining === null) return;
    const s = Math.ceil(remaining);
    if (s <= 3 && s >= 1 && beepRef.current !== s) { beepRef.current = s; beep(880, 90); }
  }, [elapsed, running, remaining]);

  useEffect(() => {
    if (done) { beep(1320, 260); goTo(idx + 1); }
  }, [done]);

  const accent = isRest ? C.ember : C.lime;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:C.ink, display:"flex",
      flexDirection:"column", padding:"max(20px, env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom))" }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash }}>
        <span>PHASE {idx + 1} / {phases.length}{pct !== null ? ` · ${pct} %` : ""}</span>
        <button onClick={onDone} style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash }}>FERMER ✕</button>
      </div>

      {pct !== null && (
        <div style={{ height:3, background:C.line, borderRadius:2, marginTop:10, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:accent, transition:"width .3s linear" }} />
        </div>
      )}

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
        <button onClick={() => goTo(idx + 1)} style={{ flex:1, padding:"18px 0", border:`1px solid ${C.line}`,
          color:C.bone, fontFamily:DISPLAY, fontSize:17, letterSpacing:".04em", borderRadius:2 }}>
          {idx + 1 >= phases.length ? "TERMINER" : "PASSER"}
        </button>
      </div>
    </div>
  );
}
