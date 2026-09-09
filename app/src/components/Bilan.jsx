import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { PATTERNS } from "../data/patterns.js";

/* Le haut du bilan, partagé par l'écran de fin et sa relecture.
   ============================================================

   Les deux écrans montrent les mêmes chiffres, et c'est la raison d'être de ce
   fichier : le choix du libellé du total tient à trois conditions — séance
   relue ou non, format à tours ouverts ou non, finisher enchaîné ou non — et
   deux copies de cette décision auraient fini par dire deux choses.

   Ce qui *diffère* entre les deux écrans reste chez eux : l'écran de fin porte
   le ressenti et les propositions, la relecture porte les consignes. */
export function BilanEntete({ stage, wod, finisher, stretch, vol, volFin, reel, fait, streak, weekCount }) {
  const amrap = vol.amrap || (volFin && volFin.amrap);
  const cartes = [
    { n: (fait ? reel.total : vol.total) + (volFin ? volFin.total : 0),
      l: fait ? "RÉPÉTITIONS FAITES" : amrap ? "REPS PAR TOUR" : "RÉPÉTITIONS" },
    { n: streak, l: streak === 1 ? "JOUR D'AFFILÉE" : "JOURS D'AFFILÉE" },
    { n: `${weekCount}/5`, l: "CETTE SEMAINE" },
  ];
  return (
    <>
      <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".16em", color:C.lime, marginBottom:10 }}>
        {stage === "finisher" ? "FINISHER TERMINÉ" : "SÉANCE TERMINÉE"}
      </div>
      <div style={{ fontFamily:DISPLAY, fontSize:44, lineHeight:.95, marginBottom:6 }}>
        {stage === "finisher" ? "TU EN AS REMIS UNE COUCHE" : "C'EST FAIT"}
      </div>
      <p style={{ fontSize:13.5, color:C.ash, lineHeight:1.5, margin:"0 0 28px" }}>
        {wod.name}{finisher ? ` + ${finisher.name}` : ""}{stretch ? ` + ${stretch.name}` : ""}
      </p>

      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        {cartes.map((k, i) => (
          <div key={i} style={{ flex:1, background:C.steel, borderRadius:3, padding:"14px 12px" }}>
            <div style={{ fontFamily:DISPLAY, fontSize:32, lineHeight:.9 }}>{k.n}</div>
            <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".1em", color:C.ash, marginTop:6 }}>{k.l}</div>
          </div>
        ))}
      </div>
      {vol.amrap && !fait && (
        <p style={{ fontSize:12, color:C.ash, lineHeight:1.5, margin:"-14px 0 24px" }}>
          Format AMRAP : le total affiché est celui d'un seul tour. Dis tes tours en
          validant la séance et le total devient le vrai.
        </p>
      )}
    </>
  );
}

/* Les schémas moteurs travaillés, et ce qui manque à la semaine. */
export function BilanPatterns({ pats, manque }) {
  return (
    <>
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
    </>
  );
}
