import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { QUALITES, demandeNote, retourDeQualite } from "../lib/qualite.js";

/* La note de qualité, à l'écran. Trois boutons comme le ressenti — et c'est
   précisément pour ça qu'ils ne se ressemblent pas : la question posée doit
   suffire à dire lequel des deux on est en train de répondre. Le ressenti
   demande comment c'était pour toi, celui-ci ce que valait la séance.

   Le champ de texte n'apparaît que sur un signalement. Rien n'oblige à le
   remplir : la séance part alors dans la liste « à documenter » du récap, ce
   qui est plus honnête qu'un formulaire qui bloque. */
export function Qualite({ valeur, note, onChoix, onNote }) {
  return (
    <React.Fragment>
      <div style={{ fontFamily:MONO, fontSize:9.5, letterSpacing:".16em",
        color: valeur ? C.ash : C.lime, marginBottom:6 }}>
        QUALITÉ DE LA SÉANCE
      </div>
      <div style={{ fontFamily:DISPLAY, fontSize:26, lineHeight:1, marginBottom:14 }}>
        ELLE VALAIT QUOI ?
      </div>
      <div style={{ display:"flex", gap:6 }}>
        {QUALITES.map((q) => {
          const on = valeur === q.id;
          return (
            <button key={q.id} onClick={() => onChoix(q.id)}
              style={{ flex:1, padding:"15px 0", borderRadius:2,
                background: on ? C.lime : "transparent",
                border:`1px solid ${on ? C.lime : C.line}`,
                color: on ? C.ink : C.bone,
                fontFamily:MONO, fontSize:9.5, fontWeight:700, letterSpacing:".07em" }}>
              {q.label}
            </button>
          );
        })}
      </div>
      {valeur && (
        <p style={{ fontSize:14, color:C.bone, lineHeight:1.45, margin:"13px 0 0" }}>
          {retourDeQualite(valeur)}
        </p>
      )}
      {demandeNote(valeur) && (
        <textarea value={note || ""} onChange={(e) => onNote(e.target.value)} rows={3}
          placeholder="Ce qui cloche : un volume aberrant, un enchaînement qui ne passe pas, un exercice mal placé…"
          style={{ width:"100%", marginTop:12, padding:"11px 12px", background:C.ink,
            border:`1px solid ${C.line}`, borderRadius:2, color:C.bone, fontSize:13.5,
            lineHeight:1.5, resize:"vertical", fontFamily:"inherit" }} />
      )}
    </React.Fragment>
  );
}
