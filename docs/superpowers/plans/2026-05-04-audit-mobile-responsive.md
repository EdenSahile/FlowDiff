# Audit & Refonte Mobile Responsive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre toutes les pages de l'app FlowDiff correctement responsives sur 360px → 1400px, sans scroll horizontal, touch targets ≥ 44px, font ≥ 16px sur le contenu principal.

**Architecture:** Approche hybrid — créer d'abord un système de breakpoints unifié (`src/lib/responsive.ts`), puis l'appliquer progressivement en 3 vagues sur les 19 pages. Mobile-first : styles de base pour 360px, surcharges via `min-width`.

**Tech Stack:** Vite 5 + React 18 + TypeScript strict + styled-components v6

---

## File Map

**Créer :**
- `src/lib/responsive.ts` — breakpoints constants + helpers `mediaQueries`

**Modifier :**
- `src/lib/theme.ts` — ajouter xs/sm/md/lg/xl dans `breakpoints`
- `src/pages/fonds/FondsPage.tsx` — aligner breakpoints hardcodés
- `src/pages/nouveautes/NouveautesPage.tsx` — grille 1→2→3 col
- `src/pages/cart/CartPage.tsx` — OPRow grid + récap responsive
- `src/pages/historique/HistoriquePage.tsx` — StatsGrid responsive
- `src/pages/search/RecherchePage.tsx` — responsive complet (0 → full)
- `src/pages/compte/MonComptePage.tsx` — formulaire + touch targets
- `src/pages/facturation/FacturationPage.tsx` — tableau → cards mobile
- `src/pages/parametres/ParametresPage.tsx` — toggles + flex-wrap
- `src/pages/selections/SelectionsPage.tsx` — grille couvertures
- `src/pages/edi/EDIPage.tsx` — zone upload + scroll horizontal
- `src/pages/home/HomePage.tsx` — unifier breakpoints 700px/900px
- `src/pages/flash-infos/FlashInfosPage.tsx` — finir les quelques issues
- `src/pages/offices/OfficesPage.tsx` — aligner nomenclature

---

## Étape 0 — Fondations

### Task 1 : Créer `src/lib/responsive.ts`

**Files:**
- Create: `src/lib/responsive.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
// src/lib/responsive.ts
export const bp = {
  xs: 360,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1400,
} as const

export const mq = {
  xs: `@media (min-width: ${bp.xs}px)`,
  sm: `@media (min-width: ${bp.sm}px)`,
  md: `@media (min-width: ${bp.md}px)`,
  lg: `@media (min-width: ${bp.lg}px)`,
  xl: `@media (min-width: ${bp.xl}px)`,
  belowSm: `@media (max-width: ${bp.sm - 1}px)`,
  belowMd: `@media (max-width: ${bp.md - 1}px)`,
  belowLg: `@media (max-width: ${bp.lg - 1}px)`,
} as const
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

Expected : 0 erreurs.

- [ ] **Step 3 : Commit**

```bash
git add src/lib/responsive.ts
git commit -m "feat(responsive): système de breakpoints unifié xs/sm/md/lg/xl"
```

---

### Task 2 : Mettre à jour `src/lib/theme.ts`

**Files:**
- Modify: `src/lib/theme.ts:70-72`

- [ ] **Step 1 : Remplacer le bloc `breakpoints` dans `theme.ts`**

Remplacer :
```typescript
  breakpoints: {
    mobile: '768px',
  },
```

Par :
```typescript
  breakpoints: {
    mobile: '768px',
    xs: '360px',
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1400px',
  },
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

Expected : 0 erreurs.

- [ ] **Step 3 : Commit**

```bash
git add src/lib/theme.ts
git commit -m "feat(theme): ajouter les breakpoints nommés xs/sm/md/lg/xl"
```

---

## Vague 1 — Core Pages

### Task 3 : FondsPage — aligner les breakpoints hardcodés

**Files:**
- Modify: `src/pages/fonds/FondsPage.tsx`

Le fichier a une grille avec des breakpoints hardcodés (`480px`, `768px`, `1024px`). Il faut les remplacer par les imports de `responsive.ts`.

- [ ] **Step 1 : Ajouter l'import en haut du fichier**

Après les imports existants, ajouter :
```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 2 : Remplacer la grille `BookGrid` (chercher `grid-template-columns: repeat(2, 1fr)` ou `repeat(auto-fill`)**

Trouver le composant styled qui contient les media queries de grille et remplacer les valeurs hardcodées par `mq.*` :

```typescript
const BookGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${mq.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${mq.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${mq.lg} {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`
```

- [ ] **Step 3 : Remplacer toutes les autres valeurs hardcodées 480px / 1024px dans le fichier**

```bash
grep -n "480px\|1024px\|700px\|900px" /Users/macbookeden/Desktop/AppBook/src/pages/fonds/FondsPage.tsx
```

Remplacer chaque occurrence par l'équivalent `mq.sm` / `mq.lg`.

- [ ] **Step 4 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

Expected : 0 erreurs.

- [ ] **Step 5 : Commit**

```bash
git add src/pages/fonds/FondsPage.tsx
git commit -m "fix(responsive): FondsPage — aligner breakpoints sur mq.*"
```

---

### Task 4 : NouveautesPage — grille 1 col à 360px

**Files:**
- Modify: `src/pages/nouveautes/NouveautesPage.tsx`

Problème actuel — grille commence à `repeat(2, 1fr)` dès le mobile : trop serré à 360px.

- [ ] **Step 1 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 2 : Remplacer le composant `Grid` (ligne ~155-170)**

Remplacer :
```typescript
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`
```

Par :
```typescript
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${mq.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${mq.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${mq.lg} {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`
```

- [ ] **Step 3 : S'assurer que les sous-onglets ont `flex-wrap: wrap`**

Trouver le composant des sous-onglets (TabsBar ou similaire) et vérifier qu'il a :
```typescript
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
```

- [ ] **Step 4 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add src/pages/nouveautes/NouveautesPage.tsx
git commit -m "fix(responsive): NouveautesPage — grille démarre à 1 col (360px)"
```

---

### Task 5 : CartPage — OPRow et récap responsive

**Files:**
- Modify: `src/pages/cart/CartPage.tsx`

Deux problèmes : `OPRow` a `grid-template-columns: 44px 1fr auto auto auto` figé, et la sidebar récap est à `320px` fixe.

- [ ] **Step 1 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 2 : Rendre `OPRow` responsive**

Remplacer :
```typescript
const OPRow = styled.div<{ $variant?: 'book' | 'cadeau' | 'plv' | 'total' }>`
  display: grid;
  grid-template-columns: 44px 1fr auto auto auto;
  align-items: center;
  ...
`
```

Par :
```typescript
const OPRow = styled.div<{ $variant?: 'book' | 'cadeau' | 'plv' | 'total' }>`
  display: grid;
  grid-template-columns: 36px 1fr auto auto;
  align-items: center;
  ...

  ${mq.md} {
    grid-template-columns: 44px 1fr auto auto auto;
  }
`
```

- [ ] **Step 3 : Vérifier que la sidebar récap passe bien en `1fr` sur mobile**

Chercher `grid-template-columns: 1fr 320px` dans CartPage.tsx et vérifier qu'il y a bien un media query `belowMd` ou `md` qui le collapse à `1fr`. Si absent, ajouter :

```typescript
const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  ${mq.md} {
    grid-template-columns: 1fr 320px;
  }
`
```

- [ ] **Step 4 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add src/pages/cart/CartPage.tsx
git commit -m "fix(responsive): CartPage — OPRow grid et layout sidebar adaptatifs"
```

---

### Task 6 : HistoriquePage — StatsGrid responsive

**Files:**
- Modify: `src/pages/historique/HistoriquePage.tsx`

Problème : `StatsGrid` a `grid-template-columns: repeat(3, 1fr)` figé — cassé à 360px.

- [ ] **Step 1 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 2 : Remplacer `StatsGrid` (ligne ~506-510)**

Remplacer :
```typescript
const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`
```

Par :
```typescript
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  ${mq.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${mq.md} {
    grid-template-columns: repeat(3, 1fr);
  }
`
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add src/pages/historique/HistoriquePage.tsx
git commit -m "fix(responsive): HistoriquePage — StatsGrid 1/2/3 col selon écran"
```

---

### Task 7 : RecherchePage — responsive complet

**Files:**
- Modify: `src/pages/search/RecherchePage.tsx`

0 media query actuellement. La grille utilise `minmax(220px, 1fr)` — sur 360px, une colonne de 220px laisse peu de marge. Les filtres n'ont pas de `flex-wrap`.

- [ ] **Step 1 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 2 : Ajouter padding responsive sur `Page`**

```typescript
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 1100px;
  margin: 0 auto;
  animation: ${fadeIn} 0.25s ease;

  ${mq.md} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`
```

- [ ] **Step 3 : Remplacer la grille `Grid` (ligne ~164-168)**

Remplacer :
```typescript
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`
```

Par :
```typescript
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${mq.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${mq.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${mq.lg} {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`
```

- [ ] **Step 4 : Vérifier que `FilterRow` a `flex-wrap: wrap`**

```typescript
const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`
```

- [ ] **Step 5 : S'assurer que `FilterChip` a un touch target suffisant**

```typescript
const FilterChip = styled.button<{ $active: boolean }>`
  padding: 8px 14px;    /* était 5px 14px — augmenter à 8px pour ≥ 36px de hauteur */
  min-height: 36px;
  ...
`
```

- [ ] **Step 6 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
git add src/pages/search/RecherchePage.tsx
git commit -m "fix(responsive): RecherchePage — responsive complet 360px→desktop"
```

---

## Vague 2 — Pages Secondaires

### Task 8 : MonComptePage — formulaire responsive

**Files:**
- Modify: `src/pages/compte/MonComptePage.tsx`

Problème : `max-width: 700px` sans padding adaptatif.

- [ ] **Step 1 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 2 : Adapter le padding de `Page`**

```typescript
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 700px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }

  ${mq.md} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`
```

- [ ] **Step 3 : Vérifier les lignes de données de la card compte**

Chercher les `display: flex` sans `flex-wrap: wrap` dans les rows d'info (nom librairie, code client, email, adresse). Ajouter `flex-wrap: wrap` et `gap` à chacun.

- [ ] **Step 4 : Vérifier que les boutons ont min-height 44px**

```bash
grep -n "button\|Button" /Users/macbookeden/Desktop/AppBook/src/pages/compte/MonComptePage.tsx | head -20
```

Chaque `styled.button` doit avoir `min-height: 44px`.

- [ ] **Step 5 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
git add src/pages/compte/MonComptePage.tsx
git commit -m "fix(responsive): MonComptePage — padding adaptatif et touch targets"
```

---

### Task 9 : FacturationPage — tableau mobile-friendly

**Files:**
- Modify: `src/pages/facturation/FacturationPage.tsx`

- [ ] **Step 1 : Lire la structure actuelle du tableau**

```bash
grep -n "grid-template\|display: grid\|display: flex\|table\|Table" /Users/macbookeden/Desktop/AppBook/src/pages/facturation/FacturationPage.tsx | head -20
```

- [ ] **Step 2 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 3 : Adapter le padding de `Page`**

```typescript
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 900px;
  margin: 0 auto;

  ${mq.md} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`
```

- [ ] **Step 4 : Si le tableau a des colonnes fixes, ajouter `overflow-x: auto` sur le wrapper**

Trouver le composant conteneur du tableau et ajouter :
```typescript
const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: ${({ theme }) => theme.radii.lg};
`
```

- [ ] **Step 5 : Vérifier les boutons (min-height ≥ 44px)**

Tous les boutons d'action (télécharger facture, etc.) doivent avoir `min-height: 44px`.

- [ ] **Step 6 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
git add src/pages/facturation/FacturationPage.tsx
git commit -m "fix(responsive): FacturationPage — tableau scrollable et padding adaptatif"
```

---

### Task 10 : ParametresPage — toggles et sections

**Files:**
- Modify: `src/pages/parametres/ParametresPage.tsx`

- [ ] **Step 1 : Lire les sections principales**

```bash
grep -n "display: flex\|display: grid\|styled\." /Users/macbookeden/Desktop/AppBook/src/pages/parametres/ParametresPage.tsx | head -30
```

- [ ] **Step 2 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 3 : Adapter le padding de `Page`**

```typescript
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 680px;
  margin: 0 auto;

  ${mq.md} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`
```

- [ ] **Step 4 : Chaque row toggle doit avoir `min-height: 44px`**

Chercher les composants toggle/switch et vérifier ou ajouter :
```typescript
const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 8px 0;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`
```

- [ ] **Step 5 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
git add src/pages/parametres/ParametresPage.tsx
git commit -m "fix(responsive): ParametresPage — toggles touch-friendly et padding adaptatif"
```

---

### Task 11 : SelectionsPage — grille couvertures responsive

**Files:**
- Modify: `src/pages/selections/SelectionsPage.tsx`

- [ ] **Step 1 : Lire la grille actuelle**

```bash
grep -n "grid-template\|480px\|repeat" /Users/macbookeden/Desktop/AppBook/src/pages/selections/SelectionsPage.tsx
```

- [ ] **Step 2 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 3 : Remplacer la grille couvertures par un pattern responsive**

La grille doit démarrer à 2 col dès 360px (les couvertures sont petites), puis s'élargir :

```typescript
const CoversGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  ${mq.sm} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  }

  ${mq.md} {
    grid-template-columns: repeat(4, 1fr);
  }

  ${mq.lg} {
    grid-template-columns: repeat(5, 1fr);
  }
`
```

- [ ] **Step 4 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add src/pages/selections/SelectionsPage.tsx
git commit -m "fix(responsive): SelectionsPage — grille couvertures 2→3→4→5 col"
```

---

### Task 12 : EDIPage — upload zone et tableau

**Files:**
- Modify: `src/pages/edi/EDIPage.tsx`

- [ ] **Step 1 : Lire les problèmes actuels**

```bash
grep -n "@media\|grid-template\|display: grid\|display: flex" /Users/macbookeden/Desktop/AppBook/src/pages/edi/EDIPage.tsx | head -20
```

- [ ] **Step 2 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 3 : Vérifier que la zone d'upload est full-width sur mobile**

La zone drag & drop doit avoir `width: 100%` et ne pas avoir de `min-width` figé.

- [ ] **Step 4 : Ajouter overflow-x: auto sur tout tableau de résultats**

```typescript
const ResultsWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`
```

- [ ] **Step 5 : Aligner les breakpoints existants sur `mq.*`**

Remplacer toutes les occurrences de `@media (max-width: ${({ theme }) => theme.breakpoints.mobile})` par `${mq.belowMd}`.

- [ ] **Step 6 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
git add src/pages/edi/EDIPage.tsx
git commit -m "fix(responsive): EDIPage — upload zone + tableau scrollable"
```

---

### Task 13 : HomePage (Dashboard) — unifier les breakpoints

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

Problème : breakpoints hardcodés `700px` et `900px` incohérents.

- [ ] **Step 1 : Lire toutes les valeurs hardcodées**

```bash
grep -n "700px\|900px\|@media" /Users/macbookeden/Desktop/AppBook/src/pages/home/HomePage.tsx
```

- [ ] **Step 2 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 3 : Remplacer chaque occurrence**

| Valeur hardcodée | Remplacer par |
|-----------------|---------------|
| `@media (max-width: 700px)` | `${mq.belowSm}` |
| `@media (max-width: 900px)` | `${mq.belowMd}` |
| `@media (min-width: 768px)` ou `theme.breakpoints.mobile` | `${mq.md}` |
| `@media (max-width: 768px)` | `${mq.belowMd}` |

- [ ] **Step 4 : Vérifier que la grille KPI (5 colonnes) est responsive**

```typescript
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${mq.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${mq.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${mq.lg} {
    grid-template-columns: repeat(5, 1fr);
  }
`
```

- [ ] **Step 5 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "fix(responsive): HomePage — unifier breakpoints 700px/900px sur mq.*"
```

---

## Vague 3 — Polish + Vérification

### Task 14 : FlashInfosPage — finaliser les issues restantes

**Files:**
- Modify: `src/pages/flash-infos/FlashInfosPage.tsx`

- [ ] **Step 1 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 2 : Remplacer les `@media (min-width: ${theme.breakpoints.mobile})` par `${mq.md}`**

```bash
grep -n "@media" /Users/macbookeden/Desktop/AppBook/src/pages/flash-infos/FlashInfosPage.tsx
```

Remplacer chaque occurrence hardcodée par l'équivalent `mq.*`.

- [ ] **Step 3 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add src/pages/flash-infos/FlashInfosPage.tsx
git commit -m "fix(responsive): FlashInfosPage — aligner media queries sur mq.*"
```

---

### Task 15 : Auth pages — vérifier les formulaires

**Files:**
- Modify: `src/pages/auth/LoginPage.tsx`
- Modify: `src/pages/auth/RegisterPage.tsx`
- Modify: `src/pages/auth/ForgotPasswordPage.tsx`

- [ ] **Step 1 : Lire les 3 pages**

```bash
grep -n "max-width\|padding\|@media\|display: flex" /Users/macbookeden/Desktop/AppBook/src/pages/auth/LoginPage.tsx | head -15
grep -n "max-width\|padding\|@media\|display: flex" /Users/macbookeden/Desktop/AppBook/src/pages/auth/RegisterPage.tsx | head -15
grep -n "max-width\|padding\|@media\|display: flex" /Users/macbookeden/Desktop/AppBook/src/pages/auth/ForgotPasswordPage.tsx | head -15
```

- [ ] **Step 2 : Pour chaque page — ajouter l'import et adapter le padding**

```typescript
import { mq } from '@/lib/responsive'

// Dans le composant Page :
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 420px;
  margin: 0 auto;

  ${mq.md} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`
```

- [ ] **Step 3 : S'assurer que les inputs ont width: 100%**

Chaque input de formulaire doit avoir `width: 100%` pour ne pas déborder.

- [ ] **Step 4 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add src/pages/auth/LoginPage.tsx src/pages/auth/RegisterPage.tsx src/pages/auth/ForgotPasswordPage.tsx
git commit -m "fix(responsive): Auth pages — padding adaptatif et inputs full-width"
```

---

### Task 16 : OfficesPage — aligner la nomenclature

**Files:**
- Modify: `src/pages/offices/OfficesPage.tsx`

- [ ] **Step 1 : Identifier les valeurs non alignées**

```bash
grep -n "@media\|min-width\|max-width" /Users/macbookeden/Desktop/AppBook/src/pages/offices/OfficesPage.tsx | head -20
```

- [ ] **Step 2 : Ajouter l'import**

```typescript
import { mq } from '@/lib/responsive'
```

- [ ] **Step 3 : Remplacer les valeurs hardcodées par `mq.*`**

Mapper chaque `@media (min-width: Xpx)` sur le breakpoint le plus proche :
- `480px` → `mq.sm`
- `768px` → `mq.md`
- `1024px` → `mq.lg`

- [ ] **Step 4 : Vérifier TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add src/pages/offices/OfficesPage.tsx
git commit -m "fix(responsive): OfficesPage — aligner media queries sur mq.*"
```

---

### Task 17 : Vérification globale

**Files:** Aucun fichier modifié — audit de validation

- [ ] **Step 1 : Run les tests Vitest**

```bash
cd /Users/macbookeden/Desktop/AppBook && npm run test -- --run
```

Expected : 162 tests passants.

- [ ] **Step 2 : Build TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook && npx tsc --noEmit
```

Expected : 0 erreurs.

- [ ] **Step 3 : Vérifier la checklist globale**

Pour chaque page listée dans ce plan, vérifier mentalement :
- [ ] `Page` container a `padding: md` mobile, `padding: lg` desktop
- [ ] Aucun `grid-template-columns` fixe sans media query adaptative
- [ ] Tous les `styled.button` ont `min-height: 36px` au minimum
- [ ] Toute grille de books démarre à `1fr` (ou `repeat(2, 1fr)` pour les petits éléments)
- [ ] `flex-wrap: wrap` sur tous les composants `display: flex` horizontaux
- [ ] Aucune valeur hardcodée `480px`, `700px`, `900px`, `1024px` — tout passe par `mq.*`

- [ ] **Step 4 : Vérifier le scroll horizontal**

```bash
grep -rn "overflow-x" /Users/macbookeden/Desktop/AppBook/src/pages --include="*.tsx"
```

S'assurer qu'il n'y a pas de containers qui peuvent déborder horizontalement sans `overflow-x: hidden` ou `overflow-x: auto`.

- [ ] **Step 5 : Commit final**

```bash
git add -A
git commit -m "fix(responsive): vérification globale — toutes les pages 360px→1400px"
```

---

## Résumé des commits attendus

1. `feat(responsive): système de breakpoints unifié xs/sm/md/lg/xl`
2. `feat(theme): ajouter les breakpoints nommés xs/sm/md/lg/xl`
3. `fix(responsive): FondsPage — aligner breakpoints sur mq.*`
4. `fix(responsive): NouveautesPage — grille démarre à 1 col (360px)`
5. `fix(responsive): CartPage — OPRow grid et layout sidebar adaptatifs`
6. `fix(responsive): HistoriquePage — StatsGrid 1/2/3 col selon écran`
7. `fix(responsive): RecherchePage — responsive complet 360px→desktop`
8. `fix(responsive): MonComptePage — padding adaptatif et touch targets`
9. `fix(responsive): FacturationPage — tableau scrollable et padding adaptatif`
10. `fix(responsive): ParametresPage — toggles touch-friendly et padding adaptatif`
11. `fix(responsive): SelectionsPage — grille couvertures 2→3→4→5 col`
12. `fix(responsive): EDIPage — upload zone + tableau scrollable`
13. `fix(responsive): HomePage — unifier breakpoints 700px/900px sur mq.*`
14. `fix(responsive): FlashInfosPage — aligner media queries sur mq.*`
15. `fix(responsive): Auth pages — padding adaptatif et inputs full-width`
16. `fix(responsive): OfficesPage — aligner media queries sur mq.*`
17. `fix(responsive): vérification globale — toutes les pages 360px→1400px`
