import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { MODES } from "../data/modes.js";

/* Le choix du mode, en tête de l'onglet séance. Aucune condition de jour :
   il s'affiche aussi le week-end, où Athlean X sert de rattrapage.

   Sorti d'App pour la même raison que `Coche` : App ne se rend pas en test. */
export function ChoixMode({ mode, onChoix }) {
  return (
    <div style={{ display:"flex", gap:6, marginBottom:20 }}>
      {MODES.map((m) => {
        const on = m.id === mode;
        return (
          <button key={m.id} onClick={() => onChoix(m.id)} aria-pressed={on}
            style={{ flex:1, padding:"8px 0", fontFamily:MONO, fontSize:10, fontWeight:700,
              letterSpacing:".12em", background: on ? C.lime : "transparent",
              color: on ? C.ink : C.ash, border:`1px solid ${on ? C.lime : C.line}`, borderRadius:2 }}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/* Ce que montre Athlean X tant que le programme n'est pas branché : rien à
   lancer. Le contenu, le chrono et le journal arrivent ticket par ticket. */
export function AthleanAVenir() {
  return (
    <React.Fragment>
      <div style={{ fontFamily:DISPLAY, fontSize:46, lineHeight:.92 }}>ATHLEAN X</div>
      <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:".1em", color:C.lime, margin:"4px 0 24px" }}>
        PROGRAMME FIXE · WORKOUT A / B
      </div>
      <div style={{ border:`1px dashed ${C.line}`, borderRadius:3, minHeight:200, display:"flex",
        alignItems:"center", justifyContent:"center", textAlign:"center", padding:"0 24px",
        color:C.ash, fontSize:13.5, lineHeight:1.6, whiteSpace:"pre-line" }}>
        {"Le programme n'est pas encore en place.\nRien à lancer pour l'instant."}
      </div>
    </React.Fragment>
  );
}
