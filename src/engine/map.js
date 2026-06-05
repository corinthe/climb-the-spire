// Génération de la carte du donjon — embranchements déterministes (seedés).
// Structure : `rows` rangées de nœuds, reliées de bas (départ) en haut (boss).
// Chaque nœud connaît ses successeurs (`next`) ; le joueur ne peut suivre que
// les chemins existants.

const DEFAULT_ROWS = 11;

// Position normalisée (0..1) d'un nœud sur sa rangée.
const npos = (col, count) => (count === 1 ? 0.5 : col / (count - 1));

export function generateMap(rng, { rows = DEFAULT_ROWS } = {}) {
  const grid = [];
  let counter = 0;

  for (let r = 0; r < rows; r++) {
    const count = r === 0 ? rng.int(2, 3) : rng.int(2, 4);
    const arr = [];
    for (let c = 0; c < count; c++) {
      arr.push({ id: `n${counter++}`, row: r, col: c, count, type: null, next: [], nx: npos(c, count), ny: r });
    }
    grid.push(arr);
  }

  const boss = { id: 'boss', row: rows, col: 0, count: 1, type: 'boss', next: [], nx: 0.5, ny: rows };

  // Relie chaque rangée à la suivante (la dernière mène au boss).
  for (let r = 0; r < rows; r++) {
    connectRows(rng, grid[r], r + 1 < rows ? grid[r + 1] : [boss]);
  }

  assignTypes(rng, grid, rows);
  return { grid, boss, rows };
}

// Connecte les nœuds d'une rangée à ceux de la suivante, en privilégiant la
// proximité horizontale (évite les croisements) et en garantissant la
// connectivité (chaque nœud suivant a au moins une entrée).
function connectRows(rng, cur, nxt) {
  for (const node of cur) {
    const sorted = nxt.slice().sort(
      (a, b) => Math.abs(a.nx - node.nx) - Math.abs(b.nx - node.nx)
    );
    const k = rng.next() < 0.4 ? 2 : 1;
    for (const t of sorted.slice(0, Math.min(k, sorted.length))) {
      if (!node.next.includes(t.id)) node.next.push(t.id);
    }
  }
  // Garantit qu'aucun nœud suivant n'est inaccessible.
  for (const t of nxt) {
    if (cur.some((n) => n.next.includes(t.id))) continue;
    const nearest = cur.slice().sort((a, b) => Math.abs(a.nx - t.nx) - Math.abs(b.nx - t.nx))[0];
    nearest.next.push(t.id);
  }
}

function assignTypes(rng, grid, rows) {
  for (let r = 0; r < rows; r++) {
    for (const node of grid[r]) {
      if (r === 0) node.type = 'combat';            // premier contact : un combat
      else if (r === rows - 1) node.type = 'rest';  // repos juste avant le boss
      else node.type = pickType(rng, r);
    }
  }
}

function pickType(rng, r) {
  const pool = [];
  const add = (t, w) => { for (let i = 0; i < w; i++) pool.push(t); };
  add('combat', 10);
  add('event', 4);
  add('treasure', 2);
  if (r >= 2) add('rest', 3);
  if (r >= 2) add('forge', 2);
  if (r >= 3) add('elite', 3);
  return rng.pick(pool);
}

// Récupère un nœud (rangées + boss) par identifiant.
export function getNode(map, id) {
  if (id === 'boss') return map.boss;
  for (const row of map.grid) {
    const n = row.find((x) => x.id === id);
    if (n) return n;
  }
  return null;
}

export function allNodes(map) {
  return map.grid.flat().concat(map.boss);
}
