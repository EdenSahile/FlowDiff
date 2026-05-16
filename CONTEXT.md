# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 168/169 tests passants · session 2026-05-16  
_(1 test pré-existant failing : `useDashboardConfig.test.ts > has 3 bottomPanels all visible` — non lié, ignoré)_

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

## Session en cours — Intégration Supabase catalogue livres

**Spec complète** : `docs/superpowers/specs/2026-05-16-supabase-books-design.md`  
**Plan détaillé** : `docs/superpowers/plans/2026-05-16-supabase-books.md`

### Checklist tâches

| # | Tâche | Statut |
|---|-------|--------|
| 1 | Variables d'env (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`) + install `@supabase/supabase-js` | ✅ |
| 2 | Modèle `Livre` dans `prisma/schema.prisma` + migration SQL générée | ✅ |
| 3 | Exécuter le SQL + politique RLS dans Supabase dashboard *(action manuelle utilisateur)* | ✅ |
| 4 | Créer `src/lib/supabase.ts` (client singleton) | ✅ |
| 5 | Créer `src/services/books.ts` + tests `searchBooksLocal` | ✅ |
| 6 | Créer `prisma/seed.ts` + exécuter le seed | ✅ |
| 7 | Migrer `FondsPage.tsx` | ✅ |
| 8 | Migrer `NouveautesPage.tsx` | ✅ |
| 9 | Migrer `AParaitrePage.tsx` | ✅ |
| 10 | Migrer `TopVentesPage.tsx` | ✅ |
| 11 | Migrer `FicheProduitPage.tsx` | - [ ] |
| 12 | Migrer `RecherchePage.tsx` | - [ ] |
| 13 | Migrer `SelectionsPage.tsx` | - [ ] |

### Notes techniques

- `DATABASE_URL` corrigé : `@` du mot de passe encodé en `%40%40` (format : `postgresql://postgres:SupaFlowDiff%40%40!!@db.cuekimkchzllcdygqogf.supabase.co:5432/postgres`)
- Prisma 7 : `url` retirée de `schema.prisma` — connexion gérée par `prisma.config.ts` (déjà configuré)
- Connexion directe Supabase échoue en local (host legacy `db.*.supabase.co`) → migration SQL créée manuellement dans `prisma/migrations/20260516000000_add_livre/`
- Table `livres` créée dans Supabase + RLS activé + policy SELECT publique ✅
- Clé anon Supabase : `sb_publishable_uW2NNz2XlOBfas952_vZYA_NrCnqd3L`
- **Pour le seed (Task 6)** : `npx tsx prisma/seed.ts` — si `PrismaClientInitializationError`, la connexion DB locale échoue toujours ; dans ce cas utiliser le client Supabase JS directement depuis le seed (contournement)
- **Pattern de migration pages** : `useState<Book[]>([])` + `useEffect` → `getBooksByTypeAsync/getAllBooksAsync`
- **Seed** : `prisma/seed.ts` utilise Supabase JS directement (clé anon a seulement SELECT → SQL généré dans `prisma/seed.sql` exécuté depuis le dashboard Supabase) ✅
- **Prochaine tâche** : Task 7 — migrer FondsPage.tsx
