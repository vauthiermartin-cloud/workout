import React, { useState } from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { mmss } from "../lib/dates.js";
import { labelOf } from "../data/exercises.js";
import { correctionsDe, perfsOf, valeurDe, volumeReel } from "../lib/perfs.js";

const uniteCourte = (u) => (u === "secondes" ? "s" : u === "tours" ? "tours" : "reps");

/* Au niveau du module, et pas dans le rendu de `Perfs` : une fonction définie à
   chaque rendu est un type de composant neuf à chaque frappe, et React démonte
   alors le champ au lieu de le mettre à jour. Le clavier de l'iPhone se
   refermait à chaque chiffre. */
function Ligne({ champ, accent, valeur, onChange }) {
  const titre = champ.kind === "ex" ? labelOf(champ.ex)
    : champ.kind === "tours" ? `Tours · ${champ.label}`
    : champ.label;
  const sous = champ.kind === "ex" ? `PRÉVU ${champ.prescrit}`
    : champ.kind === "tours" ? `1 TOUR = ${champ.parTour} REPS${champ.pas ? ` · +${champ.pas} PAR TOUR` : ""}`
    : "AUCUNE RÉFÉRENCE, C'EST TA MESURE";
  const change = champ.kind === "ex" && valeur !== "" && Number(valeur) !== champ.prescrit;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0",
      borderBottom:`1px solid ${C.line}` }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:DISPLAY, fontSize:20, lineHeight:1.15 }}>{titre}</div>
        <div style={{ fontFamily:MONO, fontSize:9.5, letterSpacing:".12em",
          color: change ? accent : C.ash, marginTop:4 }}>
          {sous}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:5, flexShrink:0 }}>
        <input type="text" inputMode="numeric" pattern="[0-9]*" value={valeur}
          onChange={(e) => onChange(e.target.value)} placeholder="—"
          style={{ width:78, padding:"6px 0", background:"transparent",
            color: change ? accent : C.bone, fontFamily:DISPLAY, fontSize:30, textAlign:"right",
            border:"none", borderBottom:`1px solid ${change ? accent : C.line}`, outline:"none" }} />
        <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:".08em", color:C.ash }}>
          {uniteCourte(champ.unit)}
        </span>
      </div>
    </div>
  );
}

/* « Mes chiffres du jour » : la saisie, sans son cadre.

   La ligne de séance existe déjà, cet écran la corrige. Une sortie existe donc
   — un écran de fin sans issue avait déjà été un piège une fois — mais elle ne
   perd rien : elle enregistre les champs modifiés sans marquer la ligne relue.
   Seul « c'est bon » la marque relue, et fixe tous les champs.

   Le corps est séparé du cadre parce qu'il sert à deux endroits : en plein
   écran depuis le bilan de fin, et comme premier onglet de la relecture.
   `sortie` nomme la sortie, qui n'est pas la même dans les deux cas. */
export function PerfsCorps({ name, level, entry, accent, onValider, onRetour, sortie }) {
  const champs = perfsOf(name, level);
  const [initial] = useState(() => {
    const o = {};
    champs.forEach((c) => {
      const v = c.kind === "score" ? entry && entry.s : valeurDe(c, entry && entry.perfs);
      o[c.k] = v === null || v === undefined ? "" : String(v);
    });
    return o;
  });
  const [saisie, setSaisie] = useState(initial);

  const set = (k, v) => setSaisie((s) => ({ ...s, [k]: v.replace(/[^0-9]/g, "") }));

  /* Ce que la saisie dit en l'état, façonné comme la ligne de séance. Sert deux
     fois : au total affiché, qui suit la frappe, et à la validation. */
  const lecture = () => {
    const perfs = {};
    let score = null;
    champs.forEach((c) => {
      const v = saisie[c.k] === "" ? null : Number(saisie[c.k]);
      if (c.kind === "score") score = v;
      else if (v !== null) perfs[c.k] = v;
    });
    const o = { perfs };
    if (champs.some((c) => c.kind === "score")) o.s = score;
    return o;
  };

  const valider = () => onValider(lecture());

  /* Le total suit la frappe : corriger un chiffre montre tout de suite ce que ça
     change. Il se tait tant qu'un tour ou un score manque — additionner ce qui
     est connu donnerait un total plus faux que pas de total.

     Le chrono, lui, est mesuré et non saisi : il vient de la ligne. */
  const lu = lecture();
  const vu = volumeReel(name, level, lu.perfs, lu.s);
  const dur = entry && entry.dur != null ? entry.dur : null;

  /* Sortir sans valider n'est pas tout jeter, mais ce n'est pas tout garder
     non plus : `correctionsDe` tranche. La ligne n'est pas marquée relue pour
     autant — c'est « c'est bon » qui le dit, et la fiche continue de proposer
     d'y revenir. */
  const retour = () =>
    onRetour(correctionsDe(champs, saisie, initial, entry && entry.perfs));

  return (
    <>
      <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".16em", color:accent, marginBottom:10 }}>
        MES CHIFFRES DU JOUR
      </div>
      <div style={{ fontFamily:DISPLAY, fontSize:40, lineHeight:.95, marginBottom:8 }}>
        CE QUE TU AS FAIT
      </div>
      <p style={{ fontSize:13.5, color:C.ash, lineHeight:1.5, margin:"0 0 20px" }}>
        Ajuste si tu as fait plus ou moins que prévu. Les totaux sont ceux de la séance
        entière, pas d'une série.
      </p>

      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {[
          { n: vu.complet ? vu.total : "—", l: "RÉPÉTITIONS FAITES" },
          { n: dur === null ? "—" : mmss(dur), l: "CHRONO EFFECTUÉ" },
        ].map((k, i) => (
          <div key={i} style={{ flex:1, background:C.steel, borderRadius:3, padding:"14px 12px" }}>
            <div style={{ fontFamily:DISPLAY, fontSize:32, lineHeight:.9 }}>{k.n}</div>
            <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".1em", color:C.ash, marginTop:6 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:24 }}>
        {champs.map((c) => (
          <Ligne key={c.k} champ={c} accent={accent} valeur={saisie[c.k]}
            onChange={(v) => set(c.k, v)} />
        ))}
      </div>

      <button onClick={valider} style={{ width:"100%", padding:"16px 0", background:accent,
        color:C.ink, fontFamily:DISPLAY, fontSize:19, letterSpacing:".04em", borderRadius:2 }}>
        C'EST BON
      </button>
      <button onClick={retour} style={{ width:"100%", padding:"14px 0", marginTop:6,
        fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash }}>
        {sortie}
      </button>
    </>
  );
}

/* Le plein écran, tel qu'il s'ouvre depuis le bilan de fin. */
export function Perfs(props) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:47, background:C.ink, overflowY:"auto",
      padding:"max(28px, env(safe-area-inset-top)) 20px calc(28px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth:460, margin:"0 auto" }}>
        <PerfsCorps {...props} sortie="RETOUR AU BILAN" />
      </div>
    </div>
  );
}
