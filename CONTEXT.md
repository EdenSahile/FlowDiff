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

---

## Session en cours

### Panneau de notifications — Feed chronologique

Spec : `docs/superpowers/specs/2026-05-04-notifications-design.md`

- [x] 1. Créer `NotificationsContext` (calcul des 3 notifs, état lu/non-lu éphémère)
- [x] 2. Créer composant `NotificationBell` (cloche + badge + dropdown panel)
- [x] 3. Intégrer dans `Header.tsx` (remplace IconBell + prop `hasNotif`)
- [x] 4. Ajouter `markAsRead` dans NouveautesPage, CartPage, TopVentesPage
- [x] 5. Envelopper l'app avec `NotificationsProvider` dans App.tsx
- [x] 6. Vérification TS + 162 tests passants

---

## Prochaines étapes
