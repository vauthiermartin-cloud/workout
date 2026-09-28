/* Générateur pseudo-aléatoire déterministe. Les simulations hebdomadaires
   doivent être rejouables : un garde-fou qui tombe une fois sur cinquante
   sans qu'on puisse le reproduire ne sert à rien. */
export function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
