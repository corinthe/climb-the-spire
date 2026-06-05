// Point d'entrée — relie le moteur (état) et le rendu (UI) + interactions.
import { newCombat, playCard, endTurn } from './engine/combat.js';
import { render } from './ui/render.js';

const root = document.getElementById('app');

// La seed pilote tout le hasard. Lisible dans l'URL (?seed=...) pour partager un run.
const params = new URLSearchParams(location.search);
let seed = params.get('seed') || randomSeed();
let relics = []; // objets équipés (modifiables en direct via le cabinet de démo)
let state = newCombat({ seed, relics });

function randomSeed() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function rebuild() {
  state = newCombat({ seed, relics });
  draw();
}

function draw() {
  render(root, state);
}

// Délégation d'événements : un seul listener pour toute l'UI.
root.addEventListener('click', (e) => {
  const card = e.target.closest('.card[data-uid]');
  if (card && !card.disabled) {
    playCard(state, Number(card.dataset.uid));
    return draw();
  }

  const relicBtn = e.target.closest('.relic-toggle[data-relic]');
  if (relicBtn) {
    const id = relicBtn.dataset.relic;
    relics = relics.includes(id) ? relics.filter((r) => r !== id) : [...relics, id];
    state.relics = relics.slice(); // applique en direct, sans casser le combat en cours
    return draw();
  }

  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action === 'endturn') { endTurn(state); return draw(); }
  if (action === 'restart') { rebuild(); return; }
  if (action === 'newseed') {
    const input = document.getElementById('seed-input');
    seed = (input?.value || '').trim() || randomSeed();
    const url = new URL(location);
    url.searchParams.set('seed', seed);
    history.replaceState(null, '', url);
    return rebuild();
  }
});

// Entrée clavier : Espace / Entrée pour finir le tour.
window.addEventListener('keydown', (e) => {
  if ((e.key === ' ' || e.key === 'Enter') && state.phase === 'combat' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    endTurn(state);
    draw();
  }
});

draw();
