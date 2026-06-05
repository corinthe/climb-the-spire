// Rendu DOM — dispatcher de scènes. Lit l'état (app) et le dessine.
// Aucune règle de jeu ici : tout vient du moteur (engine/).
import { CARDS, RELICS, STATUSES, EVENTS, fusionPreview } from '../engine/content.js';
import { previewCard, intentPreview, aliveEnemies } from '../engine/combat.js';
import { reachableNodes } from '../engine/run.js';
import { spriteSVG, cardArtSVG, relicSVG } from './assets.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const NODE_META = {
  combat:   { icon: '⚔️', label: 'Combat' },
  elite:    { icon: '💀', label: 'Élite' },
  event:    { icon: '❓', label: 'Événement' },
  rest:     { icon: '🔥', label: 'Repos' },
  forge:    { icon: '⚒️', label: 'Forge' },
  shop:     { icon: '🛒', label: 'Boutique' },
  treasure: { icon: '💎', label: 'Trésor' },
  boss:     { icon: '👑', label: 'Boss' },
};

// =======================================================================
export function render(root, app) {
  let body = '';
  switch (app.scene) {
    case 'map': body = mapView(app); break;
    case 'combat': body = combatView(app); break;
    case 'reward': body = rewardView(app); break;
    case 'rest': body = restView(app); break;
    case 'forge': body = forgeView(app); break;
    case 'shop': body = shopView(app); break;
    case 'event': body = eventView(app); break;
    case 'gameover': body = endView(app, false); break;
    case 'victory': body = endView(app, true); break;
  }
  root.innerHTML = `<div class="game">${header(app)}${body}</div>`;
}

// --- En-tête commune ----------------------------------------------------
function header(app) {
  const run = app.run;
  const hp = app.scene === 'combat' && app.combat ? app.combat.player.hp : run.hp;
  const relics = run.relics.map((r) =>
    `<i title="${esc(RELICS[r].name)} — ${esc(RELICS[r].text)}">${relicSVG(RELICS[r].art)}</i>`
  ).join('') || '<em class="muted">aucun objet</em>';
  return `<header class="topbar">
    <h1>🏔️ Climb the Spire</h1>
    <div class="run-stats">
      <span class="chip hp">❤️ ${hp}/${run.maxHp}</span>
      <span class="chip gold">💰 ${run.gold}</span>
      <span class="chip">Étage ${run.depth}</span>
      <span class="relic-strip">${relics}</span>
    </div>
    <div class="seedbox">
      <label>Seed</label>
      <input id="seed-input" value="${esc(run.seed)}" spellcheck="false">
      <button class="btn small" data-action="newseed">Nouveau</button>
    </div>
  </header>`;
}

// --- Vue MAP ------------------------------------------------------------
function mapView(app) {
  const run = app.run;
  const map = run.map;
  const reach = reachableNodes(run);
  const W = 720, ROW = 62, PADX = 56, TOP = 42;
  const totalRows = map.rows + 1;
  const H = TOP * 2 + (totalRows - 1) * ROW;
  const X = (n) => PADX + n.nx * (W - 2 * PADX);
  const Y = (n) => H - TOP - n.ny * ROW;
  const nodes = map.grid.flat().concat(map.boss);

  let lines = '';
  for (const n of nodes) {
    for (const tid of n.next) {
      const t = nodes.find((x) => x.id === tid);
      const done = run.completed.includes(n.id) && (run.completed.includes(t.id) || run.nodeId === t.id);
      lines += `<line x1="${X(n)}" y1="${Y(n)}" x2="${X(t)}" y2="${Y(t)}" class="edge ${done ? 'edge-done' : ''}"/>`;
    }
  }

  let btns = '';
  for (const n of nodes) {
    const meta = NODE_META[n.type];
    const isReach = reach.includes(n.id);
    const isCur = run.nodeId === n.id;
    const done = run.completed.includes(n.id);
    const cls = ['mapnode', n.type, isReach ? 'reachable' : '', isCur ? 'current' : '', done ? 'done' : ''].join(' ');
    btns += `<button class="${cls}" style="left:${X(n)}px;top:${Y(n)}px" ${isReach ? '' : 'disabled'}
      data-node="${n.id}" title="${meta.label}"><span>${meta.icon}</span></button>`;
  }

  const hint = run.nodeId == null ? 'Choisis ton point de départ (en bas).' : 'Choisis le prochain nœud.';
  return `<section class="mapwrap" id="mapwrap">
    <div class="map-hint">${esc(hint)} <span class="muted">— grimpe jusqu'au 👑 Boss.</span></div>
    <div class="mapcanvas" style="width:${W}px;height:${H}px">
      <svg class="edges" width="${W}" height="${H}">${lines}</svg>
      ${btns}
    </div>
    <div class="legend">${Object.values(NODE_META).map((m) => `<span><b>${m.icon}</b> ${esc(m.label)}</span>`).join('')}</div>
  </section>`;
}

// --- Vue COMBAT ---------------------------------------------------------
function hpBar(ent) {
  const pct = Math.max(0, (ent.hp / ent.maxHp) * 100);
  return `<div class="hpbar"><div class="hpfill" style="width:${pct}%"></div>
    <span class="hptext">${ent.hp} / ${ent.maxHp}</span></div>`;
}
function statusPills(ent) {
  const keys = Object.keys(ent.statuses);
  if (!keys.length) return '<div class="statuses"></div>';
  return `<div class="statuses">${keys.map((k) => {
    const s = STATUSES[k];
    return `<span class="pill" style="background:${s.color}" title="${esc(s.name)} — ${esc(s.desc)}">${s.name[0]}<b>${ent.statuses[k]}</b></span>`;
  }).join('')}</div>`;
}
function intentBadge(enemy, phase) {
  const it = intentPreview(enemy);
  if (!it || phase !== 'combat') return '';
  let icon = '❔', txt = '';
  if (it.type === 'attack') { icon = '⚔️'; txt = `${it.value}${it.times > 1 ? ` ×${it.times}` : ''}`; }
  else if (it.type === 'defend') { icon = '🛡️'; txt = `${it.value}`; }
  else if (it.type === 'buff') { icon = '⬆️'; txt = it.label; }
  return `<div class="intent" title="Intention de l'ennemi">${icon}<span>${esc(txt)}</span></div>`;
}
function blockBadge(ent) {
  return ent.block > 0 ? `<div class="block">🛡️ ${ent.block}</div>` : '';
}
function combatCard(state, card) {
  const def = CARDS[card.defId];
  const pv = previewCard(state, def);
  const playable = state.phase === 'combat' && state.turn === 'player' && def.cost <= state.energy.cur;
  let stats = '';
  if (pv.damage) stats += `<span class="stat dmg">${pv.damage} dégâts${pv.hits > 1 ? ` <small>(${pv.hits} coups)</small>` : ''}${pv.aoe ? ' <small>(tous)</small>' : ''}</span>`;
  if (pv.block) stats += `<span class="stat blk">${pv.block} blocs</span>`;
  const st = pv.statuses.map((s) => `+${s.amount} ${STATUSES[s.status].name}`).join(', ');
  if (st) stats += `<span class="stat sts">${esc(st)}</span>`;
  return `<button class="card ${def.type} ${playable ? '' : 'disabled'} ${pv.modified ? 'boosted' : ''}"
      data-uid="${card.uid}" ${playable ? '' : 'disabled'}>
    <span class="cost">${def.cost}</span>
    <span class="card-name">${esc(def.name)}</span>
    <span class="card-art">${cardArtSVG(def.art)}</span>
    <span class="card-stats">${stats}</span>
    ${pv.modified ? '<span class="boost-flag">★ objet</span>' : ''}
  </button>`;
}
function enemyEl(s, enemy) {
  const dead = enemy.hp <= 0;
  const targeted = !dead && s.targetUid === enemy.uid && aliveEnemies(s).length > 1;
  const cls = ['combatant', 'enemy', dead ? 'dead' : '', targeted ? 'targeted' : ''].join(' ');
  return `<div class="${cls}" ${dead ? '' : `data-enemy="${enemy.uid}"`}>
    ${dead ? '' : intentBadge(enemy, s.phase)}
    ${targeted ? '<div class="target-marker">🎯</div>' : ''}
    <div class="sprite">${spriteSVG(enemy.art)}${blockBadge(enemy)}</div>
    <div class="name">${esc(enemy.name)}</div>
    ${hpBar(enemy)}
    ${statusPills(enemy)}
  </div>`;
}
function combatView(app) {
  const s = app.combat;
  const tier = s.enemies.some((e) => e.tier === 'boss') ? 'boss'
    : s.enemies.some((e) => e.tier === 'elite') ? 'elite' : 'normal';
  const multi = aliveEnemies(s).length > 1;
  return `
    <section class="arena ${tier}">
      <div class="enemies">${s.enemies.map((e) => enemyEl(s, e)).join('')}</div>
      <div class="vs">⚔️</div>
      <div class="combatant player">
        <div class="sprite">${spriteSVG('hero')}${blockBadge(s.player)}</div>
        <div class="name">${esc(s.player.name)}</div>
        ${hpBar(s.player)}
        ${statusPills(s.player)}
      </div>
    </section>
    ${multi ? '<div class="target-hint">🎯 Clique un ennemi pour le cibler — les attaques simples le visent.</div>' : ''}
    <section class="hud">
      <div class="energy" title="Énergie">⚡ <b>${s.energy.cur}</b>/${s.energy.max}</div>
      <button class="btn end" data-action="endturn" ${s.phase !== 'combat' ? 'disabled' : ''}>Finir le tour ↻</button>
    </section>
    <section class="hand">
      ${s.hand.map((c) => combatCard(s, c)).join('') || '<div class="muted">— main vide —</div>'}
    </section>
    <footer class="log">${s.log.slice(-5).map((l) => `<div>${esc(l)}</div>`).join('')}</footer>`;
}

// --- Carte statique (récompense) ---------------------------------------
function staticCard(defId, action) {
  const def = CARDS[defId];
  return `<button class="card ${def.type}" data-action="${action}" data-card="${defId}">
    <span class="cost">${def.cost}</span>
    <span class="card-name">${esc(def.name)}</span>
    <span class="card-art">${cardArtSVG(def.art)}</span>
    <span class="card-text">${esc(def.text)}</span>
  </button>`;
}

// --- Vue RÉCOMPENSE -----------------------------------------------------
function rewardView(app) {
  const rw = app.reward;
  if (rw.kind === 'treasure') {
    const choices = rw.relicChoices;
    return `<section class="panel reward">
      <h2>💎 Trésor</h2>
      ${choices.length ? '<p>Choisis un objet à emporter :</p>' : "<p>Le coffre est vide...</p>"}
      <div class="relic-choices">${choices.map((id) => relicChoiceEl(id)).join('')}</div>
      <button class="btn" data-action="skip-reward">${choices.length ? 'Ne rien prendre' : 'Continuer'}</button>
    </section>`;
  }
  // récompense de combat
  return `<section class="panel reward">
    <h2>${rw.isBoss ? '🏆 Boss vaincu !' : '✨ Victoire !'}</h2>
    ${rw.gold ? `<div class="gold-banner">💰 +${rw.gold} or</div>` : ''}
    ${rw.relic ? `<div class="relic-banner">Objet obtenu : ${relicSVG(RELICS[rw.relic].art)} <b>${esc(RELICS[rw.relic].name)}</b> — ${esc(RELICS[rw.relic].text)}</div>` : ''}
    <p>Ajoute une carte à ton deck :</p>
    <div class="card-choices">${rw.cards.map((id) => staticCard(id, 'pick-card')).join('')}</div>
    <button class="btn" data-action="skip-reward">Passer la carte</button>
  </section>`;
}
function relicChoiceEl(id) {
  const r = RELICS[id];
  return `<button class="relic-choice" data-action="pick-relic" data-relic="${id}">
    ${relicSVG(r.art)}<b>${esc(r.name)}</b><span>${esc(r.text)}</span></button>`;
}

// --- Vue REPOS ----------------------------------------------------------
function restView(app) {
  const run = app.run;
  const heal = Math.round(run.maxHp * 0.3);
  return `<section class="panel rest">
    <h2>🔥 Feu de camp</h2>
    <div class="campfire">🔥</div>
    <p>Tu te reposes près du feu et récupères <b>${heal} PV</b> (actuellement ${run.hp}/${run.maxHp}).</p>
    <button class="btn big" data-action="rest">Se reposer</button>
  </section>`;
}

// --- Vue FORGE ----------------------------------------------------------
function forgeView(app) {
  const run = app.run;
  const sel = app.forgeSelection || [];

  if (run.relics.length < 2) {
    return `<section class="panel forge">
      <h2>⚒️ La Forge</h2>
      <p>Il te faut <b>au moins 2 objets</b> pour forger. Reviens quand tu en auras davantage.</p>
      <button class="btn big" data-action="leave-forge">Quitter la forge</button>
    </section>`;
  }

  const owned = run.relics.map((id, i) => {
    const r = RELICS[id];
    const on = sel.includes(i);
    return `<button class="relic-pick ${on ? 'on' : ''} ${r.fused ? 'is-fused' : ''}" data-action="forge-select" data-idx="${i}">
      ${relicSVG(r.art)}<b>${esc(r.name)}</b><span>${esc(r.text)}</span>${on ? '<em>✓</em>' : ''}</button>`;
  }).join('');

  let previewBlock = `<p class="forge-hint">Sélectionne <b>2 objets</b> à fusionner.</p>`;
  let canForge = false;
  if (sel.length === 2) {
    const res = fusionPreview(run.relics[sel[0]], run.relics[sel[1]]);
    canForge = true;
    previewBlock = `<div class="forge-result">
      <div class="forge-eq">${relicSVG(RELICS[run.relics[sel[0]]].art)} <span>+</span> ${relicSVG(RELICS[run.relics[sel[1]]].art)} <span>=</span></div>
      <div class="forge-out">${relicSVG(res.art)}<b>${esc(res.name)}</b><span>${esc(res.text)}</span></div>
    </div>`;
  }

  return `<section class="panel forge">
    <h2>⚒️ La Forge</h2>
    <p class="muted">Combine deux objets en un objet supérieur. Les deux objets d'origine sont consommés.</p>
    <div class="relic-pick-grid">${owned}</div>
    ${previewBlock}
    <div class="forge-actions">
      <button class="btn big" data-action="forge" ${canForge ? '' : 'disabled'}>🔨 Forger</button>
      <button class="btn" data-action="leave-forge">Quitter sans forger</button>
    </div>
  </section>`;
}

// --- Vue BOUTIQUE -------------------------------------------------------
function shopView(app) {
  const run = app.run;
  const items = app.shop.items.map((it, i) => {
    const afford = run.gold >= it.price && !it.sold;
    let inner;
    if (it.kind === 'card') {
      const d = CARDS[it.id];
      inner = `<span class="shop-cost-badge">${d.cost}</span>${cardArtSVG(d.art)}<b>${esc(d.name)}</b><span class="desc">${esc(d.text)}</span>`;
    } else if (it.kind === 'relic') {
      const r = RELICS[it.id];
      inner = `${relicSVG(r.art)}<b>${esc(r.name)}</b><span class="desc">${esc(r.text)}</span>`;
    } else {
      inner = `<div class="heal-ic">➕</div><b>Soin</b><span class="desc">Récupère ${it.amount} PV.</span>`;
    }
    return `<button class="shop-item ${it.sold ? 'sold' : ''}" ${afford ? '' : 'disabled'}
        data-action="buy" data-idx="${i}">
      ${inner}
      <span class="price">${it.sold ? 'VENDU' : `💰 ${it.price}`}</span>
    </button>`;
  }).join('');
  return `<section class="panel shop">
    <h2>🛒 Boutique</h2>
    <p class="muted">Tu as <b>💰 ${run.gold} or</b>. Dépense-le judicieusement.</p>
    <div class="shop-grid">${items}</div>
    <button class="btn big" data-action="leave-shop">Quitter la boutique</button>
  </section>`;
}

// --- Vue ÉVÉNEMENT ------------------------------------------------------
function eventView(app) {
  const ev = EVENTS[app.event];
  return `<section class="panel event">
    <h2>❓ ${esc(ev.title)}</h2>
    <p class="event-text">${esc(ev.text)}</p>
    <div class="event-options">
      ${ev.options.map((o, i) => `<button class="btn option" data-action="event-opt" data-opt="${i}">
        <b>${esc(o.label)}</b><span>${esc(o.desc)}</span></button>`).join('')}
    </div>
  </section>`;
}

// --- Vue FIN ------------------------------------------------------------
function endView(app, won) {
  return `<section class="panel end ${won ? 'win' : 'lose'}">
    <h2>${won ? '🏆 Donjon vaincu !' : '💀 Game Over'}</h2>
    <p>${won
      ? 'Tu as atteint le sommet et terrassé le Gardien. Bravo !'
      : `Tu es tombé à l'étage ${app.run.depth}.`}</p>
    <div class="end-actions">
      <button class="btn big" data-action="restart">Rejouer (même seed)</button>
      <button class="btn" data-action="newseed">Nouvelle seed</button>
    </div>
  </section>`;
}
