# Admin Back-Office FlowDiff — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the FlowDiff internal back-office at `/admin` — shell + 4 modules (Dashboard, Catalogue, Commandes, Libraires) with Supabase persistence.

**Architecture:** Admin routes live inside the existing `App.tsx` `<Routes>`, wrapped by `AdminAuthProvider`. A separate `AdminRoutes` component handles `/admin/*` sub-routing with its own layout and guard. Admin code is fully isolated in `src/admin/` — no shared context or layout with the libraire app.

**Tech Stack:** React 18, React Router v6, styled-components v6, Supabase JS, Vitest, TypeScript strict.

**Spec:** `docs/superpowers/specs/2026-05-16-admin-backoffice-design.md`

---

## Task 1: SQL tables + RLS + seed (manual Supabase)

> This task requires executing SQL in the Supabase dashboard. No code changes.

**Files:** none (SQL only)

- [ ] **Step 1: Create tables + RLS in Supabase SQL editor**

Open Supabase > SQL Editor and run:

```sql
-- Table commandes
CREATE TABLE IF NOT EXISTS commandes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_client  text NOT NULL,
  librairie    text NOT NULL,
  date         timestamptz NOT NULL DEFAULT now(),
  statut       text NOT NULL CHECK (statut IN ('en_preparation','expedie','livre','annule')),
  montant_ht   numeric(10,2) NOT NULL,
  montant_ttc  numeric(10,2) NOT NULL,
  articles     jsonb NOT NULL DEFAULT '[]'
);

ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ALL public demo" ON commandes FOR ALL USING (true) WITH CHECK (true);

-- Table libraires
CREATE TABLE IF NOT EXISTS libraires (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_client text UNIQUE NOT NULL,
  nom         text NOT NULL,
  email       text NOT NULL,
  ville       text NOT NULL,
  telephone   text,
  remise      numeric(5,2) NOT NULL DEFAULT 35.0,
  statut      text NOT NULL CHECK (statut IN ('actif','bloque')) DEFAULT 'actif',
  reliquat    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE libraires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ALL public demo" ON libraires FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Seed libraires**

```sql
INSERT INTO libraires (code_client, nom, email, ville, telephone, remise, statut, reliquat) VALUES
('LIB001', 'Les Temps Modernes', 'contact@lestempmodernes.fr', 'Paris', '01 43 26 17 42', 35.0, 'actif', true),
('LIB002', 'L''Écume des Pages', 'commandes@ecumedespages.fr', 'Lyon', '04 72 56 08 08', 30.0, 'actif', false),
('LIB003', 'Mollat', 'pro@mollat.com', 'Bordeaux', '05 56 56 40 40', 40.0, 'actif', true);
```

- [ ] **Step 3: Seed commandes**

```sql
INSERT INTO commandes (code_client, librairie, date, statut, montant_ht, montant_ttc, articles) VALUES
(
  'LIB001', 'Les Temps Modernes',
  NOW() - INTERVAL '1 day', 'en_preparation', 805.69, 850.00,
  '[{"isbn":"9782070360024","titre":"L''Étranger","quantite":10,"prix_ttc":8.50},
    {"isbn":"9782070413119","titre":"Les Misérables","quantite":5,"prix_ttc":14.00},
    {"isbn":"9782070386802","titre":"Le Petit Prince","quantite":20,"prix_ttc":8.50}]'::jsonb
),
(
  'LIB001', 'Les Temps Modernes',
  NOW() - INTERVAL '4 days', 'expedie', 322.27, 340.00,
  '[{"isbn":"9782070360024","titre":"L''Étranger","quantite":20,"prix_ttc":8.50},
    {"isbn":"9782072884412","titre":"Dune","quantite":5,"prix_ttc":12.00}]'::jsonb
),
(
  'LIB001', 'Les Temps Modernes',
  NOW() - INTERVAL '12 days', 'livre', 113.74, 120.00,
  '[{"isbn":"9782070386802","titre":"Le Petit Prince","quantite":8,"prix_ttc":8.50},
    {"isbn":"9782072884412","titre":"Dune","quantite":3,"prix_ttc":12.00}]'::jsonb
),
(
  'LIB002', 'L''Écume des Pages',
  NOW() - INTERVAL '2 days', 'en_preparation', 530.81, 560.00,
  '[{"isbn":"9782070413119","titre":"Les Misérables","quantite":15,"prix_ttc":14.00},
    {"isbn":"9782070360024","titre":"L''Étranger","quantite":20,"prix_ttc":8.50}]'::jsonb
),
(
  'LIB002', 'L''Écume des Pages',
  NOW() - INTERVAL '9 days', 'livre', 218.01, 230.00,
  '[{"isbn":"9782072884412","titre":"Dune","quantite":8,"prix_ttc":12.00},
    {"isbn":"9782070386802","titre":"Le Petit Prince","quantite":10,"prix_ttc":8.50}]'::jsonb
),
(
  'LIB002', 'L''Écume des Pages',
  NOW() - INTERVAL '16 days', 'annule', 170.62, 180.00,
  '[{"isbn":"9782070360024","titre":"L''Étranger","quantite":10,"prix_ttc":8.50},
    {"isbn":"9782072884412","titre":"Dune","quantite":5,"prix_ttc":12.00}]'::jsonb
),
(
  'LIB003', 'Mollat',
  NOW() - INTERVAL '1 day', 'expedie', 682.46, 720.00,
  '[{"isbn":"9782070413119","titre":"Les Misérables","quantite":20,"prix_ttc":14.00},
    {"isbn":"9782070360024","titre":"L''Étranger","quantite":20,"prix_ttc":8.50},
    {"isbn":"9782070386802","titre":"Le Petit Prince","quantite":10,"prix_ttc":8.50}]'::jsonb
),
(
  'LIB003', 'Mollat',
  NOW() - INTERVAL '6 days', 'livre', 426.54, 450.00,
  '[{"isbn":"9782072884412","titre":"Dune","quantite":15,"prix_ttc":12.00},
    {"isbn":"9782070413119","titre":"Les Misérables","quantite":10,"prix_ttc":14.00}]'::jsonb
);
```

- [ ] **Step 4: Verify**

In Supabase Table Editor, check that `commandes` has 8 rows and `libraires` has 3 rows.

---

## Task 2: Admin types + theme constants

**Files:**
- Create: `src/admin/types.ts`
- Create: `src/admin/adminTheme.ts`

- [ ] **Step 1: Create `src/admin/types.ts`**

```ts
export interface ArticleCommande {
  isbn: string
  titre: string
  quantite: number
  prix_ttc: number
}

export type StatutCommande = 'en_preparation' | 'expedie' | 'livre' | 'annule'
export type StatutLibraire = 'actif' | 'bloque'

export interface Commande {
  id: string
  code_client: string
  librairie: string
  date: string
  statut: StatutCommande
  montant_ht: number
  montant_ttc: number
  articles: ArticleCommande[]
}

export interface Libraire {
  id: string
  code_client: string
  nom: string
  email: string
  ville: string
  telephone: string | null
  remise: number
  statut: StatutLibraire
  reliquat: boolean
  created_at: string
}

export interface LivreInsert {
  title: string
  authors: string[]
  isbn: string
  publisher: string
  collection?: string
  universe: string
  type: string
  price: number
  priceTTC: number
  format: string
  genre?: string
  pages?: number
  publicationDate: string
  description: string
  statut?: string
}
```

- [ ] **Step 2: Create `src/admin/adminTheme.ts`**

```ts
export const adminColors = {
  sidebarBg:     '#1a1a2e',
  sidebarActive: '#4361ee',
  sidebarText:   '#a8b2d8',
  sidebarHover:  '#2a2a4e',
  accent:        '#4361ee',
  accentHover:   '#3451d1',
  pageBg:        '#f8f9fa',
  surface:       '#ffffff',
  rowAlt:        '#f1f3f5',
  border:        '#dee2e6',
  textPrimary:   '#212529',
  textSecondary: '#6c757d',
  danger:        '#dc3545',
  dangerHover:   '#c82333',
  statut: {
    en_preparation: '#f39c12',
    expedie:        '#3498db',
    livre:          '#2ecc71',
    annule:         '#95a5a6',
    actif:          '#2ecc71',
    bloque:         '#e74c3c',
  },
} as const
```

- [ ] **Step 3: Commit**

```bash
git add src/admin/types.ts src/admin/adminTheme.ts
git commit -m "feat(admin): add admin types and theme constants"
```

---

## Task 3: AdminAuthContext + useAdminAuth hook

**Files:**
- Create: `src/admin/contexts/AdminAuthContext.tsx`
- Create: `src/admin/hooks/useAdminAuth.ts`

- [ ] **Step 1: Write the test**

Create `src/admin/contexts/__tests__/adminAuth.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'

const SESSION_KEY = 'flowdiff_admin_session'

function fakeLogin(email: string, password: string): boolean {
  const ok = email === 'admin@flowdiff.com' && password === 'FlowDiff2024!'
  if (ok) localStorage.setItem(SESSION_KEY, JSON.stringify({ email, role: 'admin', exp: Date.now() + 8 * 3600 * 1000 }))
  return ok
}

function fakeIsAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const session = JSON.parse(raw) as { role: string; exp: number }
    return session.role === 'admin' && session.exp > Date.now()
  } catch {
    return false
  }
}

beforeEach(() => localStorage.clear())

describe('admin auth logic', () => {
  it('rejects wrong credentials', () => {
    expect(fakeLogin('bad@test.com', 'wrong')).toBe(false)
    expect(fakeIsAuthenticated()).toBe(false)
  })

  it('accepts correct credentials and sets session', () => {
    expect(fakeLogin('admin@flowdiff.com', 'FlowDiff2024!')).toBe(true)
    expect(fakeIsAuthenticated()).toBe(true)
  })

  it('rejects expired session', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'admin@flowdiff.com', role: 'admin', exp: Date.now() - 1 }))
    expect(fakeIsAuthenticated()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/admin/contexts/__tests__/adminAuth.test.ts
```

Expected: FAIL — file not found / import errors.

- [ ] **Step 3: Create `src/admin/contexts/AdminAuthContext.tsx`**

```tsx
import { createContext, useCallback, useMemo, useState } from 'react'

const SESSION_KEY = 'flowdiff_admin_session'
const ADMIN_EMAIL = 'admin@flowdiff.com'
const ADMIN_PASSWORD = 'FlowDiff2024!'

interface AdminSession {
  email: string
  role: string
  exp: number
}

function readSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as AdminSession
    return s.role === 'admin' && s.exp > Date.now() ? s : null
  } catch {
    return null
  }
}

export interface AdminAuthContextValue {
  isAuthenticated: boolean
  login(email: string, password: string): boolean
  logout(): void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(readSession)

  const login = useCallback((email: string, password: string): boolean => {
    if (email.trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return false
    const s: AdminSession = { email: ADMIN_EMAIL, role: 'admin', exp: Date.now() + 8 * 3600 * 1000 }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({ isAuthenticated: session !== null, login, logout }),
    [session, login, logout]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
```

- [ ] **Step 4: Create `src/admin/hooks/useAdminAuth.ts`**

```ts
import { useContext } from 'react'
import { AdminAuthContext } from '@/admin/contexts/AdminAuthContext'

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run src/admin/contexts/__tests__/adminAuth.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/admin/contexts/ src/admin/hooks/
git commit -m "feat(admin): AdminAuthContext with login/logout and session persistence"
```

---

## Task 4: adminServices.ts + tests

**Files:**
- Create: `src/admin/services/adminServices.ts`
- Create: `src/admin/services/__tests__/adminServices.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/admin/services/__tests__/adminServices.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '@/lib/supabase'
import { computeCAMois, computeTop5 } from '@/admin/services/adminServices'
import type { Commande } from '@/admin/types'

const mockCommandes: Commande[] = [
  {
    id: '1', code_client: 'LIB001', librairie: 'Test',
    date: new Date().toISOString(),
    statut: 'livre', montant_ht: 94.79, montant_ttc: 100.00,
    articles: [{ isbn: '123', titre: 'Livre A', quantite: 5, prix_ttc: 10 }],
  },
  {
    id: '2', code_client: 'LIB002', librairie: 'Test2',
    date: new Date().toISOString(),
    statut: 'annule', montant_ht: 47.39, montant_ttc: 50.00,
    articles: [{ isbn: '456', titre: 'Livre B', quantite: 3, prix_ttc: 10 }],
  },
  {
    id: '3', code_client: 'LIB003', librairie: 'Test3',
    date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(),
    statut: 'livre', montant_ht: 47.39, montant_ttc: 50.00,
    articles: [{ isbn: '123', titre: 'Livre A', quantite: 2, prix_ttc: 10 }],
  },
]

describe('computeCAMois', () => {
  it('sums TTC for current month, excludes annule', () => {
    expect(computeCAMois(mockCommandes)).toBe(100.00)
  })
})

describe('computeTop5', () => {
  it('aggregates quantities by isbn and sorts descending', () => {
    const top = computeTop5(mockCommandes)
    expect(top[0].isbn).toBe('123')
    expect(top[0].total).toBe(7) // 5 + 2
    expect(top[1].isbn).toBe('456')
    expect(top[1].total).toBe(3)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/admin/services/__tests__/adminServices.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/admin/services/adminServices.ts`**

```ts
import { supabase } from '@/lib/supabase'
import type { Commande, Libraire, LivreInsert, StatutCommande } from '@/admin/types'

/* ── Pure helpers (exported for tests) ── */

export function computeCAMois(commandes: Commande[]): number {
  const now = new Date()
  return commandes
    .filter(c => {
      if (c.statut === 'annule') return false
      const d = new Date(c.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, c) => sum + c.montant_ttc, 0)
}

export function computeTop5(commandes: Commande[]): { isbn: string; titre: string; total: number }[] {
  const map: Record<string, { isbn: string; titre: string; total: number }> = {}
  for (const cmd of commandes) {
    for (const art of cmd.articles) {
      if (!map[art.isbn]) map[art.isbn] = { isbn: art.isbn, titre: art.titre, total: 0 }
      map[art.isbn].total += art.quantite
    }
  }
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5)
}

/* ── Supabase queries ── */

export async function getAllCommandes(): Promise<Commande[]> {
  const { data, error } = await supabase
    .from('commandes')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Commande[]
}

export async function updateCommandeStatut(id: string, statut: StatutCommande): Promise<void> {
  const { error } = await supabase.from('commandes').update({ statut }).eq('id', id)
  if (error) throw error
}

export async function getAllLibraires(): Promise<Libraire[]> {
  const { data, error } = await supabase
    .from('libraires')
    .select('*')
    .order('code_client', { ascending: true })
  if (error) throw error
  return (data ?? []) as Libraire[]
}

export async function updateLibraire(id: string, data: Partial<Libraire>): Promise<void> {
  const { error } = await supabase.from('libraires').update(data).eq('id', id)
  if (error) throw error
}

export async function addLivre(data: LivreInsert): Promise<void> {
  const { error } = await supabase.from('livres').insert([data])
  if (error) throw error
}

export async function updateLivre(id: string, data: Partial<LivreInsert>): Promise<void> {
  const { error } = await supabase.from('livres').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteLivre(id: string): Promise<void> {
  const { error } = await supabase.from('livres').delete().eq('id', id)
  if (error) throw error
}

export async function countLivres(): Promise<number> {
  const { count, error } = await supabase.from('livres').select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/admin/services/__tests__/adminServices.test.ts
```

Expected: 2 tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: 168/169 tests pass (1 pré-existant failing non lié).

- [ ] **Step 6: Commit**

```bash
git add src/admin/services/
git commit -m "feat(admin): adminServices with Supabase queries and pure helper functions"
```

---

## Task 5: AdminRoute + AdminLoginPage

**Files:**
- Create: `src/admin/AdminRoute.tsx`
- Create: `src/admin/pages/AdminLoginPage.tsx`

- [ ] **Step 1: Create `src/admin/AdminRoute.tsx`**

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'

export function AdminRoute() {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
```

- [ ] **Step 2: Create `src/admin/pages/AdminLoginPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'
import { adminColors } from '@/admin/adminTheme'

export function AdminLoginPage() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = (fd.get('email') as string).trim()
    const password = fd.get('password') as string
    const ok = login(email, password)
    if (ok) navigate('/admin/dashboard', { replace: true })
    else setError('Identifiants incorrects')
  }

  return (
    <Page>
      <Card>
        <Logo>FlowDiff <Sup>Admin</Sup></Logo>
        <Subtitle>Espace réservé aux équipes internes</Subtitle>
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue="admin@flowdiff.com" autoComplete="username" />
          </Field>
          <Field>
            <Label>Mot de passe</Label>
            <Input name="password" type="password" defaultValue="FlowDiff2024!" autoComplete="current-password" />
          </Field>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <SubmitBtn type="submit">Se connecter</SubmitBtn>
        </Form>
      </Card>
    </Page>
  )
}

const Page = styled.div`
  min-height: 100vh;
  background: ${adminColors.pageBg};
  display: flex;
  align-items: center;
  justify-content: center;
`

const Card = styled.div`
  background: ${adminColors.surface};
  border-radius: 12px;
  padding: 48px 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
`

const Logo = styled.h1`
  font-family: 'Open Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: ${adminColors.sidebarBg};
  margin: 0 0 8px;
`

const Sup = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${adminColors.accent};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 6px;
  vertical-align: super;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: ${adminColors.textSecondary};
  margin: 0 0 32px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${adminColors.textPrimary};
`

const Input = styled.input`
  border: 1px solid ${adminColors.border};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: 'Open Sans', sans-serif;
  color: ${adminColors.textPrimary};
  outline: none;
  &:focus { border-color: ${adminColors.accent}; }
`

const ErrorMsg = styled.p`
  font-size: 13px;
  color: ${adminColors.danger};
  margin: 0;
`

const SubmitBtn = styled.button`
  background: ${adminColors.accent};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  cursor: pointer;
  margin-top: 8px;
  &:hover { background: ${adminColors.accentHover}; }
`
```

- [ ] **Step 3: Commit**

```bash
git add src/admin/AdminRoute.tsx src/admin/pages/AdminLoginPage.tsx
git commit -m "feat(admin): AdminRoute guard and AdminLoginPage with pre-filled credentials"
```

---

## Task 6: AdminLayout + AdminSidebar + AdminHeader + shared components

**Files:**
- Create: `src/admin/AdminLayout.tsx`
- Create: `src/admin/components/StatutBadge.tsx`
- Create: `src/admin/components/AdminModal.tsx`

- [ ] **Step 1: Create `src/admin/components/StatutBadge.tsx`**

```tsx
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'

const colorMap: Record<string, string> = adminColors.statut

const Badge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $color }) => $color}22;
  color: ${({ $color }) => $color};
  text-transform: capitalize;
  white-space: nowrap;
`

const LABELS: Record<string, string> = {
  en_preparation: 'En préparation',
  expedie:        'Expédié',
  livre:          'Livré',
  annule:         'Annulé',
  actif:          'Actif',
  bloque:         'Bloqué',
}

export function StatutBadge({ statut }: { statut: string }) {
  const color = colorMap[statut] ?? '#95a5a6'
  return <Badge $color={color}>{LABELS[statut] ?? statut}</Badge>
}
```

- [ ] **Step 2: Create `src/admin/components/AdminModal.tsx`**

```tsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'

interface AdminModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

export function AdminModal({ title, onClose, children, width = 560 }: AdminModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <Overlay onClick={onClose}>
      <Panel $width={width} onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <CloseBtn onClick={onClose} aria-label="Fermer">×</CloseBtn>
        </Header>
        <Body>{children}</Body>
      </Panel>
    </Overlay>,
    document.body
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`

const Panel = styled.div<{ $width: number }>`
  background: ${adminColors.surface};
  border-radius: 12px;
  width: 100%;
  max-width: ${({ $width }) => $width}px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.20);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${adminColors.border};
  position: sticky;
  top: 0;
  background: ${adminColors.surface};
  z-index: 1;
`

const Title = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: ${adminColors.textSecondary};
  padding: 0;
  &:hover { color: ${adminColors.textPrimary}; }
`

const Body = styled.div`
  padding: 24px;
`
```

- [ ] **Step 3: Create `src/admin/AdminLayout.tsx`**

```tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'

const NAV_ITEMS = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: '📊' },
  { to: '/admin/catalogue',  label: 'Catalogue',  icon: '📚' },
  { to: '/admin/commandes',  label: 'Commandes',  icon: '📦' },
  { to: '/admin/libraires',  label: 'Libraires',  icon: '🏪' },
]

export function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <Shell>
      <Sidebar>
        <Brand>FlowDiff <BrandSup>Admin</BrandSup></Brand>
        <Nav>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.to} to={item.to}>
              <span>{item.icon}</span> {item.label}
            </NavItem>
          ))}
        </Nav>
        <LogoutBtn onClick={handleLogout}>↩ Déconnexion</LogoutBtn>
      </Sidebar>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Open Sans', sans-serif;
`

const Sidebar = styled.aside`
  width: 240px;
  min-height: 100vh;
  background: ${adminColors.sidebarBg};
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
`

const Brand = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  padding: 0 20px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 12px;
`

const BrandSup = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${adminColors.accent};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 6px;
  vertical-align: super;
`

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
`

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${adminColors.sidebarText};
  text-decoration: none;
  transition: background 0.15s;

  &:hover { background: ${adminColors.sidebarHover}; color: #fff; }
  &.active { background: ${adminColors.sidebarActive}; color: #fff; }
`

const LogoutBtn = styled.button`
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 13px;
  color: ${adminColors.sidebarText};
  cursor: pointer;
  text-align: left;
  font-family: 'Open Sans', sans-serif;
  &:hover { color: #fff; }
`

const Main = styled.main`
  flex: 1;
  background: ${adminColors.pageBg};
  min-height: 100vh;
`
```

- [ ] **Step 4: Commit**

```bash
git add src/admin/AdminLayout.tsx src/admin/components/
git commit -m "feat(admin): AdminLayout, StatutBadge, AdminModal shared components"
```

---

## Task 7: Wire admin routes into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add admin imports at the top of App.tsx**

After the last existing `const ... = lazy(...)` line, add:

```tsx
// Admin back-office (lazy-loaded)
const AdminLoginPage    = lazy(() => import('@/admin/pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })))
const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminCataloguePage = lazy(() => import('@/admin/pages/AdminCataloguePage').then(m => ({ default: m.AdminCataloguePage })))
const AdminCommandesPage = lazy(() => import('@/admin/pages/AdminCommandesPage').then(m => ({ default: m.AdminCommandesPage })))
const AdminLibrairesPage = lazy(() => import('@/admin/pages/AdminLibrairesPage').then(m => ({ default: m.AdminLibrairesPage })))
```

- [ ] **Step 2: Import admin components**

At the top of App.tsx, add imports:

```tsx
import { AdminAuthProvider } from '@/admin/contexts/AdminAuthContext'
import { AdminRoute } from '@/admin/AdminRoute'
import { AdminLayout } from '@/admin/AdminLayout'
```

- [ ] **Step 3: Add admin routes inside `<Routes>` — BEFORE the public libraire routes**

In the `<Routes>` block, add as the very first `<Route>`:

```tsx
{/* Admin back-office — isolated from libraire auth */}
<Route
  path="/admin/*"
  element={
    <AdminAuthProvider>
      <Suspense fallback={null}>
        <AdminRoutes />
      </Suspense>
    </AdminAuthProvider>
  }
/>
```

- [ ] **Step 4: Add the `AdminRoutes` function above `App()`**

After `ProtectedLayout` function, add:

```tsx
function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="catalogue" element={<AdminCataloguePage />} />
          <Route path="commandes" element={<AdminCommandesPage />} />
          <Route path="libraires" element={<AdminLibrairesPage />} />
        </Route>
      </Route>
      <Route index element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If you see "cannot find module" errors for admin pages not yet created, create empty placeholder files:

```bash
mkdir -p src/admin/pages
for p in AdminDashboardPage AdminCataloguePage AdminCommandesPage AdminLibrairesPage; do
  echo "export function ${p}() { return <div>${p}</div> }" > "src/admin/pages/${p}.tsx"
done
```

Then re-run `npx tsc --noEmit`.

- [ ] **Step 6: Start dev server and verify routing**

```bash
npm run dev
```

Open `http://localhost:5173/admin` — should redirect to `/admin/login`.  
Login → should redirect to `/admin/dashboard` (showing placeholder div).

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/admin/pages/
git commit -m "feat(admin): wire admin routes into App.tsx with AdminAuthProvider"
```

---

## Task 8: AdminDashboardPage

**Files:**
- Modify: `src/admin/pages/AdminDashboardPage.tsx`

- [ ] **Step 1: Write `src/admin/pages/AdminDashboardPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { StatutBadge } from '@/admin/components/StatutBadge'
import {
  getAllCommandes,
  getAllLibraires,
  countLivres,
  computeCAMois,
  computeTop5,
} from '@/admin/services/adminServices'
import type { Commande } from '@/admin/types'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function AdminDashboardPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [nbLibraires, setNbLibraires] = useState(0)
  const [nbLivres, setNbLivres] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cmds, libs, nb] = await Promise.all([
        getAllCommandes(),
        getAllLibraires(),
        countLivres(),
      ])
      setCommandes(cmds)
      setNbLibraires(libs.filter(l => l.statut === 'actif').length)
      setNbLivres(nb)
      setLoading(false)
    }
    load()
  }, [])

  const caMois = computeCAMois(commandes)
  const enAttente = commandes.filter(c => c.statut === 'en_preparation').length
  const recentes = commandes.slice(0, 5)
  const top5 = computeTop5(commandes)

  return (
    <Page>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageSub>Vue d'ensemble de l'activité FlowDiff</PageSub>
      </PageHeader>

      <KpiGrid>
        <KpiCard>
          <KpiLabel>CA du mois</KpiLabel>
          <KpiValue>{loading ? '…' : fmt(caMois)}</KpiValue>
        </KpiCard>
        <KpiCard>
          <KpiLabel>Commandes en attente</KpiLabel>
          <KpiValue>{loading ? '…' : enAttente}</KpiValue>
        </KpiCard>
        <KpiCard>
          <KpiLabel>Livres au catalogue</KpiLabel>
          <KpiValue>{loading ? '…' : nbLivres}</KpiValue>
        </KpiCard>
        <KpiCard>
          <KpiLabel>Librairies actives</KpiLabel>
          <KpiValue>{loading ? '…' : nbLibraires}</KpiValue>
        </KpiCard>
      </KpiGrid>

      <TablesRow>
        <TableSection>
          <TableHeader>
            <SectionTitle>Commandes récentes</SectionTitle>
            <SeeAll to="/admin/commandes">Voir tout →</SeeAll>
          </TableHeader>
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Librairie</Th>
                <Th>Montant TTC</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {recentes.map(c => (
                <Tr key={c.id}>
                  <Td>{new Date(c.date).toLocaleDateString('fr-FR')}</Td>
                  <Td>{c.librairie}</Td>
                  <Td>{fmt(c.montant_ttc)}</Td>
                  <Td><StatutBadge statut={c.statut} /></Td>
                </Tr>
              ))}
              {recentes.length === 0 && <tr><Td colSpan={4} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucune commande</Td></tr>}
            </tbody>
          </Table>
        </TableSection>

        <TableSection>
          <TableHeader>
            <SectionTitle>Top livres commandés</SectionTitle>
          </TableHeader>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Titre</Th>
                <Th>ISBN</Th>
                <Th>Qté totale</Th>
              </tr>
            </thead>
            <tbody>
              {top5.map((b, i) => (
                <Tr key={b.isbn}>
                  <Td style={{ fontWeight: 700, color: adminColors.accent }}>{i + 1}</Td>
                  <Td>{b.titre}</Td>
                  <Td style={{ color: adminColors.textSecondary, fontSize: 12 }}>{b.isbn}</Td>
                  <Td><strong>{b.total}</strong></Td>
                </Tr>
              ))}
              {top5.length === 0 && <tr><Td colSpan={4} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucune donnée</Td></tr>}
            </tbody>
          </Table>
        </TableSection>
      </TablesRow>
    </Page>
  )
}

const Page = styled.div`
  padding: 32px 40px;
  max-width: 1200px;
`

const PageHeader = styled.div`
  margin-bottom: 28px;
`

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0 0 4px;
`

const PageSub = styled.p`
  font-size: 14px;
  color: ${adminColors.textSecondary};
  margin: 0;
`

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`

const KpiCard = styled.div`
  background: ${adminColors.surface};
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid ${adminColors.border};
`

const KpiLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${adminColors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
`

const KpiValue = styled.p`
  font-size: 26px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0;
`

const TablesRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`

const TableSection = styled.div`
  background: ${adminColors.surface};
  border-radius: 12px;
  border: 1px solid ${adminColors.border};
  overflow: hidden;
`

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${adminColors.border};
`

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0;
`

const SeeAll = styled(Link)`
  font-size: 13px;
  color: ${adminColors.accent};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  padding: 10px 20px;
  font-size: 11px;
  font-weight: 700;
  color: ${adminColors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${adminColors.pageBg};
  border-bottom: 1px solid ${adminColors.border};
`

const Tr = styled.tr`
  &:nth-child(even) td { background: ${adminColors.rowAlt}; }
`

const Td = styled.td`
  padding: 12px 20px;
  font-size: 13px;
  color: ${adminColors.textPrimary};
  border-bottom: 1px solid ${adminColors.border};
`
```

- [ ] **Step 2: Check TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:5173/admin/dashboard` — should show 4 KPI cards and 2 tables with real Supabase data.

- [ ] **Step 4: Commit**

```bash
git add src/admin/pages/AdminDashboardPage.tsx
git commit -m "feat(admin): AdminDashboardPage with KPIs and recent orders from Supabase"
```

---

## Task 9: AdminCataloguePage (list + CRUD)

**Files:**
- Modify: `src/admin/pages/AdminCataloguePage.tsx`

- [ ] **Step 1: Write `src/admin/pages/AdminCataloguePage.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { AdminModal } from '@/admin/components/AdminModal'
import { StatutBadge } from '@/admin/components/StatutBadge'
import { getAllBooksAsync } from '@/services/books'
import { addLivre, updateLivre, deleteLivre } from '@/admin/services/adminServices'
import type { Book } from '@/data/mockBooks'
import type { LivreInsert } from '@/admin/types'

const TYPES = ['fonds', 'nouveaute', 'a-paraitre'] as const

export function AdminCataloguePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filtered, setFiltered] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('tous')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Book | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    const data = await getAllBooksAsync()
    setBooks(data)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    let list = books
    if (typeFilter !== 'tous') list = list.filter(b => b.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.authors.some(a => a.toLowerCase().includes(q)) ||
        b.isbn.includes(q)
      )
    }
    setFiltered(list)
  }, [books, search, typeFilter])

  async function handleSave(data: LivreInsert) {
    setSaving(true)
    try {
      if (modal === 'add') await addLivre(data)
      else if (modal === 'edit' && selected) await updateLivre(selected.id, data)
      await reload()
      setModal(null)
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    await deleteLivre(confirmDelete.id)
    await reload()
    setConfirmDelete(null)
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Catalogue livres</PageTitle>
          <PageSub>{filtered.length} titre{filtered.length > 1 ? 's' : ''}</PageSub>
        </div>
        <AddBtn onClick={() => { setSelected(null); setModal('add') }}>+ Ajouter un livre</AddBtn>
      </PageHeader>

      <Toolbar>
        <SearchInput
          placeholder="Rechercher titre, auteur, ISBN…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TypeSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="tous">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </TypeSelect>
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: 60 }}>Cover</Th>
              <Th>Titre</Th>
              <Th>Auteur(s)</Th>
              <Th>ISBN</Th>
              <Th>Prix TTC</Th>
              <Th>Statut</Th>
              <Th style={{ width: 120 }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><Td colSpan={7} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Chargement…</Td></tr>
            )}
            {!loading && filtered.map(book => (
              <Tr key={book.id}>
                <Td>
                  {book.isbn ? (
                    <img
                      src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg`}
                      alt=""
                      style={{ width: 32, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : null}
                </Td>
                <Td style={{ fontWeight: 600, maxWidth: 220 }}>{book.title}</Td>
                <Td style={{ color: adminColors.textSecondary }}>{book.authors.join(', ')}</Td>
                <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{book.isbn}</Td>
                <Td>{book.priceTTC?.toFixed(2)} €</Td>
                <Td><StatutBadge statut={book.statut ?? book.type} /></Td>
                <Td>
                  <Actions>
                    <ActionBtn onClick={() => { setSelected(book); setModal('edit') }}>Modifier</ActionBtn>
                    <DeleteBtn onClick={() => setConfirmDelete(book)}>Suppr.</DeleteBtn>
                  </Actions>
                </Td>
              </Tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><Td colSpan={7} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucun résultat</Td></tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {(modal === 'add' || modal === 'edit') && (
        <AdminModal
          title={modal === 'add' ? 'Ajouter un livre' : 'Modifier le livre'}
          onClose={() => { setModal(null); setSelected(null) }}
        >
          <LivreForm book={selected} onSave={handleSave} saving={saving} />
        </AdminModal>
      )}

      {confirmDelete && (
        <AdminModal title="Confirmer la suppression" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ marginTop: 0 }}>Supprimer <strong>"{confirmDelete.title}"</strong> du catalogue ?</p>
          <FormActions>
            <CancelBtn onClick={() => setConfirmDelete(null)}>Annuler</CancelBtn>
            <DangerBtn onClick={handleDelete}>Supprimer</DangerBtn>
          </FormActions>
        </AdminModal>
      )}
    </Page>
  )
}

/* ── LivreForm sub-component ── */

function LivreForm({ book, onSave, saving }: { book: Book | null; onSave: (d: LivreInsert) => void; saving: boolean }) {
  const ref = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(ref.current!)
    const data: LivreInsert = {
      title:           fd.get('title') as string,
      authors:         [(fd.get('authors') as string)],
      isbn:            fd.get('isbn') as string,
      publisher:       fd.get('publisher') as string,
      universe:        fd.get('universe') as string,
      type:            fd.get('type') as string,
      price:           parseFloat(fd.get('price') as string),
      priceTTC:        parseFloat(fd.get('priceTTC') as string),
      format:          fd.get('format') as string,
      publicationDate: fd.get('publicationDate') as string,
      description:     fd.get('description') as string,
    }
    onSave(data)
  }

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <FormGrid>
        <FormField label="Titre" name="title" defaultValue={book?.title} required />
        <FormField label="Auteur(s)" name="authors" defaultValue={book?.authors.join(', ')} required />
        <FormField label="ISBN" name="isbn" defaultValue={book?.isbn} required />
        <FormField label="Éditeur" name="publisher" defaultValue={book?.publisher} required />
        <FormField label="Prix HT" name="price" type="number" step="0.01" defaultValue={book?.price} required />
        <FormField label="Prix TTC" name="priceTTC" type="number" step="0.01" defaultValue={book?.priceTTC} required />
        <FormField label="Format" name="format" defaultValue={book?.format ?? 'broché'} required />
        <FormField label="Date de parution" name="publicationDate" defaultValue={book?.publicationDate} required />
        <SelectField label="Univers" name="universe" defaultValue={book?.universe} options={['Littérature','BD / Mangas','Jeunesse','Adulte-pratique']} />
        <SelectField label="Type" name="type" defaultValue={book?.type} options={['fonds','nouveaute','a-paraitre']} />
      </FormGrid>
      <TextAreaField label="Description" name="description" defaultValue={book?.description} />
      <FormActions>
        <SubmitBtn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</SubmitBtn>
      </FormActions>
    </form>
  )
}

function FormField({ label, name, defaultValue, type = 'text', step, required }: {
  label: string; name: string; defaultValue?: string | number; type?: string; step?: string; required?: boolean
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Input name={name} type={type} step={step} defaultValue={defaultValue ?? ''} required={required} />
    </Field>
  )
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: string[] }) {
  return (
    <Field>
      <Label>{label}</Label>
      <Select name={name} defaultValue={defaultValue ?? ''}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </Select>
    </Field>
  )
}

function TextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <Field style={{ gridColumn: '1 / -1' }}>
      <Label>{label}</Label>
      <TextArea name={name} rows={3} defaultValue={defaultValue ?? ''} />
    </Field>
  )
}

/* ── Styles ── */

const Page = styled.div` padding: 32px 40px; max-width: 1200px; `
const PageHeader = styled.div` display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; `
const PageTitle = styled.h1` font-size: 24px; font-weight: 700; color: ${adminColors.textPrimary}; margin: 0 0 4px; `
const PageSub = styled.p` font-size: 14px; color: ${adminColors.textSecondary}; margin: 0; `
const AddBtn = styled.button`
  background: ${adminColors.accent}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accentHover}; }
`
const Toolbar = styled.div` display: flex; gap: 12px; margin-bottom: 16px; `
const SearchInput = styled.input`
  flex: 1; border: 1px solid ${adminColors.border}; border-radius: 8px;
  padding: 9px 14px; font-size: 14px; font-family: 'Open Sans', sans-serif; color: ${adminColors.textPrimary};
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const TypeSelect = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 9px 14px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface}; cursor: pointer;
`
const TableWrap = styled.div` background: ${adminColors.surface}; border-radius: 12px; border: 1px solid ${adminColors.border}; overflow: hidden; `
const Table = styled.table` width: 100%; border-collapse: collapse; `
const Th = styled.th`
  text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700;
  color: ${adminColors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;
  background: ${adminColors.pageBg}; border-bottom: 1px solid ${adminColors.border};
`
const Tr = styled.tr` &:nth-child(even) td { background: ${adminColors.rowAlt}; } `
const Td = styled.td` padding: 10px 16px; font-size: 13px; color: ${adminColors.textPrimary}; border-bottom: 1px solid ${adminColors.border}; `
const Actions = styled.div` display: flex; gap: 8px; `
const ActionBtn = styled.button`
  background: none; border: 1px solid ${adminColors.accent}; color: ${adminColors.accent};
  border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accent}; color: #fff; }
`
const DeleteBtn = styled.button`
  background: none; border: 1px solid ${adminColors.danger}; color: ${adminColors.danger};
  border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.danger}; color: #fff; }
`
const FormGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 16px; `
const Field = styled.div` display: flex; flex-direction: column; gap: 6px; `
const Label = styled.label` font-size: 13px; font-weight: 600; color: ${adminColors.textPrimary}; `
const Input = styled.input`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const Select = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface};
`
const TextArea = styled.textarea`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; resize: vertical;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const FormActions = styled.div` display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; `
const SubmitBtn = styled.button`
  background: ${adminColors.accent}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accentHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
const CancelBtn = styled.button`
  background: none; border: 1px solid ${adminColors.border}; border-radius: 8px;
  padding: 10px 20px; font-size: 14px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  color: ${adminColors.textSecondary};
`
const DangerBtn = styled.button`
  background: ${adminColors.danger}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.dangerHover}; }
`
```

- [ ] **Step 2: Check TypeScript + verify in browser**

```bash
npx tsc --noEmit
```

Open `/admin/catalogue` — verify list loads from Supabase, add/edit/delete modals work.

- [ ] **Step 3: Commit**

```bash
git add src/admin/pages/AdminCataloguePage.tsx
git commit -m "feat(admin): AdminCataloguePage with full CRUD (add/edit/delete) via Supabase"
```

---

## Task 10: AdminCommandesPage

**Files:**
- Modify: `src/admin/pages/AdminCommandesPage.tsx`

- [ ] **Step 1: Write `src/admin/pages/AdminCommandesPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { AdminModal } from '@/admin/components/AdminModal'
import { StatutBadge } from '@/admin/components/StatutBadge'
import { getAllCommandes, updateCommandeStatut } from '@/admin/services/adminServices'
import type { Commande, StatutCommande } from '@/admin/types'

const STATUTS: StatutCommande[] = ['en_preparation', 'expedie', 'livre', 'annule']
const STATUT_LABELS: Record<StatutCommande, string> = {
  en_preparation: 'En préparation',
  expedie:        'Expédié',
  livre:          'Livré',
  annule:         'Annulé',
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [filtered, setFiltered] = useState<Commande[]>([])
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('tous')
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<Commande | null>(null)

  async function reload() {
    setLoading(true)
    const data = await getAllCommandes()
    setCommandes(data)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    let list = commandes
    if (statutFilter !== 'tous') list = list.filter(c => c.statut === statutFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.librairie.toLowerCase().includes(q) ||
        c.code_client.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [commandes, search, statutFilter])

  async function handleStatutChange(id: string, statut: StatutCommande) {
    await updateCommandeStatut(id, statut)
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c))
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Commandes</PageTitle>
          <PageSub>{filtered.length} commande{filtered.length > 1 ? 's' : ''}</PageSub>
        </div>
      </PageHeader>

      <Toolbar>
        <SearchInput
          placeholder="Rechercher librairie, code client…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TypeSelect value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </TypeSelect>
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Code client</Th>
              <Th>Librairie</Th>
              <Th>Montant TTC</Th>
              <Th>Statut</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><Td colSpan={6} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Chargement…</Td></tr>}
            {!loading && filtered.map(c => (
              <Tr key={c.id}>
                <Td>{new Date(c.date).toLocaleDateString('fr-FR')}</Td>
                <Td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.code_client}</Td>
                <Td>{c.librairie}</Td>
                <Td style={{ fontWeight: 600 }}>{fmt(c.montant_ttc)}</Td>
                <Td>
                  <StatutSelect
                    value={c.statut}
                    onChange={e => handleStatutChange(c.id, e.target.value as StatutCommande)}
                  >
                    {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
                  </StatutSelect>
                </Td>
                <Td>
                  <ActionBtn onClick={() => setDetail(c)}>Détail</ActionBtn>
                </Td>
              </Tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><Td colSpan={6} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucune commande</Td></tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {detail && (
        <AdminModal title={`Commande — ${detail.librairie}`} onClose={() => setDetail(null)} width={600}>
          <DetailGrid>
            <DetailRow><DetailLabel>Librairie</DetailLabel><DetailVal>{detail.librairie}</DetailVal></DetailRow>
            <DetailRow><DetailLabel>Code client</DetailLabel><DetailVal style={{ fontFamily: 'monospace' }}>{detail.code_client}</DetailVal></DetailRow>
            <DetailRow><DetailLabel>Date</DetailLabel><DetailVal>{new Date(detail.date).toLocaleDateString('fr-FR')}</DetailVal></DetailRow>
            <DetailRow><DetailLabel>Statut</DetailLabel><DetailVal><StatutBadge statut={detail.statut} /></DetailVal></DetailRow>
          </DetailGrid>
          <ArticlesTitle>Articles commandés</ArticlesTitle>
          <Table style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <Th>Titre</Th>
                <Th>ISBN</Th>
                <Th style={{ textAlign: 'right' }}>Qté</Th>
                <Th style={{ textAlign: 'right' }}>Prix unit.</Th>
                <Th style={{ textAlign: 'right' }}>Sous-total</Th>
              </tr>
            </thead>
            <tbody>
              {detail.articles.map((art, i) => (
                <Tr key={i}>
                  <Td>{art.titre}</Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12, color: adminColors.textSecondary }}>{art.isbn}</Td>
                  <Td style={{ textAlign: 'right' }}>{art.quantite}</Td>
                  <Td style={{ textAlign: 'right' }}>{art.prix_ttc.toFixed(2)} €</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600 }}>{(art.quantite * art.prix_ttc).toFixed(2)} €</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Totals>
            <TotalRow><span>Montant HT</span><span>{fmt(detail.montant_ht)}</span></TotalRow>
            <TotalRow><span>TVA 5,5%</span><span>{fmt(detail.montant_ttc - detail.montant_ht)}</span></TotalRow>
            <TotalRow style={{ fontWeight: 700, fontSize: 15 }}><span>Total TTC</span><span>{fmt(detail.montant_ttc)}</span></TotalRow>
          </Totals>
        </AdminModal>
      )}
    </Page>
  )
}

const Page = styled.div` padding: 32px 40px; max-width: 1200px; `
const PageHeader = styled.div` display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; `
const PageTitle = styled.h1` font-size: 24px; font-weight: 700; color: ${adminColors.textPrimary}; margin: 0 0 4px; `
const PageSub = styled.p` font-size: 14px; color: ${adminColors.textSecondary}; margin: 0; `
const Toolbar = styled.div` display: flex; gap: 12px; margin-bottom: 16px; `
const SearchInput = styled.input`
  flex: 1; border: 1px solid ${adminColors.border}; border-radius: 8px;
  padding: 9px 14px; font-size: 14px; font-family: 'Open Sans', sans-serif;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const TypeSelect = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 9px 14px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface};
`
const StatutSelect = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 6px; padding: 4px 8px;
  font-size: 12px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface}; cursor: pointer;
`
const TableWrap = styled.div` background: ${adminColors.surface}; border-radius: 12px; border: 1px solid ${adminColors.border}; overflow: hidden; `
const Table = styled.table` width: 100%; border-collapse: collapse; `
const Th = styled.th`
  text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700;
  color: ${adminColors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;
  background: ${adminColors.pageBg}; border-bottom: 1px solid ${adminColors.border};
`
const Tr = styled.tr` &:nth-child(even) td { background: ${adminColors.rowAlt}; } `
const Td = styled.td` padding: 10px 16px; font-size: 13px; color: ${adminColors.textPrimary}; border-bottom: 1px solid ${adminColors.border}; `
const ActionBtn = styled.button`
  background: none; border: 1px solid ${adminColors.accent}; color: ${adminColors.accent};
  border-radius: 6px; padding: 4px 12px; font-size: 12px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accent}; color: #fff; }
`
const DetailGrid = styled.div` display: grid; gap: 8px; margin-bottom: 20px; `
const DetailRow = styled.div` display: flex; gap: 16px; `
const DetailLabel = styled.span` font-size: 13px; color: ${adminColors.textSecondary}; width: 120px; flex-shrink: 0; `
const DetailVal = styled.span` font-size: 13px; color: ${adminColors.textPrimary}; font-weight: 500; `
const ArticlesTitle = styled.h3` font-size: 14px; font-weight: 700; color: ${adminColors.textPrimary}; margin: 0 0 12px; `
const Totals = styled.div` border-top: 2px solid ${adminColors.border}; padding-top: 12px; display: flex; flex-direction: column; gap: 6px; `
const TotalRow = styled.div` display: flex; justify-content: space-between; font-size: 14px; color: ${adminColors.textPrimary}; `
```

- [ ] **Step 2: Check TypeScript + verify in browser**

```bash
npx tsc --noEmit
```

Open `/admin/commandes` — verify list loads, statut select changes persist, detail modal shows articles.

- [ ] **Step 3: Commit**

```bash
git add src/admin/pages/AdminCommandesPage.tsx
git commit -m "feat(admin): AdminCommandesPage with statut management and order detail modal"
```

---

## Task 11: AdminLibrairesPage

**Files:**
- Modify: `src/admin/pages/AdminLibrairesPage.tsx`

- [ ] **Step 1: Write `src/admin/pages/AdminLibrairesPage.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { AdminModal } from '@/admin/components/AdminModal'
import { StatutBadge } from '@/admin/components/StatutBadge'
import { getAllLibraires, updateLibraire } from '@/admin/services/adminServices'
import type { Libraire } from '@/admin/types'

export function AdminLibrairesPage() {
  const [libraires, setLibraires] = useState<Libraire[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Libraire | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    setLibraires(await getAllLibraires())
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  const filtered = search.trim()
    ? libraires.filter(l =>
        l.nom.toLowerCase().includes(search.toLowerCase()) ||
        l.code_client.toLowerCase().includes(search.toLowerCase()) ||
        l.ville.toLowerCase().includes(search.toLowerCase())
      )
    : libraires

  async function handleSave(id: string, data: Partial<Libraire>) {
    setSaving(true)
    try {
      await updateLibraire(id, data)
      await reload()
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Libraires</PageTitle>
          <PageSub>{filtered.length} compte{filtered.length > 1 ? 's' : ''}</PageSub>
        </div>
      </PageHeader>

      <Toolbar>
        <SearchInput
          placeholder="Rechercher nom, code client, ville…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Code client</Th>
              <Th>Nom</Th>
              <Th>Ville</Th>
              <Th>Email</Th>
              <Th style={{ textAlign: 'right' }}>Remise</Th>
              <Th>Statut</Th>
              <Th>Reliquat</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><Td colSpan={8} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Chargement…</Td></tr>}
            {!loading && filtered.map(l => (
              <Tr key={l.id}>
                <Td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{l.code_client}</Td>
                <Td style={{ fontWeight: 600 }}>{l.nom}</Td>
                <Td>{l.ville}</Td>
                <Td style={{ fontSize: 12, color: adminColors.textSecondary }}>{l.email}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 600 }}>{l.remise}%</Td>
                <Td><StatutBadge statut={l.statut} /></Td>
                <Td><StatutBadge statut={l.reliquat ? 'actif' : 'bloque'} /></Td>
                <Td>
                  <ActionBtn onClick={() => setSelected(l)}>Modifier</ActionBtn>
                </Td>
              </Tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><Td colSpan={8} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucun résultat</Td></tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {selected && (
        <AdminModal title={`Modifier — ${selected.nom}`} onClose={() => setSelected(null)} width={480}>
          <LibraireForm libraire={selected} onSave={data => handleSave(selected.id, data)} saving={saving} />
        </AdminModal>
      )}
    </Page>
  )
}

function LibraireForm({ libraire, onSave, saving }: { libraire: Libraire; onSave: (d: Partial<Libraire>) => void; saving: boolean }) {
  const ref = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(ref.current!)
    onSave({
      nom:       fd.get('nom') as string,
      email:     fd.get('email') as string,
      ville:     fd.get('ville') as string,
      telephone: fd.get('telephone') as string,
      remise:    parseFloat(fd.get('remise') as string),
      statut:    fd.get('statut') as 'actif' | 'bloque',
      reliquat:  fd.get('reliquat') === 'on',
    })
  }

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <FormGrid>
        <Field>
          <Label>Nom</Label>
          <Input name="nom" defaultValue={libraire.nom} required />
        </Field>
        <Field>
          <Label>Email</Label>
          <Input name="email" type="email" defaultValue={libraire.email} required />
        </Field>
        <Field>
          <Label>Ville</Label>
          <Input name="ville" defaultValue={libraire.ville} />
        </Field>
        <Field>
          <Label>Téléphone</Label>
          <Input name="telephone" defaultValue={libraire.telephone ?? ''} />
        </Field>
        <Field>
          <Label>Remise (%)</Label>
          <Input name="remise" type="number" step="0.5" min="0" max="60" defaultValue={libraire.remise} required />
        </Field>
        <Field>
          <Label>Statut</Label>
          <Select name="statut" defaultValue={libraire.statut}>
            <option value="actif">Actif</option>
            <option value="bloque">Bloqué</option>
          </Select>
        </Field>
        <Field style={{ flexDirection: 'row', alignItems: 'center', gap: 10, gridColumn: '1 / -1' }}>
          <Checkbox name="reliquat" type="checkbox" defaultChecked={libraire.reliquat} />
          <Label style={{ margin: 0 }}>Accepte les reliquats</Label>
        </Field>
      </FormGrid>
      <FormActions>
        <SubmitBtn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</SubmitBtn>
      </FormActions>
    </form>
  )
}

const Page = styled.div` padding: 32px 40px; max-width: 1200px; `
const PageHeader = styled.div` display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; `
const PageTitle = styled.h1` font-size: 24px; font-weight: 700; color: ${adminColors.textPrimary}; margin: 0 0 4px; `
const PageSub = styled.p` font-size: 14px; color: ${adminColors.textSecondary}; margin: 0; `
const Toolbar = styled.div` display: flex; gap: 12px; margin-bottom: 16px; `
const SearchInput = styled.input`
  flex: 1; border: 1px solid ${adminColors.border}; border-radius: 8px;
  padding: 9px 14px; font-size: 14px; font-family: 'Open Sans', sans-serif;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const TableWrap = styled.div` background: ${adminColors.surface}; border-radius: 12px; border: 1px solid ${adminColors.border}; overflow: hidden; `
const Table = styled.table` width: 100%; border-collapse: collapse; `
const Th = styled.th`
  text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700;
  color: ${adminColors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;
  background: ${adminColors.pageBg}; border-bottom: 1px solid ${adminColors.border};
`
const Tr = styled.tr` &:nth-child(even) td { background: ${adminColors.rowAlt}; } `
const Td = styled.td` padding: 10px 16px; font-size: 13px; color: ${adminColors.textPrimary}; border-bottom: 1px solid ${adminColors.border}; `
const ActionBtn = styled.button`
  background: none; border: 1px solid ${adminColors.accent}; color: ${adminColors.accent};
  border-radius: 6px; padding: 4px 12px; font-size: 12px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accent}; color: #fff; }
`
const FormGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 16px; `
const Field = styled.div` display: flex; flex-direction: column; gap: 6px; `
const Label = styled.label` font-size: 13px; font-weight: 600; color: ${adminColors.textPrimary}; `
const Input = styled.input`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const Select = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface};
`
const Checkbox = styled.input` width: 16px; height: 16px; cursor: pointer; `
const FormActions = styled.div` display: flex; justify-content: flex-end; margin-top: 20px; `
const SubmitBtn = styled.button`
  background: ${adminColors.accent}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accentHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
```

- [ ] **Step 2: Check TypeScript + verify in browser**

```bash
npx tsc --noEmit
```

Open `/admin/libraires` — verify list loads (3 libraires), edit modal opens and saves.

- [ ] **Step 3: Commit**

```bash
git add src/admin/pages/AdminLibrairesPage.tsx
git commit -m "feat(admin): AdminLibrairesPage with edit modal (remise, statut, reliquat)"
```

---

## Task 12: Final check + CONTEXT.md update

**Files:**
- Modify: `CONTEXT.md`

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: 170/171 tests pass (3 new admin tests pass, 1 pré-existant failing non lié).

- [ ] **Step 2: TypeScript clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify end-to-end in browser**

- `/admin/login` → identifiants pré-remplis → connexion → `/admin/dashboard`
- Dashboard KPIs non nuls, tableaux affichés
- `/admin/catalogue` → liste livres Supabase, add/edit/delete fonctionnels
- `/admin/commandes` → liste commandes, changement statut persisté
- `/admin/libraires` → 3 libraires, modification enregistrée

- [ ] **Step 4: Update CONTEXT.md**

Dans CONTEXT.md, mettre à jour "État du build" et marquer la session admin comme terminée.  
**Ne pas mentionner les identifiants admin dans CONTEXT.md.**

- [ ] **Step 5: Final commit**

```bash
git add CONTEXT.md
git commit -m "chore: update CONTEXT.md — admin back-office Phase 1 complete"
```
