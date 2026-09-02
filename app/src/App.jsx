import React, { useState, useEffect } from "react";
import { C, DISPLAY, MONO } from "./lib/theme.js";
import { store, K_LOG, K_SET, K_BAK } from "./lib/store.js";
import { iso, fromIso, mondayOf, daysBetween, shortFr, pad } from "./lib/dates.js";
import { beep } from "./lib/audio.js";
import { volumeOf, streakOf } from "./lib/volume.js";
import { pickVariant } from "./lib/generator.js";
import { DAYS, STRETCH_BY_DAY, FINISHER_BIAS } from "./data/days.js";
import { WORKOUTS, WORKOUT_BY_NAME } from "./data/workouts.js";
import { FINISHERS } from "./data/finishers.js";
import { STRETCHES } from "./data/stretches.js";
import { TIMERS } from "./data/timers.js";
import { PATTERNS, patternsOfWorkout } from "./data/patterns.js";
import { LEVELS } from "./data/levels.js";
import { f } from "./data/items.js";
import { Rail } from "./components/Rail.jsx";
import { Timer } from "./components/Timer.jsx";

export default function App() {
  const today = new Date();
  const todayIso = iso(today);
  const dow = today.getDay();

  const [tab, setTab] = useState("seance");
  const [dayKey, setDayKey] = useState(dow >= 1 && dow <= 5 ? dow : 1);
  const [variant, setVariant] = useState(null);
  const [seen, setSeen] = useState([]);
  const [runId, setRunId] = useState(0);
  const [log, setLog] = useState([]);
  const [level, setLevel] = useState(1);
  const [saveState, setSaveState] = useState("idle");
  const [askScore, setAskScore] = useState(false);
  const [scoreInput, setScoreInput] = useState("");
  const [finisher, setFinisher] = useState(null);
  const [stretch, setStretch] = useState(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [warmup, setWarmup] = useState(true);
  const [phases, setPhases] = useState(null);
  const [segment, setSegment] = useState(null);
  const [endOpen, setEndOpen] = useState(false);
  const [endStage, setEndStage] = useState("workout");
  const [propose, setPropose] = useState(null);
  const [recap, setRecap] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [lastBackup, setLastBackup] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    try { const v = store.get(K_LOG); if (v) setLog(JSON.parse(v)); } catch {}
    try { const v = store.get(K_SET); if (v) { const s = JSON.parse(v); if (s.level) setLevel(s.level); } } catch {}
    setLastBackup(store.get(K_BAK));
  }, []);

  const saveLog = (next) => { setLog(next); return store.set(K_LOG, JSON.stringify(next)); };
  const saveLevel = (l) => { setLevel(l); store.set(K_SET, JSON.stringify({ level: l })); };

  /* ---- calculs ---- */
  const last28 = log.filter((e) => daysBetween(fromIso(e.d), today) < 28).length;
  const suggested = LEVELS.slice().reverse().find((l) => last28 >= l.need).id;
  const monthCount = log.filter((e) => {
    const d = fromIso(e.d);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;

  const wkStart = mondayOf(today);
  const weekDone = {};
  log.forEach((e) => { const d = fromIso(e.d); if (d >= wkStart) weekDone[((d.getDay() + 6) % 7) + 1] = true; });
  const weekCount = Object.keys(weekDone).length;

  /* Ce que la semaine a déjà couvert, reconstruit depuis le journal */
  const weekPatterns = new Set();
  log.forEach((e) => {
    const d = fromIso(e.d);
    if (d >= wkStart && WORKOUT_BY_NAME[e.w]) {
      patternsOfWorkout(WORKOUT_BY_NAME[e.w]).forEach((p) => weekPatterns.add(p));
    }
  });

  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const s = new Date(wkStart); s.setDate(s.getDate() - i * 7);
    const e = new Date(s); e.setDate(e.getDate() + 7);
    weeks.push({
      label: `${pad(s.getDate())}/${pad(s.getMonth() + 1)}`,
      n: log.filter((x) => { const d = fromIso(x.d); return d >= s && d < e; }).length,
      current: i === 0,
    });
  }
  const maxWeek = Math.max(5, ...weeks.map((w) => w.n));
  const tests = log.filter((e) => e.s !== null && e.s !== undefined).sort((a, b) => (a.d < b.d ? 1 : -1));
  const backupStale = log.length > 0 && (!lastBackup || daysBetween(fromIso(lastBackup), today) > 30);

  /* ---- séance ---- */
  const day = DAYS.find((d) => d.key === dayKey);
  const pool = WORKOUTS[dayKey];
  const wod = variant === null ? null : pool[variant];
  const accent = wod && wod.test ? C.ember : C.lime;

  const generate = () => {
    const next = pickVariant(pool, weekPatterns, seen, variant);
    setVariant(next.index);
    setSeen(next.seen);
    setRunId((x) => x + 1); setSaveState("idle"); setAskScore(false); setScoreInput("");
    setFinisher(null); setStretch(null); setPropose(null); setEndOpen(false);
  };

  /* Le tirage penche vers les abdos les jours déjà chargés en burpees,
     mais garde une chance de sortir l'autre famille pour ne pas devenir prévisible. */
  const drawFinisher = () => {
    const biased = FINISHER_BIAS[dayKey];
    const other = biased === "cardio" ? "abdos" : "cardio";
    const fam = Math.random() < 0.7 ? biased : other;
    const list = FINISHERS[fam];
    let pick = list[Math.floor(Math.random() * list.length)];
    if (propose && list.length > 1 && pick.name === propose.name) {
      pick = list[(list.indexOf(pick) + 1) % list.length];
    }
    setPropose({ ...pick, fam, kind: "finisher" });
  };

  const drawStretch = () => {
    if (!propose || propose.kind !== "stretch") {
      const base = STRETCHES.find((s) => s.id === STRETCH_BY_DAY[dayKey]) || STRETCHES[0];
      setPropose({ ...base, kind: "stretch" });
      return;
    }
    const i = STRETCHES.findIndex((s) => s.id === propose.id);
    setPropose({ ...STRETCHES[(i + 1) % STRETCHES.length], kind: "stretch" });
  };

  /* Le plan ne contient que l'échauffement et la séance.
     Le finisher et les étirements se décident à la fin, sur l'écran de bilan. */
  const startTimer = () => {
    const p = [];
    if (warmup) p.push({ t:"down", sec:300, label:"Échauffement", sub:"À ton rythme", list:[
      f("Squats latéraux"), f("Élévations latérales de jambe"), f("Isométries kiné"),
      f("30 s de deep squat", "Talons au sol, coudes contre l'intérieur des genoux, tu pousses vers l'extérieur"),
    ] });
    const w = TIMERS[wod.name];
    if (w) p.push(...w); else p.push({ t:"up", cap:1500, label:wod.name, sub:"Chrono libre" });
    beep(660, 120);
    setSegment("workout");
    setPhases(p);
    setSetupOpen(false);
  };

  const logSession = (opts) => {
    const o = opts || {};
    const avant = log.find((e) => e.d === todayIso);
    const entry = {
      d: todayIso, day: dayKey, w: wod.name, lvl: level,
      fin: ("fin" in o ? o.fin : finisher ? finisher.name : (avant && avant.fin) || null),
      str: ("str" in o ? o.str : stretch ? stretch.name : (avant && avant.str) || null),
      s: "s" in o ? o.s
        : scoreInput !== "" ? Number(scoreInput)
        : avant && avant.s != null ? avant.s
        : null,
    };
    const ok = saveLog([...log.filter((e) => e.d !== todayIso), entry]);
    setSaveState(ok ? "done" : "error");
  };

  /* Fin d'un segment de chrono */
  const segmentDone = () => {
    setPhases(null);
    if (segment === "finisher") { setEndStage("finisher"); logSession({}); }
    else if (segment === "stretch") { setEndStage(endStage === "workout" ? "workout" : "finisher"); logSession({}); }
    else { setEndStage("workout"); if (!wod.test) logSession({ s: null }); }
    setSegment(null);
    setPropose(null);
    setEndOpen(true);
  };

  const lancerFinisher = () => {
    const fz = TIMERS[propose.name] || [{ t:"up", cap:600, label:propose.name, sub:"Chrono libre" }];
    setFinisher(propose);
    setSegment("finisher");
    setPhases([{ t:"rest", sec:90, label:"Transition", sub:"Tu souffles avant le finisher" }, ...fz]);
    setEndOpen(false);
    beep(660, 120);
  };

  const lancerStretch = () => {
    setStretch(propose);
    setSegment("stretch");
    setPhases([{ t:"down", sec:300, label:"Étirements", sub:propose.name,
      list: propose.blocks.map((b) => f(`${b.items[0].txt} — ${b.tag.toLowerCase()}`)) }]);
    setEndOpen(false);
    beep(660, 120);
  };

  const finish = () => {
    if (wod.test && !askScore) { setAskScore(true); return; }
    logSession({});
    setAskScore(false);
  };

  /* ---- sauvegarde ---- */
  const download = () => {
    const data = JSON.stringify({ v: 1, exported: todayIso, level, log }, null, 0);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `workout-${todayIso}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    store.set(K_BAK, todayIso); setLastBackup(todayIso);
  };

  const buildRecap = () => {
    const recent = log.filter((e) => daysBetween(fromIso(e.d), today) < 35).sort((a, b) => (a.d < b.d ? 1 : -1));
    const txt = [
      `RÉCAP ENTRAÎNEMENT — ${shortFr(todayIso)}`,
      `Niveau : ${LEVELS.find((l) => l.id === level).name} (${level}/3)`,
      `Séances sur 28 jours : ${last28} · ce mois : ${monthCount}`,
      `Semaines (ancienne → récente) : ${weeks.map((w) => w.n).join(", ")}`,
      tests.length ? `Tests : ${tests.slice(0, 8).map((t) => `${shortFr(t.d)} = ${t.s}`).join(" | ")}` : "Tests : aucun",
      `Couverture de la semaine : ${weekPatterns.size}/${PATTERNS.length} — ${PATTERNS.filter((p) => weekPatterns.has(p.id)).map((p) => p.label.toLowerCase()).join(", ") || "rien"}`,
      `Finishers : ${log.filter((e) => e.fin).length} · stretching : ${log.filter((e) => e.str).length} (sur ${log.length} séances)`,
      "", "DÉTAIL 35 JOURS",
      ...recent.map((e) => `${shortFr(e.d)} ${DAYS.find((d) => d.key === e.day).short} · ${e.w} · N${e.lvl}`
        + (e.s != null ? ` · score ${e.s}` : "")
        + (e.fin ? ` · finisher : ${e.fin}` : "")
        + (e.str ? ` · stretch : ${e.str}` : "")),
    ].join("\n");
    try { navigator.clipboard.writeText(txt); } catch {}
    setRecap(txt);
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      const incoming = Array.isArray(parsed) ? parsed : parsed.log;
      if (!Array.isArray(incoming)) throw new Error("format");
      const byDate = {};
      [...log, ...incoming].forEach((e) => { if (e && e.d) byDate[e.d] = e; });
      const merged = Object.values(byDate).sort((a, b) => (a.d < b.d ? -1 : 1));
      saveLog(merged);
      if (parsed.level) saveLevel(parsed.level);
      setImportMsg(`${merged.length} séances au total après fusion.`);
      setImportText("");
    } catch {
      setImportMsg("Ce texte n'est pas une sauvegarde valide. Colle le contenu d'un fichier workout-….json.");
    }
  };

  /* --------------------------- rendu --------------------------- */
  const Tab = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ flex:1, padding:"10px 0", fontFamily:MONO, fontSize:11,
      fontWeight:700, letterSpacing:".12em", background: tab === id ? C.bone : "transparent",
      color: tab === id ? C.ink : C.ash, border:`1px solid ${tab === id ? C.bone : C.line}`, borderRadius:2 }}>{label}</button>
  );
  const Label = ({ children, color }) => (
    <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color: color || C.ash, marginBottom:8 }}>{children}</div>
  );

  return (
    <div style={{ display:"flex", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ width:"100%", maxWidth:460, padding:"max(24px, env(safe-area-inset-top)) 20px 150px" }}>

        <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO, fontSize:10,
          letterSpacing:".14em", color:C.ash, marginBottom:16 }}>
          <span>{today.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" }).toUpperCase()}</span>
          <span style={{ color: level > 1 ? C.lime : C.ash }}>N{level} · {LEVELS.find((l) => l.id === level).name}</span>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:28 }}>
          <Tab id="seance" label="SÉANCE" /><Tab id="suivi" label="SUIVI" />
        </div>

        {backupStale && tab === "suivi" && (
          <div style={{ padding:12, marginBottom:20, border:`1px solid ${C.ember}`, borderRadius:2,
            fontSize:12.5, lineHeight:1.5, color:C.bone }}>
            Aucune sauvegarde depuis plus de 30 jours. Télécharge le fichier plus bas.
          </div>
        )}

        {tab === "seance" ? (
          <React.Fragment>
            <div style={{ display:"flex", gap:6, marginBottom:28 }}>
              {DAYS.map((d) => {
                const on = d.key === dayKey, done = weekDone[d.key];
                return (
                  <button key={d.key} onClick={() => { setDayKey(d.key); setVariant(null); setSeen([]); setSaveState("idle"); setFinisher(null); setStretch(null); setPropose(null); setEndOpen(false); }}
                    style={{ flex:1, padding:"8px 0", position:"relative", fontFamily:MONO, fontSize:11, fontWeight:700,
                      background: on ? C.bone : "transparent", color: on ? C.ink : (done ? C.bone : C.ash),
                      border:`1px solid ${on ? C.bone : C.line}`, borderRadius:2 }}>
                    {d.short}
                    {done && <span style={{ position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
                      width:12, height:2, background: on ? C.ink : C.lime }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ fontFamily:DISPLAY, fontSize:46, lineHeight:.92 }}>{day.long}</div>
            <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:".1em", color:accent, margin:"4px 0 24px" }}>
              {day.theme.toUpperCase()}
            </div>

            <div style={{ borderLeft:`2px solid ${C.line}`, paddingLeft:12, marginBottom:24,
              fontSize:12.5, color:C.ash, lineHeight:1.5 }}>
              <span style={{ color:C.bone }}>Avant.</span> Squats latéraux, élévations latérales de jambe,
              isométries kiné, puis 30 s de deep squat.
            </div>

            {wod ? (
              <div key={runId}>
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between",
                  borderTop:`1px solid ${C.line}`, paddingTop:18, marginBottom:4 }}>
                  <span style={{ fontFamily:DISPLAY, fontSize:30, lineHeight:1 }}>{wod.name}</span>
                  <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:accent }}>{wod.dur}</span>
                </div>
                <p style={{ fontSize:13, color:C.ash, lineHeight:1.5, margin:"0 0 16px" }}>{wod.meta}</p>

                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:22 }}>
                  {patternsOfWorkout(wod).map((p) => {
                    const neuf = !weekPatterns.has(p);
                    return (
                      <span key={p} style={{ fontFamily:MONO, fontSize:9, letterSpacing:".1em",
                        padding:"4px 7px", borderRadius:2,
                        background: neuf ? C.lime : "transparent",
                        color: neuf ? C.ink : C.ash,
                        border: `1px solid ${neuf ? C.lime : C.line}` }}>
                        {PATTERNS.find((x) => x.id === p).label}
                      </span>
                    );
                  })}
                </div>

                <Rail blocks={wod.blocks} accent={accent} level={level} reduced={reduced} />

                <div style={{ background:C.steel, borderRadius:3, padding:16, fontSize:13.5, lineHeight:1.55, marginTop:8 }}>
                  <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:accent }}>OBJECTIF</span>
                  <div style={{ marginTop:6 }}>{wod.goal}</div>
                </div>

                {askScore && (
                  <div style={{ marginTop:12, padding:16, background:C.steel, borderRadius:3, border:`1px solid ${C.ember}` }}>
                    <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash }}>{wod.testLabel.toUpperCase()}</div>
                    <input type="number" inputMode="numeric" autoFocus value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)} placeholder="—"
                      style={{ width:"100%", marginTop:8, padding:"8px 0", background:"transparent", color:C.bone,
                        fontFamily:DISPLAY, fontSize:34, border:"none", borderBottom:`1px solid ${C.line}`, outline:"none" }} />
                  </div>
                )}
                {saveState === "done" && <div style={{ marginTop:14, fontFamily:MONO, fontSize:11, color:C.lime, letterSpacing:".08em" }}>✓ SÉANCE ENREGISTRÉE</div>}
                {saveState === "error" && <div style={{ marginTop:14, fontSize:12.5, color:C.ember }}>Enregistrement impossible sur cet appareil. Vérifie que le navigateur n'est pas en navigation privée.</div>}

                <p style={{ marginTop:16, fontSize:12, color:C.ash, lineHeight:1.5 }}>
                  Barre trop dure ? Fais des négatives : tu montes en sautant, tu descends en 5 s.
                  Trois répétitions propres valent mieux que cinq lancées. Les chin-ups passent souvent
                  mieux que les pull-ups, garde-les pour les jours fatigués.
                </p>

              </div>
            ) : (
              <div style={{ border:`1px dashed ${C.line}`, borderRadius:3, minHeight:200, display:"flex",
                alignItems:"center", justifyContent:"center", textAlign:"center", padding:"0 24px",
                color:C.ash, fontSize:13.5, lineHeight:1.6, whiteSpace:"pre-line" }}>
                {weekDone[dayKey] ? "Séance déjà enregistrée ce jour-là.\nTu peux quand même en tirer une." : `${pool.length} séances possibles pour ce jour.\nAppuie pour en tirer une.`}
              </div>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ display:"flex", gap:24, alignItems:"flex-end", marginBottom:32 }}>
              <div>
                <div style={{ fontFamily:DISPLAY, fontSize:60, lineHeight:.85 }}>{monthCount}</div>
                <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash }}>CE MOIS</div>
              </div>
              <div>
                <div style={{ fontFamily:DISPLAY, fontSize:60, lineHeight:.85 }}>{last28}</div>
                <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash }}>SUR 28 JOURS</div>
              </div>
            </div>

            <Label>CETTE SEMAINE · {weekCount}/5</Label>
            <div style={{ display:"flex", gap:6, marginBottom:32 }}>
              {DAYS.map((d) => (
                <div key={d.key} style={{ flex:1, height:42, display:"flex", alignItems:"center", justifyContent:"center",
                  background: weekDone[d.key] ? C.lime : "transparent", border:`1px solid ${weekDone[d.key] ? C.lime : C.line}`,
                  color: weekDone[d.key] ? C.ink : C.ash, fontFamily:MONO, fontSize:11, fontWeight:700, borderRadius:2 }}>
                  {d.short}
                </div>
              ))}
            </div>

            <Label>COUVERTURE DE LA SEMAINE · {weekPatterns.size}/{PATTERNS.length}</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
              {PATTERNS.map((p) => {
                const on = weekPatterns.has(p.id);
                return (
                  <span key={p.id} style={{ fontFamily:MONO, fontSize:9, letterSpacing:".1em",
                    padding:"6px 8px", borderRadius:2,
                    background: on ? C.lime : "transparent", color: on ? C.ink : C.ash,
                    border:`1px solid ${on ? C.lime : C.line}` }}>
                    {p.label}
                  </span>
                );
              })}
            </div>
            <p style={{ fontSize:12.5, color:C.ash, lineHeight:1.5, margin:"0 0 32px" }}>
              {weekPatterns.size === PATTERNS.length
                ? "Semaine complète. Tous les schémas moteurs ont été travaillés."
                : weekPatterns.size === 0
                ? "Rien d'enregistré cette semaine. Le générateur partira de zéro."
                : `Il manque ${PATTERNS.filter((p) => !weekPatterns.has(p.id)).map((p) => p.label.toLowerCase()).join(", ")}. Le générateur privilégie les séances qui les couvrent.`}
            </p>

            <Label>8 DERNIÈRES SEMAINES</Label>
            <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:90, marginBottom:6 }}>
              {weeks.map((w, i) => (
                <div key={i} style={{ flex:1, height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
                  <span style={{ fontFamily:MONO, fontSize:10, color:C.ash, marginBottom:4 }}>{w.n || ""}</span>
                  <div style={{ width:"100%", height: Math.max((w.n / maxWeek) * 68, w.n ? 4 : 2),
                    background: w.n === 0 ? C.line : (w.current ? C.lime : C.bone), borderRadius:1 }} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:32 }}>
              {weeks.map((w, i) => <div key={i} style={{ flex:1, textAlign:"center", fontFamily:MONO, fontSize:8, color:C.ash }}>{w.label}</div>)}
            </div>

            <Label>NIVEAU</Label>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {LEVELS.map((l) => {
                const on = l.id === level, unlocked = last28 >= l.need;
                return (
                  <button key={l.id} onClick={() => saveLevel(l.id)}
                    style={{ flex:1, padding:"12px 4px", background: on ? C.lime : "transparent",
                      color: on ? C.ink : (unlocked ? C.bone : C.ash), border:`1px solid ${on ? C.lime : C.line}`,
                      borderRadius:2, fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".06em" }}>
                    {l.name}
                    <div style={{ fontSize:8, fontWeight:400, marginTop:3, opacity:.75 }}>{l.desc}</div>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize:12.5, color:C.ash, lineHeight:1.5, margin:"0 0 32px" }}>
              {suggested > level
                ? `${last28} séances sur 28 jours : le niveau ${LEVELS.find((l) => l.id === suggested).name} est atteignable. À toi de décider.`
                : suggested < level
                ? `${last28} séances sur 28 jours. Tu es au-dessus du niveau que l'assiduité justifie — garde-le si les séances passent bien.`
                : `${last28} séances sur 28 jours. Niveau cohérent avec ton assiduité.`}
            </p>

            <Label color={C.ember}>TESTS DU VENDREDI</Label>
            {tests.length === 0 ? (
              <p style={{ fontSize:12.5, color:C.ash, margin:"0 0 32px" }}>Aucun test enregistré. Le premier vendredi donnera ta référence.</p>
            ) : (
              <div style={{ marginBottom:32 }}>
                {tests.slice(0, 10).map((t, i) => {
                  const prev = tests[i + 1], delta = prev ? t.s - prev.s : null;
                  return (
                    <div key={t.d} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
                      padding:"10px 0", borderBottom:`1px solid ${C.line}` }}>
                      <span style={{ fontFamily:MONO, fontSize:11, color:C.ash }}>{shortFr(t.d)} · {t.w}</span>
                      <span>
                        <span style={{ fontFamily:DISPLAY, fontSize:22 }}>{t.s}</span>
                        {delta !== null && <span style={{ fontFamily:MONO, fontSize:11, marginLeft:8,
                          color: delta > 0 ? C.lime : (delta < 0 ? C.ember : C.ash) }}>{delta > 0 ? `+${delta}` : delta}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <Label>SAUVEGARDE</Label>
            <button onClick={download} style={{ width:"100%", padding:"14px 0", marginBottom:8, background:C.bone,
              color:C.ink, fontFamily:MONO, fontSize:11, fontWeight:700, letterSpacing:".1em", borderRadius:2 }}>
              TÉLÉCHARGER LE FICHIER
            </button>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <button onClick={buildRecap} style={{ flex:1, padding:"12px 0", border:`1px solid ${C.line}`,
                color:C.bone, fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".08em", borderRadius:2 }}>
                COPIER LE RÉCAP
              </button>
              <button onClick={() => { setImportOpen(!importOpen); setImportMsg(""); }}
                style={{ flex:1, padding:"12px 0", border:`1px solid ${C.line}`, color:C.bone,
                  fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".08em", borderRadius:2 }}>
                RESTAURER
              </button>
            </div>
            <p style={{ fontSize:11.5, color:C.ash, lineHeight:1.5, margin:"0 0 12px" }}>
              {lastBackup ? `Dernière sauvegarde : ${shortFr(lastBackup)}.` : "Aucune sauvegarde encore téléchargée."} Le
              fichier .json est ta seule copie hors du téléphone. Le récap est une version texte à coller dans une conversation.
            </p>

            {recap && (
              <textarea readOnly value={recap} onFocus={(e) => e.target.select()}
                style={{ width:"100%", height:150, padding:12, marginBottom:12, background:C.steel, color:C.ash,
                  fontFamily:MONO, fontSize:10, lineHeight:1.6, border:`1px solid ${C.line}`, borderRadius:2 }} />
            )}

            {importOpen && (
              <div style={{ marginBottom:20 }}>
                <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
                  placeholder="Colle ici le contenu d'un fichier workout-….json"
                  style={{ width:"100%", height:110, padding:12, background:C.steel, color:C.bone,
                    fontFamily:MONO, fontSize:10, lineHeight:1.6, border:`1px solid ${C.line}`, borderRadius:2 }} />
                <button onClick={doImport} style={{ width:"100%", padding:"12px 0", marginTop:8, background:C.lime,
                  color:C.ink, fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".1em", borderRadius:2 }}>
                  FUSIONNER AVEC L'HISTORIQUE
                </button>
                <p style={{ fontSize:11.5, color: importMsg.startsWith("Ce texte") ? C.ember : C.ash, lineHeight:1.5, marginTop:8 }}>
                  {importMsg || "La fusion garde une séance par date, rien n'est écrasé au hasard."}
                </p>
              </div>
            )}

            <div style={{ marginTop:24 }}>
              {confirmReset ? (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { saveLog([]); setConfirmReset(false); }}
                    style={{ flex:1, padding:"12px 0", background:C.ember, color:C.ink, fontFamily:MONO, fontSize:10, fontWeight:700, borderRadius:2 }}>
                    EFFACER {log.length} SÉANCES
                  </button>
                  <button onClick={() => setConfirmReset(false)}
                    style={{ flex:1, padding:"12px 0", border:`1px solid ${C.line}`, color:C.ash, fontFamily:MONO, fontSize:10, borderRadius:2 }}>
                    ANNULER
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)} style={{ fontFamily:MONO, fontSize:10, color:C.line, letterSpacing:".1em" }}>
                  EFFACER L'HISTORIQUE
                </button>
              )}
            </div>
          </React.Fragment>
        )}
      </div>

      {tab === "seance" && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, display:"flex", justifyContent:"center",
          padding:"16px 20px calc(20px + env(safe-area-inset-bottom))",
          background:`linear-gradient(to top, ${C.ink} 62%, rgba(11,11,12,0))` }}>
          <div style={{ width:"100%", maxWidth:460 }}>
            {wod && (
              <button onClick={() => setSetupOpen(true)} style={{ width:"100%", padding:"14px 0", marginBottom:8,
                background:C.steel, border:`1px solid ${accent}`, color:accent,
                fontFamily:DISPLAY, fontSize:16, letterSpacing:".06em", borderRadius:2 }}>
                ▶ LANCER LE CHRONO
              </button>
            )}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={generate} style={{ flex: wod ? "0 0 42%" : 1, padding:"16px 0",
                background: wod ? "transparent" : accent, border: wod ? `1px solid ${C.line}` : "none",
                color: wod ? C.bone : C.ink, fontFamily:DISPLAY, fontSize: wod ? 15 : 20, letterSpacing:".04em", borderRadius:2 }}>
                {wod ? `AUTRE SÉANCE${pool.length > 1 ? ` (${seen.length}/${pool.length})` : ""}` : "GÉNÉRER LA SÉANCE"}
              </button>
              {wod && (
                <button onClick={finish} disabled={saveState === "done"}
                  style={{ flex:1, padding:"16px 0", background: saveState === "done" ? C.steel : accent,
                    color: saveState === "done" ? C.ash : C.ink, fontFamily:DISPLAY, fontSize:17, letterSpacing:".04em", borderRadius:2 }}>
                  {saveState === "done" ? "ENREGISTRÉE" : askScore ? "VALIDER LE SCORE" : "SÉANCE FAITE"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Réglages avant lancement */}
      {setupOpen && wod && (
        <div style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(11,11,12,.94)", display:"flex",
          alignItems:"flex-end", justifyContent:"center" }} onClick={() => setSetupOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width:"100%", maxWidth:460, background:C.steel,
            borderTop:`1px solid ${C.line}`, borderRadius:"3px 3px 0 0",
            padding:"24px 20px calc(24px + env(safe-area-inset-bottom))" }}>
            <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash, marginBottom:14 }}>
              AVANT DE LANCER
            </div>

            <button onClick={() => setWarmup(!warmup)} style={{ width:"100%", display:"flex", alignItems:"center",
              gap:14, padding:"14px 0", borderBottom:`1px solid ${C.line}`, textAlign:"left" }}>
              <span style={{ width:22, height:22, flexShrink:0, borderRadius:2,
                border:`1px solid ${warmup ? C.lime : C.line}`, background: warmup ? C.lime : "transparent",
                color:C.ink, fontFamily:MONO, fontSize:13, fontWeight:700, lineHeight:"21px", textAlign:"center" }}>
                {warmup ? "✓" : ""}
              </span>
              <span>
                <span style={{ fontFamily:DISPLAY, fontSize:19 }}>Échauffement</span>
                <span style={{ display:"block", fontSize:12, color:C.ash, lineHeight:1.4, marginTop:2 }}>
                  5 min au début. Tu peux le passer à tout moment.
                </span>
              </span>
            </button>

            <p style={{ fontSize:12, color:C.ash, lineHeight:1.5, margin:"16px 0 18px" }}>
              Le chrono suit {wod.name}. Trois bips avant chaque bascule. À la fin, il te proposera
              un finisher et des étirements. Garde le téléphone déverrouillé, le son activé.
            </p>

            <button onClick={startTimer} style={{ width:"100%", padding:"16px 0", background:accent, color:C.ink,
              fontFamily:DISPLAY, fontSize:19, letterSpacing:".04em", borderRadius:2 }}>
              DÉMARRER
            </button>
          </div>
        </div>
      )}

      {phases && <Timer phases={phases} level={level} onDone={segmentDone} />}

      {/* ---- Écran de fin ---- */}
      {endOpen && wod && (() => {
        const vol = volumeOf(wod.name, level);
        const volFin = finisher ? volumeOf(finisher.name, level) : null;
        const streak = streakOf(log, today);
        const pats = patternsOfWorkout(wod);
        const manque = PATTERNS.filter((p) => !weekPatterns.has(p.id));
        const entryToday = log.find((e) => e.d === todayIso);
        const besoinScore = wod.test && !(entryToday && entryToday.s != null);

        return (
          <div style={{ position:"fixed", inset:0, zIndex:45, background:C.ink, overflowY:"auto",
            padding:"max(28px, env(safe-area-inset-top)) 20px calc(28px + env(safe-area-inset-bottom))" }}>
            <div style={{ maxWidth:460, margin:"0 auto" }}>

              <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".16em", color:C.lime, marginBottom:10 }}>
                {endStage === "finisher" ? "FINISHER TERMINÉ" : "SÉANCE TERMINÉE"}
              </div>
              <div style={{ fontFamily:DISPLAY, fontSize:44, lineHeight:.95, marginBottom:6 }}>
                {endStage === "finisher" ? "TU EN AS REMIS UNE COUCHE" : "C'EST FAIT"}
              </div>
              <p style={{ fontSize:13.5, color:C.ash, lineHeight:1.5, margin:"0 0 28px" }}>
                {wod.name}{finisher ? ` + ${finisher.name}` : ""}{stretch ? ` + ${stretch.name}` : ""}
              </p>

              {/* Chiffres */}
              <div style={{ display:"flex", gap:10, marginBottom:24 }}>
                {[
                  { n: vol.total + (volFin ? volFin.total : 0), l: vol.amrap || (volFin && volFin.amrap) ? "REPS PAR TOUR" : "RÉPÉTITIONS" },
                  { n: streak, l: streak === 1 ? "JOUR D'AFFILÉE" : "JOURS D'AFFILÉE" },
                  { n: `${weekCount}/5`, l: "CETTE SEMAINE" },
                ].map((k, i) => (
                  <div key={i} style={{ flex:1, background:C.steel, borderRadius:3, padding:"14px 12px" }}>
                    <div style={{ fontFamily:DISPLAY, fontSize:32, lineHeight:.9 }}>{k.n}</div>
                    <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".1em", color:C.ash, marginTop:6 }}>{k.l}</div>
                  </div>
                ))}
              </div>
              {vol.amrap && (
                <p style={{ fontSize:12, color:C.ash, lineHeight:1.5, margin:"-14px 0 24px" }}>
                  Format AMRAP : le total affiché est celui d'un seul tour. Multiplie par tes tours.
                </p>
              )}

              {/* Schémas */}
              <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash, marginBottom:8 }}>
                TRAVAILLÉ AUJOURD'HUI
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                {pats.map((p) => (
                  <span key={p} style={{ fontFamily:MONO, fontSize:9, letterSpacing:".1em", padding:"5px 8px",
                    borderRadius:2, background:C.lime, color:C.ink }}>
                    {PATTERNS.find((x) => x.id === p).label}
                  </span>
                ))}
              </div>
              <p style={{ fontSize:12.5, color:C.ash, lineHeight:1.5, margin:"0 0 28px" }}>
                {manque.length === 0
                  ? "Semaine complète : les dix schémas moteurs sont couverts."
                  : `Il reste ${manque.map((p) => p.label.toLowerCase()).join(", ")} à couvrir cette semaine.`}
              </p>

              {/* Score du test */}
              {besoinScore && (
                <div style={{ padding:16, marginBottom:20, background:C.steel, borderRadius:3,
                  border:`1px solid ${C.ember}` }}>
                  <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash }}>
                    {wod.testLabel.toUpperCase()}
                  </div>
                  <input type="number" inputMode="numeric" value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)} placeholder="—"
                    style={{ width:"100%", marginTop:8, padding:"8px 0", background:"transparent", color:C.bone,
                      fontFamily:DISPLAY, fontSize:34, border:"none", borderBottom:`1px solid ${C.line}`, outline:"none" }} />
                  <button onClick={() => logSession({})} style={{ width:"100%", padding:"12px 0", marginTop:12,
                    background:C.ember, color:C.ink, fontFamily:MONO, fontSize:10, fontWeight:700,
                    letterSpacing:".1em", borderRadius:2 }}>
                    ENREGISTRER LE SCORE
                  </button>
                </div>
              )}

              {/* Proposition */}
              {propose && (
                <div style={{ borderTop:`1px solid ${C.line}`, paddingTop:20, marginBottom:20 }}>
                  <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em",
                    color: propose.kind === "finisher" ? C.lime : C.ash, marginBottom:6 }}>
                    {propose.kind === "finisher"
                      ? `FINISHER · ${propose.fam === "cardio" ? "CARDIO" : "ABDOS"}`
                      : "ÉTIREMENTS"}
                  </div>
                  <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontFamily:DISPLAY, fontSize:26, lineHeight:1 }}>{propose.name}</span>
                    <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700,
                      color: propose.kind === "finisher" ? C.lime : C.ash }}>
                      {propose.kind === "finisher" ? propose.dur : "5 min"}
                    </span>
                  </div>
                  <p style={{ fontSize:13, color:C.ash, lineHeight:1.5, margin:"0 0 18px" }}>{propose.meta}</p>
                  <Rail blocks={propose.blocks} accent={propose.kind === "finisher" ? C.lime : C.ash}
                    level={propose.kind === "finisher" ? level : 1} reduced={reduced} />
                  <div style={{ display:"flex", gap:8, marginTop:4 }}>
                    <button onClick={propose.kind === "finisher" ? lancerFinisher : lancerStretch}
                      style={{ flex:1, padding:"15px 0", background: propose.kind === "finisher" ? C.lime : C.bone,
                        color:C.ink, fontFamily:DISPLAY, fontSize:16, letterSpacing:".04em", borderRadius:2 }}>
                      ▶ LANCER
                    </button>
                    <button onClick={propose.kind === "finisher" ? drawFinisher : drawStretch}
                      style={{ flex:"0 0 38%", padding:"15px 0", border:`1px solid ${C.line}`, color:C.bone,
                        fontFamily:DISPLAY, fontSize:14, letterSpacing:".04em", borderRadius:2 }}>
                      EN TIRER UN AUTRE
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!propose && (
                <div style={{ borderTop:`1px solid ${C.line}`, paddingTop:20 }}>
                  {endStage === "workout" && !finisher && (
                    <>
                      <p style={{ fontSize:13.5, lineHeight:1.5, margin:"0 0 14px" }}>
                        Encore du jus ? Un finisher de 10 minutes maximum.
                      </p>
                      <button onClick={drawFinisher} style={{ width:"100%", padding:"16px 0", marginBottom:8,
                        background:C.lime, color:C.ink, fontFamily:DISPLAY, fontSize:18,
                        letterSpacing:".04em", borderRadius:2 }}>
                        AJOUTER UN FINISHER
                      </button>
                    </>
                  )}
                  {!stretch && (
                    <button onClick={drawStretch} style={{ width:"100%", padding:"15px 0", marginBottom:8,
                      border:`1px solid ${C.bone}`, color:C.bone, fontFamily:DISPLAY, fontSize:16,
                      letterSpacing:".04em", borderRadius:2 }}>
                      ÉTIREMENTS · 5 MIN
                    </button>
                  )}
                  <button onClick={() => { setEndOpen(false); setTab("suivi"); }}
                    style={{ width:"100%", padding:"15px 0", marginBottom:8,
                      background: endStage === "finisher" && stretch ? C.bone : "transparent",
                      border:`1px solid ${C.line}`,
                      color: endStage === "finisher" && stretch ? C.ink : C.bone,
                      fontFamily:DISPLAY, fontSize:16, letterSpacing:".04em", borderRadius:2 }}>
                    VOIR MES STATS
                  </button>
                  <button onClick={() => setEndOpen(false)} style={{ width:"100%", padding:"12px 0",
                    fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash }}>
                    FERMER
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
