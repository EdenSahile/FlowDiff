# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 161 tests passants · session 2026-05-03 (session 9)  
**FicheProduitPage conformité maquette** ✅

---

## Session en cours

### Harmonisation des cards — layout `coverFirst` sur toutes les pages ✅

- [x] AParaitrePage — ajouter `coverFirst` + aligner minmax à 220px
- [x] NouveautesPage — ajouter `coverFirst` + aligner minmax à 220px
- [x] RecherchePage — ajouter `coverFirst` + aligner minmax à 220px
- [x] AuteurPage — ajouter `coverFirst` + aligner minmax à 220px
- [x] TopVentesPage — ajouter `coverFirst` (PodiumGrid, sans toucher à la structure)

### Redesign BookCard coverFirst — layout "Product Shot" ✅

- [x] BookCover : chargement image réelle via OpenLibrary API par ISBN, fallback SVG généré
- [x] CoverZone : fond neutre `gray[50]`, hauteur 200px, livre centré
- [x] Book3D : wrapper CSS `perspective + rotateY(-10deg)` + drop-shadow, hover animé
- [x] Star wishlist : top-right de la CoverZone
- [x] CFInfoSection : badge + titre + auteur + éditeur·année + séparateur + prix + qty + stock + CTA
- [x] Fix BookCover : TitleArea déjà masqué en fill mode (pas de double affichage)

---

## Prochaines étapes

