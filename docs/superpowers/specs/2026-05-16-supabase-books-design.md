# Spec — Intégration Supabase : catalogue livres

**Date :** 2026-05-16  
**Périmètre :** Livres (catalogue, fiche produit, recherche) — Phase 1 de l'intégration Supabase  
**Auth :** Inchangée (demo mock JWT, pré-rempli, clic direct)  
**Hors périmètre :** Commandes, panier, libraires, auth Supabase — phases ultérieures

---

## Contexte

L'application BookFlow est une SPA Vite + React 18. Toutes les données livres sont actuellement en mémoire (`src/data/mockBooks.ts`). Prisma est installé avec un schéma PostgreSQL (`Libraire`, `Commande`, `LigneCommande`) mais non branché.

L'objectif de cette phase est de persister le catalogue livres dans Supabase (PostgreSQL managé) et de remplacer les imports mock par des appels réels via le client Supabase JS.

---

## Architecture cible

```
src/
├── lib/
│   └── supabase.ts          ← client singleton (@supabase/supabase-js)
├── services/
│   └── books.ts             ← fonctions fetch (getAllBooks, getBooksByType…)
prisma/
├── schema.prisma            ← modèle Livre ajouté
├── migrations/              ← SQL généré par prisma migrate dev
└── seed.ts                  ← insert des mock books existants
.env                         ← VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY + DATABASE_URL
```

---

## Schéma Prisma — modèle `Livre`

```prisma
model Livre {
  id              String    @id @default(cuid())
  isbn            String    @unique
  title           String
  authors         String[]
  publisher       String
  collection      String?
  universe        String
  type            String       // 'nouveaute' | 'a-paraitre' | 'fonds'
  price           Float
  priceTTC        Float
  format          String
  genre           String?
  language        String?   @default("Français")
  pages           Int?
  publicationDate String
  description     String
  programme       String?
  fictif          Boolean   @default(false)
  statut          String?   // 'disponible' | 'stock_limite' | 'sur_commande' | 'en_reimp' | 'epuise' | 'rupture'
  delaiReimp      String?
  topVente        Boolean   @default(false)
  selection       Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

Les champs correspondent exactement à l'interface `Book` de `mockBooks.ts`. Le champ `authors` utilise le type tableau PostgreSQL natif (`text[]`), supporté par Prisma sur PostgreSQL.

---

## Client Supabase

**`src/lib/supabase.ts`** — client singleton initialisé une seule fois.

Variables d'environnement requises dans `.env` :
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<project-ref>:<password>@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

`DIRECT_URL` est nécessaire pour les migrations Prisma (contourne PgBouncer).  
`VITE_*` sont exposées au front React par Vite.

---

## Service livres

**`src/services/books.ts`** expose :

| Fonction | Usage |
|----------|-------|
| `getAllBooks()` | FondsPage, RecherchePage |
| `getBooksByType(type)` | NouveautesPage (`nouveaute`), AParaitrePage (`a-paraitre`), FondsPage (`fonds`) |
| `getBookById(id)` | FicheProduitPage |
| `getTopVentes()` | TopVentesPage (`topVente = true`) |
| `getSelections()` | SelectionsPage (`selection = true`) |
| `searchBooks(query)` | RecherchePage (filtre titre / auteur / ISBN) |

Chaque fonction retourne `Promise<Book[]>` ou `Promise<Book | null>` et mappe le row Supabase vers le type `Book` existant pour éviter de changer les composants.

---

## Seed

**`prisma/seed.ts`** importe `_RAW_MOCK_BOOKS` depuis `src/data/mockBooks.ts` et insère via `@prisma/client` (connexion directe DATABASE_URL). À exécuter une fois via `npx ts-node prisma/seed.ts` (ou `tsx`).

---

## Gestion des états dans les pages

Chaque page migre de :
```tsx
const books = mockBooks.filter(...)
```
vers :
```tsx
const [books, setBooks] = useState<Book[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  getBooksByType('fonds')
    .then(setBooks)
    .catch(() => setError('Erreur de chargement'))
    .finally(() => setLoading(false))
}, [])
```

- **Loading** : skeleton existant (si présent) ou `null` (pas de spinner intrusif)
- **Error** : message discret en bas de page, style `gray.400`

---

## Pages impactées

| Page | Changement |
|------|------------|
| `FondsPage.tsx` | `getBooksByType('fonds')` |
| `NouveautesPage.tsx` | `getBooksByType('nouveaute')` |
| `AParaitrePage.tsx` | `getBooksByType('a-paraitre')` |
| `TopVentesPage.tsx` | `getTopVentes()` |
| `SelectionsPage.tsx` | `getSelections()` |
| `FicheProduitPage.tsx` | `getBookById(id)` |
| `RecherchePage.tsx` | `searchBooks(query)` + `getAllBooks()` |

---

## Ordre d'implémentation

1. **Setup** (toi) : créer projet Supabase, récupérer URL + keys
2. **Infrastructure** (Claude) : `.env`, install `@supabase/supabase-js`, `supabase.ts`
3. **Schéma** (Claude) : modèle Livre dans `schema.prisma`, migration SQL
4. **Migration** (toi) : coller le SQL dans le dashboard Supabase → SQL Editor → Run
5. **Seed** (Claude) : `prisma/seed.ts`, exécution
6. **Service** (Claude) : `src/services/books.ts`
7. **Pages** (Claude) : migration une par une dans l'ordre du tableau ci-dessus
8. **Nettoyage** (Claude) : supprimer les imports `mockBooks` inutilisés

---

## Ce qui ne change pas

- `mockBooks.ts` reste (utilisé par le seed + autres mocks non migrés)
- Auth demo inchangée
- `mockOrders`, `mockUsers`, `mockDashboard`, etc. — hors périmètre
- Tests existants non impactés (ils testent `computeTotals`, `isOrderable`, pas le fetch)
