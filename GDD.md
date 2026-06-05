# 🏔️ Climb the Spire — Game Design Document

> Roguelike deckbuilder coopératif (façon *Slay the Spire*), web. Solo d'abord, **coop réseau** visé.
> La **puissance vient des objets**, pas du deck : on combine des objets pour bâtir des combos dévastateurs.

## Pilier de design
Le deck reste **simple et lisible** (Frappe, Défense…). Ce sont les **objets équipés sur le personnage**
qui transforment *toutes* les cartes et, en s'**empilant**, créent la profondeur et la rejouabilité.

## Boucle de jeu
`Menu (seed) → Map à embranchements → Nœuds → Récompenses → … → Boss`
Nœuds : Combat · Élite · Événement · **Forge** · Repos · Boutique · Boss. Une seule vie.
Durée d'un run visée : **30–60 min**.

## Combat
- Tour par tour : le joueur joue, puis l'ennemi. **Intentions ennemies affichées.**
- **Énergie** : 3, régénérée entièrement chaque tour. Cartes coûtent de l'énergie.
- **Main** : pioche 5 cartes/tour ; les cartes non jouées sont défaussées en fin de tour.
- **Bloc** : remis à zéro au début de votre tour (il vous protège donc pendant le tour ennemi).
- Cartes de base : **Frappe** (attaque), **Défense** (bloc). Nouvelles cartes = variations simples.
- MVP : **1 ennemi** par combat (groupes plus tard).

## Système d'objets (signature)
- Un objet s'**équipe sur le personnage** et modifie **globalement** les cartes via un *pipeline d'effets*.
- **Illimités** (façon reliques). Appliqués **dans l'ordre** → l'empilement fait les combos.
- Exemples : *Katana* (attaques ×2), *Graisse d'Ours* (+Faiblesse), *Lame Vénéneuse* (+Poison), *Gantelet* (+2 dégâts).
- **Forge** : nœud qui **combine 2 objets → 1 objet supérieur** (recettes à découvrir).

### Statuts
Poison, Saignement, Brûlure (dégâts sur la durée, -1/tour), Faiblesse (-25% dégâts), Force (ennemis, +dégâts).

## Personnage
Une seule classe au départ. **PV max fixes** : aucune montée en niveau — toute la progression passe par cartes + objets.

## Map & seed
Donjon à embranchements **généré depuis une seed** affichée et partageable (URL `?seed=`).
Tout le hasard découle de la seed ⇒ run **reproductible** (pas de re-roll abusif du RNG).

## Coop (prévu)
Coop **en réseau**, 2 joueurs avançant ensemble. Préparé dès maintenant par une **logique de jeu
pure et déterministe, séparée du rendu** (dossier `engine/`), pilotée par seed + actions.

## Technique
- **JS vanilla + modules ES**, zéro dépendance. Rendu DOM/CSS, assets **SVG cartoon** générés en code.
- `engine/` = règles pures (testable, réseau-ready) · `ui/` = rendu & interactions.
- Pas de sauvegarde pour le MVP.

## Décisions tranchées (v0.1)
| Sujet | Choix |
|---|---|
| Objets | Illimités, empilables, globaux |
| Cartes gagnées | Variations simples (objets = source de puissance) |
| Ennemis/combat | 1 (MVP) |
| Hasard | Seed reproductible |
| Vie | Une seule |
| Coop | Réseau, plus tard |
| Stack | JS vanilla + SVG |

## Roadmap
- [x] **Jalon 1 — Un combat jouable** (moteur + UI + objets en direct).
- [ ] Jalon 2 — Map à embranchements + récompenses (cartes & objets).
- [ ] Jalon 3 — Forge (fusion d'objets), Repos, Boutique, Événements.
- [ ] Jalon 4 — Plusieurs ennemis, élites, boss.
- [ ] Jalon 5 — Coop réseau.
