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

**Cible** : 360px → 1400px · Tous les formats · Critères : 0 scroll H, touch ≥44px, font ≥16px, layouts adaptatifs

#### Étape 0 — Fondations
- [ ] Créer `src/lib/responsive.ts` (breakpoints constants + helpers mediaQueries)
- [ ] Mettre à jour `src/lib/theme.ts` (ajouter xs/sm/md/lg/xl)
- [ ] Créer composant utilitaire `ResponsiveGrid`

#### Vague 1 — Core pages (critiques)
- [ ] FondsPage — aligner breakpoints hardcodés sur responsive.ts
- [ ] NouveautesPage — grid 1 col (360px), 2 col (480px+), sous-onglets flex-wrap
- [ ] CartPage — book item grid (130px 1fr) → flex responsive
- [ ] HistoriquePage — grid repeat(3,1fr) → 1/2/3 col responsive
- [ ] RecherchePage — responsive complet (0 → full)

#### Vague 2 — Pages secondaires
- [ ] MonComptePage — formulaire responsive + touch targets
- [ ] FacturationPage — tableau → layout card mobile
- [ ] ParametresPage — toggles + sections flex-wrap
- [ ] SelectionsPage — grille couvertures responsive
- [ ] EDIPage — zone upload + tableau scroll horizontal
- [ ] HomePage (Dashboard) — unifier breakpoints 700px/900px

#### Vague 3 — Polish + vérification
- [ ] FlashInfosPage — finaliser issues restantes
- [ ] Auth pages (Login/Register/Forgot) — vérifier formulaires
- [ ] OfficesPage — aligner nomenclature
- [ ] Vérification globale : touch targets, font, scroll H

---

## Prochaines étapes

Écrire le plan d'implémentation détaillé (writing-plans) puis exécuter Étape 0.
