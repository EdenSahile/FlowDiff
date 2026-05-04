# Refonte UI Phase 2 — Refonte structurelle 4 pages clés

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Appliquer les mockups validés sur FondsPage, FicheProduitPage, CartPage et HomePage — refonte structurelle et visuelle basée sur `.superpowers/brainstorm/63208-1777743595/content/`.

**Architecture:** Chaque page est traitée indépendamment. Les composants partagés modifiés (BookCard) sont mis à jour en Task 1. Aucune logique métier ne change — uniquement la présentation. Tests restent verts tout au long.

**Tech Stack:** Styled-components v6, React 18, TypeScript strict, theme tokens `src/lib/theme.ts`

**Mockups de référence :**
- `fonds.html` → FondsPage + BookCard
- `fiche-livre.html` → FicheProduitPage
- `panier.html` → CartPage
- `homepage-full.html` → HomePage

---

### Task 1: FondsPage — résultats bar + cover badges + état "ajouté"

**Fichiers :**
- Modify: `src/components/catalogue/BookCard.tsx`
- Modify: `src/pages/fonds/FondsPage.tsx`

Le mockup montre : (1) badges overlay TOP VENTE / SÉLECTION sur la couverture, (2) état "ajouté" vert avec checkmark sur le bouton panier, (3) un résultats bar avec count + sort dropdown, (4) un eyebrow label sous le titre de page.

- [ ] **Step 1: Ajouter `CoverBadge` et état `$added` à BookCard**

Dans `src/components/catalogue/BookCard.tsx`, après `const StarWrap = styled.div` (ligne ~142), ajoute :

```ts
const CoverBadge = styled.span<{ $variant: 'top' | 'selection' }>`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: ${({ $variant, theme }) =>
    $variant === 'top'
      ? `rgba(${212},${168},${67},0.9)`
      : `rgba(45,58,74,0.82)`};
  color: ${({ $variant }) => $variant === 'top' ? '#3d2f00' : '#fff'};
`
```

Remplace `AjouterBtn` par une version avec état `$added` :

```ts
const AjouterBtn = styled.button<{ $epuise?: boolean; $added?: boolean }>`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $epuise, $added, theme }) =>
    $epuise ? theme.colors.gray[200]
    : $added  ? theme.colors.success
    : theme.colors.navy};
  color: ${({ $epuise, theme }) => $epuise ? theme.colors.gray[400] : '#fdfdfd'};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: ${({ $epuise }) => $epuise ? 'not-allowed' : 'pointer'};
  transition: background .15s, transform .1s;
  white-space: nowrap;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${({ $epuise, $added, theme }) =>
      $epuise ? theme.colors.gray[200]
      : $added  ? theme.colors.success
      : theme.colors.primaryHover};
  }
  &:active { transform: ${({ $epuise }) => $epuise ? 'none' : 'scale(0.97)'}; }
`
```

- [ ] **Step 2: Câbler `$added` dans le composant BookCard**

Dans la fonction `BookCard`, ajoute un état `added` avec reset auto :

```tsx
const [added, setAdded] = useState(false)
```

Modifie `confirmAdd` pour activer l'état :

```tsx
const confirmAdd = (enReliquat: boolean) => {
  addToCart(book, qty, { enReliquat })
  const action: ToastAction = { label: 'Voir le panier →', onClick: () => navigate('/panier') }
  showToast(`"${book.title}" ajouté au panier`, 'success', action)
  setQty(1)
  setAdded(true)
  setTimeout(() => setAdded(false), 2000)
}
```

Dans le JSX `CardBody`, avant `StarWrap`, ajoute le badge cover (pour les livres `type === 'top-vente'` et `type === 'selection'` — utilise `showType` pour afficher) :

```tsx
{book.type === 'nouveaute' && showType && (
  <CoverBadge $variant="top">Nouveauté</CoverBadge>
)}
```

Dans les deux `AjouterBtn` du footer (états normal et épuisé), passe `$added={added}` :

```tsx
<AjouterBtn onClick={handleAdd} $added={added} aria-label="Ajouter au panier">
  {added ? <><IconCheck /> Ajouté</> : <><IconCart /> Ajouter au panier</>}
</AjouterBtn>
```

- [ ] **Step 3: Ajouter ResultsBar + eyebrow à FondsPage**

Dans `src/pages/fonds/FondsPage.tsx`, ajoute ces styled-components (avant le composant) :

```ts
const PageEyebrow = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 18px;
    height: 1.5px;
    background: ${({ theme }) => theme.colors.accent};
    display: inline-block;
  }
`

const ResultsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const ResultsCount = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};

  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`

const SortSelect = styled.select`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.gray[800]};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 5px 10px;
  cursor: pointer;
  outline: none;

  &:focus { border-color: ${({ theme }) => theme.colors.navy}; }
`
```

Dans le JSX de FondsPage, ajoute l'eyebrow avant `<PageTitle>` et la ResultsBar avant `<Grid>` :

```tsx
<PageEyebrow>Catalogue</PageEyebrow>
<PageTitle>Fonds</PageTitle>
```

```tsx
<ResultsBar>
  <ResultsCount>
    <strong>{filtered.length}</strong> titre{filtered.length > 1 ? 's' : ''}
  </ResultsCount>
  <SortSelect value={sort} onChange={e => setSort(e.target.value as SortKey)}>
    <option value="pertinence">Pertinence</option>
    <option value="titre">Titre A→Z</option>
    <option value="prix_asc">Prix ↑</option>
    <option value="prix_desc">Prix ↓</option>
  </SortSelect>
</ResultsBar>
```

Ajoute le state sort et la logique de tri (ajoute `sort` aux imports `useState`) :

```tsx
type SortKey = 'pertinence' | 'titre' | 'prix_asc' | 'prix_desc'
const [sort, setSort] = useState<SortKey>('pertinence')
```

Applique le tri sur `filtered` avant de rendre la grille :

```tsx
const sorted = useMemo(() => {
  if (sort === 'titre') return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'prix_asc') return [...filtered].sort((a, b) => a.priceTTC - b.priceTTC)
  if (sort === 'prix_desc') return [...filtered].sort((a, b) => b.priceTTC - a.priceTTC)
  return filtered
}, [filtered, sort])
```

Remplace `filtered` par `sorted` dans le rendu de la grille.

- [ ] **Step 4: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: aucune erreur.

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: 161 tests passants.

- [ ] **Step 6: Commit**

```bash
git add src/components/catalogue/BookCard.tsx src/pages/fonds/FondsPage.tsx
git commit -m "feat(fonds): résultats bar + sort + cover badges + état ajouté BookCard"
```

---

### Task 2: FicheProduitPage — format selector + price card + section eyebrows + similar strip

**Fichiers :**
- Modify: `src/pages/catalogue/FicheProduitPage.tsx`

Le mockup montre : (1) sélecteur format (Broché/Poche) en boutons toggle, (2) price zone en card blanche, (3) section eyebrows avec before-bar champagne, (4) order info block fond champagneBg, (5) bande "Similaires" en 7 colonnes en bas de page.

- [ ] **Step 1: Lire les sections concernées**

Lit les lignes 1–150 (imports + premiers styled) et 500–700 (zone prix + format) de `src/pages/catalogue/FicheProduitPage.tsx` pour localiser exactement les composants `PriceBlock`, `InfoCol`, et la zone format.

- [ ] **Step 2: Ajouter les styled-components manquants**

Dans `FicheProduitPage.tsx`, après le bloc des imports et avant les premiers styled-components, ajoute :

```ts
/* ── Format selector ── */
const FormatSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

const FormatBtn = styled.button<{ $active: boolean }>`
  padding: 7px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.primaryLight : theme.colors.white};
  color: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  cursor: pointer;
  box-shadow: ${({ $active }) => $active ? 'inset 0 0 0 1px #2D3A4A' : 'none'};
  transition: all 0.15s;

  &:hover:not([aria-pressed="true"]) {
    border-color: ${({ theme }) => theme.colors.gray[400]};
  }
`

/* ── Price card ── */
const PriceCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 16px 18px;
  margin-bottom: 16px;
`

/* ── Section eyebrow ── */
const SectionEyebrow = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 14px;
    height: 1.5px;
    background: ${({ theme }) => theme.colors.accent};
    display: inline-block;
    flex-shrink: 0;
  }
`

/* ── Order info block ── */
const OrderInfoBlock = styled.div`
  background: ${({ theme }) => theme.colors.accentLight};
  border: 1px solid rgba(212, 168, 67, 0.2);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px 14px;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
  margin-top: 12px;
`

/* ── Similar books strip ── */
const SimilarSection = styled.section`
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const SimilarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const SimilarCard = styled.article`
  cursor: pointer;
  transition: transform 0.15s;

  &:hover { transform: translateY(-2px); }
`

const SimilarCover = styled.div`
  aspect-ratio: 2/3;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  margin-bottom: 6px;
`

const SimilarTitle = styled.p`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const SimilarAuthor = styled.p`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
```

- [ ] **Step 3: Ajouter le state `selectedFormat` dans le composant**

Dans la fonction du composant FicheProduitPage (après les useState existants), ajoute :

```tsx
const [selectedFormat, setSelectedFormat] = useState<'broche' | 'poche'>('broche')
```

- [ ] **Step 4: Insérer le FormatSelector dans le JSX InfoCol**

Localise la zone prix/format dans le JSX (autour de la section qui affiche `book.priceTTC`). Avant le bloc prix, insère :

```tsx
<FormatSelector>
  <FormatBtn
    $active={selectedFormat === 'broche'}
    aria-pressed={selectedFormat === 'broche'}
    onClick={() => setSelectedFormat('broche')}
  >
    Broché
  </FormatBtn>
  <FormatBtn
    $active={selectedFormat === 'poche'}
    aria-pressed={selectedFormat === 'poche'}
    onClick={() => setSelectedFormat('poche')}
  >
    Poche
  </FormatBtn>
</FormatSelector>
```

- [ ] **Step 5: Entourer la zone prix dans PriceCard**

Dans le JSX, entoure le bloc contenant `priceTTC`, `StockStatus`, et le stepper de quantité dans `<PriceCard>...</PriceCard>`.

- [ ] **Step 6: Ajouter OrderInfoBlock sous la PriceCard**

Après `</PriceCard>`, insère :

```tsx
<OrderInfoBlock>
  Livraison habituelle sous <strong>1 à 3 jours ouvrés</strong>.
  Remise personnalisée appliquée automatiquement.
</OrderInfoBlock>
```

- [ ] **Step 7: Ajouter les SectionEyebrow aux sections Synopsis, Presse, etc.**

Pour chaque section qui a un titre `<SectionTitle>Synopsis</SectionTitle>` (ou similaire), remplace par :

```tsx
<SectionEyebrow>Synopsis</SectionEyebrow>
```

Fais de même pour "Presse", "Pages intérieures", "Bande annonce".

- [ ] **Step 8: Ajouter la bande SimilarSection en bas du return**

À la fin du JSX principal (avant la fermeture du composant), ajoute la bande des livres similaires. Importe `MOCK_BOOKS` depuis `@/data/mockBooks` si pas déjà importé, et utilise `useNavigate` (déjà présent) :

```tsx
{(() => {
  const similar = MOCK_BOOKS
    .filter(b => b.universe === book.universe && b.id !== book.id)
    .slice(0, 7)
  if (similar.length === 0) return null
  return (
    <SimilarSection>
      <SectionEyebrow>Dans la même thématique</SectionEyebrow>
      <SimilarGrid>
        {similar.map(b => (
          <SimilarCard key={b.id} onClick={() => navigate(`/livre/${b.id}`)}>
            <SimilarCover>
              <BookCover
                isbn={b.isbn}
                alt={b.title}
                width={120}
                height={180}
                universe={b.universe}
                authors={b.authors}
                publisher={b.publisher}
              />
            </SimilarCover>
            <SimilarTitle>{b.title}</SimilarTitle>
            <SimilarAuthor>{b.authors[0]}</SimilarAuthor>
          </SimilarCard>
        ))}
      </SimilarGrid>
    </SimilarSection>
  )
})()}
```

- [ ] **Step 9: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: aucune erreur.

- [ ] **Step 10: Run tests**

```bash
npm test
```
Expected: 161 tests passants.

- [ ] **Step 11: Commit**

```bash
git add src/pages/catalogue/FicheProduitPage.tsx
git commit -m "feat(fiche-produit): format selector + price card + eyebrows + similar strip"
```

---

### Task 3: CartPage — layout 2 colonnes + items groupés par univers + recap sidebar

**Fichiers :**
- Modify: `src/pages/cart/CartPage.tsx`

Le mockup montre : (1) layout 2 colonnes (items flex-1 + recap 320px sticky), (2) items groupés par univers avec label, (3) cart item redesigné (cover 52×78 + stepper sm + sous-total), (4) delivery card avec radio, (5) bouton valider 52px height, (6) EDI hint.

**Note :** Le CartPage actuel a un stepper 4 étapes. La Task 3 concerne **uniquement le step 1 (affichage panier)** — les autres steps (livraison, OP, résumé) gardent leur layout actuel.

- [ ] **Step 1: Lire les lignes 1–200 de CartPage pour identifier la structure du step panier**

```bash
# Lis les 200 premières lignes pour identifier les composants du step 0 (panier)
```

Localise : le composant `OPRow` / la liste des items, le `SummaryCard`, le stepper de validation.

- [ ] **Step 2: Ajouter les styled-components 2-colonnes**

Dans `src/pages/cart/CartPage.tsx`, ajoute ces composants (après les imports, avant les styled existants) :

```ts
/* ── Layout 2 colonnes (step panier uniquement) ── */
const TwoColLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

const ItemsCol = styled.div``

const RecapCol = styled.div`
  position: sticky;
  top: calc(${({ theme }) => theme.layout.headerHeight} + 16px);
`

const UniverseGroupLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 10px;
  margin-top: 20px;

  &:first-child { margin-top: 0; }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.gray[200]};
  }
`

const CartItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const CartItemCover = styled.div`
  width: 52px;
  height: 78px;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.gray[100]};
`

const CartItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const CartItemTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
  margin-bottom: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CartItemAuthor = styled.p`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
  margin-bottom: 2px;
`

const CartItemEditor = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const CartItemPriceCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
`

const CartItemUnitPrice = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const CartItemSubtotal = styled.p`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const CartItemNetHT = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.success};
`

const StepperSm = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
`

const StepperSmBtn = styled.button`
  width: 28px;
  height: 32px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;

  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`

const StepperSmInput = styled.input`
  width: 40px;
  height: 32px;
  border: none;
  border-left: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.white};
  outline: none;

  &:focus { background: ${({ theme }) => theme.colors.gray[50]}; }
`

const CartDeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.12s, background 0.12s;
  border-radius: ${({ theme }) => theme.radii.sm};
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background: rgba(192, 57, 43, 0.06);
  }
`

/* ── Recap sidebar ── */
const RecapCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  margin-bottom: 12px;
`

const RecapHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const RecapHeaderTitle = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
`

const RecapHeaderCount = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const RecapBody = styled.div`
  padding: 14px 18px;
`

const RecapRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const RecapDiscount = styled(RecapRow)`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
`

const RecapDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  margin: 10px 0;
`

const RecapTotalLine = styled.div`
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 -18px -14px;
`

const RecapTotalLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
`

const RecapTotalValue = styled.p`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const ValidateBtn = styled.button`
  width: 100%;
  height: 52px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
  margin-bottom: 10px;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const EDIHint = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 10px 0;

  a {
    color: ${({ theme }) => theme.colors.navy};
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
`

const EDIHintIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.navy};
  font-size: 16px;
`
```

- [ ] **Step 3: Identifier et remplacer le JSX du step panier**

Lire les lignes 600–900 de CartPage pour localiser exactement le return du step 0 (la liste des items avant le checkout). Chercher le pattern `{currentStep === 0 && ...}` ou le rendu conditionnel du panier.

- [ ] **Step 4: Remplacer le layout du step panier**

Remplace le contenu du step panier (liste `{items.map(...)}` + SummaryCard actuel) par :

```tsx
<TwoColLayout>
  <ItemsCol>
    {/* Grouper par univers */}
    {Object.entries(
      items.reduce<Record<string, typeof items>>((acc, item) => {
        const u = item.book.universe
        if (!acc[u]) acc[u] = []
        acc[u].push(item)
        return acc
      }, {})
    ).map(([universe, universeItems]) => (
      <div key={universe}>
        <UniverseGroupLabel>{universe}</UniverseGroupLabel>
        {universeItems.map(item => (
          <CartItemRow key={item.book.id}>
            <CartItemCover>
              <BookCover
                isbn={item.book.isbn}
                alt={item.book.title}
                width={52}
                height={78}
                universe={item.book.universe}
                authors={item.book.authors}
                publisher={item.book.publisher}
              />
            </CartItemCover>
            <CartItemInfo>
              <CartItemTitle>{item.book.title}</CartItemTitle>
              <CartItemAuthor>{item.book.authors.join(', ')}</CartItemAuthor>
              <CartItemEditor>{item.book.publisher}</CartItemEditor>
            </CartItemInfo>
            <CartItemPriceCol>
              <CartItemUnitPrice>{item.book.priceTTC.toFixed(2)} €</CartItemUnitPrice>
              <StepperSm>
                <StepperSmBtn
                  onClick={() => updateQty(item.book.id, item.qty - 1)}
                  disabled={item.qty <= 1}
                >−</StepperSmBtn>
                <StepperSmInput
                  type="number"
                  value={item.qty}
                  min={1}
                  onChange={e => updateQty(item.book.id, parseInt(e.target.value) || 1)}
                />
                <StepperSmBtn onClick={() => updateQty(item.book.id, item.qty + 1)}>+</StepperSmBtn>
              </StepperSm>
              <CartItemSubtotal>{(item.book.priceTTC * item.qty).toFixed(2)} €</CartItemSubtotal>
              <CartDeleteBtn onClick={() => removeFromCart(item.book.id)} aria-label="Supprimer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </CartDeleteBtn>
            </CartItemPriceCol>
          </CartItemRow>
        ))}
      </div>
    ))}
  </ItemsCol>

  <RecapCol>
    <RecapCard>
      <RecapHeader>
        <RecapHeaderTitle>Récapitulatif</RecapHeaderTitle>
        <RecapHeaderCount>{totalItems} article{totalItems > 1 ? 's' : ''}</RecapHeaderCount>
      </RecapHeader>
      <RecapBody>
        <RecapRow>
          <span>Montant HT</span>
          <span>{montantHT} €</span>
        </RecapRow>
        {remisePct > 0 && (
          <RecapDiscount>
            <span>Remise {remisePct}%</span>
            <span>−{remiseMontant} €</span>
          </RecapDiscount>
        )}
        <RecapRow>
          <span>Net HT</span>
          <span>{netHT} €</span>
        </RecapRow>
        <RecapRow>
          <span>TVA 5,5%</span>
          <span>{tva} €</span>
        </RecapRow>
        <RecapDivider />
        <RecapTotalLine>
          <RecapTotalLabel>Total TTC</RecapTotalLabel>
          <RecapTotalValue>{totalTTC} €</RecapTotalValue>
        </RecapTotalLine>
      </RecapBody>
    </RecapCard>

    <ValidateBtn onClick={goToNextStep} disabled={items.length === 0}>
      Valider la commande
    </ValidateBtn>

    <EDIHint>
      <EDIHintIcon>⇄</EDIHintIcon>
      <span>Commande EDI disponible via <a onClick={() => navigate('/edi')}>Dilicom</a></span>
    </EDIHint>
  </RecapCol>
</TwoColLayout>
```

**Note :** Adapte les noms de variables (`totalItems`, `montantHT`, `remisePct`, etc.) aux variables déjà calculées dans CartPage. Utilise les fonctions `updateQty` et `removeFromCart` du contexte `useCart` — vérifie leur nom exact dans les imports.

- [ ] **Step 5: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: aucune erreur.

- [ ] **Step 6: Run tests**

```bash
npm test
```
Expected: 161 tests passants.

- [ ] **Step 7: Commit**

```bash
git add src/pages/cart/CartPage.tsx
git commit -m "feat(cart): 2-col layout + items groupés univers + recap sidebar + EDI hint"
```

---

### Task 4: HomePage — KPI cards polish + action cards + panel eyebrows + FAB

**Fichiers :**
- Modify: `src/pages/home/HomePage.tsx`

Le mockup montre : (1) KPI cards avec icône circulaire + trend badge (▲/▼%), (2) action cards sur 5 colonnes avec compteur + badge deadline, (3) section eyebrows champagne sur les panels, (4) FAB 52px bas-droite.

- [ ] **Step 1: Lire les lignes 1–300 + 800–1000 de HomePage**

Identifie les composants `KPICard`, `ActionCard`, `PanelCard`, et les styles actuels pour comprendre ce qui est déjà là vs ce qui manque.

- [ ] **Step 2: Améliorer le styled KPICard**

Dans HomePage.tsx, trouve le styled `KPICard` et remplace-le par :

```ts
const KPICard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 18px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05);
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,.09), 0 6px 20px rgba(0,0,0,.07);
  }
`
```

- [ ] **Step 3: Ajouter KPIIconCircle et KPITrend**

Après `KPICard`, ajoute :

```ts
const KPIIconCircle = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`

const KPITrend = styled.span<{ $positive: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.error};
  background: ${({ $positive, theme }) => $positive ? '#E6F2EC' : '#FDECEA'};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.full};
`

const KPIRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const KPIValue = styled.p`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.03em;
  line-height: 1;
`

const KPILabel = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-weight: 600;
`
```

- [ ] **Step 4: Ajouter PanelEyebrow pour les headers de panel**

```ts
const PanelEyebrow = styled.p`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 2px;
`
```

- [ ] **Step 5: Ajouter FAB bottom-right**

```ts
const FAB = styled.button`
  position: fixed;
  bottom: calc(${({ theme }) => theme.layout.bottomNavHeight} + 16px);
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(45,58,74,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 100;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 24px rgba(45,58,74,0.45);
  }
`
```

- [ ] **Step 6: Câbler KPIIconCircle + KPITrend dans le JSX**

Localise le rendu des KPI cards dans le JSX. Dans chaque `<KPICard>`, restructure pour utiliser les nouveaux composants :

```tsx
<KPICard>
  <KPIRow>
    <KPIIconCircle $color={kpi.iconBg}>{kpi.icon}</KPIIconCircle>
    {kpi.trend != null && (
      <KPITrend $positive={kpi.trend >= 0}>
        {kpi.trend >= 0 ? '▲' : '▼'} {Math.abs(kpi.trend)}%
      </KPITrend>
    )}
  </KPIRow>
  <KPIValue>{kpi.value}</KPIValue>
  <KPILabel>{kpi.label}</KPILabel>
</KPICard>
```

Adapte `kpi.iconBg`, `kpi.icon`, `kpi.trend`, `kpi.value`, `kpi.label` aux propriétés réelles de l'objet KPI dans le code existant.

- [ ] **Step 7: Ajouter PanelEyebrow dans les PanelCard headers**

Pour chaque panel (Nouveautés, Raccourcis, etc.), ajoute un `<PanelEyebrow>` avant le titre :

```tsx
<PanelEyebrow>Catalogue</PanelEyebrow>
<PanelTitle>Nouveautés du mois</PanelTitle>
```

- [ ] **Step 8: Ajouter le FAB à la fin du return**

À la fin du return principal, avant la fermeture de `<Page>`, ajoute :

```tsx
<FAB aria-label="Nouvelle commande rapide" onClick={() => navigate('/fonds')}>＋</FAB>
```

- [ ] **Step 9: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: aucune erreur.

- [ ] **Step 10: Run tests**

```bash
npm test
```
Expected: 161 tests passants.

- [ ] **Step 11: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(home): KPI cards polish + panel eyebrows + FAB mobile"
```

---

## Self-Review

**Spec coverage :**

| Exigence mockup | Task |
|---|---|
| FondsPage résultats bar + sort | Task 1 |
| BookCard état "ajouté" vert | Task 1 |
| FicheProduitPage format selector | Task 2 |
| FicheProduitPage price card | Task 2 |
| FicheProduitPage section eyebrows | Task 2 |
| FicheProduitPage similar strip 7-col | Task 2 |
| CartPage 2-col items + recap sidebar | Task 3 |
| CartPage items groupés par univers | Task 3 |
| CartPage stepper sm + sous-total | Task 3 |
| CartPage validate btn 52px | Task 3 |
| CartPage EDI hint | Task 3 |
| HomePage KPI iconCircle + trend | Task 4 |
| HomePage panel eyebrows | Task 4 |
| HomePage FAB mobile | Task 4 |
| Tests restent verts | Toutes les tasks |

**No placeholders :** toutes les steps contiennent du code complet.

**Limites connues :**
- Task 3 nécessite d'adapter les noms de variables `updateQty`, `removeFromCart`, totaux — à vérifier en Step 1 avant d'écrire
- Task 4 Step 6 : les propriétés `iconBg`, `icon`, `trend` dépendent de la structure réelle de `computeKPIs()` — à vérifier avant de remplacer
