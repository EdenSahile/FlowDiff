# Supabase Books Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les imports `mockBooks` par des données réelles depuis Supabase (table `livres`) dans les 7 pages catalogue, sans toucher à l'auth ni aux autres mocks.

**Architecture:** Client Supabase JS (`@supabase/supabase-js`) singleton dans `src/lib/supabase.ts`. Service `src/services/books.ts` avec fonctions async. Prisma gère la migration SQL. Seed via `tsx prisma/seed.ts`. Chaque page fetch ses livres au mount via `useEffect` + `useState`.

**Tech Stack:** `@supabase/supabase-js`, Prisma (migrations), tsx (seed), Vitest (tests)

---

## Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `.env` | Modifier — ajouter VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY |
| `prisma/schema.prisma` | Modifier — ajouter modèle Livre |
| `prisma/seed.ts` | Créer — insert MOCK_BOOKS dans Supabase |
| `src/lib/supabase.ts` | Créer — client singleton |
| `src/services/books.ts` | Créer — fonctions async |
| `src/services/__tests__/books.test.ts` | Créer — tests searchBooksLocal |
| `src/pages/fonds/FondsPage.tsx` | Modifier — useEffect + getBooksByTypeAsync |
| `src/pages/nouveautes/NouveautesPage.tsx` | Modifier — useEffect + getBooksByTypeAsync |
| `src/pages/a-paraitre/AParaitrePage.tsx` | Modifier — useEffect + getBooksByTypeAsync |
| `src/pages/top-ventes/TopVentesPage.tsx` | Modifier — useEffect + getAllBooksAsync |
| `src/pages/catalogue/FicheProduitPage.tsx` | Modifier — useEffect + getBookByIdAsync |
| `src/pages/search/RecherchePage.tsx` | Modifier — useEffect + getAllBooksAsync |
| `src/pages/selections/SelectionsPage.tsx` | Modifier — useEffect + getAllBooksAsync |

---

## Task 1 : Variables d'environnement + install @supabase/supabase-js

**Files:**
- Modify: `.env`

> ⚠️ **Action manuelle requise** : récupère `VITE_SUPABASE_ANON_KEY` depuis ton dashboard Supabase → Settings → API → `anon public`.

- [ ] **Step 1 : Ajouter les variables Vite dans `.env`**

Ajouter sous la ligne `DATABASE_URL` existante :

```
VITE_SUPABASE_URL=https://cuekimkchzllcdygqogf.supabase.co
VITE_SUPABASE_ANON_KEY=<coller ta clé anon ici>
```

- [ ] **Step 2 : Installer le client Supabase JS**

```bash
npm install @supabase/supabase-js
```

Résultat attendu : `added 1 package` (ou similar), `package.json` mis à jour.

- [ ] **Step 3 : Vérifier l'installation**

```bash
node -e "require('./node_modules/@supabase/supabase-js/dist/main/index.js'); console.log('OK')"
```

Résultat attendu : `OK`

- [ ] **Step 4 : Commit**

```bash
git add .env package.json package-lock.json
git commit -m "feat(db): install @supabase/supabase-js + VITE env vars"
```

---

## Task 2 : Modèle Livre dans Prisma + migration SQL

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1 : Ajouter le modèle Livre dans `prisma/schema.prisma`**

Ajouter à la fin du fichier, après l'enum `StatutCommande` :

```prisma
model Livre {
  id              String   @id
  isbn            String   @unique
  title           String
  authors         String[]
  publisher       String
  collection      String?
  universe        String
  type            String
  price           Float
  priceTTC        Float
  format          String
  genre           String?
  language        String?  @default("Français")
  pages           Int?
  publicationDate String
  description     String
  programme       String?
  fictif          Boolean  @default(false)
  statut          String?
  delaiReimp      String?
  topVente        Boolean  @default(false)
  selection       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("livres")
}
```

- [ ] **Step 2 : Générer le client Prisma**

```bash
npx prisma generate
```

Résultat attendu : `Generated Prisma Client`

- [ ] **Step 3 : Générer la migration SQL**

```bash
npx prisma migrate dev --name add-livre --create-only
```

Résultat attendu : un fichier créé dans `prisma/migrations/YYYYMMDDHHMMSS_add_livre/migration.sql`

- [ ] **Step 4 : Copier le SQL généré pour le dashboard Supabase**

Ouvrir le fichier `prisma/migrations/*/migration.sql` et copier son contenu. Il contiendra approximativement :

```sql
CREATE TABLE "livres" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "publisher" TEXT NOT NULL,
    "collection" TEXT,
    "universe" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceTTC" DOUBLE PRECISION NOT NULL,
    "format" TEXT NOT NULL,
    "genre" TEXT,
    "language" TEXT DEFAULT 'Français',
    "pages" INTEGER,
    "publicationDate" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "programme" TEXT,
    "fictif" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT,
    "delaiReimp" TEXT,
    "topVente" BOOLEAN NOT NULL DEFAULT false,
    "selection" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "livres_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "livres_isbn_key" ON "livres"("isbn");
```

> ⚠️ **Action manuelle** : dans le dashboard Supabase → SQL Editor → coller le SQL ci-dessus → Run. Puis ajouter la politique RLS :

```sql
ALTER TABLE "livres" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON "livres" FOR SELECT USING (true);
```

- [ ] **Step 5 : Marquer la migration comme appliquée (skip le apply local)**

```bash
npx prisma migrate resolve --applied $(ls prisma/migrations | tail -1)
```

Ou simplement noter dans `prisma/migrations/migration_lock.toml` qu'elle est appliquée.

- [ ] **Step 6 : Commit**

```bash
git add prisma/
git commit -m "feat(db): modèle Livre + migration SQL (table livres)"
```

---

## Task 3 : Créer src/lib/supabase.ts

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1 : Créer le client Supabase singleton**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)
```

- [ ] **Step 2 : Vérifier que le build TS est clean**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat(db): client Supabase singleton"
```

---

## Task 4 : Créer src/services/books.ts + tests

**Files:**
- Create: `src/services/books.ts`
- Create: `src/services/__tests__/books.test.ts`

- [ ] **Step 1 : Écrire le test d'abord**

```typescript
// src/services/__tests__/books.test.ts
import { describe, it, expect } from 'vitest'
import { searchBooksLocal } from '../books'
import type { Book } from '@/data/mockBooks'

const base: Book = {
  id: 't1', isbn: '9781234567890', title: 'La Nuit des rois',
  authors: ['William Shakespeare'], publisher: 'Folio',
  universe: 'Littérature', type: 'fonds',
  price: 10, priceTTC: 15, format: '155 x 235 mm',
  publicationDate: '2026-01-01', description: 'Test',
  statut: 'disponible', topVente: false, selection: false, fictif: false,
}

const books: Book[] = [
  base,
  { ...base, id: 't2', isbn: '9780000000001', title: 'Dune', authors: ['Frank Herbert'] },
]

describe('searchBooksLocal', () => {
  it('filtre par titre (insensible à la casse)', () => {
    expect(searchBooksLocal(books, 'dune')).toHaveLength(1)
    expect(searchBooksLocal(books, 'dune')[0].id).toBe('t2')
  })

  it('filtre par auteur', () => {
    expect(searchBooksLocal(books, 'shakespeare')).toHaveLength(1)
  })

  it('retourne tous les livres si la requête est vide', () => {
    expect(searchBooksLocal(books, '')).toHaveLength(2)
  })

  it('retourne tableau vide si aucun résultat', () => {
    expect(searchBooksLocal(books, 'xyzabc')).toHaveLength(0)
  })
})
```

- [ ] **Step 2 : Exécuter le test — vérifier qu'il échoue (module introuvable)**

```bash
npx vitest run src/services/__tests__/books.test.ts
```

Résultat attendu : FAIL `Cannot find module '../books'`

- [ ] **Step 3 : Créer src/services/books.ts**

```typescript
// src/services/books.ts
import { supabase } from '@/lib/supabase'
import type { Book, BookType, Universe } from '@/data/mockBooks'

type Row = Record<string, unknown>

function rowToBook(row: Row): Book {
  return {
    id:              row.id as string,
    isbn:            row.isbn as string,
    title:           row.title as string,
    authors:         row.authors as string[],
    publisher:       row.publisher as string,
    collection:      (row.collection as string) || undefined,
    universe:        row.universe as Universe,
    type:            row.type as BookType,
    price:           row.price as number,
    priceTTC:        row.priceTTC as number,
    format:          row.format as string,
    genre:           (row.genre as string) || undefined,
    language:        (row.language as string) || undefined,
    pages:           (row.pages as number) || undefined,
    publicationDate: row.publicationDate as string,
    description:     row.description as string,
    programme:       (row.programme as string) || undefined,
    fictif:          (row.fictif as boolean) || undefined,
    statut:          (row.statut as Book['statut']) || undefined,
    delaiReimp:      (row.delaiReimp as string) || undefined,
    topVente:        (row.topVente as boolean) || undefined,
    selection:       (row.selection as boolean) || undefined,
  }
}

export async function getAllBooksAsync(): Promise<Book[]> {
  const { data, error } = await supabase.from('livres').select('*')
  if (error) throw error
  return (data ?? []).map(rowToBook)
}

export async function getBooksByTypeAsync(type: BookType, universe?: Universe): Promise<Book[]> {
  const base = supabase.from('livres').select('*').eq('type', type)
  const query = universe ? base.eq('universe', universe) : base
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(rowToBook)
}

export async function getBookByIdAsync(id: string): Promise<Book | null> {
  const { data, error } = await supabase.from('livres').select('*').eq('id', id).single()
  if (error) return null
  return rowToBook(data as Row)
}

export function searchBooksLocal(books: Book[], query: string): Book[] {
  const q = query.toLowerCase().trim()
  if (!q) return books
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.toLowerCase().includes(q)) ||
    b.publisher.toLowerCase().includes(q) ||
    b.isbn.includes(q.replace(/[\s-]/g, '')) ||
    (b.collection?.toLowerCase().includes(q) ?? false) ||
    (b.genre?.toLowerCase().includes(q) ?? false)
  )
}
```

- [ ] **Step 4 : Exécuter les tests — vérifier qu'ils passent**

```bash
npx vitest run src/services/__tests__/books.test.ts
```

Résultat attendu : 4 tests PASS.

- [ ] **Step 5 : Vérifier TS clean**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add src/services/
git commit -m "feat(db): service books async + tests searchBooksLocal"
```

---

## Task 5 : Créer prisma/seed.ts + exécuter le seed

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1 : Créer prisma/seed.ts**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { MOCK_BOOKS } from '../src/data/mockBooks'

const prisma = new PrismaClient()

async function main() {
  console.log(`Seeding ${MOCK_BOOKS.length} books…`)

  const data = MOCK_BOOKS.map(b => ({
    id:              b.id,
    isbn:            b.isbn,
    title:           b.title,
    authors:         b.authors,
    publisher:       b.publisher,
    collection:      b.collection ?? null,
    universe:        b.universe,
    type:            b.type,
    price:           b.price,
    priceTTC:        b.priceTTC,
    format:          b.format,
    genre:           b.genre ?? null,
    language:        b.language ?? 'Français',
    pages:           b.pages ?? null,
    publicationDate: b.publicationDate,
    description:     b.description,
    programme:       b.programme ?? null,
    fictif:          b.fictif ?? false,
    statut:          b.statut ?? null,
    delaiReimp:      b.delaiReimp ?? null,
    topVente:        b.topVente ?? false,
    selection:       b.selection ?? false,
  }))

  const result = await prisma.livre.createMany({ data, skipDuplicates: true })
  console.log(`✓ ${result.count} books insérés`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2 : Exécuter le seed**

```bash
npx tsx prisma/seed.ts
```

Résultat attendu : `✓ N books insérés` (N = nombre de livres dans MOCK_BOOKS, ~80+).

> Si erreur `PrismaClientInitializationError` : vérifier que `DATABASE_URL` dans `.env` est correctement URL-encodé (le `@` dans le mot de passe doit être `%40`). Format attendu : `postgresql://postgres:SupaFlowDiff%40%40!!@db.cuekimkchzllcdygqogf.supabase.co:5432/postgres`

- [ ] **Step 3 : Vérifier dans Supabase dashboard**

Aller dans Supabase → Table Editor → `livres` → vérifier que les lignes sont présentes.

- [ ] **Step 4 : Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(db): seed livres depuis MOCK_BOOKS"
```

---

## Task 6 : Migrer FondsPage.tsx

**Files:**
- Modify: `src/pages/fonds/FondsPage.tsx`

- [ ] **Step 1 : Ajouter les imports**

Remplacer la ligne :
```typescript
import { getBooksByType, searchBooks } from '@/data/mockBooks'
```
par :
```typescript
import { useEffect } from 'react'
import { getBooksByTypeAsync, searchBooksLocal } from '@/services/books'
import type { Book } from '@/data/mockBooks'
```

Et dans la ligne 1 ajouter `useEffect` :
```typescript
import { useState, useDeferredValue, useMemo, useEffect } from 'react'
```

- [ ] **Step 2 : Remplacer le bloc de données dans `FondsPage()`**

Trouver le composant `FondsPage()` (environ ligne 231). Ajouter après les useState existants :

```typescript
const [allFonds, setAllFonds] = useState<Book[]>([])

useEffect(() => {
  getBooksByTypeAsync('fonds').then(setAllFonds).catch(console.error)
}, [])
```

- [ ] **Step 3 : Mettre à jour le useMemo**

Remplacer le bloc `useMemo` actuel (lignes ~238-250) :

```typescript
// AVANT
const sorted = useMemo(() => {
  let books = deferred.trim()
    ? searchBooks(deferred).filter(b => b.type === 'fonds')
    : getBooksByType('fonds')
  if (universe) books = books.filter(b => b.universe === universe)
  if (statut)   books = books.filter(b => b.statut === statut)
  if (sort === 'titre')     return [...books].sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'prix_asc')  return [...books].sort((a, b) => a.priceTTC - b.priceTTC)
  if (sort === 'prix_desc') return [...books].sort((a, b) => b.priceTTC - a.priceTTC)
  return books
}, [deferred, universe, statut, sort])
```

par :

```typescript
// APRÈS
const sorted = useMemo(() => {
  let books = deferred.trim()
    ? searchBooksLocal(allFonds, deferred)
    : [...allFonds]
  if (universe) books = books.filter(b => b.universe === universe)
  if (statut)   books = books.filter(b => b.statut === statut)
  if (sort === 'titre')     return [...books].sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'prix_asc')  return [...books].sort((a, b) => a.priceTTC - b.priceTTC)
  if (sort === 'prix_desc') return [...books].sort((a, b) => b.priceTTC - a.priceTTC)
  return books
}, [allFonds, deferred, universe, statut, sort])
```

- [ ] **Step 4 : Vérifier TS clean**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 5 : Commit**

```bash
git add src/pages/fonds/FondsPage.tsx
git commit -m "feat(db): FondsPage → Supabase (getBooksByTypeAsync)"
```

---

## Task 7 : Migrer NouveautesPage.tsx

**Files:**
- Modify: `src/pages/nouveautes/NouveautesPage.tsx`

- [ ] **Step 1 : Remplacer l'import**

```typescript
// AVANT (ligne 6-7)
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'

// APRÈS
import { getBooksByTypeAsync, searchBooksLocal } from '@/services/books'
import type { Universe, Book } from '@/data/mockBooks'
```

- [ ] **Step 2 : Ajouter state + useEffect dans `NouveautesPage()`**

Après les useState existants, ajouter :

```typescript
const [allNouveautes, setAllNouveautes] = useState<Book[]>([])

useEffect(() => {
  getBooksByTypeAsync('nouveaute').then(setAllNouveautes).catch(console.error)
}, [])
```

- [ ] **Step 3 : Mettre à jour le useMemo**

Trouver le useMemo qui utilise `getBooksByType` / `searchBooks` et appliquer le même pattern que FondsPage :

```typescript
// Remplacer les appels synchrones :
// searchBooks(deferred).filter(b => b.type === 'nouveaute')
// getBooksByType('nouveaute')
// par :
// searchBooksLocal(allNouveautes, deferred)
// [...allNouveautes]
// et ajouter allNouveautes dans les dépendances du useMemo
```

- [ ] **Step 4 : Vérifier TS clean + commit**

```bash
npx tsc --noEmit
git add src/pages/nouveautes/NouveautesPage.tsx
git commit -m "feat(db): NouveautesPage → Supabase (getBooksByTypeAsync)"
```

---

## Task 8 : Migrer AParaitrePage.tsx

**Files:**
- Modify: `src/pages/a-paraitre/AParaitrePage.tsx`

- [ ] **Step 1 : Remplacer l'import**

```typescript
// AVANT (lignes 5-6)
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'

// APRÈS
import { useState, useEffect } from 'react'  // ajouter useEffect si absent
import { getBooksByTypeAsync, searchBooksLocal } from '@/services/books'
import type { Universe, Book } from '@/data/mockBooks'
```

- [ ] **Step 2 : Ajouter state + useEffect dans `AParaitrePage()`**

```typescript
const [allAParaitre, setAllAParaitre] = useState<Book[]>([])

useEffect(() => {
  getBooksByTypeAsync('a-paraitre').then(setAllAParaitre).catch(console.error)
}, [])
```

- [ ] **Step 3 : Mettre à jour le useMemo**

Même pattern : remplacer les appels `getBooksByType('a-paraitre')` par `[...allAParaitre]` et `searchBooks(...)` par `searchBooksLocal(allAParaitre, deferred)`.

- [ ] **Step 4 : Vérifier TS clean + commit**

```bash
npx tsc --noEmit
git add src/pages/a-paraitre/AParaitrePage.tsx
git commit -m "feat(db): AParaitrePage → Supabase (getBooksByTypeAsync)"
```

---

## Task 9 : Migrer TopVentesPage.tsx

**Files:**
- Modify: `src/pages/top-ventes/TopVentesPage.tsx`

- [ ] **Step 1 : Remplacer l'import**

```typescript
// AVANT (ligne 7)
import { MOCK_BOOKS, type Book, type Universe } from '@/data/mockBooks'

// APRÈS
import { getAllBooksAsync } from '@/services/books'
import type { Book, Universe } from '@/data/mockBooks'
```

- [ ] **Step 2 : Modifier `getSection` pour accepter un tableau de livres**

```typescript
// AVANT (ligne ~69-75)
function getSection(type: 'nouveaute' | 'fonds', universe: TabView) {
  const base = MOCK_BOOKS.filter(b =>
    b.type === type &&
    (universe === 'tous' || b.universe === universe)
  )
  return getRankedBooks(base)
}

// APRÈS
function getSection(books: Book[], type: 'nouveaute' | 'fonds', universe: TabView) {
  const base = books.filter(b =>
    b.type === type &&
    (universe === 'tous' || b.universe === universe)
  )
  return getRankedBooks(base)
}
```

- [ ] **Step 3 : Ajouter state + useEffect dans `TopVentesPage()`**

```typescript
const [allBooks, setAllBooks] = useState<Book[]>([])

useEffect(() => {
  getAllBooksAsync().then(setAllBooks).catch(console.error)
}, [])
```

- [ ] **Step 4 : Mettre à jour les appels à `getSection`**

```typescript
// AVANT
const nouveautes = getSection('nouveaute', activeTab)
const fonds      = getSection('fonds',     activeTab)

// APRÈS
const nouveautes = getSection(allBooks, 'nouveaute', activeTab)
const fonds      = getSection(allBooks, 'fonds',     activeTab)
```

- [ ] **Step 5 : Vérifier TS clean + commit**

```bash
npx tsc --noEmit
git add src/pages/top-ventes/TopVentesPage.tsx
git commit -m "feat(db): TopVentesPage → Supabase (getAllBooksAsync)"
```

---

## Task 10 : Migrer FicheProduitPage.tsx

**Files:**
- Modify: `src/pages/catalogue/FicheProduitPage.tsx`

- [ ] **Step 1 : Remplacer l'import**

```typescript
// AVANT (ligne 6)
import { getBookById, MOCK_BOOKS } from '@/data/mockBooks'

// APRÈS
import { getBookByIdAsync, getBooksByTypeAsync } from '@/services/books'
import type { Book } from '@/data/mockBooks'
```

- [ ] **Step 2 : Remplacer la logique de fetch dans le composant principal**

Trouver dans le composant (`FicheProduitPage`) la ligne `const book = id ? getBookById(id) : undefined` (environ ligne 1340).

Remplacer par :

```typescript
const [book, setBook]           = useState<Book | null>(null)
const [bookLoading, setBookLoading] = useState(true)
const [similar, setSimilar]     = useState<Book[]>([])

useEffect(() => {
  if (!id) { setBookLoading(false); return }
  setBookLoading(true)
  setBook(null)
  setSimilar([])
  getBookByIdAsync(id).then(b => {
    setBook(b)
    setBookLoading(false)
    if (b) {
      getBooksByTypeAsync(b.type as Book['type']).then(all => {
        setSimilar(all.filter(x => x.universe === b.universe && x.id !== b.id).slice(0, 7))
      })
    }
  }).catch(() => setBookLoading(false))
}, [id])
```

- [ ] **Step 3 : Mettre à jour le guard `if (!book)`**

```typescript
// AVANT
if (!book) {
  return (
    <Page>
      <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>
      <NotFoundBox>...</NotFoundBox>
    </Page>
  )
}

// APRÈS — ajouter le loading state avant
if (bookLoading) {
  return <Page style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><span style={{ color: '#6B6B68', fontFamily: 'Open Sans, sans-serif' }}>Chargement…</span></Page>
}
if (!book) {
  return (
    <Page>
      <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>
      <NotFoundBox>...</NotFoundBox>
    </Page>
  )
}
```

- [ ] **Step 4 : Remplacer MOCK_BOOKS.filter (livres similaires)**

```typescript
// AVANT (ligne ~1492)
const similar = MOCK_BOOKS.filter(b => b.universe === book.universe && b.id !== book.id).slice(0, 7)

// APRÈS — supprimer cette ligne, `similar` vient du useState
// (vérifier que `similar` est bien utilisé dans le JSX)
```

- [ ] **Step 5 : Vérifier TS clean + commit**

```bash
npx tsc --noEmit
git add src/pages/catalogue/FicheProduitPage.tsx
git commit -m "feat(db): FicheProduitPage → Supabase (getBookByIdAsync)"
```

---

## Task 11 : Migrer RecherchePage.tsx

**Files:**
- Modify: `src/pages/search/RecherchePage.tsx`

- [ ] **Step 1 : Remplacer l'import**

```typescript
// AVANT (ligne 4)
import { MOCK_BOOKS, PRICE_RANGES, type Book, type Universe } from '@/data/mockBooks'

// APRÈS
import { getAllBooksAsync, searchBooksLocal } from '@/services/books'
import { PRICE_RANGES, type Book, type Universe } from '@/data/mockBooks'
```

- [ ] **Step 2 : Ajouter state + useEffect dans `RecherchePage()`**

Ajouter après les useState existants :

```typescript
const [allBooks, setAllBooks] = useState<Book[]>([])

useEffect(() => {
  getAllBooksAsync().then(setAllBooks).catch(console.error)
}, [])
```

- [ ] **Step 3 : Mettre à jour `searchCatalog`**

```typescript
// AVANT (lignes 21-31) — fonction module-level qui lit MOCK_BOOKS
function searchCatalog(query: string): Book[] {
  const q = normalise(query.trim())
  if (!q) return []
  return MOCK_BOOKS.filter(b => ...)
}

// APRÈS — convertir en fonction pure qui accepte le catalogue
function searchCatalog(catalog: Book[], query: string): Book[] {
  const q = normalise(query.trim())
  if (!q) return []
  return catalog.filter(b =>
    normalise(b.title).includes(q) ||
    b.authors.some(a => normalise(a).includes(q)) ||
    normalise(b.publisher).includes(q) ||
    (b.collection && normalise(b.collection).includes(q)) ||
    b.isbn.includes(q.replace(/[\s-]/g, ''))
  )
}
```

- [ ] **Step 4 : Mettre à jour tous les appels à `MOCK_BOOKS` dans le composant**

```typescript
// Ligne ~454 — ISBN redirect
const found = allBooks.find(b => b.isbn === isbn)

// Ligne ~462 — résultats catalogue
let books = q ? searchCatalog(allBooks, q) : [...allBooks]

// Ligne ~488 — ISBN hors catalogue
!allBooks.find(b => b.isbn === q.replace(/[\s-]/g, ''))
```

- [ ] **Step 5 : Vérifier TS clean + commit**

```bash
npx tsc --noEmit
git add src/pages/search/RecherchePage.tsx
git commit -m "feat(db): RecherchePage → Supabase (getAllBooksAsync)"
```

---

## Task 12 : Migrer SelectionsPage.tsx

**Files:**
- Modify: `src/pages/selections/SelectionsPage.tsx`

- [ ] **Step 1 : Remplacer l'import**

```typescript
// AVANT (ligne 5)
import { MOCK_BOOKS, UNIVERSES, type Universe } from '@/data/mockBooks'

// APRÈS
import { getAllBooksAsync } from '@/services/books'
import { UNIVERSES, type Universe, type Book } from '@/data/mockBooks'
```

- [ ] **Step 2 : Ajouter state + useEffect dans le composant principal**

```typescript
const [allBooks, setAllBooks] = useState<Book[]>([])

useEffect(() => {
  getAllBooksAsync().then(setAllBooks).catch(console.error)
}, [])
```

- [ ] **Step 3 : Remplacer tous les appels `MOCK_BOOKS` par `allBooks`**

Chercher dans le fichier :
- `MOCK_BOOKS.some(...)` → `allBooks.some(...)`
- `MOCK_BOOKS.find(...)` → `allBooks.find(...)`
- `.map(id => MOCK_BOOKS.find(...))` → `.map(id => allBooks.find(...))`

S'assurer que le `useState<Book[]>([])` est importé et que `allBooks` est dans les dépendances des `useMemo` / `useCallback` qui l'utilisent.

- [ ] **Step 4 : Vérifier TS clean + lancer tous les tests**

```bash
npx tsc --noEmit
npx vitest run
```

Résultat attendu : TS clean, 164/165 tests passants (1 pre-existing failure inchangé).

- [ ] **Step 5 : Commit final**

```bash
git add src/pages/selections/SelectionsPage.tsx
git commit -m "feat(db): SelectionsPage → Supabase (getAllBooksAsync)"
```

---

## Vérification finale

- [ ] Lancer le dev server : `npm run dev`
- [ ] Naviguer sur FondsPage → vérifier que les livres s'affichent depuis Supabase
- [ ] Naviguer sur une FicheProduitPage → vérifier le chargement + livres similaires
- [ ] Tester la recherche sur RecherchePage
- [ ] `npx tsc --noEmit` → aucune erreur
- [ ] `npx vitest run` → 164/165 (1 failure pre-existing)
