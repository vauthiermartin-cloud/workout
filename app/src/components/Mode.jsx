import React from "react";
import { C, DISPLAY, MONO } from "../lib/theme.js";
import { MODES } from "../data/modes.js";
import { MODES_ATHLEAN, etapesAthlean, compositionAthlean } from "../data/seancesAthlean.js";
import { dureeSeance } from "../lib/athlean.js";
import { Coche } from "./Coche.jsx";
import { saisieParBloc } from "../lib/repsAthlean.js";
import { mmss, shortFr } from "../lib/dates.js";

/* Le choix du mode, en tête de l'onglet séance. Aucune condition de jour :
   il s'affiche aussi le week-end, où Athlean X sert de rattrapage. Chaque
   mode porte sa couleur : le vert du Classique, le rouge d'Athlean X.

   Sorti d'App pour la même raison que `Coche` : App ne se rend pas en test. */
export function ChoixMode({ mode, onChoix }) {
  return (
    <div style={{ display:"flex", gap:6, marginBottom:20 }}>
      {MODES.map((m) => {
        const on = m.id === mode;
        const couleur = m.id === "athleanX" ? C.rouge : C.lime;
        return (
          <button key={m.id} onClick={() => onChoix(m.id)} aria-pressed={on}
            style={{ flex:1, padding:"8px 0", fontFamily:MONO, fontSize:10, fontWeight:700,
              letterSpacing:".12em", background: on ? couleur : "transparent",
              color: on ? C.ink : C.ash, border:`1px solid ${on ? couleur : C.line}`, borderRadius:2 }}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/* L'entrée d'Athlean X : quel workout, quel mode, puis le chrono.

   Le workout ne se choisit qu'à la toute première séance. Ensuite, c'est
   l'opposé du dernier joué, sans écran de choix : l'alternance est le
   programme. Le mode, lui, se choisit à chaque séance et rien n'est
   présélectionné — il dépend de l'envie du jour, pas de l'historique.

   Tout l'état vit dans App ; ce composant ne fait que le montrer, ce qui le
   rend lisible en test. */
const MODES_LIBELLES = {
  NORMAL: "deux tours complets",
  BUILD: "deuxième tour force",
  DEFINE: "deuxième tour hybride",
};

export function EntreeAthlean({ propose, dernier, workout, onWorkout, modeSeance, onModeSeance, onLancer, enregistree,
  enCours = false, echauffement = true, onEchauffement = () => {}, children = null }) {
  const choisi = propose || workout;
  /* Une séance laissée en cours se reprend ou s'abandonne d'abord : en
     lancer une autre écraserait ce qui permet de la retrouver. */
  const pret = choisi && modeSeance && !enCours;
  const carte = (on) => ({ flex:1, padding:"14px 0", borderRadius:2, textAlign:"center",
    background: on ? C.rouge : "transparent", color: on ? C.ink : C.bone,
    border:`1px solid ${on ? C.rouge : C.line}` });
  return (
    <React.Fragment>
      <div style={{ fontFamily:DISPLAY, fontSize:46, lineHeight:.92 }}>ATHLEAN X</div>
      <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:".1em", color:C.rouge, margin:"4px 0 24px" }}>
        PROGRAMME FIXE · WORKOUT A / B
      </div>

      {enregistree && (
        <div style={{ padding:12, marginBottom:children ? 10 : 20, border:`1px solid ${C.rouge}`, borderRadius:2, fontSize:12.5, color:C.bone }}>
          Séance enregistrée : workout {enregistree.workoutId} · {enregistree.mode}.
        </div>
      )}
      {children}

      {propose ? (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:DISPLAY, fontSize:34, lineHeight:1 }}>WORKOUT {propose}</div>
          <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash, marginTop:6 }}>
            EN ALTERNANCE · DERNIÈRE SÉANCE : {dernier}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash, marginBottom:8 }}>
            PREMIÈRE SÉANCE · CHOISIS TON WORKOUT
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["A", "B"].map((w) => (
              <button key={w} onClick={() => onWorkout(w)} aria-pressed={workout === w}
                style={{ ...carte(workout === w), fontFamily:DISPLAY, fontSize:22 }}>
                WORKOUT {w}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash, marginBottom:8 }}>MODE</div>
      <div style={{ display:"flex", gap:6, marginBottom:28 }}>
        {MODES_ATHLEAN.map((m) => (
          <button key={m} onClick={() => onModeSeance(m)} aria-pressed={modeSeance === m} style={carte(modeSeance === m)}>
            <div style={{ fontFamily:DISPLAY, fontSize:17 }}>{m}</div>
            <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:".06em", marginTop:4, opacity:.8 }}>
              {mmss(dureeSeance(etapesAthlean("A", m)))}
            </div>
            <div style={{ fontSize:10.5, marginTop:4, opacity:.8 }}>{MODES_LIBELLES[m]}</div>
          </button>
        ))}
      </div>

      {/* L'échauffement du Classique, cochée par défaut comme lui. Il ouvre le
          chrono, avant le pré-départ, et ne compte pas dans la durée annoncée. */}
      <div style={{ marginBottom:28 }}>
        <Coche on={echauffement} onToggle={onEchauffement} titre="Échauffement" couleur={C.rouge}
          detail="5 min avant la séance, hors de sa durée. Tu peux le passer à tout moment." />
      </div>

      {choisi && <CompoAthlean workoutId={choisi} mode={modeSeance} />}

      {/* Comme en Classique, le lancement tient en bas de l'écran : la fiche
          se lit en entier sans le perdre de vue. */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, display:"flex", justifyContent:"center",
        padding:"16px 20px calc(20px + env(safe-area-inset-bottom))",
        background:`linear-gradient(to top, ${C.ink} 62%, rgba(11,11,12,0))` }}>
        <button onClick={pret ? onLancer : undefined} disabled={!pret}
          style={{ width:"100%", maxWidth:460, padding:"18px 0", background: pret ? C.rouge : C.ink,
            color: pret ? C.ink : C.ash, border: pret ? "none" : `1px solid ${C.line}`,
            fontFamily:DISPLAY, fontSize:19, letterSpacing:".04em", borderRadius:2 }}>
          {pret ? `LANCER · ${mmss(dureeSeance(etapesAthlean(choisi, modeSeance)))}`
            : enCours ? "UNE SÉANCE EST EN COURS" : !choisi ? "CHOISIS UN WORKOUT" : "CHOISIS UN MODE"}
        </button>
      </div>
    </React.Fragment>
  );
}

/* La séance Athlean X laissée en cours, retrouvée au démarrage. Même carte
   que pour le Classique : sous quatre heures elle se reprend, en pause, là
   où elle a été laissée ; au-delà elle s'enregistre telle quelle ou
   s'abandonne. Le compte d'exercices est celui de la séance, transitions et
   pré-départ à part. */
export function RepriseAthlean({ pending, onReprendre, onEnregistrer, onAbandonner }) {
  const { kind, rec } = pending;
  const reprise = kind === "resume";
  const etapes = etapesAthlean(rec.workoutId, rec.mode, { echauffement: !!rec.echauffement });
  const exercices = etapes.filter((e) => e.t === "exercice");
  const fait = etapes.slice(0, rec.idx + 1).filter((e) => e.t === "exercice").length;
  const ou = etapes[rec.idx].t === "bloc" ? "Tu étais dans l'échauffement."
    : etapes[rec.idx].t === "exercice" ? `Tu étais à l'exercice ${fait} sur ${exercices.length}.`
    : `Tu allais attaquer l'exercice ${fait + 1} sur ${exercices.length}.`;
  const bouton = { flex:1, padding:"13px 0", fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".1em", borderRadius:2 };
  return (
    <div style={{ padding:16, marginBottom:24, border:`1px solid ${C.rouge}`, borderRadius:3 }}>
      <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".14em", color:C.rouge, marginBottom:8 }}>
        {reprise ? "SÉANCE ATHLEAN X EN COURS" : "SÉANCE ATHLEAN X NON TERMINÉE"}
      </div>
      <div style={{ fontFamily:DISPLAY, fontSize:26, lineHeight:1 }}>WORKOUT {rec.workoutId} · {rec.mode}</div>
      <p style={{ fontSize:12.5, color:C.ash, lineHeight:1.5, margin:"8px 0 14px" }}>
        {reprise
          ? `${ou} Elle reprendra en pause, là où tu l'as laissée.`
          : `Laissée en cours le ${shortFr(rec.d)}. Trop ancienne pour être reprise : tu peux l'enregistrer telle quelle ou l'abandonner.`}
      </p>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={reprise ? onReprendre : onEnregistrer} style={{ ...bouton, background:C.rouge, color:C.ink }}>
          {reprise ? "REPRENDRE" : "ENREGISTRER"}
        </button>
        <button onClick={onAbandonner} style={{ ...bouton, border:`1px solid ${C.line}`, color:C.ash }}>
          ABANDONNER
        </button>
      </div>
    </div>
  );
}

/* Les étirements, une fois la séance Athlean X enregistrée. Même geste que
   l'écran de fin du Classique : un bouton, puis une séquence suggérée —
   l'enchaînement complet —, que AUTRE fait défiler. Faits, ils s'inscrivent
   sur la séance. */
export function EtirementsAthlean({ faits, propose, onProposer, onAutre, onLancer }) {
  if (faits) {
    return (
      <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash, marginBottom:20 }}>
        ✓ ÉTIREMENTS · {faits.toUpperCase()}
      </div>
    );
  }
  const bouton = { flex:1, padding:"14px 0", fontFamily:DISPLAY, fontSize:16, letterSpacing:".04em", borderRadius:2 };
  if (!propose) {
    return (
      <button onClick={onProposer} style={{ ...bouton, width:"100%", marginBottom:20, border:`1px solid ${C.bone}`, color:C.bone }}>
        ÉTIREMENTS · 5 MIN
      </button>
    );
  }
  return (
    <div style={{ padding:14, marginBottom:20, border:`1px solid ${C.line}`, borderRadius:3 }}>
      <div style={{ fontFamily:DISPLAY, fontSize:22, lineHeight:1 }}>{propose.name.toUpperCase()}</div>
      <div style={{ fontSize:11.5, color:C.ash, margin:"4px 0 10px" }}>{propose.meta}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:4, fontSize:12.5, color:C.bone, marginBottom:12 }}>
        {propose.blocks.map((b, i) => <div key={i}>{b.items[0].txt} <span style={{ color:C.ash }}>· {b.tag.toLowerCase()}</span></div>)}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onLancer} style={{ ...bouton, background:C.rouge, color:C.ink }}>LANCER</button>
        <button onClick={onAutre} style={{ ...bouton, border:`1px solid ${C.line}`, color:C.ash }}>AUTRE</button>
      </div>
    </div>
  );
}

/* Le récap de fin de séance Athlean X, rangé comme la fiche : par bloc,
   chaque exercice avec une colonne par tour. Un exercice que le mode ne
   rejoue pas n'a que sa colonne TOUR 1 ; le correctif de BUILD et DEFINE,
   joué après le deuxième tour, a la sienne, FIN. Tout est facultatif — un
   champ vide passe, et ENREGISTRER sans rien noter ne bloque rien. La
   séance est déjà au journal quand cet écran s'ouvre : il n'y ajoute que
   les reps. */
export function SaisieReps({ seance, valeurs, onChange, onValider }) {
  const blocs = saisieParBloc(seance.workoutId, seance.mode);
  const LARGEUR = 64;
  const champ = { width:LARGEUR, padding:"8px 6px", background:C.steel, border:`1px solid ${C.line}`, borderRadius:2,
    color:C.bone, fontFamily:MONO, fontSize:16, textAlign:"center" };
  const colonne = { width:LARGEUR, flexShrink:0, textAlign:"center" };
  return (
    <React.Fragment>
      <div style={{ fontFamily:DISPLAY, fontSize:40, lineHeight:.92 }}>TES REPS</div>
      <div style={{ fontFamily:MONO, fontSize:11, letterSpacing:".1em", color:C.rouge, margin:"4px 0 6px" }}>
        WORKOUT {seance.workoutId} · {seance.mode}
      </div>
      <p style={{ fontSize:12.5, color:C.ash, lineHeight:1.5, margin:"0 0 18px" }}>
        Séance enregistrée. Note ce que tu as fait sur chaque minute ; un champ vide reste vide.
      </p>
      {blocs.map((b) => {
        /* L'en-tête d'une colonne dit le tour de ses champs dans ce bloc. */
        const entete = (k) => [...new Set(b.exercices.flatMap((e) => e.champs.filter((c) => c.colonne === k).map((c) => c.tour)))].join(" / ");
        return (
          <div key={b.numero} style={{ marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, paddingBottom:6, borderBottom:`1px solid ${C.line}`,
              fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash }}>
              <span style={{ flex:1 }}>
                <span style={{ color:C.rouge, fontWeight:700 }}>{b.numero}</span> · {b.titre.fr.toUpperCase()}
              </span>
              <span style={colonne}>{entete(1)}</span>
              <span style={colonne}>{entete(2)}</span>
            </div>
            {b.exercices.map((e) => (
              <div key={e.sourceId} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:`1px solid ${C.line}` }}>
                <span style={{ flex:1, fontSize:14, color:C.bone }}>{e.nom}</span>
                {[1, 2].map((k) => {
                  const c = e.champs.find((x) => x.colonne === k);
                  return c ? (
                    <input key={k} type="text" inputMode="numeric" pattern="[0-9]*" aria-label={`${e.nom}, ${c.tour.toLowerCase()}`}
                      value={valeurs[c.i] ?? ""} onChange={(ev) => onChange(c.i, ev.target.value)} style={champ} />
                  ) : (
                    <span key={k} style={{ ...colonne, color:C.line, fontFamily:MONO }}>—</span>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
      <button onClick={onValider} style={{ width:"100%", marginTop:8, padding:"18px 0", background:C.rouge, color:C.ink,
        fontFamily:DISPLAY, fontSize:19, letterSpacing:".04em", borderRadius:2 }}>
        ENREGISTRER
      </button>
    </React.Fragment>
  );
}

/* Ce que dit le deuxième tour, selon le mode. */
const TOURS = {
  NORMAL: "Deux tours des six blocs, correctif compris.",
  BUILD: "Tour 1 : les cinq premiers blocs. Tour 2 : huit exercices, axe force. Puis le correctif.",
  DEFINE: "Tour 1 : les cinq premiers blocs. Tour 2 : huit exercices, axe hybride. Puis le correctif.",
};

/* La fiche d'une séance Athlean X : ses blocs de trois exercices, dans la
   grammaire de la fiche Classique (`Rail`) — un repère par bloc, le
   libellé en grand. Le nom anglais du spec vient en seconde ligne : c'est
   la fiche, pas le chrono. Le mode choisi dit, exercice par exercice, s'il
   est joué une ou deux fois. */
export function CompoAthlean({ workoutId, mode }) {
  const blocs = compositionAthlean(workoutId, mode);
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:".12em", color:C.ash, marginBottom:6 }}>LA SÉANCE</div>
      <p style={{ fontSize:12.5, color:C.ash, lineHeight:1.5, margin:"0 0 18px" }}>
        {mode ? TOURS[mode] : "Choisis un mode pour voir ce que rejoue le deuxième tour."}
      </p>
      <div style={{ borderLeft:`1px solid ${C.line}`, marginLeft:6 }}>
        {blocs.map((b) => (
          <div key={b.numero} style={{ position:"relative", paddingLeft:20, paddingBottom:20 }}>
            <span style={{ position:"absolute", left:-4, top:5, width:7, height:7, background:C.rouge, borderRadius:1 }} />
            <div style={{ fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:".14em", color:C.ash, marginBottom:5 }}>
              {b.numero} · {b.titre.fr.toUpperCase()} <span style={{ fontWeight:400 }}>· {b.titre.en.toUpperCase()}</span>
            </div>
            {b.exercices.map((e) => (
              <div key={e.sourceId} style={{ marginBottom:8 }}>
                <div style={{ fontFamily:DISPLAY, fontSize:21, lineHeight:1.24 }}>
                  {e.passages !== null && (
                    <span style={{ color: e.passages > 1 ? C.rouge : C.ash }}>×{e.passages} </span>
                  )}
                  {e.nom}
                </div>
                <div style={{ fontFamily:MONO, fontSize:10.5, letterSpacing:".05em", color:C.ash, marginTop:2 }}>{e.nameEn}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
