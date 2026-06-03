# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 180/181 tests passants · session 2026-06-03  
_(1 test pré-existant failing : `useDashboardConfig.test.ts > has 3 bottomPanels all visible` — non lié, ignoré)_  
**Intégration Supabase catalogue** : 13/13 pages migrées ✅  
**Back-Office Admin FlowDiff Phase 1** : 12/12 tâches terminées ✅

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
**EDI — Refonte header icônes** : StickyBand + ListsLabel dynamique ✅  
**EDI — Fixes tableau** : suppression colonne Diffuseur · N° commande ORDRSP via `getOrderRef` · onglet Factures avec N° facture + ISBN search ✅  
**EDI — Renumérotation** : CMD-YYYY-MMDD-XXX → CMD0000001-CMD0000012 (mocks EDI) + CMD0000013-CMD0000014 (mockOrders) · compteur initial à 14 · STORAGE_VERSION v3 · ACK/DESADV refs corrigés ✅  
**EDI — Références de commande** : section référence dans CartPage (global + par article) · RFF+CR dans template ORDERS · badge HistoriquePage ✅  
**EDI — ORDERS production EDIFACT** : UNA · UNOC:3 · GLN placeholders · UNH/UNT docRef · CUX:9 · RFF+LI/API · IMD auteur(009/010/011)/titre(050, split)/éditeur(109)/année(170)/Livre(180) · CNT · parseAuthorImd · titleToImd050 · mockEDIMessages enrichis · MOCK_EDI_VERSION v7 ✅

