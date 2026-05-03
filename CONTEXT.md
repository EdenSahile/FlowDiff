# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 161 tests passants · dernière session 2026-05-03 (session 4)  
**Audit comptable panier complet** — calculs et affichage conformes secteur diffusion livre.

---

## Refonte UI — état des mockups (2026-05-03)

Choix arrêtés :
- Direction : **Éditorial Luxe**
- Typographie : **Open Sans** (toute l'app)
- Palette : **Ardoise & Champagne** — `#2D3A4A` / `#D4A843` / `#F8F5EE`
- Approche : **C — Hybride** (design system → 5 pages clés → touches légères sur les 17 autres)

Fichiers mockup : `.superpowers/brainstorm/63208-1777743595/content/`

Pages validées :
- [x] **HomePage** ✅
- [x] **Login** ✅
- [x] **Fonds** ✅
- [x] **Fiche livre** ✅
- [ ] **Panier** — mockup à faire

---

## Corrections panier — session 4 (2026-05-03)

Audit comptable réalisé via skills `comptable` + `expert-comptable-flowdiff` :

**Bloc ouvrage (PriceStrip)** :
- "Prix public TTC" = PP TTC unitaire (référence éditeur)
- "Remise" = −X%
- "Prix net TTC" = PP TTC × (1 − remise%) — prix unitaire remisé

**Récapitulatif financier — Option A tout HT** (standard facture diffuseur) :
- Montant HT = Σ(PP TTC / 1,055 × qté) — brut HT avant remise
- Remise HT = montantHT × remise%
- Net HT / TVA 5,5% / Total TTC

**Autres corrections** :
- `remiseAmount` dans `handleConfirmOrder` corrigé en HT (÷ 1,055), cohérent avec le modèle `Order`
- Calculs de totaux consolidés vers `useCart()` — suppression de la duplication locale
- Appliqué sur les 3 vues : panier, étape récap, étape confirmation finale

---

## Prochaines étapes

1. Mockup **Panier** (dernière page manquante)
2. Écrire le spec dans `docs/superpowers/specs/2026-05-03-refonte-ui-design.md`
3. Lancer `/writing-plans` pour le plan d'implémentation
4. Implémentation phase 1 : `theme.ts` + composants UI
5. Implémentation phase 2 : LoginPage · HomePage · FondsPage · FicheProduitPage · CartPage
6. Implémentation phase 3 : touches légères sur les 17 autres pages
