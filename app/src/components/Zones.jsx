import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { ZONES } from "../data/douleurs.js";

/* Le choix des zones sensibles, à deux endroits et sous la même forme.

   Dans les réglages il commande la condition chronique ; avant de lancer le
   chrono, l'état du jour. Une zone chronique y apparaît déjà allumée et ne se
   décoche pas d'un jour : c'est un réglage, pas une humeur, et le seul endroit
   honnête pour y revenir est celui où on l'a déclarée. */
export function Zones({ actives, verrouillees = [], onToggle }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
      {ZONES.map((z) => {
        const bloquee = verrouillees.includes(z.id);
        const on = bloquee || actives.includes(z.id);
        return (
          <button key={z.id} onClick={() => (bloquee ? null : onToggle(z.id))}
            style={{ padding:"9px 12px", borderRadius:2, textAlign:"left",
              background: on ? C.lime : "transparent", color: on ? C.ink : C.bone,
              border:`1px solid ${on ? C.lime : C.line}`, opacity: bloquee ? .72 : 1 }}>
            <span style={{ fontFamily:DISPLAY, fontSize:15, letterSpacing:".02em" }}>{z.label}</span>
            {bloquee && (
              <span style={{ fontFamily:MONO, fontSize:8, letterSpacing:".14em", marginLeft:6 }}>TOUJOURS</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Ce que le choix change, dit en clair avant de lancer. Une séance qui
   remplace trois mouvements sans le dire serait une séance qu'on ne reconnaît
   pas — et la première réaction serait de croire à un bug. */
export function ZonesEffet({ zones, subs, perdus }) {
  const n = Object.keys(subs).length;
  const noms = ZONES.filter((z) => zones.includes(z.id));
  if (!noms.length) return null;
  return (
    <p style={{ fontSize:12, color:C.ash, lineHeight:1.5, margin:"10px 0 0" }}>
      {noms.map((z) => z.detail).join(" ")}
      {" "}
      {n === 0 ? "Rien à remplacer dans cette séance."
        : n === 1 ? "Un exercice remplacé, à volume égal."
        : `${n} exercices remplacés, à volume égal.`}
      {perdus && perdus.length > 0 && (
        ` La couverture ${perdus.length > 1 ? "des schémas" : "du schéma"} ${perdus.join(", ")} n'est pas atteignable comme ça : la grille le dit au lieu de laisser une case vide.`
      )}
    </p>
  );
}
