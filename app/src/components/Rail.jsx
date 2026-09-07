import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { scaleItem } from "../data/levels.js";
import { labelOf, quantityOf, sideNoteOf } from "../data/exercises.js";

export function Rail({ blocks, accent, level, reduced }) {
  return (
    <div style={{ borderLeft:`1px solid ${C.line}`, marginLeft:6 }}>
      {blocks.map((b, i) => (
        <div key={i} style={{ position:"relative", paddingLeft:20, paddingBottom:20,
          opacity: reduced ? 1 : 0, animation: reduced ? "none" : `wodIn 320ms cubic-bezier(.2,.7,.3,1) ${i*55}ms forwards` }}>
          <span style={{ position:"absolute", left:-4, top:5, width:7, height:7, background:accent, borderRadius:1 }} />
          <div style={{ fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".14em", color:C.ash, marginBottom:5 }}>{b.tag}</div>
          {b.items.map((it, j) => {
            /* La fiche est la seule surface où l'on a le temps de lire : c'est
               donc ici que la latéralité se dit, et nulle part ailleurs. La
               note vient de la table, elle n'est plus recopiée à la main dans
               la consigne de chaque ligne. */
            const q = it.txt ? null : scaleItem(it, level);
            const side = q ? sideNoteOf(it.ex, q.n) : null;
            return (
              <div key={j} style={{ marginBottom: it.d || side ? 8 : 0 }}>
                <div style={{ fontFamily:DISPLAY, fontSize:21, lineHeight:1.24 }}>
                  {it.txt ? it.txt : (
                    <React.Fragment>
                      <span style={{ color: q.montee ? C.lime : C.bone }}>{quantityOf(it.ex, q.n)}</span>{" "}
                      {labelOf(it.ex)}
                    </React.Fragment>
                  )}
                </div>
                {/* Sur sa propre ligne : intercalée dans le titre, la note se
                    coupait au milieu (« 8 par / côté ») dès que le libellé
                    était long. */}
                {side && <div style={{ fontFamily:MONO, fontSize:10.5, letterSpacing:".05em", color:C.ash, marginTop:3 }}>{side}</div>}
                {it.d && <div style={{ fontSize:12, color:C.ash, lineHeight:1.45, marginTop:2 }}>{it.d}</div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
