// Contenu du jeu : cartes, statuts, objets, ennemis.
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
  // "Variation simple" gagnable en récompense (dispo pour test).
  heavyblow: {
    id: 'heavyblow', name: 'Coup Lourd', type: 'attack', cost: 2,
    text: 'Inflige 14 dégâts.',
    effects: [{ type: 'damage', amount: 14, target: 'enemy' }],
    art: 'hammer',
  },
};

// Deck de départ : volontairement simple. La puissance vient des OBJETS.
export const STARTING_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend', 'defend',
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
};

// --- ENNEMIS ------------------------------------------------------------
// L'ennemi suit un `pattern` cyclique d'intentions, télégraphiées au joueur.
export const ENEMIES = {
  slime: {
    id: 'slime', name: 'Gluant Gardien', maxHp: 46, art: 'slime',
    pattern: [
      { type: 'attack', value: 9 },
      { type: 'buff', status: 'force', value: 2, label: 'Se renforce' },
      { type: 'attack', value: 7 },
      { type: 'defend', value: 8 },
    ],
  },
};
