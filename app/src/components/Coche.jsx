import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";

/* Une case à cocher de l'écran d'avant-lancement.

   Elle vit dans un fichier à elle pour une raison de vérification : `App` ne
   se rend pas en test — il touche `window` — et le seul écran que le correctif
   ajoutait était donc invérifiable. Sorti d'App, ce morceau se rend. */
export function Coche({ on, onToggle, titre, detail }) {
  return (
    <button onClick={onToggle} style={{ width:"100%", display:"flex", alignItems:"center",
      gap:14, padding:"14px 0", borderBottom:`1px solid ${C.line}`, textAlign:"left" }}>
      <span style={{ width:22, height:22, flexShrink:0, borderRadius:2,
        border:`1px solid ${on ? C.lime : C.line}`, background: on ? C.lime : "transparent",
        color:C.ink, fontFamily:MONO, fontSize:13, fontWeight:700, lineHeight:"21px", textAlign:"center" }}>
        {on ? "✓" : ""}
      </span>
      <span>
        <span style={{ fontFamily:DISPLAY, fontSize:19 }}>{titre}</span>
        <span style={{ display:"block", fontSize:12, color:C.ash, lineHeight:1.4, marginTop:2 }}>
          {detail}
        </span>
      </span>
    </button>
  );
}
