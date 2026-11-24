# Commit 7 — Composants UI réutilisables — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Éliminer les duplications UI : modales de confirmation inline, icônes SVG locales, logique CSV copié-collé.

**Architecture:** 3 nouveaux modules partagés (`csv.ts`, `icons/index.tsx`, `ConfirmDialog.tsx`) — chacun extrait d'une implémentation existante puis substitué dans ses consommateurs. Aucune logique métier ne bouge, seule la mécanique UI est centralisée.

**Tech Stack:** React 18, styled-components v6, TypeScript strict, Vitest

---

## Fichiers créés / modifiés

| Statut | Chemin | Rôle |
|--------|--------|------|
| Créer | `src/lib/csv.ts` | Export CSV générique |
| Créer | `src/lib/__tests__/csv.test.ts` | Tests csv.ts |
| Créer | `src/components/ui/icons/index.tsx` | Icônes centralisées |
| Créer | `src/components/ui/ConfirmDialog.tsx` | Modale confirm réutilisable |
| Modifier | `src/components/layout/Sidebar.tsx` | Utiliser ConfirmDialog + IconLogout |
| Modifier | `src/components/layout/BurgerMenu.tsx` | Utiliser ConfirmDialog + IconLogout |
| Modifier | `src/components/layout/Header.tsx` | Utiliser ConfirmDialog + IconTrash + IconCart + exportToCSV |
| Modifier | `src/pages/cart/CartPage.tsx` | Utiliser ConfirmDialog partagé + IconTrash + IconCart + IconChevronLeft |
| Modifier | `src/pages/historique/HistoriquePage.tsx` | Utiliser exportToCSV |

---

## Task 1 : `src/lib/csv.ts` (TDD)

**Files:**
- Create: `src/lib/csv.ts`
- Create: `src/lib/__tests__/csv.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

```typescript
// src/lib/__tests__/csv.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { exportToCSV } from '@/lib/csv'

describe('exportToCSV', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('déclenche le téléchargement avec le bon nom de fichier', () => {
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: clickSpy })
    )
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportToCSV('mon_fichier', ['Col A', 'Col B'], [['val1', 'val2']])

    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('insère le BOM UTF-8 pour Excel', () => {
    let capturedContent = ''
    const OriginalBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation((parts: BlobPart[]) => {
      capturedContent = parts[0] as string
      return new OriginalBlob(parts)
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: vi.fn() })
    )

    exportToCSV('test', ['H'], [['v']])

    expect(capturedContent.startsWith('﻿')).toBe(true)
  })

  it('échappe les guillemets doubles dans les valeurs', () => {
    let capturedContent = ''
    const OriginalBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation((parts: BlobPart[]) => {
      capturedContent = parts[0] as string
      return new OriginalBlob(parts)
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: vi.fn() })
    )

    exportToCSV('test', ['H'], [['"valeur avec guillemets"']])

    expect(capturedContent).toContain('""valeur avec guillemets""')
  })

  it('utilise le point-virgule comme séparateur (convention française)', () => {
    let capturedContent = ''
    const OriginalBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation((parts: BlobPart[]) => {
      capturedContent = parts[0] as string
      return new OriginalBlob(parts)
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: vi.fn() })
    )

    exportToCSV('test', ['A', 'B'], [['x', 'y']])

    expect(capturedContent).toContain('A;B')
    expect(capturedContent).toContain('x;y')
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
npx vitest run src/lib/__tests__/csv.test.ts
```

Attendu : FAIL — `exportToCSV` not found

- [ ] **Step 3 : Implémenter `csv.ts`**

```typescript
// src/lib/csv.ts
const SEP = ';'
const BOM = '﻿'

function escape(v: string | number): string {
  const s = String(v)
  return s.includes(SEP) || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csv = [headers, ...rows].map(r => r.map(escape).join(SEP)).join('\r\n')
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npx vitest run src/lib/__tests__/csv.test.ts
```

Attendu : 4 tests PASS

- [ ] **Step 5 : Commit**

```bash
git add src/lib/csv.ts src/lib/__tests__/csv.test.ts
git commit -m "feat: add exportToCSV utility with UTF-8 BOM and semicolon separator"
```

---

## Task 2 : `src/components/ui/icons/index.tsx`

**Files:**
- Create: `src/components/ui/icons/index.tsx`

Périmètre : `IconTrash`, `IconCart`, `IconSearch`, `IconLogout`, `IconChevronLeft`, `IconStar`. Toutes acceptent `size?: number` (défaut 16). `IconCart` accepte `filled?: boolean`. `IconStar` accepte `filled?: boolean` et `color?: string`.

- [ ] **Step 1 : Créer le fichier**

```tsx
// src/components/ui/icons/index.tsx

interface IconProps { size?: number }

export function IconTrash({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  )
}

export function IconCart({ size = 16, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" fill={filled ? 'currentColor' : 'none'}/>
      <circle cx="20" cy="21" r="1" fill={filled ? 'currentColor' : 'none'}/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

export function IconSearch({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

export function IconLogout({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

export function IconChevronLeft({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
      <path d="m15 18-6-6 6-6"/>
    </svg>
  )
}

export function IconStar({ size = 16, filled = false, color = 'currentColor' }: IconProps & { filled?: boolean; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? color : 'none'} stroke={color}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
```

- [ ] **Step 2 : Vérifier que le build TypeScript passe**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 3 : Commit**

```bash
git add src/components/ui/icons/index.tsx
git commit -m "feat: add centralized icon components (IconTrash, IconCart, IconSearch, IconLogout, IconChevronLeft, IconStar)"
```

---

## Task 3 : `src/components/ui/ConfirmDialog.tsx`

**Files:**
- Create: `src/components/ui/ConfirmDialog.tsx`

Extrait de l'implémentation existante dans `CartPage.tsx` (lignes 16–100), adaptée avec les props documentées dans le design.

- [ ] **Step 1 : Créer le composant**

```tsx
// src/components/ui/ConfirmDialog.tsx
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
  padding: 16px;
`

const Dialog = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 360px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
`

const DialogTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const DialogText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const DialogActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`

const DialogBtn = styled.button<{ $destructive?: boolean }>`
  padding: 0 ${({ theme }) => theme.spacing.lg};
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  border: none;
  transition: background .15s, color .15s;
  background: ${({ $destructive, theme }) => $destructive ? theme.colors.error : theme.colors.gray[100]};
  color: ${({ $destructive }) => $destructive ? '#fff' : '#374151'};
  &:hover { filter: brightness(0.92); }
  &:focus-visible {
    outline: 2px solid ${({ $destructive, theme }) => $destructive ? theme.colors.error : theme.colors.navy};
    outline-offset: 2px;
  }
`

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel  = 'Annuler',
  destructive  = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <Overlay onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <Dialog onClick={e => e.stopPropagation()}>
        <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
        <DialogText>{message}</DialogText>
        <DialogActions>
          <DialogBtn onClick={onCancel}>{cancelLabel}</DialogBtn>
          <DialogBtn $destructive={destructive} ref={confirmRef} onClick={() => { onConfirm(); onCancel() }}>
            {confirmLabel}
          </DialogBtn>
        </DialogActions>
      </Dialog>
    </Overlay>,
    document.body
  )
}
```

- [ ] **Step 2 : Vérifier le build TypeScript**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 3 : Commit**

```bash
git add src/components/ui/ConfirmDialog.tsx
git commit -m "feat: add shared ConfirmDialog component with keyboard support and destructive variant"
```

---

## Task 4 : Migrer `Sidebar.tsx`

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

Supprimer : `ConfirmOverlay`, `ConfirmBox`, `ConfirmIconWrap`, `ConfirmTitle`, `ConfirmBody`, `ConfirmBtns`, `BtnCancel`, `BtnConfirm`, `IconLogout` (tous locaux).
Ajouter : import `ConfirmDialog` + `IconLogout` depuis les modules centralisés.

- [ ] **Step 1 : Modifier les imports**

En tête de `Sidebar.tsx`, remplacer les imports actuels par :

```tsx
// Ajouter ces imports
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconLogout } from '@/components/ui/icons'
```

Supprimer l'import `keyframes` de `styled-components` s'il n'est utilisé que pour `fadeIn` de la modale.

- [ ] **Step 2 : Supprimer les styled components locaux de la modale**

Supprimer dans `Sidebar.tsx` les blocs :
```
const fadeIn = keyframes`...`           ← si uniquement utilisé par la modale
const ConfirmOverlay = styled.div`...`
const ConfirmBox = styled.div`...`
const ConfirmIconWrap = styled.div`...`
const ConfirmTitle = styled.p`...`
const ConfirmBody  = styled.p`...`
const ConfirmBtns  = styled.div`...`
const BtnCancel    = styled.button`...`
const BtnConfirm   = styled.button`...`
```

Supprimer aussi la fonction locale `function IconLogout() { ... }`.

- [ ] **Step 3 : Remplacer l'usage du portal inline**

Localiser le bloc (autour de la ligne 358) :
```tsx
{confirmLogout && createPortal(
  <ConfirmOverlay onClick={() => setConfirmLogout(false)}>
    <ConfirmBox onClick={e => e.stopPropagation()}>
      <ConfirmIconWrap><IconLogout /></ConfirmIconWrap>
      <ConfirmTitle>Se déconnecter ?</ConfirmTitle>
      <ConfirmBody>Vous serez redirigé vers la page de connexion.</ConfirmBody>
      <ConfirmBtns>
        <BtnCancel onClick={() => setConfirmLogout(false)}>Annuler</BtnCancel>
        <BtnConfirm onClick={handleLogout}>Se déconnecter</BtnConfirm>
      </ConfirmBtns>
    </ConfirmBox>
  </ConfirmOverlay>,
  document.body
)}
```

Le remplacer par :
```tsx
<ConfirmDialog
  open={confirmLogout}
  title="Se déconnecter ?"
  message="Vous serez redirigé vers la page de connexion."
  confirmLabel="Se déconnecter"
  destructive
  onConfirm={handleLogout}
  onCancel={() => setConfirmLogout(false)}
/>
```

Supprimer l'import `createPortal` de `react-dom` si plus utilisé ailleurs dans le fichier.

- [ ] **Step 4 : Vérifier le build**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 5 : Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "refactor(sidebar): replace inline confirm modal with shared ConfirmDialog"
```

---

## Task 5 : Migrer `BurgerMenu.tsx`

**Files:**
- Modify: `src/components/layout/BurgerMenu.tsx`

Supprimer : `ConfirmOverlay`, `ConfirmBox`, `ConfirmIcon`, `ConfirmTitle`, `ConfirmBody`, `ConfirmButtons`, `BtnCancel`, `BtnConfirm` locaux, `IconDeconnexion`.
Ajouter : `ConfirmDialog` + `IconLogout`.

- [ ] **Step 1 : Modifier les imports**

```tsx
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconLogout } from '@/components/ui/icons'
```

- [ ] **Step 2 : Supprimer les styled components et icône locaux**

Supprimer dans `BurgerMenu.tsx` :
```
const ConfirmOverlay = styled.div`...`
const ConfirmBox = styled.div`...`
const ConfirmIcon = styled.div`...`
const ConfirmTitle = styled.p`...`
const ConfirmBody = styled.p`...`
const ConfirmButtons = styled.div`...`
const BtnCancel = styled.button`...`
const BtnConfirm = styled.button`...`
function IconDeconnexion() { ... }
```

- [ ] **Step 3 : Remplacer le portal inline (autour de la ligne 411)**

Remplacer :
```tsx
{confirmLogout && createPortal(
  <ConfirmOverlay onClick={() => setConfirmLogout(false)}>
    <ConfirmBox onClick={e => e.stopPropagation()}>
      <ConfirmIcon><IconDeconnexion /></ConfirmIcon>
      <ConfirmTitle>Se déconnecter ?</ConfirmTitle>
      <ConfirmBody>Vous serez redirigé vers la page de connexion.</ConfirmBody>
      <ConfirmButtons>
        <BtnCancel onClick={() => setConfirmLogout(false)}>Annuler</BtnCancel>
        <BtnConfirm onClick={handleLogout}>Se déconnecter</BtnConfirm>
      </ConfirmButtons>
    </ConfirmBox>
  </ConfirmOverlay>,
  document.body
)}
```

Par :
```tsx
<ConfirmDialog
  open={confirmLogout}
  title="Se déconnecter ?"
  message="Vous serez redirigé vers la page de connexion."
  confirmLabel="Se déconnecter"
  destructive
  onConfirm={handleLogout}
  onCancel={() => setConfirmLogout(false)}
/>
```

Supprimer l'import `createPortal` si plus utilisé.

- [ ] **Step 4 : Vérifier le build**

```bash
npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add src/components/layout/BurgerMenu.tsx
git commit -m "refactor(burger-menu): replace inline confirm modal with shared ConfirmDialog"
```

---

## Task 6 : Migrer `Header.tsx`

**Files:**
- Modify: `src/components/layout/Header.tsx`

Remplace : `ConfirmOverlay` + 5 styled components liés + `IconTrash` + `IconCartSvg` + `IconSearch` locaux + `exportListCSV` inline.

- [ ] **Step 1 : Modifier les imports**

```tsx
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconTrash, IconCart, IconSearch } from '@/components/ui/icons'
import { exportToCSV } from '@/lib/csv'
```

- [ ] **Step 2 : Supprimer les styled components de la modale locale**

Supprimer dans `Header.tsx` :
```
const ConfirmOverlay = styled.div`position: absolute; ...`
const ConfirmText = styled.p`...`
const ConfirmSub = styled.p`...`
const ConfirmRow = styled.div`...`
const ConfirmCancel = styled.button`...`
const ConfirmDelete = styled.button`...`
```

- [ ] **Step 3 : Supprimer les icônes locales**

Supprimer :
```
function IconSearch() { ... }
function IconTrash() { ... }
function IconCartSvg({ filled }: { filled: boolean }) { ... }
```

- [ ] **Step 4 : Mettre à jour les usages des icônes**

Remplacer dans le JSX :
- `<IconSearch />` → `<IconSearch size={14} />`
- `<IconTrash />` → `<IconTrash size={12} />`
- `<IconCartSvg filled={cartCount > 0} />` → `<IconCart size={16} filled={cartCount > 0} />`
- `<IconCartSvg filled={false} />` (2 occurrences) → `<IconCart size={16} filled={false} />`

- [ ] **Step 5 : Remplacer `exportListCSV` par `exportToCSV`**

Supprimer la fonction `exportListCSV` (autour de la ligne 1085) :
```tsx
const exportListCSV = (list: { name: string; items: Array<...> }) => {
  const header = [...]
  const rows = list.items.map(...)
  const csv = ...
  const blob = new Blob(...)
  // ...
}
```

La remplacer par un appel direct sur le site d'utilisation (autour de la ligne 1599) :

```tsx
onClick={() => {
  const headers = ['ISBN', 'Titre', 'Auteur', 'Prix TTC', 'Date parution', 'Nom de la liste', 'Ajouté par']
  const rows = list.items.map(({ book, addedBy }) => [
    book.isbn,
    book.title,
    book.authors.join(', '),
    book.priceTTC.toFixed(2).replace('.', ','),
    book.publicationDate,
    list.name,
    addedBy ?? '',
  ])
  exportToCSV(`${list.name.replace(/[^a-z0-9]/gi, '_')}.csv`, headers, rows)
}}
```

- [ ] **Step 6 : Remplacer la modale inline dans le JSX**

Localiser (autour de la ligne 1507) :
```tsx
{confirmDeleteId && (() => {
  const target = lists.find(l => l.id === confirmDeleteId)
  return (
    <ConfirmOverlay>
      <ConfirmText>Supprimer la liste&nbsp;?</ConfirmText>
      <ConfirmSub>« {target?.name} » et ses {target?.items.length ?? 0} titre{...} seront supprimés.</ConfirmSub>
      <ConfirmRow>
        <ConfirmCancel onClick={() => setConfirmDeleteId(null)}>Annuler</ConfirmCancel>
        <ConfirmDelete onClick={() => { deleteList(confirmDeleteId); setConfirmDeleteId(null) }}>Supprimer</ConfirmDelete>
      </ConfirmRow>
    </ConfirmOverlay>
  )
})()}
```

Remplacer par (en dehors du panel, au niveau racine du composant) :
```tsx
{(() => {
  const target = confirmDeleteId ? lists.find(l => l.id === confirmDeleteId) : null
  return (
    <ConfirmDialog
      open={!!confirmDeleteId}
      title="Supprimer la liste ?"
      message={target ? `« ${target.name} » et ses ${target.items.length} titre${target.items.length !== 1 ? 's' : ''} seront supprimés.` : ''}
      confirmLabel="Supprimer"
      destructive
      onConfirm={() => { if (confirmDeleteId) { deleteList(confirmDeleteId); setConfirmDeleteId(null) } }}
      onCancel={() => setConfirmDeleteId(null)}
    />
  )
})()}
```

- [ ] **Step 7 : Vérifier le build**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 8 : Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "refactor(header): use shared ConfirmDialog, centralized icons, and exportToCSV"
```

---

## Task 7 : Migrer `CartPage.tsx`

**Files:**
- Modify: `src/pages/cart/CartPage.tsx`

CartPage a déjà un `ConfirmDialog` local (lignes 16–100). On le remplace par l'import partagé et on met à jour les icônes.

- [ ] **Step 1 : Modifier les imports**

```tsx
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconTrash, IconCart, IconChevronLeft } from '@/components/ui/icons'
```

- [ ] **Step 2 : Supprimer le code local de ConfirmDialog**

Supprimer les blocs suivants dans `CartPage.tsx` (lignes 16–100 environ) :
```
const Overlay = styled.div`position: fixed; inset: 0; ...`
const Dialog = styled.div`...`
const DialogTitle = styled.h3`...`
const DialogText = styled.p`...`
const DialogActions = styled.div`...`
const DialogBtn = styled.button<{ $danger?: boolean }>`...`
type ConfirmState = { open: false } | { open: true; ... }
function ConfirmDialog(...) { ... }
```

- [ ] **Step 3 : Conserver le state existant, adapter uniquement le rendu**

Le state `confirm` et la fonction `askConfirm` (ligne 1015) sont conservés tels quels :
```tsx
// Garder inchangé
const [confirm, setConfirm] = useState<{ open: false } | { open: true; title: string; message: string; onConfirm: () => void }>({ open: false })
const askConfirm = (title: string, message: string, onConfirm: () => void) =>
  setConfirm({ open: true, title, message, onConfirm })
```

Remplacer uniquement le rendu (autour de la ligne 1361) :
```tsx
// Avant
<ConfirmDialog state={confirm} onCancel={() => setConfirm({ open: false })} />
```
Par :
```tsx
<ConfirmDialog
  open={confirm.open}
  title={confirm.open ? confirm.title : ''}
  message={confirm.open ? confirm.message : ''}
  confirmLabel="Supprimer"
  destructive
  onConfirm={confirm.open ? confirm.onConfirm : () => {}}
  onCancel={() => setConfirm({ open: false })}
/>
```

Supprimer également le type local `ConfirmState` (ligne 70) puisqu'il n'est plus référencé.

- [ ] **Step 4 : Supprimer les icônes locales**

Supprimer les fonctions locales :
```
function IconTrash() { ... }
function IconCart() { ... }
function IconChevronLeft() { ... }
```

Les usages dans le JSX restent identiques (les props de taille étant gérées par les defaults).

Ajuster si nécessaire :
- `IconCart` dans CartPage était de taille 48 avec des styles inline → conserver `<IconCart size={48} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />`
- `IconChevronLeft` dans CartPage avait un style inline → déjà inclus dans le composant centralisé

- [ ] **Step 5 : Vérifier le build**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Step 6 : Commit**

```bash
git add src/pages/cart/CartPage.tsx
git commit -m "refactor(cart): use shared ConfirmDialog and centralized icons"
```

---

## Task 8 : Migrer `HistoriquePage.tsx`

**Files:**
- Modify: `src/pages/historique/HistoriquePage.tsx`

- [ ] **Step 1 : Ajouter l'import**

```tsx
import { exportToCSV } from '@/lib/csv'
```

- [ ] **Step 2 : Supprimer `buildCSVRows` et `downloadCSV`**

Supprimer les fonctions (autour des lignes 444–582) :
```
function buildCSVRows(orders: Order[]): string { ... }
function downloadCSV(csv: string, filename: string) { ... }
```

- [ ] **Step 3 : Mettre à jour `handleExportAll` et `handleExportOrder`**

```tsx
function buildRows(orders: Order[]): (string | number)[][] {
  const multiOrder = orders.length > 1
  return orders.flatMap(order =>
    order.items.map(item => {
      const book = MOCK_BOOKS.find(b => b.id === item.bookId)
      const pubDate = book ? book.publicationDate : ''
      const remiseRate = REMISE_RATES[item.universe as keyof typeof REMISE_RATES] ?? 0
      const prixTTC    = (item.unitPriceHT * 1.055).toFixed(2).replace('.', ',')
      const prixRemise = (item.unitPriceHT * (1 - remiseRate) * 1.055).toFixed(2).replace('.', ',')
      return [
        ...(multiOrder ? [order.numero] : []),
        order.date,
        item.isbn,
        item.title,
        item.author,
        pubDate,
        prixTTC,
        prixRemise,
        item.quantity,
      ]
    })
  )
}

function getHeaders(multiOrder: boolean): string[] {
  return [
    ...(multiOrder ? ['Numéro'] : []),
    'Date cmd.', 'ISBN', 'Titre', 'Auteur', 'Date de parution',
    'Prix TTC (€)', 'Prix remisé TTC (€)', 'Quantité',
  ]
}

function handleExportAll() {
  exportToCSV('flowdiff_historique_complet.csv', getHeaders(true), buildRows(filtered))
}

function handleExportOrder(order: Order) {
  exportToCSV(`${order.numero}_commande.csv`, getHeaders(false), buildRows([order]))
}
```

- [ ] **Step 4 : Vérifier le build**

```bash
npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add src/pages/historique/HistoriquePage.tsx
git commit -m "refactor(historique): use shared exportToCSV utility"
```

---

## Task 9 : Vérification finale

- [ ] **Step 1 : Suite complète Vitest**

```bash
npx vitest run
```

Attendu : tous les tests passent (au moins 85 — 81 existants + 4 csv)

- [ ] **Step 2 : Build production**

```bash
npm run build
```

Attendu : build OK, 0 erreur TypeScript

- [ ] **Step 3 : Test visuel — modales**

Démarrer le dev server (`npm run dev`) et vérifier :
1. Sidebar desktop → cliquer "Se déconnecter" → modale `ConfirmDialog` apparaît, Escape la ferme
2. BurgerMenu → cliquer "Se déconnecter" → idem
3. Header → ouvrir les listes → icône corbeille → modale confirme la suppression
4. Panier → "Tout vider" → modale confirme, "Supprimer" sur un item → modale confirme

- [ ] **Step 4 : Test visuel — export CSV**

1. Header → ouvrir une liste → cliquer "↓ Exporter la liste (.csv)" → fichier `.csv` téléchargé, ouvre correctement dans Excel/LibreOffice
2. Historique → "Exporter toutes les commandes" → idem
3. Historique → export d'une seule commande → fichier avec colonnes sans "Numéro"
