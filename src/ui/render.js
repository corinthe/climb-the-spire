// Rendu DOM — lit l'état du moteur et le dessine. Aucune règle de jeu ici.
import { CARDS, RELICS, STATUSES } from '../engine/content.js';
import { previewCard, enemyIntentPreview } from '../engine/combat.js';
import { spriteSVG, cardArtSVG, relicSVG } from './assets.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function hpBar(ent) {
  const pct = Math.max(0, (ent.hp / ent.maxHp) * 100);
  return `<div class="hpbar"><div class="hpfill" style="width:${pct}%"></div>
    <span class="hptext">${ent.hp} / ${ent.maxHp}</span></div>`;
}

function statusPills(ent) {
  const keys = Object.keys(ent.statuses);
  if (!keys.length) return '';
  return `<div class="statuses">${keys.map((k) => {
    const s = STATUSES[k];
    return `<span class="pill" style="background:${s.color}" title="${esc(s.name)} — ${esc(s.desc)}">
      ${s.name[0]}<b>${ent.statuses[k]}</b></span>`;
  }).join('')}</div>`;
}

function intentBadge(state) {
  const it = enemyIntentPreview(state);
  if (!it || state.phase !== 'combat') return '';
  let icon = '❔', txt = '';
  if (it.type === 'attack') { icon = '⚔️'; txt = `${it.value}${it.times > 1 ? ` ×${it.times}` : ''}`; }
  else if (it.type === 'defend') { icon = '🛡️'; txt = `${it.value}`; }
  else if (it.type === 'buff') { icon = '⬆️'; txt = it.label; }
  return `<div class="intent" title="Intention de l'ennemi">${icon}<span>${esc(txt)}</span></div>`;
}

function blockBadge(ent) {
  return ent.block > 0 ? `<div class="block">🛡️ ${ent.block}</div>` : '';
}

function cardEl(state, card) {
  const def = CARDS[card.defId];
  const pv = previewCard(state, def);
  const playable = state.phase === 'combat' && state.turn === 'player' && def.cost <= state.energy.cur;

  let stats = '';
  if (pv.damage) stats += `<span class="stat dmg">${pv.damage}${pv.hits > 1 ? `<small>×${pv.hits}</small>` : ''} dégâts</span>`;
  if (pv.block) stats += `<span class="stat blk">${pv.block} blocs</span>`;
  const statusTxt = pv.statuses.map((s) => `+${s.amount} ${STATUSES[s.status].name}`).join(', ');
  if (statusTxt) stats += `<span class="stat sts">${esc(statusTxt)}</span>`;

  return `<button class="card ${def.type} ${playable ? '' : 'disabled'} ${pv.modified ? 'boosted' : ''}"
      data-uid="${card.uid}" ${playable ? '' : 'disabled'}>
    <span class="cost">${def.cost}</span>
    <span class="card-name">${esc(def.name)}</span>
    <span class="card-art">${cardArtSVG(def.art)}</span>
    <span class="card-stats">${stats}</span>
    ${pv.modified ? '<span class="boost-flag">★ objet</span>' : ''}
  </button>`;
}

function relicBar(state) {
  return `<div class="relics-owned">${state.relics.map((rid) => {
    const r = RELICS[rid];
    return `<span class="relic owned" title="${esc(r.name)} — ${esc(r.text)}">${relicSVG(r.art)}</span>`;
  }).join('') || '<span class="muted">aucun objet équipé</span>'}</div>`;
}

function relicWorkshop(state) {
  return `<div class="workshop">
    <div class="workshop-title">🧰 Cabinet d'objets <small>(démo — équipez pour voir les cartes changer)</small></div>
    <div class="relic-toggles">${Object.values(RELICS).map((r) => {
      const on = state.relics.includes(r.id);
      return `<button class="relic-toggle ${on ? 'on' : ''}" data-relic="${r.id}" title="${esc(r.text)}">
        ${relicSVG(r.art)}<span>${esc(r.name)}</span>${on ? '<em>✓</em>' : ''}</button>`;
    }).join('')}</div>
  </div>`;
}

function overlay(state) {
  if (state.phase === 'combat') return '';
  const won = state.phase === 'won';
  return `<div class="overlay ${won ? 'win' : 'lose'}">
    <div class="overlay-card">
      <h2>${won ? '🏆 Victoire !' : '💀 Défaite'}</h2>
      <p>${won ? 'Le Gluant Gardien est vaincu.' : "Vous êtes tombé dans le donjon."}</p>
      <button class="btn big" data-action="restart">Rejouer (même seed)</button>
    </div>
  </div>`;
}

export function render(root, state) {
  root.innerHTML = `
  <div class="game">
    <header class="topbar">
      <h1>🏔️ Climb the Spire <small>— jalon 1 : combat</small></h1>
      <div class="seedbox">
        <label>Seed</label>
        <input id="seed-input" value="${esc(state.seed)}" spellcheck="false">
        <button class="btn" data-action="newseed">Nouveau run</button>
      </div>
    </header>

    ${relicWorkshop(state)}

    <section class="arena">
      <div class="combatant enemy">
        ${intentBadge(state)}
        <div class="sprite">${spriteSVG(state.enemy.art)}${blockBadge(state.enemy)}</div>
        <div class="name">${esc(state.enemy.name)}</div>
        ${hpBar(state.enemy)}
        ${statusPills(state.enemy)}
      </div>

      <div class="vs">⚔️</div>

      <div class="combatant player">
        <div class="sprite">${spriteSVG(state.player.art || 'hero')}${blockBadge(state.player)}</div>
        <div class="name">${esc(state.player.name)}</div>
        ${hpBar(state.player)}
        ${statusPills(state.player)}
      </div>
    </section>

    <section class="hud">
      <div class="energy" title="Énergie">⚡ <b>${state.energy.cur}</b>/${state.energy.max}</div>
      <div class="owned-label">Objets : ${relicBar(state)}</div>
      <button class="btn end" data-action="endturn" ${state.phase !== 'combat' ? 'disabled' : ''}>Finir le tour ↻</button>
    </section>

    <section class="hand">
      ${state.hand.map((c) => cardEl(state, c)).join('') || '<div class="muted">— main vide —</div>'}
    </section>

    <footer class="log">${state.log.slice(-5).map((l) => `<div>${esc(l)}</div>`).join('')}</footer>

    ${overlay(state)}
  </div>`;
}
