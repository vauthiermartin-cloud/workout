let audioCtx = null;

export function beep(freq, ms) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "square"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.14, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + ms / 1000);
  } catch {}
}

/* Ce qui suit sert le chrono d'Athlean X. `beep` reste tel quel pour le chrono
   Classique.

   iOS ne laisse sonner un contexte audio que s'il a été ouvert sous le doigt.
   `deverrouiller` est donc appelé dans le geste « Démarrer » lui-même : le
   contexte s'y crée ou s'y réveille, et un échantillon muet le fait jouer une
   première fois. */
export function deverrouiller() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const src = audioCtx.createBufferSource();
    src.buffer = audioCtx.createBuffer(1, 1, 22050);
    src.connect(audioCtx.destination);
    src.start(0);
  } catch {}
}

/* Les sons en cours sont retenus pour que passer ou recommencer une étape
   puisse les couper net. */
let enCours = [];

export function ton(freq, ms) {
  try {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "square"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.14, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000);
    o.connect(g); g.connect(audioCtx.destination);
    o.onended = () => { enCours = enCours.filter((x) => x !== o); };
    enCours.push(o);
    o.start(); o.stop(audioCtx.currentTime + ms / 1000);
  } catch {}
}

/* Sans API de vibration — Safari iOS n'en a pas —, rien ne se passe et rien
   ne casse. */
export function vibrer(motif) {
  try { if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(motif); } catch {}
}

export function couper() {
  enCours.forEach((o) => { try { o.stop(); } catch {} });
  enCours = [];
  vibrer(0);
}
