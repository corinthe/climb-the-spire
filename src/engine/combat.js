// Moteur de combat — logique PURE et déterministe, sans aucun rendu.
// L'UI lit cet état et appelle les actions ; tout passe par le RNG seedé.
// Cette séparation prépare le futur mode coop en réseau.
// Supporte plusieurs ennemis par combat (ciblage + attaques de zone).

import { makeRng } from './rng.js';
import { CARDS, STARTING_DECK, RELICS, ENEMIES } from './content.js';

let _uid = 1;
let _euid = 1;
const instance = (defId) => ({ uid: _uid++, defId });

// --- Création d'un combat -----------------------------------------------
// Accepte un `rng` (fourni par le run pour rester déterministe) ou une `seed`.
// `deck`, `hp`, `maxHp`, `relics` proviennent du run et persistent entre combats.
// `enemies` est une liste d'identifiants d'ennemis (le groupe à affronter).
export function newCombat({ seed, rng, relics = [], enemies = ['slime'], deck = STARTING_DECK, hp = null, maxHp = 60 }) {
  rng = rng || makeRng(seed);
  const state = {
    rng,
    seed: seed ?? rng.seed,
    phase: 'combat', // 'combat' | 'won' | 'lost'
    turn: 'player',
    turnCount: 0,
    energy: { cur: 3, max: 3 },
    relics: relics.slice(),
    player: { name: 'Héros', hp: hp == null ? maxHp : hp, maxHp, block: 0, statuses: {}, art: 'hero' },
    enemies: enemies.map(makeEnemy),
    targetUid: null,
    draw: [],
    hand: [],
    discard: [],
    log: [],
  };
  state.targetUid = state.enemies[0].uid;
  state.draw = rng.shuffle(deck.map(instance));
  state.enemies.forEach(setEnemyIntent);
  startPlayerTurn(state);
  return state;
}

function makeEnemy(id) {
  const def = ENEMIES[id];
  return {
    uid: `e${_euid++}`, id, name: def.name, hp: def.maxHp, maxHp: def.maxHp,
    block: 0, statuses: {}, patternIndex: 0, intent: null, art: def.art, tier: def.tier || 'normal',
  };
}

// --- Sélection de cible -------------------------------------------------
export function aliveEnemies(state) { return state.enemies.filter((e) => e.hp > 0); }
function getEnemy(state, uid) { return state.enemies.find((e) => e.uid === uid); }

function ensureTarget(state) {
  const cur = getEnemy(state, state.targetUid);
  if (!cur || cur.hp <= 0) {
    const alive = aliveEnemies(state);
    state.targetUid = alive.length ? alive[0].uid : null;
  }
}

export function setTarget(state, uid) {
  const e = getEnemy(state, uid);
  if (e && e.hp > 0) state.targetUid = uid;
}

// --- Statuts & dégâts ---------------------------------------------------
function addStatus(ent, status, amount) {
  ent.statuses[status] = (ent.statuses[status] || 0) + amount;
  if (ent.statuses[status] <= 0) delete ent.statuses[status];
}

function outgoing(ent, base) {
  let v = base;
  if (ent.statuses.force) v += ent.statuses.force;
  if (ent.statuses.weak) v = Math.floor(v * 0.75);
  return Math.max(0, v);
}

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

const isAoe = (def) => def.effects.some((e) => e.target === 'allEnemies');

// Applique un effet à un ensemble de cibles ennemies (ou au joueur si 'self').
function applyEffect(state, e, enemyTargets) {
  if (e.target === 'self') {
    if (e.type === 'block') state.player.block += e.amount;
    else if (e.type === 'status') addStatus(state.player, e.status, e.amount);
    return;
  }
  for (const t of enemyTargets) {
    if (!t || t.hp <= 0) continue;
    if (e.type === 'damage') applyDamage(state, t, outgoing(state.player, e.amount));
    else if (e.type === 'status') addStatus(t, e.status, e.amount);
    else if (e.type === 'block') t.block += e.amount;
  }
}

// --- Action : jouer une carte ------------------------------------------
export function playCard(state, uid) {
  if (state.phase !== 'combat' || state.turn !== 'player') return false;
  const idx = state.hand.findIndex((c) => c.uid === uid);
  if (idx < 0) return false;
  const def = CARDS[state.hand[idx].defId];
  if (def.cost > state.energy.cur) return false;

  ensureTarget(state);
  // Cibles : toutes (zone) ou la cible sélectionnée.
  const targets = isAoe(def)
    ? aliveEnemies(state)
    : (state.targetUid ? [getEnemy(state, state.targetUid)] : []);

  state.energy.cur -= def.cost;
  for (const e of resolveEffects(state, def)) applyEffect(state, e, targets);

  const [card] = state.hand.splice(idx, 1);
  state.discard.push(card);
  log(state, `Vous jouez ${def.name}.`);
  ensureTarget(state);
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
  ensureTarget(state);
}

function startEnemyTurn(state) {
  state.turn = 'enemy';
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    tickStartOfTurn(state, enemy);
    if (state.phase !== 'combat') return;
    if (enemy.hp <= 0) continue; // mort par poison/etc.
    executeIntent(state, enemy);
    if (state.phase !== 'combat') return;
    advanceEnemyIntent(enemy);
  }
  if (state.phase === 'combat') startPlayerTurn(state);
}

function executeIntent(state, enemy) {
  const it = enemy.intent;
  if (it.type === 'attack') {
    const times = it.times || 1;
    const dmg = outgoing(enemy, it.value);
    for (let i = 0; i < times; i++) {
      applyDamage(state, state.player, dmg);
      if (state.phase !== 'combat') return;
    }
    log(state, `${enemy.name} attaque (${dmg}${times > 1 ? ` ×${times}` : ''}).`);
  } else if (it.type === 'defend') {
    enemy.block += it.value;
    log(state, `${enemy.name} se protège (+${it.value} blocs).`);
  } else if (it.type === 'buff') {
    addStatus(enemy, it.status, it.value);
    log(state, `${enemy.name} ${it.label || 'se renforce'}.`);
  }
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
function setEnemyIntent(enemy) {
  const def = ENEMIES[enemy.id];
  enemy.intent = def.pattern[enemy.patternIndex % def.pattern.length];
}
function advanceEnemyIntent(enemy) {
  enemy.patternIndex++;
  setEnemyIntent(enemy);
}

// --- Fin de combat ------------------------------------------------------
function checkDeaths(state) {
  if (state.phase !== 'combat') return;
  if (state.player.hp <= 0) { state.phase = 'lost'; log(state, 'Vous êtes tombé...'); }
  else if (aliveEnemies(state).length === 0) { state.phase = 'won'; log(state, 'Ennemis vaincus !'); }
}

function log(state, msg) {
  state.log.push(msg);
  if (state.log.length > 30) state.log.shift();
}

// --- Aperçus pour l'UI (lecture seule) ----------------------------------
export function previewCard(state, cardDef) {
  const effects = resolveEffects(state, cardDef);
  let damage = 0, block = 0, hits = 0;
  const statuses = [];
  for (const e of effects) {
    if (e.type === 'damage') { damage += outgoing(state.player, e.amount); hits++; }
    else if (e.type === 'block') block += e.amount;
    else if (e.type === 'status') statuses.push(e);
  }
  const baseHits = cardDef.effects.filter((e) => e.type === 'damage').length;
  const baseDamage = cardDef.effects.filter((e) => e.type === 'damage').reduce((s, e) => s + e.amount, 0);
  const baseStatuses = cardDef.effects.filter((e) => e.type === 'status').length;
  const modified = damage !== baseDamage || hits > baseHits || statuses.length > baseStatuses;
  return { damage, block, hits, statuses, aoe: isAoe(cardDef), modified };
}

// Aperçu de l'intention d'un ennemi (dégâts réels après Force/Faiblesse).
export function intentPreview(enemy) {
  const it = enemy.intent;
  if (!it) return null;
  if (it.type === 'attack') return { type: 'attack', value: outgoing(enemy, it.value), times: it.times || 1 };
  if (it.type === 'defend') return { type: 'defend', value: it.value };
  if (it.type === 'buff') return { type: 'buff', label: it.label || 'se renforce' };
  return null;
}
