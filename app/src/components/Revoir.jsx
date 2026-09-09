import React, { useState } from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { volumeReel } from "../lib/perfs.js";
import { BilanEntete, BilanPatterns } from "./Bilan.jsx";
import { PerfsCorps } from "./Perfs.jsx";
import { Rail } from "./Rail.jsx";

/* La relecture d'une séance faite.
   ==============================

   Elle n'est pas l'écran de fin réaffiché, et c'est tout l'objet de ce fichier.
   L'écran de fin est un moment du parcours : il propose un finisher, des
   étirements, il demande le ressenti. Revenir dessus plus tard rouvrait ces
   propositions comme si la journée n'était pas jouée.

   Ici, rien n'est à décider. Deux onglets, aucune action de séance :

   - `chiffres`, l'onglet d'arrivée, parce que c'est la seule chose qui reste
     corrigeable — et le vendredi, la seule qui puisse manquer ;
   - `seance`, ce qui a été fait et ce que ça a couvert, consignes comprises.
     Les consignes ont quitté la fiche du jour, où relire le travail d'une
     séance déjà faite n'aidait personne ; c'est ici qu'elles se retrouvent.

   Le ressenti n'y figure pas. Il se répond à chaud, sur l'écran de fin, ou
   pas du tout : une séance sans réponse est une séance sans signal, pas une
   séance à rattraper. */
export function Revoir({ wod, finisher, stretch, level, entry, accent, vol, volFin,
  streak, weekCount, pats, manque, reduced, onValider, onRetour }) {
  const [onglet, setOnglet] = useState("chiffres");

  const reel = entry && entry.valide
    ? volumeReel(wod.name, level, entry.perfs, entry.s) : null;
  const fait = reel && reel.complet;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:46, background:C.ink, overflowY:"auto",
      padding:"max(28px, env(safe-area-inset-top)) 20px calc(28px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth:460, margin:"0 auto" }}>

        <div style={{ display:"flex", gap:6, marginBottom:24 }}>
          {[{ id:"chiffres", l:"MES CHIFFRES" }, { id:"seance", l:"LA SÉANCE" }].map((t) => {
            const on = onglet === t.id;
            return (
              <button key={t.id} onClick={() => setOnglet(t.id)}
                style={{ flex:1, padding:"10px 0", borderRadius:2, fontFamily:MONO,
                  fontSize:10, fontWeight:700, letterSpacing:".1em",
                  background: on ? C.bone : "transparent", color: on ? C.ink : C.ash,
                  border:`1px solid ${on ? C.bone : C.line}` }}>
                {t.l}
              </button>
            );
          })}
        </div>

        {onglet === "chiffres" ? (
          <PerfsCorps name={wod.name} level={level} entry={entry} accent={accent}
            onValider={onValider} onRetour={onRetour} sortie="FERMER" />
        ) : (
          <>
            <BilanEntete stage="workout" wod={wod} finisher={finisher} stretch={stretch}
              vol={vol} volFin={volFin} reel={reel} fait={fait}
              streak={streak} weekCount={weekCount} />
            <BilanPatterns pats={pats} manque={manque} />

            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between",
              borderTop:`1px solid ${C.line}`, paddingTop:18, marginBottom:4 }}>
              <span style={{ fontFamily:DISPLAY, fontSize:26, lineHeight:1 }}>{wod.name}</span>
              <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:accent }}>{wod.dur}</span>
            </div>
            <p style={{ fontSize:13, color:C.ash, lineHeight:1.5, margin:"0 0 16px" }}>{wod.meta}</p>

            <Rail blocks={wod.blocks} accent={accent} level={entry.lvl || level} reduced={reduced} />

            <div style={{ background:C.steel, borderRadius:3, padding:16, fontSize:13.5,
              lineHeight:1.55, marginTop:8 }}>
              <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:accent }}>OBJECTIF</span>
              <div style={{ marginTop:6 }}>{wod.goal}</div>
            </div>

            <button onClick={() => onRetour(null)} style={{ width:"100%", padding:"15px 0",
              marginTop:20, background:"transparent", border:`1px solid ${C.line}`, color:C.bone,
              fontFamily:DISPLAY, fontSize:16, letterSpacing:".04em", borderRadius:2 }}>
              FERMER
            </button>
          </>
        )}
      </div>
    </div>
  );
}
