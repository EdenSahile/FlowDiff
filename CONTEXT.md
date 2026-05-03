# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 161 tests passants · session 2026-05-03 (session 6)  
**Refonte UI Éditorial Luxe — mergée sur `main`** ✅ `4a679bb`  
Fix LoginPage contenu panneau gauche ✅ `61343d1`

---

## Session en cours — Conformité maquettes

Plan : `docs/superpowers/plans/2026-05-03-layout-mockup-conformity.md`

Objectif : faire correspondre exactement l'app aux mockups HTML validés  
(`homepage-full.html` et `fonds.html`) — layout flex + topbar blanche + corrections pages.

### Tâches

- [x] Task 1 — `theme.ts` : headerHeight 68px → 56px
- [x] Task 2 — `AppLayout` : flex layout + MainColumn wrapper
- [x] Task 3 — `Sidebar` : sticky full-height + brand FlowDiff PRO en haut
- [x] Task 4 — `Header` : topbar blanche, logo masqué desktop, couleurs light
- [x] Task 5 — `DemoBanner` : sticky dans le flux (plus fixed)
- [ ] Task 6 — `AppFooter` : dans le flux MainColumn (plus fixed)
- [ ] Task 7 — `HomePage` : greeting-sub, section labels, PanelCard/ActionsBox styles, reminder card
- [ ] Task 8 — `FondsPage` : page header view-toggle, SVG search icon, ResultsCount style

---

## Prochaines étapes

1. Valider l'approche d'exécution (subagent ou inline) ✅
2. Exécuter les 8 tâches dans l'ordre avec validation après chaque tâche
3. Vérification visuelle sur le dev server après Task 6 (layout) et après Task 8 (pages)
4. Vérifier les autres pages si besoin
