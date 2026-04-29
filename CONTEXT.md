# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 130 tests passants · dernière session 2026-04-29  
Feature dashboard complète : sélecteur de période, comparaison N-1, 7 KPI cards dynamiques, graphique, donut, top éditeurs.  
Feature personnalisation drawer complète : toggle visibilité, réordonnancement drag & drop (desktop) + flèches (mobile), reset, persistance localStorage.  
Fixes UX drawer : touch targets 44px, icônes SVG (IconGrip, IconLayout), section labels visuels, scroll page background pendant drawer ouvert.

---

## Session en cours

**Feature : Drag & drop direct sur les cards de la HomePage**  
Plan : `docs/superpowers/plans/2026-04-29-dashboard-card-drag.md`  
Spec : `docs/superpowers/specs/2026-04-29-dashboard-card-drag-design.md`  
Exécution : subagent-driven-development (1 sous-agent par tâche)

### Tâches

- [x] T1 — Add `IconGrip` + `CardDragHandle` (commit `2009f1e`)
- [x] T2 — Modify `ActionCard` + add `ActionCardWrap` (commit en cours)
- [x] T3 — Add DnD props to `KPICard` + `PanelCard` (commit `9257a61`)
- [x] T4 — Add DnD state + handlers to `HomePage` (commit `110e356`)
- [x] T5 — Wire DnD on `kpiCards` (commit `21496e9`)
- [x] T6 — Wire DnD on `actionCards` (commit `2a2d515`)
- [x] T7 — Wire DnD on `mainPanels` + `bottomPanels` (commit `fa35a15`)
- [x] T8 — Final verification (tsc clean · 130 tests · 18 drag handles DOM · 18 draggables homepage OK)

**Fichier modifié :** `src/pages/home/HomePage.tsx` uniquement  
**Warnings IDE attendus** : `CardDragHandle`, `ActionCardWrap`, `IconGrip` "declared but never read" — disparaîtront dès T5-T7.

---

## Prochaines étapes

Reprendre à T3 quand l'utilisateur donne le feu vert.
