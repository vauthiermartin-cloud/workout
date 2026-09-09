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
/* La suppression d'une séance, armée puis confirmée.
   ================================================

   Elle sert d'abord à montrer l'app à quelqu'un sans laisser la séance de
   démonstration dans les stats, mais aussi à une séance loguée par erreur.

   Elle vit ici et pas sur l'écran de fin : celui-là se voit tous les vrais
   matins juste après l'effort, et un geste destructeur n'y a rien à faire. La
   relecture, elle, ne s'atteint que délibérément.

   Son état d'armement tient dans ce composant, et c'est voulu : changer
   d'onglet le démonte, donc le bouton se désarme seul. Un bouton resté armé
   sous un onglet qu'on ne regarde plus serait un piège. */
export function SupprimerSeance({ onSupprimer }) {
  const [arme, setArme] = useState(false);
  if (!onSupprimer) return null;

  if (!arme) return (
    <button onClick={() => setArme(true)} style={{ display:"block", margin:"28px auto 0",
      padding:"8px 4px", background:"transparent", border:"none", color:C.ash,
      fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".14em" }}>
      SUPPRIMER CETTE SÉANCE
    </button>
  );

  return (
    <div style={{ marginTop:28, border:`1px solid ${C.ember}`, borderRadius:3, padding:16 }}>
      <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.ember }}>EFFACER CETTE SÉANCE</span>
      <p style={{ fontSize:13, color:C.ash, lineHeight:1.5, margin:"8px 0 14px" }}>
        Elle quitte le journal avec ses chiffres. La série et le compte de la
        semaine se recalculent sans elle. Sans retour.
      </p>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => setArme(false)} style={{ flex:1, padding:"13px 0",
          background:"transparent", border:`1px solid ${C.line}`, color:C.bone,
          fontFamily:DISPLAY, fontSize:15, letterSpacing:".04em", borderRadius:2 }}>
          ANNULER
        </button>
        <button onClick={onSupprimer} style={{ flex:1, padding:"13px 0",
          background:C.ember, border:`1px solid ${C.ember}`, color:C.ink,
          fontFamily:DISPLAY, fontSize:15, letterSpacing:".04em", borderRadius:2 }}>
          EFFACER
        </button>
      </div>
    </div>
  );
}

export function Revoir({ wod, finisher, stretch, level, entry, accent, vol, volFin,
  streak, weekCount, pats, manque, reduced, onValider, onRetour, onSupprimer }) {
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

            <SupprimerSeance onSupprimer={onSupprimer} />
          </>
        )}
      </div>
    </div>
  );
}
