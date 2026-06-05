// Moteur de combat — logique PURE et déterministe, sans aucun rendu.
// L'UI lit cet état et appelle les actions ; tout passe par le RNG seedé.
// Cette séparation prépare le futur mode coop en réseau.

import { makeRng } from './rng.js';
import { CARDS, STARTING_DECK, RELICS, ENEMIES } from './content.js';

let _uid = 1;
const instance = (defId) => ({ uid: _uid++, defId });

// --- Création d'un combat -----------------------------------------------
// Accepte un `rng` (fourni par le run pour rester déterministe) ou une `seed`.
// `deck`, `hp`, `maxHp` et `relics` proviennent du run et persistent entre combats.
export function newCombat({ seed, rng, relics = [], enemyId = 'slime', deck = STARTING_DECK, hp = null, maxHp = 60 }) {
  rng = rng || makeRng(seed);
  const enemyDef = ENEMIES[enemyId];
  const state = {
    rng,
    seed: seed ?? rng.seed,
    phase: 'combat', // 'combat' | 'won' | 'lost'
    turn: 'player',
    turnCount: 0,
    energy: { cur: 3, max: 3 },
    relics: relics.slice(),
    player: { name: 'Héros', hp: hp == null ? maxHp : hp, maxHp, block: 0, statuses: {}, art: 'hero' },
    enemy: {
      id: enemyId, name: enemyDef.name, hp: enemyDef.maxHp, maxHp: enemyDef.maxHp,
      block: 0, statuses: {}, patternIndex: 0, intent: null, art: enemyDef.art,
      tier: enemyDef.tier || 'normal',
    },
    draw: [],
    hand: [],
    discard: [],
    log: [],
  };
  state.draw = rng.shuffle(deck.map(instance));
  setEnemyIntent(state);
  startPlayerTurn(state);
  return state;
}

// --- Statuts & dégâts ---------------------------------------------------
function addStatus(ent, status, amount) {
  ent.statuses[status] = (ent.statuses[status] || 0) + amount;
  if (ent.statuses[status] <= 0) delete ent.statuses[status];
}

// Dégâts SORTANTS d'une entité (applique Force puis Faiblesse).
function outgoing(ent, base) {
  let v = base;
  if (ent.statuses.force) v += ent.statuses.force;
  if (ent.statuses.weak) v = Math.floor(v * 0.75);
  return Math.max(0, v);
}

// Applique des dégâts à une cible (le bloc absorbe d'abord).
function applyDamage(state, target, dmg) {
  if (target.block > 0) {
    const absorbed = Math.min(target.block, dmg);
    target.block -= absorbed;
    dmg -= absorbed;
  }
  target.hp = Math.max(0, target.hp - dmg);
  checkDeaths(state);
}

// --- Pipeline d'effets d'une carte (cœur du système d'objets) -----------
function resolveEffects(state, cardDef) {
  let effects = cardDef.effects.map((e) => ({ ...e }));
  for (const rid of state.relics) {
    const relic = RELICS[rid];
    if (relic && relic.modifyEffects) effects = relic.modifyEffects(cardDef, effects);
  }
  return effects;
}

function applyEffect(state, effect, sourceSide) {
  const src = sourceSide === 'player' ? state.player : state.enemy;
  const targetSide = effect.target === 'self'
    ? sourceSide
    : sourceSide === 'player' ? 'enemy' : 'player';
  const tgt = targetSide === 'player' ? state.player : state.enemy;

  if (effect.type === 'damage') applyDamage(state, tgt, outgoing(src, effect.amount));
  else if (effect.type === 'block') src.block += effect.amount;
  else if (effect.type === 'status') addStatus(tgt, effect.status, effect.amount);
}

// --- Action : jouer une carte ------------------------------------------
export function playCard(state, uid) {
  if (state.phase !== 'combat' || state.turn !== 'player') return false;
  const idx = state.hand.findIndex((c) => c.uid === uid);
  if (idx < 0) return false;
  const def = CARDS[state.hand[idx].defId];
  if (def.cost > state.energy.cur) return false;

  state.energy.cur -= def.cost;
  for (const e of resolveEffects(state, def)) applyEffect(state, e, 'player');

  const [card] = state.hand.splice(idx, 1);
  state.discard.push(card);
  log(state, `Vous jouez ${def.name}.`);
  return true;
}

// --- Action : finir son tour -------------------------------------------
export function endTurn(state) {
  if (state.phase !== 'combat' || state.turn !== 'player') return;
  state.discard.push(...state.hand);
  state.hand = [];
  startEnemyTurn(state);
}

// --- Déroulé des tours --------------------------------------------------
function tickStartOfTurn(state, ent) {
  ent.block = 0; // le bloc ne dure pas d'un tour à l'autre
  for (const dot of ['poison', 'bleed', 'burn']) {
    if (ent.statuses[dot]) {
      ent.hp = Math.max(0, ent.hp - ent.statuses[dot]);
      addStatus(ent, dot, -1);
    }
  }
  if (ent.statuses.weak) addStatus(ent, 'weak', -1);
  checkDeaths(state);
}

function startPlayerTurn(state) {
  state.turn = 'player';
  state.turnCount++;
  tickStartOfTurn(state, state.player);
  if (state.phase !== 'combat') return;
  state.energy.cur = state.energy.max;
  drawCards(state, 5);
}

function startEnemyTurn(state) {
  state.turn = 'enemy';
  tickStartOfTurn(state, state.enemy);
  if (state.phase !== 'combat') return;

  const it = state.enemy.intent;
  if (it.type === 'attack') {
    const times = it.times || 1;
    const dmg = outgoing(state.enemy, it.value);
    for (let i = 0; i < times; i++) applyDamage(state, state.player, dmg);
    log(state, `${state.enemy.name} attaque (${dmg}${times > 1 ? ` ×${times}` : ''}).`);
  } else if (it.type === 'defend') {
    state.enemy.block += it.value;
    log(state, `${state.enemy.name} se protège (+${it.value} blocs).`);
  } else if (it.type === 'buff') {
    addStatus(state.enemy, it.status, it.value);
    log(state, `${state.enemy.name} ${it.label || 'se renforce'}.`);
  }

  advanceEnemyIntent(state);
  if (state.phase === 'combat') startPlayerTurn(state);
}

// --- Pioche -------------------------------------------------------------
function drawCards(state, n) {
  for (let i = 0; i < n; i++) {
    if (state.draw.length === 0) {
      if (state.discard.length === 0) break;
      state.draw = state.rng.shuffle(state.discard);
      state.discard = [];
    }
    state.hand.push(state.draw.pop());
  }
}

// --- Intentions ennemies ------------------------------------------------
function setEnemyIntent(state) {
  const def = ENEMIES[state.enemy.id];
  state.enemy.intent = def.pattern[state.enemy.patternIndex % def.pattern.length];
}
function advanceEnemyIntent(state) {
  state.enemy.patternIndex++;
  setEnemyIntent(state);
}

// --- Fin de combat ------------------------------------------------------
function checkDeaths(state) {
  if (state.phase !== 'combat') return;
  if (state.player.hp <= 0) { state.phase = 'lost'; log(state, 'Vous êtes tombé...'); }
  else if (state.enemy.hp <= 0) { state.phase = 'won'; log(state, 'Ennemi vaincu !'); }
}

function log(state, msg) {
  state.log.push(msg);
  if (state.log.length > 30) state.log.shift();
}

// --- Aperçus pour l'UI (lecture seule) ----------------------------------
// Montre la carte APRÈS transformation par les objets (dégâts, coups, statuts).
export function previewCard(state, cardDef) {
  const effects = resolveEffects(state, cardDef);
  let damage = 0, block = 0, hits = 0;
  const statuses = [];
  for (const e of effects) {
    if (e.type === 'damage') { damage += outgoing(state.player, e.amount); hits++; }
    else if (e.type === 'block') block += e.amount;
    else if (e.type === 'status') statuses.push(e);
  }
  const baseDamage = cardDef.effects.filter((e) => e.type === 'damage').reduce((s, e) => s + e.amount, 0);
  const modified = damage !== baseDamage || hits > cardDef.effects.filter((e) => e.type === 'damage').length || statuses.length > 0;
  return { damage, block, hits, statuses, modified };
}

// Aperçu de l'intention ennemie (dégâts réels après Force/Faiblesse).
export function enemyIntentPreview(state) {
  const it = state.enemy.intent;
  if (!it) return null;
  if (it.type === 'attack') return { type: 'attack', value: outgoing(state.enemy, it.value), times: it.times || 1 };
  if (it.type === 'defend') return { type: 'defend', value: it.value };
  if (it.type === 'buff') return { type: 'buff', label: it.label || 'Se renforce' };
  return null;
}
