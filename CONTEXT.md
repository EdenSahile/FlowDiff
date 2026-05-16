# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 168/169 tests passants · session 2026-05-16  
_(1 test pré-existant failing : `useDashboardConfig.test.ts > has 3 bottomPanels all visible` — non lié, ignoré)_  
**Intégration Supabase catalogue** : 13/13 pages migrées ✅

**Refonte design pages** : NouveautesPage, AParaitrePage, TopVentesPage, SelectionsPage, FlashInfosPage, HistoriquePage, MonComptePage, RecherchePage, AuteurPage, ContactPage, FacturationPage, ParametresPage, EDIPage, OfficesPage ✅  
**Onboarding** : Tour guidé Driver.js 7 étapes + TooltipInfo métier + "Revoir le tour" ✅  
**Panier** : Récapitulatif HT corrigé — remise appliquée sur base HT (Prix TTC / 1,055) ✅  
**Notifications** : Feed chronologique 3 types, NotificationBell, NotificationsContext, markAsRead ✅  
**Audit Mobile Responsive** : 360px→1400px · `src/lib/responsive.ts` (bp/mq) · 16 pages alignées · 0 scroll horizontal · touch ≥44px ✅  
**LoginPage responsive** : overflow grid corrigé (DemoBanner sorti de SplitPage) · Wordmark prop `responsiveOnDark` (white mobile / navy desktop) ✅  
**Scroll restoration FicheProduitPage** : `useEffect([id])` → `window.scrollTo(0,0)` ✅  
**FicheProduitPage mobile** : scroll horizontal supprimé · touch targets ≥44px · carrousel "Dans la même thématique" ✅  
**BookCard** : ISBN affiché en bold 13px navy sous l'éditeur (layouts défaut + coverFirst) ✅  
**mockBooks** : format → dimensions réelles (155x235, 108x177, 115x175, 220x290, 145x195, 145x215 mm) ✅  
**FicheProduitPage** : dimensions cohérentes avec le format sélectionné (broché/poche) ✅  
**Sidebar** : entrée "Panier" retirée du menu ✅  
**FacturationPage — bouton Payer** : colonne Payer · modal CB/Virement · badge "Payé" · persistance localStorage · portal fix + fix overflow CVV ✅  
**Dashboard — comparaison** : toggle "Année N-1" uniquement (Période préc. supprimée) · anneau intérieur donut supprimé · KPI renommé "Références distinctes commandées" ✅  
**Dashboard — graphique tooltip** : survol courbe verte → ligne verticale + point + bulle navy (date · cumulé · N-1) ✅  
**Dashboard — exports CSV par section** : icône ↓ dans chaque PanelHeader (évolution, répartition, top éditeurs, EDI, nouveautés) + bouton ↓ KPIs + bouton ↓ Actions en attente + bouton global "Exporter CSV" (rapport complet) ✅  
**Dashboard — réinitialiser filtres** : bouton "↺ Réinitialiser" dans la barre de filtres (après vs N-1), visible uniquement quand période ≠ défaut, style lien discret ✅  
**BackButton — navigation retour** : composant `src/components/ui/BackButton.tsx` · intégré dans 17 pages · RecherchePage (BackBtn local supprimé, `<BackButton />` global) · AuteurPage (style pilule blanc conservé, conditionné sur `location.key !== 'default'`) ✅  
**AuteurPage — liste livres** : suppression groupement par mois · grille plate triée du plus récent au plus ancien · sans filtre 2 ans ✅  
**Bouton "Ajouter au panier"** : toujours navy quelle que soit la disponibilité (suppression couleurs inline selon statut dans FicheProduitPage) ✅  
**BookCard — en réimpression** : bouton "Ajouter au panier" affiché (layout coverFirst : `isIndispo = isEpuise` uniquement) ✅  
**Mon Compte — Reliquat accepté** : champ lecture seule · badge Oui (vert) / Non (gris) · `reliquatAccepte` dans MockUser + AuthUser · LIB001 true, LIB002 false, LIB003 true ✅

---

## Session en cours — Back-Office Admin FlowDiff (Phase 1)

**Spec complète** : `docs/superpowers/specs/2026-05-16-admin-backoffice-design.md`  
**Plan détaillé** : `docs/superpowers/plans/2026-05-16-admin-backoffice.md`

### Checklist tâches

| # | Tâche | Statut |
|---|-------|--------|
| 1 | SQL tables `commandes` + `libraires` + RLS + seed *(Supabase dashboard)* | ⬜ |
| 2 | Admin types (`src/admin/types.ts`) + adminTheme (`src/admin/adminTheme.ts`) | ⬜ |
| 3 | `AdminAuthContext` + `useAdminAuth` hook | ⬜ |
| 4 | `adminServices.ts` + tests (`computeCAMois`, `computeTop5`) | ⬜ |
| 5 | `AdminRoute` guard + `AdminLoginPage` (identifiants pré-remplis) | ⬜ |
| 6 | `AdminLayout` + `StatutBadge` + `AdminModal` | ⬜ |
| 7 | Câblage routes admin dans `App.tsx` | ⬜ |
| 8 | `AdminDashboardPage` (KPIs + tableaux synthèse) | ⬜ |
| 9 | `AdminCataloguePage` (liste + CRUD add/edit/delete) | ⬜ |
| 10 | `AdminCommandesPage` (liste + statut inline + détail modal) | ⬜ |
| 11 | `AdminLibrairesPage` (liste + edit modal remise/statut/reliquat) | ⬜ |
| 12 | Tests finaux + CONTEXT.md | ⬜ |

### Notes techniques

- Route admin : `/admin/*` dans `App.tsx`, enveloppé par `AdminAuthProvider` + sous-router `AdminRoutes`
- Auth admin : localStorage flag — identifiants dans `src/admin/contexts/AdminAuthContext.tsx` (ne pas mettre dans CONTEXT.md)
- Style : `src/admin/adminTheme.ts` — sidebar `#1a1a2e`, accent `#4361ee`, fond `#f8f9fa`
- Supabase : clé anon + RLS `FOR ALL USING (true)` pour la démo (à restreindre en prod)
- Tables à créer : `commandes` + `libraires` (la table `livres` existe déjà)
- Seed : 3 libraires (LIB001/LIB002/LIB003) + 8 commandes (statuts variés) — SQL dans le plan Task 1
