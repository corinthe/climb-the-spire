// Contenu du jeu : cartes, statuts, objets, ennemis, événements.
// Données pures, sans logique de rendu. Facile à étendre / équilibrer.

// --- CARTES -------------------------------------------------------------
// Une carte a des `effects` de base. Les OBJETS viennent transformer cette
// liste d'effets au moment où la carte est jouée (voir RELICS.modifyEffects).
export const CARDS = {
  strike: {
    id: 'strike', name: 'Frappe', type: 'attack', cost: 1,
    text: 'Inflige 6 dégâts.',
    effects: [{ type: 'damage', amount: 6, target: 'enemy' }],
    art: 'sword',
  },
  defend: {
    id: 'defend', name: 'Défense', type: 'skill', cost: 1,
    text: 'Gagne 5 blocs.',
    effects: [{ type: 'block', amount: 5, target: 'self' }],
    art: 'shield',
  },

  // --- Cartes gagnables en récompense (variations simples) ---
  heavyblow: {
    id: 'heavyblow', name: 'Coup Lourd', type: 'attack', cost: 2,
    text: 'Inflige 14 dégâts.',
    effects: [{ type: 'damage', amount: 14, target: 'enemy' }],
    art: 'hammer',
  },
  quickjab: {
    id: 'quickjab', name: 'Jab', type: 'attack', cost: 0,
    text: 'Inflige 3 dégâts.',
    effects: [{ type: 'damage', amount: 3, target: 'enemy' }],
    art: 'sword',
  },
  guardstance: {
    id: 'guardstance', name: 'Posture de Garde', type: 'skill', cost: 1,
    text: 'Gagne 9 blocs.',
    effects: [{ type: 'block', amount: 9, target: 'self' }],
    art: 'shield',
  },
  firestrike: {
    id: 'firestrike', name: 'Coup Ardent', type: 'attack', cost: 1,
    text: 'Inflige 4 dégâts et applique 3 Brûlure.',
    effects: [
      { type: 'damage', amount: 4, target: 'enemy' },
      { type: 'status', status: 'burn', amount: 3, target: 'enemy' },
    ],
    art: 'flame',
  },
  venomstrike: {
    id: 'venomstrike', name: 'Dague Vénéneuse', type: 'attack', cost: 1,
    text: 'Inflige 4 dégâts et applique 3 Poison.',
    effects: [
      { type: 'damage', amount: 4, target: 'enemy' },
      { type: 'status', status: 'poison', amount: 3, target: 'enemy' },
    ],
    art: 'flame',
  },
  hamstring: {
    id: 'hamstring', name: 'Entaille', type: 'attack', cost: 1,
    text: 'Inflige 5 dégâts et applique 2 Faiblesse.',
    effects: [
      { type: 'damage', amount: 5, target: 'enemy' },
      { type: 'status', status: 'weak', amount: 2, target: 'enemy' },
    ],
    art: 'sword',
  },
};

// Deck de départ : volontairement simple. La puissance vient des OBJETS.
export const STARTING_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend', 'defend',
];

// Cartes proposées en récompense de combat.
export const REWARD_CARD_IDS = [
  'heavyblow', 'quickjab', 'guardstance', 'firestrike', 'venomstrike', 'hamstring',
];

// --- STATUTS ------------------------------------------------------------
export const STATUSES = {
  weak:   { id: 'weak',   name: 'Faiblesse',  kind: 'debuff', color: '#7d5fff', desc: 'Inflige 25% de dégâts en moins. -1 par tour.' },
  force:  { id: 'force',  name: 'Force',      kind: 'buff',   color: '#ff8a3d', desc: '+dégâts à chaque attaque.' },
  poison: { id: 'poison', name: 'Poison',     kind: 'dot',    color: '#5fd35f', desc: 'Perd ce nombre de PV en début de tour, puis -1.' },
  bleed:  { id: 'bleed',  name: 'Saignement', kind: 'dot',    color: '#e23d57', desc: 'Perd ce nombre de PV en début de tour, puis -1.' },
  burn:   { id: 'burn',   name: 'Brûlure',    kind: 'dot',    color: '#ff5a1f', desc: 'Perd ce nombre de PV en début de tour, puis -1.' },
};

// --- OBJETS (RELIQUES) --------------------------------------------------
// Chaque objet peut implémenter `modifyEffects(cardDef, effects)` :
// il reçoit la liste d'effets et en renvoie une nouvelle (transformée).
// Les objets sont appliqués DANS L'ORDRE => l'empilement crée les combos.
export const RELICS = {
  katana: {
    id: 'katana', name: 'Katana', art: 'katana',
    text: 'Vos attaques frappent deux fois.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      const extraHits = effects.filter((e) => e.type === 'damage').map((e) => ({ ...e }));
      return effects.concat(extraHits);
    },
  },
  beargrease: {
    id: 'beargrease', name: "Graisse d'Ours", art: 'grease',
    text: 'Vos attaques appliquent 1 Faiblesse.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      return effects.concat([{ type: 'status', status: 'weak', amount: 1, target: 'enemy' }]);
    },
  },
  venomblade: {
    id: 'venomblade', name: 'Lame Vénéneuse', art: 'venom',
    text: 'Vos attaques appliquent 2 Poison.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      return effects.concat([{ type: 'status', status: 'poison', amount: 2, target: 'enemy' }]);
    },
  },
  gauntlet: {
    id: 'gauntlet', name: 'Gantelet de Force', art: 'gauntlet',
    text: '+2 dégâts sur chaque coup porté.',
    modifyEffects(card, effects) {
      return effects.map((e) => (e.type === 'damage' ? { ...e, amount: e.amount + 2 } : e));
    },
  },
  emberheart: {
    id: 'emberheart', name: 'Cœur de Braise', art: 'ember',
    text: 'Vos attaques appliquent 2 Brûlure.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      return effects.concat([{ type: 'status', status: 'burn', amount: 2, target: 'enemy' }]);
    },
  },
  towershield: {
    id: 'towershield', name: 'Pavois', art: 'tower',
    text: '+3 blocs à chaque carte de défense.',
    modifyEffects(card, effects) {
      return effects.map((e) => (e.type === 'block' ? { ...e, amount: e.amount + 3 } : e));
    },
  },

  // --- OBJETS FUSIONNÉS (issus de la Forge) ---
  executioner: {
    id: 'executioner', name: 'Lame du Bourreau', art: 'fused', fused: true, from: ['katana', 'gauntlet'],
    text: 'Vos attaques frappent deux fois ET infligent +3 dégâts par coup.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      const boosted = effects.map((e) => (e.type === 'damage' ? { ...e, amount: e.amount + 3 } : e));
      const extra = boosted.filter((e) => e.type === 'damage').map((e) => ({ ...e }));
      return boosted.concat(extra);
    },
  },
  plaguebrand: {
    id: 'plaguebrand', name: 'Sceau de Peste', art: 'fused', fused: true, from: ['venomblade', 'emberheart'],
    text: 'Vos attaques appliquent 3 Poison et 3 Brûlure.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      return effects.concat([
        { type: 'status', status: 'poison', amount: 3, target: 'enemy' },
        { type: 'status', status: 'burn', amount: 3, target: 'enemy' },
      ]);
    },
  },
  aegis: {
    id: 'aegis', name: "Égide de l'Ours", art: 'fused', fused: true, from: ['beargrease', 'towershield'],
    text: '+4 blocs en défense ET vos attaques appliquent 1 Faiblesse.',
    modifyEffects(card, effects) {
      let e = effects.map((x) => (x.type === 'block' ? { ...x, amount: x.amount + 4 } : x));
      if (card.type === 'attack') e = e.concat([{ type: 'status', status: 'weak', amount: 1, target: 'enemy' }]);
      return e;
    },
  },
  serpentfang: {
    id: 'serpentfang', name: 'Croc du Serpent', art: 'fused', fused: true, from: ['katana', 'venomblade'],
    text: 'Vos attaques frappent deux fois ET appliquent 2 Poison.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      const extra = effects.filter((e) => e.type === 'damage').map((e) => ({ ...e }));
      return effects.concat(extra).concat([{ type: 'status', status: 'poison', amount: 2, target: 'enemy' }]);
    },
  },
  magmafist: {
    id: 'magmafist', name: 'Poing de Magma', art: 'fused', fused: true, from: ['gauntlet', 'emberheart'],
    text: '+3 dégâts par coup ET vos attaques appliquent 2 Brûlure.',
    modifyEffects(card, effects) {
      let e = effects.map((x) => (x.type === 'damage' ? { ...x, amount: x.amount + 3 } : x));
      if (card.type === 'attack') e = e.concat([{ type: 'status', status: 'burn', amount: 2, target: 'enemy' }]);
      return e;
    },
  },
  twinfang: {
    id: 'twinfang', name: 'Double Croc', art: 'fused', fused: true, from: ['katana', 'beargrease'],
    text: 'Vos attaques frappent deux fois ET appliquent 1 Faiblesse.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      const extra = effects.filter((e) => e.type === 'damage').map((e) => ({ ...e }));
      return effects.concat(extra).concat([{ type: 'status', status: 'weak', amount: 1, target: 'enemy' }]);
    },
  },
  bulwark: {
    id: 'bulwark', name: 'Rempart', art: 'fused', fused: true, from: ['gauntlet', 'towershield'],
    text: '+2 dégâts par coup ET +4 blocs en défense.',
    modifyEffects(card, effects) {
      return effects.map((e) => {
        if (e.type === 'damage') return { ...e, amount: e.amount + 2 };
        if (e.type === 'block') return { ...e, amount: e.amount + 4 };
        return e;
      });
    },
  },
  corrosion: {
    id: 'corrosion', name: 'Corrosion', art: 'fused', fused: true, from: ['venomblade', 'beargrease'],
    text: 'Vos attaques appliquent 3 Poison et 1 Faiblesse.',
    modifyEffects(card, effects) {
      if (card.type !== 'attack') return effects;
      return effects.concat([
        { type: 'status', status: 'poison', amount: 3, target: 'enemy' },
        { type: 'status', status: 'weak', amount: 1, target: 'enemy' },
      ]);
    },
  },
};

// --- RECETTES DE FUSION -------------------------------------------------
// Clé = paire d'objets triée (id+id) ; valeur = objet fusionné obtenu.
export const RECIPES = {
  'gauntlet+katana': 'executioner',
  'emberheart+venomblade': 'plaguebrand',
  'beargrease+towershield': 'aegis',
  'katana+venomblade': 'serpentfang',
  'emberheart+gauntlet': 'magmafist',
  'beargrease+katana': 'twinfang',
  'gauntlet+towershield': 'bulwark',
  'beargrease+venomblade': 'corrosion',
};

// Calcule l'objet résultant de la fusion de deux objets.
// - Paire connue => objet fusionné dédié (recette).
// - Sinon => "Amalgame" générique : enchaîne les deux effets + bonus universel.
// Déterministe (aucun hasard) ; enregistre l'amalgame généré dans RELICS.
export function fusionResult(a, b) {
  const key = [a, b].sort().join('+');
  if (RECIPES[key]) return RECIPES[key];

  const [x, y] = [a, b].sort();
  const id = `amalgam__${x}__${y}`;
  if (!RELICS[id]) {
    const ra = RELICS[x], rb = RELICS[y];
    RELICS[id] = {
      id, art: 'amalgam', fused: true, from: [x, y],
      name: `Amalgame : ${ra.name} + ${rb.name}`,
      text: `${ra.text} ${rb.text} Et +1 dégât par coup.`,
      modifyEffects(card, effects) {
        let e = effects;
        if (ra.modifyEffects) e = ra.modifyEffects(card, e);
        if (rb.modifyEffects) e = rb.modifyEffects(card, e);
        return e.map((x2) => (x2.type === 'damage' ? { ...x2, amount: x2.amount + 1 } : x2));
      },
    };
  }
  return id;
}

// Aperçu (sans consommer) de l'objet résultant.
export function fusionPreview(a, b) {
  return RELICS[fusionResult(a, b)];
}

// --- ENNEMIS ------------------------------------------------------------
// L'ennemi suit un `pattern` cyclique d'intentions, télégraphiées au joueur.
export const ENEMIES = {
  slime: {
    id: 'slime', name: 'Gluant Gardien', maxHp: 46, art: 'slime',
    pattern: [
      { type: 'attack', value: 9 },
      { type: 'buff', status: 'force', value: 2, label: 'se renforce' },
      { type: 'attack', value: 7 },
      { type: 'defend', value: 8 },
    ],
  },
  bat: {
    id: 'bat', name: 'Chauve-souris Vorace', maxHp: 32, art: 'bat',
    pattern: [
      { type: 'attack', value: 4, times: 2 },
      { type: 'attack', value: 8 },
      { type: 'buff', status: 'force', value: 1, label: "s'excite" },
    ],
  },
  golem: {
    id: 'golem', name: 'Golem de Pierre', maxHp: 58, art: 'golem',
    pattern: [
      { type: 'defend', value: 10 },
      { type: 'attack', value: 12 },
      { type: 'attack', value: 6 },
    ],
  },
  // Élite
  brute: {
    id: 'brute', name: 'Brute Gobeline', maxHp: 72, art: 'brute', tier: 'elite',
    pattern: [
      { type: 'attack', value: 10 },
      { type: 'buff', status: 'force', value: 3, label: 'rugit' },
      { type: 'attack', value: 8 },
      { type: 'defend', value: 8 },
    ],
  },
  // Boss
  guardian: {
    id: 'guardian', name: 'Gardien du Sommet', maxHp: 100, art: 'guardian', tier: 'boss',
    pattern: [
      { type: 'attack', value: 13 },
      { type: 'buff', status: 'force', value: 2, label: 'se concentre' },
      { type: 'attack', value: 9, times: 2 },
      { type: 'defend', value: 14 },
    ],
  },
};

// Pools d'ennemis par type de nœud.
export const ENEMY_POOLS = {
  combat: ['slime', 'bat', 'golem'],
  elite: ['brute'],
  boss: ['guardian'],
};

// --- ÉVÉNEMENTS ---------------------------------------------------------
// Chaque option a des `outcomes` typés appliqués au run (voir run.js).
export const EVENTS = {
  trappedChest: {
    id: 'trappedChest', title: 'Coffre Piégé', art: 'chest',
    text: "Un coffre orné trône, mais ses serrures grondent d'énergie. L'ouvrir ?",
    options: [
      { label: 'Forcer le coffre', desc: 'Gagne un objet, mais perds 6 PV.',
        outcomes: [{ kind: 'relic' }, { kind: 'damage', value: 6 }] },
      { label: 'Passer son chemin', desc: 'Rien ne se passe.', outcomes: [] },
    ],
  },
  healingSpring: {
    id: 'healingSpring', title: 'Source Scintillante', art: 'spring',
    text: 'Une source aux reflets dorés murmure. Vous vous penchez...',
    options: [
      { label: 'Boire longuement', desc: 'Soigne 18 PV.',
        outcomes: [{ kind: 'heal', value: 18 }] },
      { label: 'Étudier le courant', desc: 'Apprends une nouvelle carte.',
        outcomes: [{ kind: 'card' }] },
    ],
  },
  wanderingSmith: {
    id: 'wanderingSmith', title: 'Forgeron Errant', art: 'smith',
    text: "Un vieux forgeron vous tend la main : « Un présent, voyageur. »",
    options: [
      { label: 'Accepter un objet', desc: 'Gagne un objet.', outcomes: [{ kind: 'relic' }] },
      { label: 'Demander conseil', desc: 'Soigne 8 PV et apprends une carte.',
        outcomes: [{ kind: 'heal', value: 8 }, { kind: 'card' }] },
    ],
  },
};

export const EVENT_IDS = Object.keys(EVENTS);
