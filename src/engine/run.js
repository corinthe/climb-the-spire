// Moteur du RUN — couche méta au-dessus du combat. Logique pure.
// Gère la map, la position, les PV/deck/objets persistants et les transitions
// entre scènes (map, combat, récompense, repos, événement, fin).
// Tout le hasard découle de la seed pour rester reproductible.

import { makeRng } from './rng.js';
import { generateMap, getNode } from './map.js';
import { newCombat } from './combat.js';
import {
  STARTING_DECK, RELICS, ENEMY_POOLS, REWARD_CARD_IDS, EVENTS, EVENT_IDS, fusionResult,
} from './content.js';

export const MAX_HP = 60;

// rng dédié et indépendant du déroulé, dérivé de la seed + du nœud.
const nodeRng = (run, nodeId, channel) => makeRng(`${run.seed}:${nodeId}:${channel}`);

export function newRun(seed) {
  const map = generateMap(makeRng(`${seed}:map`));
  return {
    seed,
    maxHp: MAX_HP,
    hp: MAX_HP,
    relics: [],
    deck: STARTING_DECK.slice(),
    map,
    nodeId: null,         // position courante (null = pas encore entré)
    completed: [],        // nœuds traversés
    depth: 0,             // rangée atteinte (progression)
  };
}

// Nœuds que le joueur peut rejoindre depuis sa position actuelle.
export function reachableNodes(run) {
  if (run.nodeId == null) return run.map.grid[0].map((n) => n.id);
  const node = getNode(run.map, run.nodeId);
  return node ? node.next.slice() : [];
}

// --- Entrée dans un nœud ------------------------------------------------
export function enterNode(app, nodeId) {
  const run = app.run;
  if (!reachableNodes(run).includes(nodeId)) return;
  const node = getNode(run.map, nodeId);
  run.nodeId = nodeId;
  run.depth = Math.max(run.depth, node.row + 1);
  app.currentNode = node;
  app.reward = null;
  app.event = null;

  if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss') {
    const pool = ENEMY_POOLS[node.type] || ENEMY_POOLS.combat;
    const enemyId = nodeRng(run, nodeId, 'pick').pick(pool);
    app.combat = newCombat({
      rng: nodeRng(run, nodeId, 'combat'),
      relics: run.relics,
      deck: run.deck,
      hp: run.hp,
      maxHp: run.maxHp,
      enemyId,
    });
    app.scene = 'combat';
  } else if (node.type === 'rest') {
    app.scene = 'rest';
  } else if (node.type === 'forge') {
    app.forgeSelection = [];
    app.scene = 'forge';
  } else if (node.type === 'event') {
    app.event = nodeRng(run, nodeId, 'event').pick(EVENT_IDS);
    app.scene = 'event';
  } else if (node.type === 'treasure') {
    app.reward = makeTreasureReward(run, node);
    app.scene = 'reward';
  }
}

// --- Issue d'un combat --------------------------------------------------
export function onCombatResolved(app) {
  const c = app.combat;
  if (!c || c.phase === 'combat') return;
  app.run.hp = c.player.hp; // les PV persistent dans le run

  if (c.phase === 'lost') {
    app.scene = 'gameover';
    return;
  }
  // Victoire → récompense
  const node = app.currentNode;
  const rng = nodeRng(app.run, node.id, 'reward');
  const cards = rng.shuffle(REWARD_CARD_IDS).slice(0, 3);
  let relic = null;
  if (node.type === 'elite' || node.type === 'boss') {
    relic = pickNewRelic(rng, app.run);
    if (relic) app.run.relics.push(relic); // objet garanti accordé tout de suite
  }
  app.reward = { kind: 'combat', cards, relic, isBoss: node.type === 'boss' };
  app.scene = 'reward';
}

// --- Récompenses --------------------------------------------------------
function makeTreasureReward(run, node) {
  const rng = nodeRng(run, node.id, 'reward');
  return { kind: 'treasure', relicChoices: pickRelics(rng, run, 3) };
}

export function chooseRewardCard(app, defId) {
  if (defId) app.run.deck.push(defId);
  finishNode(app);
}

export function chooseRelic(app, relicId) {
  if (relicId && !app.run.relics.includes(relicId)) app.run.relics.push(relicId);
  finishNode(app);
}

export function skipReward(app) {
  finishNode(app);
}

// --- Forge --------------------------------------------------------------
// Fusionne deux objets possédés (par index) en un objet supérieur.
export function doForge(app, i, j) {
  const run = app.run;
  if (i === j || run.relics[i] == null || run.relics[j] == null) return;
  const fused = fusionResult(run.relics[i], run.relics[j]);
  const [hi, lo] = i > j ? [i, j] : [j, i];
  run.relics.splice(hi, 1);
  run.relics.splice(lo, 1);
  run.relics.push(fused);
  app.forgeSelection = [];
  finishNode(app);
}

export function leaveForge(app) {
  app.forgeSelection = [];
  finishNode(app);
}

// --- Repos --------------------------------------------------------------
export function doRest(app) {
  const run = app.run;
  run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * 0.3));
  finishNode(app);
}

// --- Événements ---------------------------------------------------------
export function chooseEventOption(app, idx) {
  const ev = EVENTS[app.event];
  const opt = ev.options[idx];
  const rng = nodeRng(app.run, app.currentNode.id, 'evt');
  for (const o of opt.outcomes) applyOutcome(app.run, o, rng);
  finishNode(app);
}

function applyOutcome(run, o, rng) {
  if (o.kind === 'heal') run.hp = Math.min(run.maxHp, run.hp + o.value);
  else if (o.kind === 'damage') run.hp = Math.max(1, run.hp - o.value); // un événement ne tue pas
  else if (o.kind === 'relic') { const r = pickNewRelic(rng, run); if (r) run.relics.push(r); }
  else if (o.kind === 'card') run.deck.push(rng.pick(REWARD_CARD_IDS));
}

// --- Fin de nœud --------------------------------------------------------
function finishNode(app) {
  const node = app.currentNode;
  if (!app.run.completed.includes(node.id)) app.run.completed.push(node.id);
  if (app.reward && app.reward.isBoss) {
    app.scene = 'victory';
  } else {
    app.scene = 'map';
  }
  app.reward = null;
  app.event = null;
  app.combat = null;
}

// --- Sélection d'objets -------------------------------------------------
function pickNewRelic(rng, run) {
  const avail = Object.keys(RELICS).filter((id) => !run.relics.includes(id));
  return avail.length ? rng.pick(avail) : null;
}

function pickRelics(rng, run, n) {
  return rng.shuffle(Object.keys(RELICS).filter((id) => !run.relics.includes(id))).slice(0, n);
}
