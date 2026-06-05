// Point d'entrée — relie le moteur du run (engine/) au rendu (ui/).
import { playCard, endTurn } from './engine/combat.js';
import {
  newRun, enterNode, onCombatResolved,
  chooseRewardCard, chooseRelic, skipReward, doRest, chooseEventOption,
} from './engine/run.js';
import { render } from './ui/render.js';

const root = document.getElementById('app');

const params = new URLSearchParams(location.search);
let seed = params.get('seed') || randomSeed();

const app = {
  run: newRun(seed),
  scene: 'map',
  combat: null,
  reward: null,
  event: null,
  currentNode: null,
};

function randomSeed() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function startRun(newSeed) {
  seed = newSeed;
  const url = new URL(location);
  url.searchParams.set('seed', seed);
  history.replaceState(null, '', url);
  app.run = newRun(seed);
  app.scene = 'map';
  app.combat = app.reward = app.event = app.currentNode = null;
  draw();
}

function draw() {
  render(root, app);
  // sur la map, on défile vers le bas (point de départ) après le rendu.
  if (app.scene === 'map') {
    const wrap = document.getElementById('mapwrap');
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
  }
}

// Après une action de combat, bascule en récompense/défaite si le combat est fini.
function afterCombatAction() {
  if (app.combat && app.combat.phase !== 'combat') onCombatResolved(app);
  draw();
}

root.addEventListener('click', (e) => {
  // --- MAP ---
  const node = e.target.closest('.mapnode[data-node]');
  if (node && !node.disabled) { enterNode(app, node.dataset.node); return draw(); }

  // --- COMBAT : jouer une carte ---
  const card = e.target.closest('.card[data-uid]');
  if (card && !card.disabled && app.scene === 'combat') {
    playCard(app.combat, Number(card.dataset.uid));
    return afterCombatAction();
  }

  // --- Actions génériques ---
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'endturn') { endTurn(app.combat); return afterCombatAction(); }
  if (action === 'pick-card') { chooseRewardCard(app, el.dataset.card); return draw(); }
  if (action === 'pick-relic') { chooseRelic(app, el.dataset.relic); return draw(); }
  if (action === 'skip-reward') { skipReward(app); return draw(); }
  if (action === 'rest') { doRest(app); return draw(); }
  if (action === 'event-opt') { chooseEventOption(app, Number(el.dataset.opt)); return draw(); }
  if (action === 'restart') { return startRun(seed); }
  if (action === 'newseed') {
    const input = document.getElementById('seed-input');
    return startRun((input?.value || '').trim() || randomSeed());
  }
});

// Espace / Entrée : finir le tour en combat.
window.addEventListener('keydown', (e) => {
  if ((e.key === ' ' || e.key === 'Enter')
      && app.scene === 'combat' && app.combat.phase === 'combat'
      && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    endTurn(app.combat);
    afterCombatAction();
  }
});

draw();
