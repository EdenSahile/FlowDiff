# Références de commande EDI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre au libraire d'associer une référence interne à sa commande (globale ou par article), incluse dans le segment EDIFACT `RFF+CR` et affichée dans l'historique.

**Architecture:** State local dans CartPage (`refMode`, `refGlobale`, `refsParLigne`), passé à `addOrder()` via deux nouveaux params optionnels. OrdersContext mappe les références sur `Order` et `OrderItem`. Le template EDIFACT ORDERS insère les segments `RFF+CR` conditionnellement.

**Tech Stack:** React 18, TypeScript strict, styled-components v6, Vite 5

---

## Fichiers modifiés

| Fichier | Nature |
|---------|--------|
| `src/data/mockOrders.ts` | types + mock data |
| `src/lib/ediUtils.ts` | types + template ORDERS |
| `src/contexts/OrdersContext.tsx` | addOrder params + implem |
| `src/pages/cart/CartPage.tsx` | UI section + state + confirm |
| `src/pages/historique/HistoriquePage.tsx` | badge RefBadge |

---

## Task 1 : Types — mockOrders.ts + ediUtils.ts

**Files:**
- Modify: `src/data/mockOrders.ts:42-78`
- Modify: `src/lib/ediUtils.ts:6-17`

- [ ] **Step 1 : Ajouter `referenceLigne` sur OrderItem**

Dans `src/data/mockOrders.ts`, après `enReliquat?: boolean` (ligne ~54) :

```ts
export interface OrderItem {
  bookId: string
  title: string
  author: string
  publisher: string
  isbn: string
  quantity: number
  unitPriceHT: number
  unitPriceTTC?: number
  universe: string
  typeCommande?: TypeCommande
  statut?: StockStatut
  enReliquat?: boolean
  referenceLigne?: string   // référence par article pour EDI
}
```

- [ ] **Step 2 : Ajouter `referenceCommande` sur Order**

Dans `src/data/mockOrders.ts`, après `ediStatus?` (ligne ~77) :

```ts
export interface Order {
  id: string
  numero: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  subtotalHT: number
  remiseAmount: number
  netHT: number
  tva: number
  totalTTC: number
  adresseLivraison: string
  codeClient: string
  commandePar?: string
  deliveryMode: 'standard' | 'specific'
  deliveryDate?: string
  dateFacturation?: string
  numFacture?: string
  shipment?: Shipment
  transmissionMode?: 'FLOWDIFF' | 'EDI'
  ediStatus?: 'PENDING' | 'SENT' | 'ACK' | 'ERROR'
  referenceCommande?: string   // référence globale pour EDI
}
```

- [ ] **Step 3 : Ajouter `referenceLigne` sur ORDERSLine et `referenceGlobale` sur ORDERSPayload**

Dans `src/lib/ediUtils.ts`, remplacer les interfaces (lignes 6-17) :

```ts
export interface ORDERSLine {
  lineNumber: number
  ean: string
  title: string
  qtyRequested: number
  referenceLigne?: string   // segment RFF+CR par ligne
}

export interface ORDERSPayload {
  orderId: string
  diffuseur: string
  lines: ORDERSLine[]
  referenceGlobale?: string   // segment RFF+CR global
}
```

- [ ] **Step 4 : Vérifier TS**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 5 : Commit**

```bash
git add src/data/mockOrders.ts src/lib/ediUtils.ts
git commit -m "feat(refs-cmd): types referenceLigne/referenceGlobale sur Order, OrderItem, ORDERSLine, ORDERSPayload"
```

---

## Task 2 : Mock data — CMD0000013 avec référence

**Files:**
- Modify: `src/data/mockOrders.ts:87-130`

- [ ] **Step 1 : Ajouter referenceCommande sur CMD0000013**

Dans `src/data/mockOrders.ts`, dans l'objet `CMD0000013` (id: 'ord-001'), ajouter après `ediStatus` ou après `deliveryMode` :

```ts
{
  id: 'ord-001',
  numero: 'CMD0000013',
  date: '2026-05-25',
  status: 'en préparation',
  codeClient: 'LIB001',
  commandePar: 'Marc Dupont',
  adresseLivraison: '12 rue du Parc, 75001 Paris',
  deliveryMode: 'standard',
  referenceCommande: 'BC-2026-0412',   // ← ajouté
  items: [ ... ]
  ...
}
```

- [ ] **Step 2 : Vérifier TS**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/data/mockOrders.ts
git commit -m "feat(refs-cmd): mock CMD0000013 avec referenceCommande BC-2026-0412"
```

---

## Task 3 : Template EDIFACT ORDERS — segments RFF+CR

**Files:**
- Modify: `src/lib/ediUtils.ts:278-298`

- [ ] **Step 1 : Remplacer le template ORDERS**

Dans `src/lib/ediUtils.ts`, remplacer le bloc `ORDERS: (msg) => {` (lignes 278-298) par :

```ts
ORDERS: (msg) => {
  const p = msg.payload as Partial<ORDERSPayload> & { totalQty?: number }
  const header = [
    `UNB+UNOA:1+301234XXXXXXX:14+GLN-DIFFUSEUR:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+ORDERS:D:96A:UN'`,
    `BGM+220+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `NAD+BY+301234XXXXXXX::9'`,
    `NAD+SU+GLN-DIFFUSEUR::9'`,
    ...(p.referenceGlobale ? [`RFF+CR:${p.referenceGlobale}'`] : []),
  ]
  const lineSegments = Array.isArray(p.lines)
    ? p.lines.flatMap((line, i) => [
        `LIN+${i + 1}++${line.ean}:EN'`,
        `QTY+21:${line.qtyRequested}'`,
        ...(line.referenceLigne ? [`RFF+CR:${line.referenceLigne}'`] : []),
      ])
    : [`LIN+1++9782070360024:EN'`, `QTY+21:${p.totalQty ?? 5}'`]
  // UNT compte de UNH à UNT inclus : (header.length - 1 pour UNB) + lineSegments.length + UNS + UNT
  const untCount = header.length + lineSegments.length + 1
  const footer = [`UNS+S'`, `UNT+${untCount}+1'`, `UNZ+1+1'`]
  return [...header, ...lineSegments, ...footer].join('\n')
},
```

- [ ] **Step 2 : Vérifier TS**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/lib/ediUtils.ts
git commit -m "feat(refs-cmd): template ORDERS EDIFACT — RFF+CR global (après NAD) et par ligne (après QTY+21)"
```

---

## Task 4 : OrdersContext — passer les références à addOrder

**Files:**
- Modify: `src/contexts/OrdersContext.tsx:44-155`

- [ ] **Step 1 : Étendre l'interface addOrder dans OrdersContextValue**

Dans `src/contexts/OrdersContext.tsx`, remplacer le type addOrder (lignes 48-60) :

```ts
addOrder: (params: {
  codeClient: string
  adresseLivraison: string
  items: CartItem[]
  subtotalHT: number
  remiseAmount: number
  netHT: number
  tva: number
  totalTTC: number
  deliveryMode: 'standard' | 'specific'
  deliveryDate?: string
  transmissionMode: 'FLOWDIFF' | 'EDI'
  referenceCommande?: string
  referencesParLigne?: Record<string, string>
}) => Order
```

- [ ] **Step 2 : Étendre l'implémentation addOrder**

Dans `src/contexts/OrdersContext.tsx`, remplacer la signature de la fonction `addOrder` (lignes 107-119) :

```ts
function addOrder(params: {
  codeClient: string
  adresseLivraison: string
  items: CartItem[]
  subtotalHT: number
  remiseAmount: number
  netHT: number
  tva: number
  totalTTC: number
  deliveryMode: 'standard' | 'specific'
  deliveryDate?: string
  transmissionMode: 'FLOWDIFF' | 'EDI'
  referenceCommande?: string
  referencesParLigne?: Record<string, string>
}): Order {
```

- [ ] **Step 3 : Mapper referenceLigne sur chaque OrderItem**

Dans la fonction `addOrder`, remplacer le bloc `const orderItems` (lignes 120-132) :

```ts
const orderItems: OrderItem[] = params.items.map(({ book, quantity, statut, enReliquat, ebookOption }) => ({
  bookId: book.id,
  title: book.title,
  author: book.authors.join(', '),
  publisher: book.publisher,
  isbn: book.isbn,
  quantity,
  unitPriceHT: book.price,
  unitPriceTTC: book.priceTTC,
  universe: book.universe,
  statut,
  enReliquat,
  referenceLigne: params.referencesParLigne
    ? (params.referencesParLigne[ebookOption ? `${book.id}::${ebookOption.isbnEbook}` : book.id]?.trim() || undefined)
    : undefined,
}))
```

- [ ] **Step 4 : Passer referenceCommande sur l'Order créé**

Dans la fonction `addOrder`, dans la const `order` (lignes 134-151), ajouter après `ediStatus` :

```ts
const order: Order = {
  id: `ord-${Date.now()}`,
  numero: generateNumero(),
  date: todayISO(),
  status: 'en préparation',
  codeClient: params.codeClient,
  adresseLivraison: params.adresseLivraison,
  deliveryMode: params.deliveryMode,
  deliveryDate: params.deliveryDate,
  transmissionMode: params.transmissionMode,
  ediStatus: params.transmissionMode === 'EDI' ? 'PENDING' : undefined,
  referenceCommande: params.referenceCommande,
  items: orderItems,
  subtotalHT: params.subtotalHT,
  remiseAmount: params.remiseAmount,
  netHT: params.netHT,
  tva: params.tva,
  totalTTC: params.totalTTC,
}
```

- [ ] **Step 5 : Vérifier TS**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 6 : Commit**

```bash
git add src/contexts/OrdersContext.tsx
git commit -m "feat(refs-cmd): addOrder accepte referenceCommande + referencesParLigne, mappe sur Order/OrderItem"
```

---

## Task 5 : CartPage — section UI référence commande

**Files:**
- Modify: `src/pages/cart/CartPage.tsx`

### 5a — Styled components

- [ ] **Step 1 : Ajouter les styled components après DatePickerLabel (ligne ~576)**

Insérer après `const DatePickerLabel = styled.label` (ligne 576) et avant le bloc `ÉTATS VIDE / SUCCÈS` :

```ts
/* ══════════════════════════════════════════════════════
   RÉFÉRENCE COMMANDE
══════════════════════════════════════════════════════ */
const RefCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.lg};
`

const RefOptional = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.normal};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-left: 6px;
`

const RefHint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 4px 0 12px;
`

const RefToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`

const RefToggleBtn = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.gray[600]};
  cursor: pointer;
  transition: all .15s;
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ theme }) => theme.colors.navy};
    background: transparent;
  }
`

const RefInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.gray[50]};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.navy}; background: ${({ theme }) => theme.colors.white}; }
  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
`

const RefLineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const RefLineRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const RefLineLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
```

### 5b — State

- [ ] **Step 2 : Ajouter les 3 états dans CartPage (après ligne ~1107)**

Dans la fonction `CartPage`, après `const [saveAsDefault, setSaveAsDefault] = useState(false)` (ligne ~1107) :

```ts
const [refMode, setRefMode]           = useState<'global' | 'par-ligne'>('global')
const [refGlobale, setRefGlobale]     = useState('')
const [refsParLigne, setRefsParLigne] = useState<Record<string, string>>({})
```

### 5c — JSX section

- [ ] **Step 3 : Insérer la section référence dans la vue panier**

Dans la vue panier principale (`return (` à la ligne 1441), après la section des OP groups (après `</Section>` qui ferme les opGroups, ligne ~1686) et avant la section Livraison (`{/* ── Livraison ── */}`, ligne ~1688) :

```tsx
          {/* ── Référence commande ── */}
          {items.length > 0 && (
            <Section>
              <RefCard>
                <SectionTitle style={{ marginBottom: 4 }}>
                  Référence commande<RefOptional>(optionnel)</RefOptional>
                </SectionTitle>
                <RefHint>
                  Associez une référence interne (BC, rayon, projet…) incluse dans le message EDI.
                </RefHint>
                <RefToggle>
                  <RefToggleBtn $active={refMode === 'global'} onClick={() => setRefMode('global')}>
                    Référence globale
                  </RefToggleBtn>
                  <RefToggleBtn $active={refMode === 'par-ligne'} onClick={() => setRefMode('par-ligne')}>
                    Par article
                  </RefToggleBtn>
                </RefToggle>
                {refMode === 'global' ? (
                  <RefInput
                    type="text"
                    maxLength={35}
                    placeholder="Ex : BC-2026-0412, Rayon-Littérature…"
                    value={refGlobale}
                    onChange={e => setRefGlobale(e.target.value)}
                  />
                ) : (
                  <RefLineList>
                    {items.map(item => {
                      const key = getItemKey(item)
                      return (
                        <RefLineRow key={key}>
                          <RefLineLabel>{item.book.title}</RefLineLabel>
                          <RefInput
                            type="text"
                            maxLength={35}
                            placeholder="Référence pour ce titre…"
                            value={refsParLigne[key] ?? ''}
                            onChange={e => setRefsParLigne(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        </RefLineRow>
                      )
                    })}
                  </RefLineList>
                )}
              </RefCard>
            </Section>
          )}
```

### 5d — handleConfirmOrder

- [ ] **Step 4 : Passer les références dans handleConfirmOrder**

Remplacer `handleConfirmOrder` (lignes 1164-1186) :

```ts
function handleConfirmOrder() {
  const effectiveBilling = sameAsDelivery ? deliveryAddress : billingAddress
  const reliquat = hasReliquatItems
  addOrder({
    codeClient: user?.codeClient ?? '',
    adresseLivraison: fmtAddress(deliveryAddress),
    items,
    subtotalHT: subtotalTTC / 1.055,
    remiseAmount: remiseAmount / 1.055,
    netHT,
    tva,
    totalTTC,
    deliveryMode: delivery,
    deliveryDate: delivery === 'specific' ? specificDate : undefined,
    transmissionMode: localTransmission,
    referenceCommande: refMode === 'global' ? (refGlobale.trim() || undefined) : undefined,
    referencesParLigne: refMode === 'par-ligne' ? refsParLigne : undefined,
  })
  void effectiveBilling
  clearCart()
  setPage('success')
  if (reliquat) {
    showToast('📧 Vous serez notifié par email dès l\'expédition des titres en reliquat.')
  }
}
```

- [ ] **Step 5 : Vérifier TS**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 6 : Commit**

```bash
git add src/pages/cart/CartPage.tsx
git commit -m "feat(refs-cmd): section référence commande dans CartPage — toggle global/par-article, maxLength 35"
```

---

## Task 6 : HistoriquePage — badge référence

**Files:**
- Modify: `src/pages/historique/HistoriquePage.tsx`

- [ ] **Step 1 : Ajouter le styled component RefBadge**

Dans `src/pages/historique/HistoriquePage.tsx`, après `const OrderDate` (ligne ~165) :

```ts
const RefBadge = styled.span`
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.navyLight};
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`
```

- [ ] **Step 2 : Afficher le badge après OrderNumero**

Dans la vue des commandes, remplacer le bloc `<div>` qui contient `<OrderNumero>` (ligne ~797) :

```tsx
<div>
  <OrderNumero>{order.numero}</OrderNumero>
  {order.referenceCommande && (
    <RefBadge>Réf : {order.referenceCommande}</RefBadge>
  )}
  <OrderDate>{formatDate(order.date)}</OrderDate>
</div>
```

- [ ] **Step 3 : Vérifier TS**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/pages/historique/HistoriquePage.tsx
git commit -m "feat(refs-cmd): badge référence commande dans HistoriquePage (fond navyLight, 11px)"
```

---

## Task 7 : Vérification finale

- [ ] **Step 1 : TypeScript clean**

```bash
npx tsc --noEmit
```

Attendu : 0 erreur.

- [ ] **Step 2 : Tests**

```bash
npx vitest run
```

Attendu : 173/174 passants (1 failing pré-existant `useDashboardConfig.test.ts` — ignoré).

- [ ] **Step 3 : Mettre à jour CONTEXT.md**

Ajouter dans la section "État du build" :
```
**EDI — Références de commande** : section référence dans CartPage (global + par article) · RFF+CR dans template ORDERS · badge HistoriquePage ✅
```

- [ ] **Step 4 : Commit final**

```bash
git add CONTEXT.md
git commit -m "chore: CONTEXT.md — références commande EDI terminées"
```
