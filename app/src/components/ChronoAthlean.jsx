import React, { useState, useEffect, useRef } from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { mmss } from "../lib/dates.js";
import { couper, deverrouiller, ton, vibrer } from "../lib/audio.js";
import {
  WARNING, avancer, demarrer, dureeSeance, dureeTotale, ecran, fini, mettreEnPause, passer,
  effet, instantane, progression, recommencer, reprendre,
} from "../lib/athlean.js";

/* L'horloge du chrono Athlean X : monotone, insensible à un réglage de
   l'heure du téléphone. Le moteur ne lit rien d'autre. */
const maintenant = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function emettre(signal, actif) {
  const s = effet(signal, actif);
  if (!s) return;
  ton(s.freq, s.ms);
  vibrer(s.vibre);
}

/* Le chrono Athlean X, seul. Rien ne l'ouvre encore : le branchement derrière
   le sélecteur de mode est l'affaire d'un ticket suivant. `etapes` vient de
   `deroule`. `initial` est un chrono déjà lancé : celui qu'on reprend après
   un redémarrage, ou celui d'un test. `onSauver` reçoit, à chaque seconde
   affichée et à chaque geste, de quoi le retrouver si l'app est tuée. */
export function ChronoAthlean({ etapes, warning = WARNING, initial = null, onFin, onFermer, onSauver }) {
  const [run, setRun] = useState(initial);
  const [now, setNow] = useState(maintenant);
  const [arme, setArme] = useState(false);
  /* L'interrupteur de son. Il n'est pas enregistré : chaque séance repart
     son activé, comme l'app repart sur Classique. Un son coupé un soir ne
     doit pas laisser une séance muette le lendemain matin. */
  const [son, setSon] = useState(true);
  const sonRef = useRef(son);
  const runRef = useRef(run);

  const appliquer = (next) => { runRef.current = next; setRun(next); setNow(maintenant()); };

  const battre = () => {
    const cur = runRef.current;
    if (!cur) return;
    const t = maintenant();
    const { run: next, signaux } = avancer(cur, t);
    signaux.forEach((s) => emettre(s, sonRef.current));
    runRef.current = next;
    setRun(next);
    setNow(t);
  };

  /* Battement et retour au premier plan. Au retour, on relit tout de suite :
     les échéances ont continué de tomber, l'écran doit les rattraper avant
     d'afficher quoi que ce soit. Rattraper ne rejoue pas les signaux perdus. */
  useEffect(() => {
    if (!run || run.pause !== null || fini(run)) return;
    const id = setInterval(battre, 100);
    const onVis = () => { if (document.visibilityState === "visible") battre(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [run && run.pause, run && fini(run), !!run]);

  /* Écran allumé tant que le chrono est ouvert */
  useEffect(() => {
    let lock = null;
    try {
      if (navigator.wakeLock) navigator.wakeLock.request("screen").then((l) => { lock = l; }).catch(() => {});
    } catch {}
    return () => { try { if (lock) lock.release(); } catch {} };
  }, []);

  useEffect(() => { if (run && fini(run)) { couper(); onFin && onFin(); } }, [run && fini(run)]);

  /* Une écriture par seconde affichée, pas par battement : dix par seconde
     n'apprendraient rien de plus au stockage. */
  const vue = run && !fini(run) ? ecran(run, now) : null;
  useEffect(() => {
    if (vue && onSauver) onSauver(instantane(run, maintenant()));
  }, [run && run.idx, run && run.pause !== null, vue && vue.restant]);

  /* Le son se déverrouille dans le geste même : iOS l'exige. */
  const lancer = () => { deverrouiller(); appliquer(demarrer(etapes, maintenant(), warning)); };
  const basculer = () => {
    const t = maintenant();
    /* Reprendre déverrouille aussi le son : après un redémarrage de l'app,
       c'est le premier geste de la séance, DÉMARRER n'a pas eu lieu. */
    if (run.pause !== null) { deverrouiller(); appliquer(reprendre(run, t)); }
    else { couper(); appliquer(mettreEnPause(run, t)); }
  };
  const suivant = () => { couper(); appliquer(passer(runRef.current, maintenant())); };
  const basculerSon = () => {
    if (son) couper();
    sonRef.current = !son;
    setSon(!son);
  };
  const encore = () => { couper(); appliquer(recommencer(runRef.current, maintenant())); };

  const cadre = { position:"fixed", inset:0, zIndex:50, background:C.ink, display:"flex",
    flexDirection:"column", padding:"max(20px, env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom))" };
  const bouton = { flex:1, padding:"18px 0", border:`1px solid ${C.line}`, color:C.bone,
    fontFamily:DISPLAY, fontSize:17, letterSpacing:".04em", borderRadius:2 };

  /* Ce qu'annonce l'écran d'avant départ : l'échauffement s'il ouvre la
     séance, sinon le premier exercice. La durée est celle de la séance, sans
     échauffement ; un chrono d'étirements seuls annonce les siens. */
  const premier = etapes[0].t === "bloc" ? etapes[0] : etapes.find((e) => e.t === "exercice");
  const duree = dureeSeance(etapes) || dureeTotale(etapes);

  if (!run) {
    return (
      <div style={cadre}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center" }}>
          <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:".16em", color:C.rouge, marginBottom:10 }}>
            ATHLEAN X · {mmss(duree)}
          </div>
          <div style={{ fontFamily:DISPLAY, fontSize:"clamp(40px, 12vw, 64px)", lineHeight:.95 }}>
            {premier ? premier.nom.toUpperCase() : ""}
          </div>
        </div>
        <button onClick={lancer} style={{ width:"100%", padding:"18px 0", background:C.rouge, color:C.ink,
          fontFamily:DISPLAY, fontSize:19, letterSpacing:".04em", borderRadius:2 }}>
          DÉMARRER
        </button>
      </div>
    );
  }

  const v = ecran(run, now);
  if (!v) return null;
  /* Le rouge est l'effort — exercice ou bloc libre ; les temps morts,
     pré-départ et transitions, sont en blanc. L'orange reste aux alertes. */
  const travail = v.t === "exercice" || v.t === "bloc";
  const accent = travail ? C.rouge : C.bone;
  const restantMs = run.pause !== null ? run.pause : run.fin - now;
  const prog = progression(run.etapes, run.idx, run.etapes[run.idx].sec * 1000 - restantMs);

  return (
    <div style={cadre}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO, fontSize:10, letterSpacing:".14em" }}>
        <button onClick={basculerSon} aria-pressed={son}
          style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color: son ? C.ash : C.ember }}>
          {son ? "SON ACTIVÉ" : "SON COUPÉ"}
        </button>
        {/* Deux temps pour fermer : un doigt qui glisse ne doit pas arrêter la séance. */}
        <button onClick={() => (arme ? onFermer && onFermer() : setArme(true))}
          style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color: arme ? C.ember : C.ash }}>
          {arme ? "ARRÊTER ? TOUCHE ENCORE" : "FERMER ✕"}
        </button>
      </div>

      {/* La jauge de séance, comme en Classique : un segment par tour, large
          comme sa durée, le pourcentage au-dessus. L'échauffement n'y entre
          pas — il est hors séance. Un chrono d'étirements seuls n'en a pas. */}
      {prog && (
        <React.Fragment>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:14, flexShrink:0,
            fontFamily:MONO, letterSpacing:".06em", color:C.ash, fontVariantNumeric:"tabular-nums" }}>
            <span style={{ fontSize:10, letterSpacing:".12em" }}>
              {prog.phase ? `${prog.phase.toUpperCase()} · ${String(prog.numero).padStart(2, "0")} / ${prog.total}` : "HORS SÉANCE"}
            </span>
            <span style={{ fontSize:13 }}>{prog.pct} %</span>
          </div>
          <div style={{ display:"flex", gap:2, height:7, marginTop:8, flexShrink:0 }}>
            {prog.segments.map((g) => (
              <div key={g.id} style={{ flexGrow:g.grow, flexBasis:0, background:C.line, borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${g.fill * 100}%`, background: g.done ? C.bone : C.rouge }} />
              </div>
            ))}
          </div>
        </React.Fragment>
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center" }}>
        <div style={{ fontFamily:DISPLAY, fontSize: travail ? "clamp(34px, 10vw, 52px)" : "clamp(40px, 12vw, 64px)",
          lineHeight:.95, color:C.bone }}>
          {v.titre.toUpperCase()}
        </div>
        {v.sous && (
          <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash, marginTop:8 }}>
            {v.sous.toUpperCase()}
          </div>
        )}
        <div style={{ fontFamily:DISPLAY, fontSize:"clamp(76px, 26vw, 132px)", lineHeight:.9, marginTop:12,
          color: v.enPause ? C.ash : accent, fontVariantNumeric:"tabular-nums" }}>
          {travail ? mmss(v.restant) : v.restant}
        </div>
        {v.enPause && (
          <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ash, marginTop:8 }}>EN PAUSE</div>
        )}
        {/* Un bloc libre se suit à ton rythme : sa liste, comme dans le chrono
            Classique. Jamais pendant un exercice, où seul le nom s'affiche. */}
        {v.liste && (
          <div style={{ marginTop:18, display:"flex", flexDirection:"column", gap:6, fontSize:13.5, color:C.bone, lineHeight:1.4 }}>
            {v.liste.map((it, i) => <div key={i}>{it.txt}</div>)}
          </div>
        )}
        {v.ensuite && (
          <div style={{ marginTop:18, fontFamily:MONO, fontSize:11, letterSpacing:".1em", color:C.ash }}>
            ENSUITE : {v.ensuite.toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={encore} style={bouton}>RECOMMENCER</button>
        <button onClick={basculer} style={{ ...bouton, background: v.enPause ? accent : "transparent",
          color: v.enPause ? C.ink : C.bone, border: v.enPause ? "none" : bouton.border }}>
          {v.enPause ? "REPRENDRE" : "PAUSE"}
        </button>
        <button onClick={suivant} style={bouton}>PASSER</button>
      </div>
    </div>
  );
}
