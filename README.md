# 🏔️ Climb the Spire

Roguelike deckbuilder coopératif sur navigateur, inspiré de *Slay the Spire*.
La puissance vient des **objets** qu'on combine, pas du deck lui-même.

👉 Voir [GDD.md](./GDD.md) pour le design complet.

## Lancer le jeu

Le jeu utilise des **modules ES** : il faut le servir via HTTP (pas en `file://`).
Aucune installation, aucune dépendance.

```bash
# au choix
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

ou avec Node :

```bash
npx serve .
```

## Jalon actuel — un combat jouable

- Combat tour par tour contre le **Gluant Gardien**, intention affichée.
- Deck simple (Frappe / Défense), énergie 3/tour, pioche 5.
- **Cabinet d'objets** (panneau démo) : équipez/retirez des objets **en direct** et
  regardez les cartes se transformer (Katana = ×2, Graisse d'Ours = +Faiblesse, etc.).
- Seed reproductible (modifiable, partagée dans l'URL `?seed=`).

## Structure

```
src/
  engine/   logique de jeu PURE & déterministe (réseau-ready)
    rng.js        RNG seedé
    content.js    cartes, objets, statuts, ennemis (données)
    combat.js     règles du combat
  ui/         rendu DOM & assets (aucune règle de jeu)
    assets.js     SVG cartoon générés en code
    render.js     rendu de l'état
  main.js     liaison moteur ⇄ UI + interactions
```
