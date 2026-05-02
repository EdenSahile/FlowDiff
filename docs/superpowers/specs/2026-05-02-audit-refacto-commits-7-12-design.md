# Design : Audit qualité + Commits 7→12

**Date** : 2026-05-02  
**Contexte** : Commits 1→6 déjà appliqués. Reprendre le plan d'audit/refacto pour les commits 7→12, enrichi d'un audit ciblé des nouvelles features développées depuis (dashboard, feedback widget, EDI, Offices, RDV, CSV).

---

## Situation de départ

| Commit | État | Ce qui reste |
|--------|------|-------------|
| 1→6 | ✅ commité | — |
| 7 | ✅ largement fait | Vérifier si Header/Historique utilisent `csv.ts` ; SVG inline résiduels dans nouvelles pages |
| 8 | ❌ | CartContext, AuthContext, WishlistContext sans `useCallback`/`useMemo` |
| 9 | ❌ | PriceNet BookCard/BookCardRow, toast avec action, tab Panier BottomNav, recherche ISBN directe |
| 10 | ❌ partiel | Sidebar contraste rgba 0.30/0.40, pas de règle globale `prefers-reduced-motion`, 113× font-size 10-11px |
| 11 | ❌ | Lazy bcrypt AuthContext, `React.memo` BookCover, `PageSkeleton`, `loading="lazy"` SelectionsPage |
| 12 | ❌ adapté | Corriger 2 affirmations fausses CLAUDE.md + tableau des phases — **pas de bloc daté** |

---

## Architecture générale

Pas de nouveau composant architectural. Toutes les modifications sont des améliorations incrémentales sur le code existant :
- Memoization : patterns `useCallback`/`useMemo` ajoutés dans les 3 contextes existants
- A11y : corrections CSS dans fichiers existants
- Perf : wrappers `React.memo`, dynamic imports, attributs HTML natifs
- UX : nouveaux sous-composants inline (`PriceNet`, `PageSkeleton`), extension de `ToastContext`

---

## Étapes

### Étape 0 — Audit ciblé des nouvelles features
**Agent en parallèle** qui lit les fichiers des features post-plan :
- `src/components/dashboard/` + `src/pages/**/DashboardPage`
- `src/components/ui/FeedbackWidget.tsx`
- `src/pages/edi/`, `src/pages/offices/`, `src/pages/rdv/`
- `src/lib/csv.ts` + `src/lib/exportCSV.ts`

**Rapport attendu (compact)** :
1. SVG inline non migrés vers `icons/index.tsx`
2. Usages manquants de `csv.ts` (Header export liste, Historique export commandes)
3. Nouvelles dettes a11y/perf non couvertes par commits 8-11

### Étape 1 — Commit 7 (complétion)
Si l'audit révèle des gaps :
- Migrer SVG inline résiduels vers `icons/index.tsx`
- Brancher `exportToCSV` de `csv.ts` dans Header.tsx et HistoriquePage si ce n'est pas encore fait

### Étape 2 — Commit 8 (memoization contexts)
Fichiers : `CartContext.tsx`, `AuthContext.tsx`, `WishlistContext.tsx`
- `useCallback` sur toutes les fonctions mutantes (addToCart, updateQty, removeFromCart, addOPToCart, removeOP, clearCart, login, register, logout + 7 fonctions wishlist)
- `useMemo` sur `effectiveRates`, résultat `computeTotals`, objet `value`
- OrdersContext : déjà partiellement memoïsé, vérifier `addOrder` + `value`

### Étape 3 — Commit 9 (UX flux libraire)
- `BookCard` + `BookCardRow` : sous-composant `<PriceNet>` affichant `(priceTTC × (1 - userRate)).toFixed(2) €` + label "Net remisé"
- `ToastContext` : étendre le payload `{ message, action?: { label, onClick } }` ; `BookCard.handleAdd` : toast avec bouton "Voir le panier →"
- `BottomNav` : remplacer tab Top Ventes ou Sélections par tab Panier avec badge `useCart().totalItems`
- `Header.handleSearchKey` : navigation directe `/livre/${id}` si search match exactement un ISBN dans MOCK_BOOKS

### Étape 4 — Commit 10 (accessibilité WCAG AA)
- `Sidebar.tsx` : remonter tous les `rgba(255,255,255,0.28–0.45)` à `0.60+`
- `index.css` : ajouter règle globale `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`
- Font-size 10-11px → 12px sur textes informatifs (hors codes ISBN mono)
- Touch targets QtyBtn, BookRowRemove, ListRowDelete, BookRowCartBtn : 24-28px → 36px

### Étape 5 — Commit 11 (perf bundle + images)
- `AuthContext` : dynamic import bcrypt `const bcrypt = await import('bcryptjs')` dans login/register
- `BookCover.tsx` : wrapper `React.memo` avec compare sur `isbn + width + height`
- `App.tsx` : remplacer `<Suspense fallback={null}>` par `<Suspense fallback={<PageSkeleton />}>`
- `PageSkeleton` : nouveau composant simple, fond navy, cohérent charte
- `SelectionsPage` : `loading="lazy" decoding="async"` sur les `<img>` de SerieCover

### Étape 6 — Commit 12 (doc CLAUDE.md)
**Strictement** :
1. Corriger "Guard anti-prod dans mockUsers.ts (throw si chargé en prod)" → "console.warn (guard passif, bundled en prod)"
2. Corriger "Clés localStorage suffixées par codeClient" → préciser que NAME_KEY est aussi suffixé depuis Commit 4
3. Mettre à jour le tableau des phases (phases nouvellement complètes)
4. **Aucun bloc `## Session du...`** — interdit par CLAUDE.md

---

## Vérification entre chaque commit

```
npm run build && npm run test
```
Les 153 tests doivent passer. En cas d'échec : stop, diagnostic, fix avant de continuer.

---

## Ce qui reste hors scope (décisions prises)

| Ref | Raison |
|-----|--------|
| S1/S2/S11 | Sécurité fondamentale (JWT forgeable, mockUsers bundled) — accepté, projet test |
| D4/D5 | Suppression Prisma/Next-auth — en fin de projet |
| A5/A6 | Découpage pages monolithes (1200-1600L) — risque régression élevé, hors scope |
| P10 | PWA — hors scope |
| U12 | Dark mode — non demandé |
