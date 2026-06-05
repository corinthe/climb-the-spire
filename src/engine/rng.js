// Générateur pseudo-aléatoire DÉTERMINISTE basé sur une seed.
// Tout le hasard du jeu (map, récompenses, pioche...) doit passer par ici :
// une même seed => un run strictement reproductible.

export function hashSeed(str) {
  let h = 1779033703 ^ String(str).length;
  for (let i = 0; i < String(str).length; i++) {
    h = Math.imul(h ^ String(str).charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// mulberry32 — petit, rapide, suffisant pour un jeu.
export function makeRng(seedStr) {
  let a = hashSeed(seedStr);
  const rng = {
    seed: seedStr,
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min, max) {
      return min + Math.floor(rng.next() * (max - min + 1));
    },
    pick(arr) {
      return arr[Math.floor(rng.next() * arr.length)];
    },
    // Fisher-Yates déterministe (ne modifie pas l'entrée).
    shuffle(arr) {
      const r = arr.slice();
      for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [r[i], r[j]] = [r[j], r[i]];
      }
      return r;
    },
  };
  return rng;
}
