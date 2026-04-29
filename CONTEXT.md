# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 13 nouveaux tests (useDashboardConfig) · dernière session 2026-04-28  
Feature dashboard complète : sélecteur de période, comparaison N-1, 7 KPI cards dynamiques, graphique, donut, top éditeurs.  
Fix UTC dates : `parseLocalISO` dans `usePeriodFilter` + `toLocalISO` dans `ComparaisonToggle` (dates début N-1 correctes).

---

## Session en cours — Feature : Personnalisation du dashboard (drawer)

### Plan d'implémentation
`docs/superpowers/plans/2026-04-28-dashboard-customization.md` — 7 tâches  
Exécution via **subagent-driven-development** (sous-agents + revues spec + qualité)

### Tâches

- [x] **Task 1** — `useDashboardConfig` hook + tests (`src/hooks/useDashboardConfig.ts`) — commit `ea4366d`
- [x] **Task 2** — `CustomizerDrawer` composant (`src/components/dashboard/CustomizerDrawer.tsx`) — commits `2d346d2` + `93725af` (fixes a11y)
- [x] **Task 3** — HomePage : imports, état `customizerOpen`, bouton "⊞ Personnaliser", `CustomizerDrawer` dans JSX — commit `fed19be`
- [x] **Task 4** — HomePage : zone `actionCards` config-driven
- [x] **Task 5** — HomePage : zone `kpiCards` config-driven
- [x] **Task 6** — HomePage : zones `mainPanels` + `bottomPanels` + fix `ThreeColRow` ($count)
- [ ] **Task 7** — Vérification finale : build + test manuel drawer

### Nota
- `gray[300]` n'existe pas dans le thème (tokens : 50/100/200/400/600/800) → utiliser `gray[400]`
- Le commit Task 1 a bundlé par erreur la modif `usePeriodFilter.ts` déjà en attente

---

## Prochaines étapes

Reprendre l'exécution du plan à la **Task 4** (zone actionCards dans HomePage.tsx).


