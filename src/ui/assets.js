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

export function spriteSVG(art) {
  return art === 'slime' ? slimeSVG() : heroSVG();
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
  return wrap('');
}
