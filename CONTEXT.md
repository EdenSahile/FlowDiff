# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 162 tests passants · session 2026-05-04  
**Refonte design pages** : NouveautesPage, AParaitrePage, TopVentesPage, SelectionsPage, FlashInfosPage, HistoriquePage, MonComptePage, RecherchePage, AuteurPage, ContactPage, FacturationPage, ParametresPage, EDIPage, OfficesPage ✅  
**Onboarding** : Tour guidé Driver.js 7 étapes + TooltipInfo métier + "Revoir le tour" ✅  
**Panier** : Récapitulatif HT corrigé — remise appliquée sur base HT (Prix TTC / 1,055) ✅  
**Notifications** : Feed chronologique 3 types, NotificationBell, NotificationsContext, markAsRead ✅

---

## Session en cours

### Audit & Refonte Mobile Responsive — Approche Hybrid

Spec : `docs/superpowers/specs/2026-05-04-audit-mobile-responsive-design.md`  
Plan : `docs/superpowers/plans/2026-05-04-audit-mobile-responsive.md`

**Cible** : 360px → 1400px · Tous les formats · Critères : 0 scroll H, touch ≥44px, font ≥16px, layouts adaptatifs

#### Étape 0 — Fondations
- [x] Task 1 — Créer `src/lib/responsive.ts` (bp + mq constants)
- [x] Task 2 — Mettre à jour `src/lib/theme.ts` (ajouter xs/sm/md/lg/xl)

#### Vague 1 — Core pages (critiques)
- [x] Task 3 — FondsPage — aligner breakpoints hardcodés sur mq.*
- [x] Task 4 — NouveautesPage — grid 1 col (360px), 2 col (480px+), flex-wrap sous-onglets
- [x] Task 5 — CartPage — OPRow grid adaptatif + sidebar récap 1fr→320px
- [x] Task 6 — HistoriquePage — StatsGrid repeat(3,1fr) → 1/2/3 col responsive
- [x] Task 7 — RecherchePage — responsive complet (0 → full)

#### Vague 2 — Pages secondaires
- [x] Task 8 — MonComptePage — padding adaptatif + touch targets ≥44px
- [x] Task 9 — FacturationPage — tableau overflow-x auto + padding adaptatif
- [x] Task 10 — ParametresPage — toggles min-height:44px + flex-wrap
- [x] Task 11 — SelectionsPage — grille couvertures 2→3→4→5 col
- [x] Task 12 — EDIPage — zone upload full-width + tableau scrollable
- [ ] Task 13 — HomePage (Dashboard) — unifier breakpoints 700px/900px → mq.*

#### Vague 3 — Polish + vérification
- [ ] Task 14 — FlashInfosPage — aligner media queries sur mq.*
- [ ] Task 15 — Auth pages (Login/Register/Forgot) — padding adaptatif + inputs full-width
- [ ] Task 16 — OfficesPage — aligner nomenclature 480px/768px/1024px → mq.*
- [ ] Task 17 — Vérification globale : 162 tests + TS clean + checklist responsive

---

## Prochaines étapes

En cours d'exécution — sous-agents dispatché par tâche avec validation entre chaque.
