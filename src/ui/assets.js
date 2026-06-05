// Assets SVG dessinés en code — style cartoon : aplats vifs, gros contours.
// Tout est vectoriel (léger, redimensionnable, animable en CSS).

const OUT = '#2b2138'; // contour sombre commun

// --- Personnages --------------------------------------------------------
export function heroSVG() {
  return `<svg viewBox="0 0 120 140" class="sprite-svg" aria-label="Héros">
    <ellipse cx="60" cy="128" rx="34" ry="8" fill="#000" opacity=".18"/>
    <!-- corps -->
    <path d="M32 70 q28 -16 56 0 l4 46 q-32 14 -64 0 z" fill="#4a90d9" stroke="${OUT}" stroke-width="4"/>
    <path d="M48 72 h24 l-4 44 h-16 z" fill="#f4d35e" stroke="${OUT}" stroke-width="4"/>
    <!-- bras + épée -->
    <rect x="84" y="60" width="12" height="40" rx="6" fill="#4a90d9" stroke="${OUT}" stroke-width="4"/>
    <rect x="86" y="6" width="8" height="60" rx="4" fill="#dfe6ee" stroke="${OUT}" stroke-width="4"/>
    <rect x="78" y="58" width="24" height="9" rx="4" fill="#f4d35e" stroke="${OUT}" stroke-width="4"/>
    <!-- bouclier -->
    <path d="M18 64 q10 -8 20 0 v18 q-10 12 -20 0 z" fill="#e2574c" stroke="${OUT}" stroke-width="4"/>
    <!-- tête / casque -->
    <circle cx="60" cy="44" r="26" fill="#ffd9a8" stroke="${OUT}" stroke-width="4"/>
    <path d="M34 40 a26 26 0 0 1 52 0 v-2 a26 26 0 0 0 -52 0 z" fill="#9aa7b4" stroke="${OUT}" stroke-width="4"/>
    <rect x="56" y="30" width="8" height="26" fill="#9aa7b4" stroke="${OUT}" stroke-width="3"/>
    <circle cx="50" cy="46" r="3.5" fill="${OUT}"/>
    <circle cx="70" cy="46" r="3.5" fill="${OUT}"/>
    <path d="M52 56 q8 6 16 0" fill="none" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

export function slimeSVG() {
  return `<svg viewBox="0 0 140 130" class="sprite-svg" aria-label="Gluant">
    <ellipse cx="70" cy="120" rx="46" ry="9" fill="#000" opacity=".18"/>
    <path d="M14 96 q-2 -64 56 -64 q58 0 56 64 q-28 18 -56 14 q-28 4 -56 -14 z"
          fill="#5fd35f" stroke="${OUT}" stroke-width="5"/>
    <path d="M30 60 q6 -10 14 -2 q-4 8 -14 2 z" fill="#bff7bf" opacity=".8"/>
    <circle cx="52" cy="74" r="11" fill="#fff" stroke="${OUT}" stroke-width="4"/>
    <circle cx="92" cy="74" r="11" fill="#fff" stroke="${OUT}" stroke-width="4"/>
    <circle cx="54" cy="77" r="5" fill="${OUT}"/>
    <circle cx="90" cy="77" r="5" fill="${OUT}"/>
    <path d="M56 98 q14 10 28 0" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

export function batSVG() {
  return `<svg viewBox="0 0 150 120" class="sprite-svg" aria-label="Chauve-souris">
    <ellipse cx="75" cy="110" rx="34" ry="7" fill="#000" opacity=".18"/>
    <path d="M75 50 q-50 -34 -64 -6 q24 -2 24 14 q12 -10 40 -8 z" fill="#6b4bb0" stroke="${OUT}" stroke-width="4"/>
    <path d="M75 50 q50 -34 64 -6 q-24 -2 -24 14 q-12 -10 -40 -8 z" fill="#6b4bb0" stroke="${OUT}" stroke-width="4"/>
    <ellipse cx="75" cy="62" rx="26" ry="24" fill="#7d5fff" stroke="${OUT}" stroke-width="4"/>
    <path d="M58 40 l6 14 l-14 -6 z" fill="#7d5fff" stroke="${OUT}" stroke-width="3"/>
    <path d="M92 40 l-6 14 l14 -6 z" fill="#7d5fff" stroke="${OUT}" stroke-width="3"/>
    <circle cx="66" cy="60" r="5" fill="#fff"/><circle cx="84" cy="60" r="5" fill="#fff"/>
    <circle cx="67" cy="61" r="2.5" fill="${OUT}"/><circle cx="85" cy="61" r="2.5" fill="${OUT}"/>
    <path d="M68 74 l4 5 l4 -5 l4 5 l4 -5" fill="none" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

export function golemSVG() {
  return `<svg viewBox="0 0 130 130" class="sprite-svg" aria-label="Golem">
    <ellipse cx="65" cy="122" rx="42" ry="8" fill="#000" opacity=".18"/>
    <rect x="26" y="44" width="78" height="68" rx="12" fill="#9aa7b4" stroke="${OUT}" stroke-width="5"/>
    <rect x="14" y="58" width="16" height="40" rx="6" fill="#869"  stroke="${OUT}" stroke-width="4" fill="#7e8a98"/>
    <rect x="100" y="58" width="16" height="40" rx="6" fill="#7e8a98" stroke="${OUT}" stroke-width="4"/>
    <rect x="40" y="60" width="18" height="18" rx="4" fill="#cfd6de" stroke="${OUT}" stroke-width="3"/>
    <rect x="72" y="60" width="18" height="18" rx="4" fill="#cfd6de" stroke="${OUT}" stroke-width="3"/>
    <circle cx="49" cy="69" r="4" fill="${OUT}"/><circle cx="81" cy="69" r="4" fill="${OUT}"/>
    <path d="M48 94 h34" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
    <path d="M40 30 l8 14 M65 26 v18 M90 30 l-8 14" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

export function bruteSVG() {
  return `<svg viewBox="0 0 130 140" class="sprite-svg" aria-label="Brute">
    <ellipse cx="65" cy="130" rx="40" ry="8" fill="#000" opacity=".18"/>
    <path d="M28 78 q37 -18 74 0 l6 42 q-43 16 -86 0 z" fill="#4a8a3d" stroke="${OUT}" stroke-width="5"/>
    <circle cx="65" cy="48" r="30" fill="#5fb04d" stroke="${OUT}" stroke-width="5"/>
    <path d="M40 36 l-12 -8 M90 36 l12 -8" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="54" cy="48" r="5" fill="#fff"/><circle cx="76" cy="48" r="5" fill="#fff"/>
    <circle cx="55" cy="49" r="2.5" fill="${OUT}"/><circle cx="77" cy="49" r="2.5" fill="${OUT}"/>
    <path d="M50 64 q15 8 30 0" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
    <path d="M56 62 l-2 8 M74 62 l2 8" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <rect x="96" y="36" width="10" height="60" rx="4" fill="#a9743a" stroke="${OUT}" stroke-width="4"/>
    <rect x="86" y="26" width="30" height="22" rx="6" fill="#9aa7b4" stroke="${OUT}" stroke-width="4"/>
  </svg>`;
}

export function guardianSVG() {
  return `<svg viewBox="0 0 150 150" class="sprite-svg" aria-label="Gardien">
    <ellipse cx="75" cy="140" rx="50" ry="9" fill="#000" opacity=".2"/>
    <path d="M30 80 q45 -22 90 0 l8 50 q-53 18 -106 0 z" fill="#c79a2e" stroke="${OUT}" stroke-width="5"/>
    <path d="M44 92 h62 v8 h-62z" fill="#fff3c4" opacity=".6"/>
    <circle cx="75" cy="50" r="34" fill="#e9c45a" stroke="${OUT}" stroke-width="5"/>
    <path d="M41 50 a34 34 0 0 1 68 0 z" fill="#b98a22" stroke="${OUT}" stroke-width="5"/>
    <path d="M52 18 l6 18 M75 12 v24 M98 18 l-6 18" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="62" cy="54" r="6" fill="#fff"/><circle cx="88" cy="54" r="6" fill="#fff"/>
    <circle cx="63" cy="55" r="3" fill="#e2574c"/><circle cx="89" cy="55" r="3" fill="#e2574c"/>
    <path d="M60 72 q15 8 30 0" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

export function spriteSVG(art) {
  switch (art) {
    case 'slime': return slimeSVG();
    case 'bat': return batSVG();
    case 'golem': return golemSVG();
    case 'brute': return bruteSVG();
    case 'guardian': return guardianSVG();
    default: return heroSVG();
  }
}

// --- Icônes de cartes ---------------------------------------------------
export function cardArtSVG(art) {
  const wrap = (inner) => `<svg viewBox="0 0 64 64" class="card-art-svg">${inner}</svg>`;
  if (art === 'sword') return wrap(`
    <rect x="28" y="6" width="8" height="38" rx="3" fill="#dfe6ee" stroke="${OUT}" stroke-width="3"/>
    <rect x="18" y="42" width="28" height="7" rx="3" fill="#f4d35e" stroke="${OUT}" stroke-width="3"/>
    <rect x="29" y="48" width="6" height="12" rx="2" fill="#a9743a" stroke="${OUT}" stroke-width="3"/>`);
  if (art === 'shield') return wrap(`
    <path d="M14 14 q18 -8 36 0 v20 q-18 22 -36 0 z" fill="#4a90d9" stroke="${OUT}" stroke-width="3"/>
    <path d="M32 18 v28" stroke="#dfe6ee" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 28 h24" stroke="#dfe6ee" stroke-width="4" stroke-linecap="round"/>`);
  if (art === 'hammer') return wrap(`
    <rect x="16" y="14" width="32" height="18" rx="4" fill="#9aa7b4" stroke="${OUT}" stroke-width="3"/>
    <rect x="29" y="30" width="6" height="26" rx="2" fill="#a9743a" stroke="${OUT}" stroke-width="3"/>`);
  if (art === 'flame') return wrap(`
    <path d="M32 6 q14 16 14 30 a14 14 0 0 1 -28 0 q0 -10 14 -30z" fill="#ff8a3d" stroke="${OUT}" stroke-width="3"/>
    <path d="M32 24 q7 8 7 14 a7 7 0 0 1 -14 0 q0 -5 7 -14z" fill="#ffd84d"/>`);
  if (art === 'whirl') return wrap(`
    <path d="M32 32 q-22 -6 -24 -26 q18 6 24 26z" fill="#9aa7b4" stroke="${OUT}" stroke-width="3"/>
    <path d="M32 32 q22 6 24 26 q-18 -6 -24 -26z" fill="#9aa7b4" stroke="${OUT}" stroke-width="3"/>
    <path d="M32 32 q6 -22 26 -24 q-6 18 -26 24z" fill="#cfd6de" stroke="${OUT}" stroke-width="3"/>
    <path d="M32 32 q-6 22 -26 24 q6 -18 26 -24z" fill="#cfd6de" stroke="${OUT}" stroke-width="3"/>
    <circle cx="32" cy="32" r="5" fill="#f4d35e" stroke="${OUT}" stroke-width="2"/>`);
  return wrap('');
}

// --- Icônes d'objets ----------------------------------------------------
export function relicSVG(art) {
  const wrap = (inner) => `<svg viewBox="0 0 48 48" class="relic-svg">${inner}</svg>`;
  if (art === 'katana') return wrap(`
    <path d="M8 40 q22 -28 34 -34 l2 4 q-14 10 -32 34 z" fill="#dfe6ee" stroke="${OUT}" stroke-width="3"/>
    <rect x="6" y="36" width="12" height="6" rx="3" fill="#2b2138"/>`);
  if (art === 'grease') return wrap(`
    <ellipse cx="24" cy="30" rx="14" ry="12" fill="#f4d35e" stroke="${OUT}" stroke-width="3"/>
    <path d="M16 16 q8 -8 16 0" fill="none" stroke="${OUT}" stroke-width="3"/>
    <circle cx="20" cy="30" r="2.5" fill="${OUT}"/><circle cx="28" cy="30" r="2.5" fill="${OUT}"/>`);
  if (art === 'venom') return wrap(`
    <path d="M24 6 q12 18 12 26 a12 12 0 0 1 -24 0 q0 -8 12 -26z" fill="#5fd35f" stroke="${OUT}" stroke-width="3"/>
    <circle cx="20" cy="30" r="3" fill="#bff7bf"/>`);
  if (art === 'gauntlet') return wrap(`
    <rect x="14" y="16" width="20" height="22" rx="5" fill="#e2574c" stroke="${OUT}" stroke-width="3"/>
    <rect x="14" y="10" width="5" height="10" rx="2" fill="#e2574c" stroke="${OUT}" stroke-width="2"/>
    <rect x="21" y="8" width="5" height="12" rx="2" fill="#e2574c" stroke="${OUT}" stroke-width="2"/>
    <rect x="28" y="10" width="5" height="10" rx="2" fill="#e2574c" stroke="${OUT}" stroke-width="2"/>`);
  if (art === 'ember') return wrap(`
    <path d="M24 6 q14 14 14 26 a14 14 0 0 1 -28 0 q0 -10 14 -26z" fill="#ff5a1f" stroke="${OUT}" stroke-width="3"/>
    <path d="M24 22 q6 7 6 12 a6 6 0 0 1 -12 0 q0 -5 6 -12z" fill="#ffd84d"/>`);
  if (art === 'tower') return wrap(`
    <path d="M10 12 q14 -6 28 0 v16 q-14 18 -28 0z" fill="#6b7a8d" stroke="${OUT}" stroke-width="3"/>
    <rect x="21" y="14" width="6" height="22" rx="2" fill="#cfd6de"/>
    <rect x="14" y="16" width="20" height="6" rx="2" fill="#cfd6de"/>`);
  if (art === 'fused') return wrap(`
    <path d="M24 6 l5 12 l13 1 l-10 9 l3 13 l-11 -7 l-11 7 l3 -13 l-10 -9 l13 -1 z"
          fill="#ffd84d" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="24" cy="22" r="4" fill="#fff7e6"/>`);
  if (art === 'amalgam') return wrap(`
    <circle cx="18" cy="26" r="12" fill="#7d5fff" stroke="${OUT}" stroke-width="3"/>
    <circle cx="30" cy="22" r="12" fill="#5fd35f" stroke="${OUT}" stroke-width="3"/>
    <circle cx="24" cy="24" r="5" fill="#fff" opacity=".8"/>`);
  if (art === 'blood') return wrap(`
    <path d="M16 38 q18 -28 30 -34 l2 4 q-12 10 -28 34 z" fill="#cfd6de" stroke="${OUT}" stroke-width="3"/>
    <path d="M22 30 q3 6 1 10 a3 3 0 0 1 -6 0 q0 -4 5 -10z" fill="#e23d57" stroke="${OUT}" stroke-width="2"/>
    <rect x="12" y="34" width="12" height="6" rx="3" fill="${OUT}"/>`);
  return wrap('');
}
