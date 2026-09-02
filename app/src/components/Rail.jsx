import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { scaleRep } from "../data/levels.js";

export function Rail({ blocks, accent, level, reduced }) {
  return (
    <div style={{ borderLeft:`1px solid ${C.line}`, marginLeft:6 }}>
      {blocks.map((b, i) => (
        <div key={i} style={{ position:"relative", paddingLeft:20, paddingBottom:20,
          opacity: reduced ? 1 : 0, animation: reduced ? "none" : `wodIn 320ms cubic-bezier(.2,.7,.3,1) ${i*55}ms forwards` }}>
          <span style={{ position:"absolute", left:-4, top:5, width:7, height:7, background:accent, borderRadius:1 }} />
          <div style={{ fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".14em", color:C.ash, marginBottom:5 }}>{b.tag}</div>
          {b.items.map((it, j) => (
            <div key={j} style={{ marginBottom: it.d ? 8 : 0 }}>
              <div style={{ fontFamily:DISPLAY, fontSize:21, lineHeight:1.24 }}>
                {it.txt ? it.txt : (
                  <React.Fragment>
                    <span style={{ color: level > 1 ? C.lime : C.bone }}>{scaleRep(it.n, level)}</span> {it.t}
                  </React.Fragment>
                )}
              </div>
              {it.d && <div style={{ fontSize:12, color:C.ash, lineHeight:1.45, marginTop:2 }}>{it.d}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
