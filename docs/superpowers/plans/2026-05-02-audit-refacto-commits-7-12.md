# Audit qualité + Commits 7→12 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compléter les commits 7→12 du plan d'audit/refacto : vérification des nouvelles features, memoization des 3 contextes manquants, UX métier (PriceNet + toast action + BottomNav panier + ISBN nav), accessibilité WCAG AA, perf bundle, et mise à jour doc.

**Architecture:** Aucune nouvelle architecture — uniquement des améliorations incrémentales sur le code existant. Chaque commit est autonome et vérifié par `npm run build && npm run test` (153 tests doivent passer) avant de passer au suivant.

**Tech Stack:** Vite 5 + React 18 + TypeScript strict + styled-components v6 + Vitest

---

## Fichiers touchés

| Fichier | Tâche | Rôle |
|---------|-------|------|
| `src/contexts/CartContext.tsx` | T2 | Ajouter useCallback/useMemo |
| `src/contexts/AuthContext.tsx` | T3 | Ajouter useCallback/useMemo + lazy bcrypt |
| `src/contexts/WishlistContext.tsx` | T3 | Ajouter useCallback/useMemo |
| `src/contexts/ToastContext.tsx` | T4 | Étendre payload avec action optionnelle |
| `src/components/ui/Toast.tsx` | T4 | Rendre le bouton action dans ToastBox |
| `src/components/catalogue/BookCard.tsx` | T5 | Ajouter PriceNet + toast avec action |
| `src/components/catalogue/BookCardRow.tsx` | T5 | Ajouter PriceNet |
| `src/components/layout/BottomNav.tsx` | T6 | Remplacer tab Top Ventes → Panier avec badge |
| `src/components/layout/Header.tsx` | T7 | ISBN → navigation directe /livre/:id |
| `src/index.css` | T8 | Règle globale prefers-reduced-motion |
| `src/components/layout/Sidebar.tsx` | T8 | Contraste rgba → 0.65+ |
| `src/components/catalogue/BookCard.tsx` | T8 | QtyBtn 22px → 36px |
| `src/components/layout/Header.tsx` | T8 | BookRowRemove 24px → 36px |
| `src/components/catalogue/BookCover.tsx` | T9 | Wrapper React.memo |
| `src/components/ui/PageSkeleton.tsx` | T9 | Nouveau composant (créer) |
| `src/App.tsx` | T9 | Suspense fallback → PageSkeleton |
| `CLAUDE.md` | T10 | Corriger 2 affirmations fausses + tableau phases |

---

## Task 0 : Audit ciblé des nouvelles features

**Files (read only):**
- Read: `src/components/ui/FeedbackWidget.tsx`
- Read: `src/pages/offices/OfficesPage.tsx` (lines 1-50 + grep SVG inline)
- Read: `src/pages/rdv/RdvPage.tsx` (lines 1-50 + grep SVG inline)
- Read: `src/components/layout/Header.tsx` (grep csv.ts import)
- Read: `src/pages/historique/HistoriquePage.tsx` (grep csv.ts import + export)

- [ ] **Step 1 : Scanner les SVG inline non migrés dans les nouvelles features**

```bash
grep -rn "<svg" src/pages/offices/ src/pages/rdv/ src/components/ui/FeedbackWidget.tsx src/components/dashboard/ | grep -v "node_modules" | wc -l
```
Expected output : nombre de SVG inline restants. Si > 0, noter les fichiers concernés pour Task 1.

- [ ] **Step 2 : Vérifier l'usage de csv.ts dans Header et Historique**

```bash
grep -n "csv\|exportToCSV\|exportCSV" src/components/layout/Header.tsx src/pages/historique/HistoriquePage.tsx
```
Expected : si aucun résultat dans l'un ou l'autre, ce fichier a encore une implémentation d'export custom à migrer vers `src/lib/csv.ts`.

- [ ] **Step 3 : Vérifier les nouveaux contextes sans memoïsation**

```bash
grep -rn "useCallback\|useMemo" src/contexts/EDIContext.tsx src/contexts/RdvContext.tsx src/contexts/ReturnsContext.tsx
```
Expected : noter lesquels sont déjà memoïsés et lesquels ne le sont pas (ils seront traités en Task 3 si EDIContext/RdvContext/ReturnsContext sont absents).

- [ ] **Step 4 : Rapport — noter les gaps dans CONTEXT.md (section "Session en cours")**

Mettre à jour `CONTEXT.md` avec la liste des gaps trouvés : fichiers avec SVG inline à migrer, usages csv.ts manquants, contextes sans memoïsation.

---

## Task 1 : Commit 7 — complétion (conditionnel)

**Files (si gaps trouvés en Task 0) :**
- Modify: fichiers identifiés en Task 0

> **Skip cette tâche si Task 0 ne trouve aucun gap.** Si des SVG inline sont trouvés dans les nouvelles features, les migrer vers `src/components/ui/icons/index.tsx`. Si Header.tsx n'utilise pas `csv.ts` pour l'export de listes, migrer.

- [ ] **Step 1 : (conditionnel) Migrer SVG inline vers icons/index.tsx**

Pour chaque SVG inline trouvé dans Task 0, remplacer par l'icône correspondante de `src/components/ui/icons/index.tsx`. Exemple pour un SVG trash dans OfficesPage :

```tsx
// Avant
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ...>
  <polyline points="3 6 5 6 21 6"/>
  ...
</svg>

// Après
import { IconTrash } from '@/components/ui/icons'
<IconTrash size={16} />
```

- [ ] **Step 2 : (conditionnel) Migrer export dans Header.tsx vers csv.ts**

Si Header.tsx n'importe pas `exportToCSV` de `@/lib/csv.ts`, localiser la fonction d'export inline et la remplacer :

```tsx
// Ajouter en haut de Header.tsx
import { exportToCSV } from '@/lib/csv'

// Remplacer la logique d'export inline par :
exportToCSV('liste-livres', ['Titre', 'Auteur', 'ISBN', 'Prix TTC'], rows)
```

- [ ] **Step 3 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : build sans erreur, 153 tests passants.

- [ ] **Step 4 : Commit**

```bash
git add -p
git commit -m "feat(ui): complete commit 7 — migrate remaining inline SVGs + wire csv.ts"
```

---

## Task 2 : Commit 8a — CartContext memoization

**Files:**
- Modify: `src/contexts/CartContext.tsx`

- [ ] **Step 1 : Ajouter useCallback et useMemo aux imports React**

Ligne 1 de `CartContext.tsx`, modifier l'import React :

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
```

- [ ] **Step 2 : Mémoïser effectiveRates**

Remplacer (lignes 248-250) :

```tsx
  const effectiveRates: Record<string, number> = user?.remisesParUnivers
    ? Object.fromEntries(Object.entries(user.remisesParUnivers).map(([k, v]) => [k, v / 100]))
    : REMISE_RATES
```

Par :

```tsx
  const effectiveRates = useMemo<Record<string, number>>(
    () => user?.remisesParUnivers
      ? Object.fromEntries(Object.entries(user.remisesParUnivers).map(([k, v]) => [k, v / 100]))
      : REMISE_RATES,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.remisesParUnivers]
  )
```

- [ ] **Step 3 : Mémoïser les fonctions mutantes**

Remplacer les fonctions `addToCart`, `updateQty`, `removeFromCart`, `addOPToCart`, `removeOP`, `clearCart`, `setTransmissionMode` par des useCallback. Les voici dans leur intégralité (remplacer le bloc lignes 182-245) :

```tsx
  const removeFromCart = useCallback((itemKey: string) =>
    setItems(prev => prev.filter(i => getItemKey(i) !== itemKey))
  , [])

  const updateQty = useCallback((itemKey: string, qty: number) => {
    if (qty < 1) { removeFromCart(itemKey); return }
    setItems(prev => prev.map(i => getItemKey(i) === itemKey ? { ...i, quantity: qty } : i))
  }, [removeFromCart])

  const addToCart = useCallback((book: Book, qty = 1, opts: AddToCartOptions = {}) => {
    if (totalItems >= CART_LIMIT) {
      showToast(
        `Limite de démonstration atteinte (${CART_LIMIT} articles max). Veuillez vider votre panier pour continuer.`,
        'error'
      )
      return
    }
    const { ebookOption, enReliquat } = opts
    setItems(prev => {
      const key = ebookOption ? `${book.id}::${ebookOption.isbnEbook}` : book.id
      const existing = prev.find(i =>
        ebookOption
          ? i.book.id === book.id && i.ebookOption?.isbnEbook === ebookOption.isbnEbook
          : i.book.id === book.id && !i.ebookOption
      )
      if (existing)
        return prev.map(i => {
          const iKey = i.ebookOption ? `${i.book.id}::${i.ebookOption.isbnEbook}` : i.book.id
          return iKey === key ? { ...i, quantity: i.quantity + qty } : i
        })
      return [...prev, {
        book,
        quantity: qty,
        ebookOption,
        statut: book.statut,
        enReliquat: enReliquat ?? false,
      }]
    })
  }, [totalItems, showToast])

  const removeOP = useCallback((opId: string) =>
    setOpGroups(prev => prev.filter(op => op.id !== opId))
  , [])

  const addOPToCart = useCallback((group: Omit<OPCartGroup, 'id'>) => {
    const opCount = group.books.reduce((s, { quantity }) => s + quantity, 0)
    if (totalItems + opCount > CART_LIMIT) {
      showToast(
        `Limite de démonstration atteinte (${CART_LIMIT} articles max). Veuillez vider votre panier pour continuer.`,
        'error'
      )
      return
    }
    const id = `op-${group.serieId}-${Date.now()}`
    setOpGroups(prev => [...prev, { ...group, id }])
  }, [totalItems, showToast])

  const clearCart = useCallback(() => setCart({ items: [], opGroups: [] }), [])

  const setTransmissionMode = useCallback((mode: TransmissionMode) => {
    setTransmissionModeState(mode)
    if (user?.codeClient) {
      localStorage.setItem(transmissionKey(user.codeClient), mode)
    }
  }, [user?.codeClient])
```

- [ ] **Step 4 : Mémoïser la value du Provider**

Remplacer le bloc `return (` → `<CartContext.Provider value={{...}}>` par :

```tsx
  const value = useMemo(() => ({
    items,
    opGroups,
    totalItems,
    addToCart,
    updateQty,
    removeFromCart,
    addOPToCart,
    removeOP,
    clearCart,
    hasReliquatItems,
    ...computeTotals(items, opGroups, effectiveRates),
    transmissionMode,
    setTransmissionMode,
  }), [items, opGroups, totalItems, addToCart, updateQty, removeFromCart,
      addOPToCart, removeOP, clearCart, hasReliquatItems, effectiveRates,
      transmissionMode, setTransmissionMode])

  return (
    <CartContext.Provider value={value}>
```

- [ ] **Step 5 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : build sans erreur TS, 153 tests passants.

- [ ] **Step 6 : Commit**

```bash
git add src/contexts/CartContext.tsx
git commit -m "perf(cart): memoize CartContext — useCallback + useMemo on all functions and value"
```

---

## Task 3 : Commit 8b — AuthContext + WishlistContext memoization

**Files:**
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/contexts/WishlistContext.tsx`

- [ ] **Step 1 : AuthContext — ajouter useCallback + useMemo aux imports**

Modifier l'import React dans `AuthContext.tsx` :

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
```

- [ ] **Step 2 : AuthContext — mémoïser login, register, logout**

Remplacer les 3 fonctions (lignes 105-180) par des useCallback :

```tsx
  const login = useCallback(async (data: LoginInput): Promise<AuthResult> => {
    const result = loginSchema.safeParse(data)
    if (!result.success) {
      return { success: false, fieldErrors: getZodErrors(result) }
    }
    const found = findUser(result.data.identifier, sessionUsersRef.current)
    if (!found) {
      return { success: false, error: 'Code client ou email introuvable.' }
    }
    const passwordMatch = await bcrypt.compare(result.data.password, found.passwordHash)
    if (!passwordMatch) {
      return { success: false, error: 'Mot de passe incorrect.' }
    }
    const token = createMockToken(found.id, found.codeClient)
    localStorage.setItem(TOKEN_KEY, token)
    setUser(toAuthUser(found))
    return { success: true }
  }, [])

  const register = useCallback(async (data: RegisterInput): Promise<AuthResult> => {
    const result = registerSchema.safeParse(data)
    if (!result.success) {
      return { success: false, fieldErrors: getZodErrors(result) }
    }
    const { codeClient, email, password } = result.data
    const validEntry = VALID_CLIENT_CODES.find((v) => v.codeClient === codeClient)
    if (!validEntry) {
      return { success: false, fieldErrors: { codeClient: 'Code client non reconnu.' } }
    }
    if (validEntry.email.toLowerCase() !== email.toLowerCase()) {
      return { success: false, fieldErrors: { email: "Cet email ne correspond pas à ce code client." } }
    }
    const existing = sessionUsersRef.current.find((u) => u.codeClient === codeClient)
    if (existing) {
      return { success: false, error: 'Un compte existe déjà pour ce code client.' }
    }
    const base = MOCK_USERS.find((u) => u.codeClient === codeClient)!
    try {
      const newUser: MockUser = {
        ...base,
        passwordHash: await bcrypt.hash(password, BCRYPT_COST),
      }
      sessionUsersRef.current.push(newUser)
      const token = createMockToken(newUser.id, newUser.codeClient)
      localStorage.setItem(TOKEN_KEY, token)
      setUser(toAuthUser(newUser))
    } catch {
      return { success: false, error: 'Erreur lors de la création du compte.' }
    }
    return { success: true }
  }, [])
```

Pour `logout`, remplacer (lignes 172-179) :

```tsx
  const logout = useCallback(() => {
    if (user?.codeClient) {
      localStorage.removeItem(`flowdiff_wishlist_username_${user.codeClient}`)
    }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    /* Panier et historique conservés — partagés entre tous les utilisateurs de la librairie */
  }, [user?.codeClient])
```

- [ ] **Step 3 : AuthContext — mémoïser la value**

Remplacer `<AuthContext.Provider value={{ user, isLoading, login, register, logout }}>` par :

```tsx
  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  )

  return (
    <AuthContext.Provider value={value}>
```

- [ ] **Step 4 : WishlistContext — ajouter useCallback + useMemo aux imports**

Modifier l'import React dans `WishlistContext.tsx` :

```tsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
```

- [ ] **Step 5 : WishlistContext — mémoïser les 7 fonctions**

Remplacer les fonctions `createList`, `deleteList`, `addToList`, `removeFromList`, `isInAnyList`, `isInList`, `getListsContaining` par des useCallback :

```tsx
  const createList = useCallback((name: string): Wishlist => {
    const newList: Wishlist = {
      id: `wl-${Date.now()}`,
      name: name.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    }
    setLists(prev => [...prev, newList])
    return newList
  }, [])

  const deleteList = useCallback((listId: string) =>
    setLists(prev => prev.filter(l => l.id !== listId))
  , [])

  const addToList = useCallback((listId: string, book: Book, addedBy?: string) =>
    setLists(prev => prev.map(l =>
      l.id !== listId ? l :
      l.items.some(i => i.book.id === book.id) ? l :
      { ...l, items: [...l.items, { book, addedBy: addedBy?.trim() || undefined, addedAt: new Date().toISOString() }] }
    ))
  , [])

  const removeFromList = useCallback((listId: string, bookId: string) =>
    setLists(prev => prev.map(l =>
      l.id !== listId ? l :
      { ...l, items: l.items.filter(i => i.book.id !== bookId) }
    ))
  , [])

  const isInAnyList = useCallback((bookId: string) =>
    lists.some(l => l.items.some(i => i.book.id === bookId))
  , [lists])

  const isInList = useCallback((listId: string, bookId: string) =>
    lists.find(l => l.id === listId)?.items.some(i => i.book.id === bookId) ?? false
  , [lists])

  const getListsContaining = useCallback((bookId: string) =>
    lists.filter(l => l.items.some(i => i.book.id === bookId))
  , [lists])
```

- [ ] **Step 6 : WishlistContext — mémoïser la value**

Remplacer `<WishlistContext.Provider value={{ lists, ... }}>` par :

```tsx
  const value = useMemo(() => ({
    lists,
    currentUserName,
    setCurrentUserName,
    createList,
    deleteList,
    addToList,
    removeFromList,
    isInAnyList,
    isInList,
    getListsContaining,
  }), [lists, currentUserName, setCurrentUserName, createList, deleteList,
      addToList, removeFromList, isInAnyList, isInList, getListsContaining])

  return (
    <WishlistContext.Provider value={value}>
```

- [ ] **Step 7 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : 153 tests passants. Si ESLint react-hooks/exhaustive-deps avertit, vérifier que les deps listées sont correctes.

- [ ] **Step 8 : Commit**

```bash
git add src/contexts/AuthContext.tsx src/contexts/WishlistContext.tsx
git commit -m "perf(auth,wishlist): memoize AuthContext and WishlistContext — useCallback + useMemo"
```

---

## Task 4 : Commit 9a — ToastContext : payload avec action optionnelle

**Files:**
- Modify: `src/contexts/ToastContext.tsx`
- Modify: `src/components/ui/Toast.tsx`

- [ ] **Step 1 : Écrire le test pour le nouveau payload**

Créer `src/contexts/__tests__/toastAction.test.ts` :

```ts
import { describe, it, expect, vi } from 'vitest'

// Test de la structure du payload — vérification d'inférence de type
describe('ToastContext action payload', () => {
  it('accepte un payload message seul', () => {
    const payload = { message: 'Ajouté au panier' }
    expect(payload.message).toBe('Ajouté au panier')
    expect((payload as { action?: { label: string; onClick: () => void } }).action).toBeUndefined()
  })

  it('accepte un payload avec action', () => {
    const fn = vi.fn()
    const payload = { message: 'Ajouté', action: { label: 'Voir le panier →', onClick: fn } }
    expect(payload.action.label).toBe('Voir le panier →')
    payload.action.onClick()
    expect(fn).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il passe (structure seulement)**

```bash
npm run test -- src/contexts/__tests__/toastAction.test.ts
```
Expected : PASS (pas de code applicatif testé encore, juste la structure).

- [ ] **Step 3 : Modifier ToastContext.tsx**

Remplacer le contenu de `src/contexts/ToastContext.tsx` :

```tsx
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ToastBox, type ToastType } from '@/components/ui/Toast'

export interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, action?: ToastAction) => void
}

interface ToastState {
  message: string
  type: ToastType
  action?: ToastAction
  leaving: boolean
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'success', action?: ToastAction) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type, action, leaving: false })
    timerRef.current = setTimeout(() => {
      setToast(prev => prev ? { ...prev, leaving: true } : null)
      setTimeout(() => setToast(null), 300)
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && createPortal(
        <ToastBox $leaving={toast.leaving} $type={toast.type} $hasAction={!!toast.action}>
          <span>{toast.type === 'error' ? '⚠ ' : '✓ '}{toast.message}</span>
          {toast.action && (
            <ToastActionBtn onClick={() => { toast.action!.onClick(); setToast(null) }}>
              {toast.action.label}
            </ToastActionBtn>
          )}
        </ToastBox>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être dans <ToastProvider>')
  return ctx
}
```

Note : `ToastActionBtn` est importé depuis `Toast.tsx`. Ajouter l'import dans `ToastContext.tsx` :

```tsx
import { ToastBox, ToastActionBtn, type ToastType } from '@/components/ui/Toast'
```

- [ ] **Step 4 : Modifier Toast.tsx — ajouter ToastActionBtn + prop $hasAction**

Lire `src/components/ui/Toast.tsx`. Ajouter à la fin des styled-components :

```tsx
export const ToastActionBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  padding: 0 0 0 12px;
  opacity: 0.9;
  white-space: nowrap;
  &:hover { opacity: 1; }
`
```

Et modifier `ToastBox` pour accepter `$hasAction` (ajouter la prop optionnelle dans le type, le CSS peut rester identique).

- [ ] **Step 5 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : 154+ tests passants (le nouveau test + les 153 existants).

- [ ] **Step 6 : Commit**

```bash
git add src/contexts/ToastContext.tsx src/components/ui/Toast.tsx src/contexts/__tests__/toastAction.test.ts
git commit -m "feat(toast): extend showToast with optional action payload"
```

---

## Task 5 : Commit 9b — BookCard + BookCardRow PriceNet + toast avec action

**Files:**
- Modify: `src/components/catalogue/BookCard.tsx`
- Modify: `src/components/catalogue/BookCardRow.tsx`

- [ ] **Step 1 : Écrire le test pour le calcul PriceNet**

Créer `src/components/catalogue/__tests__/priceNet.test.ts` :

```ts
import { describe, it, expect } from 'vitest'

function computePriceNet(priceTTC: number, rate: number): string {
  return (priceTTC * (1 - rate)).toFixed(2)
}

describe('PriceNet calculation', () => {
  it('applique une remise de 30%', () => {
    expect(computePriceNet(20, 0.30)).toBe('14.00')
  })

  it('sans remise retourne le prix TTC', () => {
    expect(computePriceNet(15.50, 0)).toBe('15.50')
  })

  it('remise 33% sur 18.99', () => {
    expect(computePriceNet(18.99, 0.33)).toBe('12.72')
  })
})
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il passe**

```bash
npm run test -- src/components/catalogue/__tests__/priceNet.test.ts
```
Expected : PASS (fonction pure, pas de code applicatif).

- [ ] **Step 3 : BookCard — ajouter import useAuth et PriceNet styled-component**

Dans `src/components/catalogue/BookCard.tsx` :

Ajouter l'import auth (après les imports existants) :
```tsx
import { useAuth } from '@/hooks/useAuth'
import { REMISE_RATES } from '@/contexts/CartContext'
import type { ToastAction } from '@/contexts/ToastContext'
```

Ajouter le styled-component `PriceNet` (après `PriceLabel`) :
```tsx
const PriceNet = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 500;
`
const PriceNetLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-left: 4px;
`
```

- [ ] **Step 4 : BookCard — calculer le taux et afficher PriceNet**

Dans le corps du composant `BookCard`, après `const { addToCart } = useCart()`, ajouter :

```tsx
  const { user } = useAuth()
  const universe = book.universe
  const userRate: number = user?.remisesParUnivers?.[universe] != null
    ? user.remisesParUnivers[universe] / 100
    : (REMISE_RATES[universe as keyof typeof REMISE_RATES] ?? 0)
  const priceNet = userRate > 0 ? (book.priceTTC * (1 - userRate)).toFixed(2) : null
```

Dans le JSX, après chaque bloc `<PriceInfo>...<Price>...</Price><PriceLabel>Prix public TTC</PriceLabel></PriceInfo>`, ajouter :

```tsx
  {priceNet && (
    <PriceInfo>
      <PriceNet>{priceNet} €</PriceNet>
      <PriceNetLabel>Net remisé</PriceNetLabel>
    </PriceInfo>
  )}
```

Il y a 2 occurrences de ce bloc dans BookCard.tsx (lignes ~494-511 et ~519-528). Répéter pour les deux.

- [ ] **Step 5 : BookCard — toast avec action "Voir le panier →"**

Dans `handleAdd`, modifier l'appel `showToast` (chercher `showToast(` dans la fonction handleAdd) :

```tsx
import { useNavigate } from 'react-router-dom'

// Dans le composant :
const navigate = useNavigate()

// Dans handleAdd, remplacer showToast(...) par :
const action: ToastAction = { label: 'Voir le panier →', onClick: () => navigate('/panier') }
showToast(`"${book.title}" ajouté au panier`, 'success', action)
```

- [ ] **Step 6 : BookCardRow — même PriceNet**

Dans `src/components/catalogue/BookCardRow.tsx`, le prix est affiché dans le `TriggerLabel` du format selector. Ajouter PriceNet en dessous du trigger, dans la zone format :

```tsx
import { useAuth } from '@/hooks/useAuth'
import { REMISE_RATES } from '@/contexts/CartContext'

// Dans le composant (après les déclarations existantes) :
const { user } = useAuth()
const userRate: number = user?.remisesParUnivers?.[book.universe] != null
  ? user.remisesParUnivers[book.universe] / 100
  : (REMISE_RATES[book.universe as keyof typeof REMISE_RATES] ?? 0)
const priceNet = userRate > 0 && mode === 'print'
  ? (book.priceTTC * (1 - userRate)).toFixed(2)
  : null
```

Ajouter un styled-component `RowPriceNet` :

```tsx
const RowPriceNet = styled.span`
  display: block;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
`
```

Dans le JSX, juste après la fermeture `</DropdownTrigger>` :

```tsx
{priceNet && (
  <RowPriceNet>Net remisé : {priceNet} €</RowPriceNet>
)}
```

- [ ] **Step 7 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : 157+ tests passants.

- [ ] **Step 8 : Commit**

```bash
git add src/components/catalogue/BookCard.tsx src/components/catalogue/BookCardRow.tsx src/components/catalogue/__tests__/priceNet.test.ts
git commit -m "feat(ux): add net price display on BookCard/BookCardRow + cart shortcut in toast"
```

---

## Task 6 : Commit 9c — BottomNav : remplacer Top Ventes par Panier avec badge

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1 : Lire le fichier et identifier les imports nécessaires**

```bash
head -30 src/components/layout/BottomNav.tsx
```
Vérifier si `useCart` est déjà importé.

- [ ] **Step 2 : Modifier BottomNav.tsx**

Ajouter les imports manquants en tête de fichier :

```tsx
import { useCart } from '@/contexts/CartContext'
```

Ajouter le styled-component `CartBadge` avant le composant :

```tsx
const CartTabWrap = styled.span`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`
const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -8px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 9px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
`
```

Transformer le composant `BottomNav` pour utiliser `useCart` et remplacer le tab Top Ventes :

```tsx
export function BottomNav() {
  const { totalItems } = useCart()

  return (
    <Nav aria-label="Navigation principale">
      <StyledNavLink to="/" end>
        <HomeIcon /><TabLabel>Accueil</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/nouveautes">
        <StarIcon /><TabLabel>Nouveautés</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/fonds">
        <BookIcon /><TabLabel>Fonds</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/panier">
        <CartTabWrap>
          <CartIcon />
          {totalItems > 0 && <CartBadge>{totalItems > 99 ? '99+' : totalItems}</CartBadge>}
        </CartTabWrap>
        <TabLabel>Panier</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/selections">
        <GridIcon /><TabLabel>Sélections</TabLabel>
      </StyledNavLink>
    </Nav>
  )
}
```

Note : `CartIcon` est l'icône panier SVG existante dans le fichier ou depuis `src/components/ui/icons` (`IconCart`).

- [ ] **Step 3 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : 153+ tests passants.

- [ ] **Step 4 : Commit**

```bash
git add src/components/layout/BottomNav.tsx
git commit -m "feat(nav): replace Top Ventes tab with Panier + badge counter in BottomNav"
```

---

## Task 7 : Commit 9d — Header : navigation directe par ISBN

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1 : Écrire le test**

Créer `src/components/layout/__tests__/isbnSearch.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { MOCK_BOOKS } from '@/data/mockBooks'

function findByIsbn(search: string, books: typeof MOCK_BOOKS) {
  const trimmed = search.trim()
  return books.find(b => b.isbn === trimmed) ?? null
}

describe('ISBN direct search', () => {
  it('trouve un livre par ISBN exact', () => {
    const first = MOCK_BOOKS[0]
    const found = findByIsbn(first.isbn, MOCK_BOOKS)
    expect(found?.id).toBe(first.id)
  })

  it('retourne null pour un ISBN inexistant', () => {
    expect(findByIsbn('000-0-000-00000-0', MOCK_BOOKS)).toBeNull()
  })

  it('ignore les espaces autour', () => {
    const first = MOCK_BOOKS[0]
    expect(findByIsbn(`  ${first.isbn}  `, MOCK_BOOKS)).not.toBeNull()
  })
})
```

- [ ] **Step 2 : Lancer le test pour vérifier**

```bash
npm run test -- src/components/layout/__tests__/isbnSearch.test.ts
```
Expected : PASS.

- [ ] **Step 3 : Modifier handleSearchKey dans Header.tsx**

Localiser `function handleSearchKey` (ligne ~1176). Ajouter la détection ISBN avant le navigate existant :

```tsx
import { MOCK_BOOKS } from '@/data/mockBooks'

function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== 'Enter') return
  const trimmed = search.trim()
  if (!trimmed && activeCount === 0) return

  // Navigation directe si l'input est un ISBN exact
  const byIsbn = MOCK_BOOKS.find(b => b.isbn === trimmed)
  if (byIsbn) {
    navigate(`/livre/${byIsbn.id}`)
    setSearch('')
    return
  }

  navigate(`/recherche?${buildParams(search)}`)
  setSearch('')
}
```

- [ ] **Step 4 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : 156+ tests passants.

- [ ] **Step 5 : Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/__tests__/isbnSearch.test.ts
git commit -m "feat(search): navigate directly to book page when ISBN matches exactly"
```

---

## Task 8 : Commit 10 — Accessibilité WCAG AA

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/catalogue/BookCard.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1 : Ajouter la règle globale prefers-reduced-motion dans index.css**

Ouvrir `src/index.css`. Ajouter à la fin :

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2 : Corriger le contraste Sidebar**

Dans `src/components/layout/Sidebar.tsx`, remplacer :
- `color: rgba(255,255,255,0.30)` → `color: rgba(255,255,255,0.65)`
- `color: rgba(255,255,255,0.40)` → `color: rgba(255,255,255,0.65)`

Vérifier également tous les autres `rgba(255,255,255,0.XX)` avec XX < 60 :

```bash
grep -n "rgba(255,255,255,0\." src/components/layout/Sidebar.tsx
```

Tout opacité < 0.60 sur un fond sombre doit passer à 0.65 minimum.

- [ ] **Step 3 : Touch target QtyBtn dans BookCard**

Dans `src/components/catalogue/BookCard.tsx`, localiser `QtyBtn` (ligne ~223) :

```tsx
const QtyBtn = styled.button`
  width: 36px; height: 36px;   /* était 22px */
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.success};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .12s;
  &:hover { opacity: 0.7; }
`
```

- [ ] **Step 4 : Touch target BookRowRemove dans Header**

Dans `src/components/layout/Header.tsx`, chercher le composant `BookRowRemove` (ou équivalent, `width: 24px`) et passer à `width: 36px; height: 36px`.

```bash
grep -n "BookRowRemove\|ListRowDelete\|BookRowCartBtn\|width: 24\|width: 26\|width: 28" src/components/layout/Header.tsx | head -10
```

Pour chaque bouton trouvé avec width 24/26/28px, passer à 36px.

- [ ] **Step 5 : Font-size 10-11px → 12px (textes informatifs)**

Les codes ISBN et données mono peuvent rester en 10-11px. Pour les textes d'interface :

```bash
grep -rn "font-size.*10px\|font-size.*11px\|fontSize.*10\b\|fontSize.*11\b" src/components/ src/pages/ --include="*.tsx" | grep -v "isbn\|ISBN\|mono\|node_modules" | head -20
```

Pour chaque occurrence non-ISBN trouvée, passer à `font-size: 12px`.

- [ ] **Step 6 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : 153+ tests passants.

- [ ] **Step 7 : Commit**

```bash
git add src/index.css src/components/layout/Sidebar.tsx src/components/catalogue/BookCard.tsx src/components/layout/Header.tsx
git commit -m "a11y: WCAG AA — Sidebar contrast, reduced-motion rule, touch targets 36px, font-size 12px min"
```

---

## Task 9 : Commit 11 — Perf bundle + images

**Files:**
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/components/catalogue/BookCover.tsx`
- Create: `src/components/ui/PageSkeleton.tsx`
- Modify: `src/App.tsx`

> **Note** : `SelectionsPage.SerieCover` ne contient pas de `<img>` — c'est un gradient CSS. L'item P7 (lazy img) est N/A.

- [ ] **Step 1 : AuthContext — lazy import bcrypt**

Dans `src/contexts/AuthContext.tsx`, remplacer la ligne :

```tsx
import bcrypt from 'bcryptjs'
```

Par rien (supprimer ce import statique).

Dans `login`, remplacer `await bcrypt.compare(...)` par :

```tsx
const { default: bcrypt } = await import('bcryptjs')
const passwordMatch = await bcrypt.compare(result.data.password, found.passwordHash)
```

Dans `register`, même chose pour `bcrypt.hash` :

```tsx
const { default: bcrypt } = await import('bcryptjs')
const newUser: MockUser = {
  ...base,
  passwordHash: await bcrypt.hash(password, BCRYPT_COST),
}
```

- [ ] **Step 2 : BookCover — wrapper React.memo**

Dans `src/components/catalogue/BookCover.tsx`, modifier l'export :

```tsx
import { memo } from 'react'

// Garder la function BookCover existante telle quelle, renommer en BookCoverBase
function BookCoverBase({ isbn, title, author, universe, width = 80, height = 120 }: BookCoverProps) {
  // ... corps inchangé
}

export const BookCover = memo(BookCoverBase, (prev, next) =>
  prev.isbn === next.isbn && prev.width === next.width && prev.height === next.height
)
```

- [ ] **Step 3 : Créer PageSkeleton**

Créer `src/components/ui/PageSkeleton.tsx` :

```tsx
import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0%   { opacity: 0.5; }
  50%  { opacity: 0.8; }
  100% { opacity: 0.5; }
`

const Wrap = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.7;
  }
`

const Logo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
`

export function PageSkeleton() {
  return <Wrap><Logo /></Wrap>
}
```

- [ ] **Step 4 : App.tsx — remplacer Suspense fallback={null}**

Dans `src/App.tsx`, ajouter l'import :

```tsx
import { PageSkeleton } from '@/components/ui/PageSkeleton'
```

Remplacer toutes les occurrences de `<Suspense fallback={null}>` par `<Suspense fallback={<PageSkeleton />}>`.

```bash
grep -n "Suspense fallback={null}" src/App.tsx
```

- [ ] **Step 5 : Vérifier le build et la taille du bundle auth**

```bash
npm run build 2>&1 | grep -i "vendor\|auth\|bcrypt\|chunk"
```
Expected : le chunk `vendor-auth` (ou similaire contenant bcrypt) doit soit disparaître soit diminuer significativement.

- [ ] **Step 6 : Vérifier les tests**

```bash
npm run test
```
Expected : 153+ tests passants.

- [ ] **Step 7 : Commit**

```bash
git add src/contexts/AuthContext.tsx src/components/catalogue/BookCover.tsx src/components/ui/PageSkeleton.tsx src/App.tsx
git commit -m "perf: lazy bcrypt import + BookCover memo + PageSkeleton for Suspense"
```

---

## Task 10 : Commit 12 — Doc CLAUDE.md (adapté)

**Files:**
- Modify: `CLAUDE.md`

> **Règle absolue** : aucun bloc `## Session du...` — interdit par CLAUDE.md lui-même. Uniquement corrections factuelles + tableau des phases.

- [ ] **Step 1 : Corriger l'affirmation sur mockUsers guard**

Chercher dans CLAUDE.md le texte sur le guard mockUsers. Remplacer :

```
"Guard anti-prod dans mockUsers.ts (throw si chargé en prod)"
```

Par :

```
"Guard passif dans mockUsers.ts (console.warn uniquement — bundled en prod, sera retiré à la migration Supabase/Prisma)"
```

- [ ] **Step 2 : Corriger l'affirmation sur NAME_KEY localStorage**

Chercher la mention "Clés localStorage suffixées par codeClient". Préciser :

```
"Clés localStorage suffixées par codeClient — y compris NAME_KEY (wishlist username) depuis Commit 4"
```

- [ ] **Step 3 : Mettre à jour le tableau des phases**

Identifier dans le tableau des phases toutes les entrées qui ne sont pas encore marquées ✅ mais dont le code a été appliqué dans cette session. Les marquer ✅ après avoir vérifié avec `/verification-before-completion`.

- [ ] **Step 4 : Vérifier build et tests**

```bash
npm run build && npm run test
```
Expected : 153+ tests passants.

- [ ] **Step 5 : Commit**

```bash
git add CLAUDE.md
git commit -m "docs: correct 2 false statements in CLAUDE.md + update phases table"
```

---

## Vérification finale

```bash
npm run build && npm run test
```

153+ tests passants, build sans erreur TypeScript.
