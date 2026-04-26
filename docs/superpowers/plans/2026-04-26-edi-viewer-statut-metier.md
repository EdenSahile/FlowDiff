# EDI Viewer & Statut Métier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le statut technique SENT/RECEIVED dans le tableau Historique par un statut métier lisible (dérivé du type de message), et refondre la modale 👁 en un viewer split-view JSON / EDIFACT style terminal.

**Architecture:** Approche B — nouveau composant `EDIViewer` autonome, `EDIMessageModal` réduit à un wrapper `<Overlay>`, logique centralisée dans `ediUtils.ts` (`getBusinessStatus`, `generateEdifactPlaceholder`). STOCK exclu de l'intégralité du périmètre.

**Tech Stack:** React 18, TypeScript strict, styled-components v6, Vitest (jsdom)

**Spec de référence:** `docs/superpowers/specs/2026-04-26-edi-viewer-statut-metier-design.md`

---

## File Map

| Fichier | Action | Rôle |
|---------|--------|------|
| `src/lib/ediUtils.ts` | Modifier | Retirer STOCK, ajouter `getBusinessStatus`, `generateEdifactPlaceholder` |
| `src/pages/edi/__tests__/ediUtils.test.ts` | Modifier | Retirer test STOCK, ajouter tests nouvelles fonctions |
| `src/components/edi/EDIViewer.tsx` | Créer | Split-view JSON + EDIFACT terminal |
| `src/components/edi/EDIMessageModal.tsx` | Modifier | Refactor → wrapper Overlay + EDIViewer |
| `src/pages/edi/EDIPage.tsx` | Modifier | Badge Statut métier, col Voir, onglet STOCK supprimé |

---

## Task 1 — Retirer STOCK de `ediUtils.ts` + mettre à jour les tests

**Files:**
- Modify: `src/lib/ediUtils.ts`
- Modify: `src/pages/edi/__tests__/ediUtils.test.ts`

- [ ] **Step 1.1 — Retirer STOCK du type et des maps dans `ediUtils.ts`**

Remplacer le contenu de `src/lib/ediUtils.ts` par :

```ts
export type EDIMessageType = 'ORDERS' | 'ORDRSP' | 'DESADV' | 'INVOIC'
export type EDIStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'ERROR'

export interface EDIMessage {
  id: string
  type: EDIMessageType
  status: EDIStatus
  documentRef: string
  diffuseur: string
  detail: string
  createdAt: string
  orderId?: string
  payload: object
}

export interface EDIParams {
  preferEdiByDefault: boolean
  emailNotifications: boolean
  relanceDelay: '12h' | '24h' | '48h'
}

export type EDIFilter = 'ALL' | EDIMessageType

export function filterEDIMessages(messages: EDIMessage[], filter: EDIFilter): EDIMessage[] {
  if (filter === 'ALL') return messages
  return messages.filter(m => m.type === filter)
}

export function getFluxCounts(messages: EDIMessage[]): {
  orders: number
  expeditions: number
  factures: number
  errors: number
} {
  return {
    orders:      messages.filter(m => m.type === 'ORDERS' && m.status === 'PENDING').length,
    expeditions: messages.filter(m => m.type === 'DESADV').length,
    factures:    messages.filter(m => m.type === 'INVOIC' && m.status === 'PENDING').length,
    errors:      messages.filter(m => m.status === 'ERROR').length,
  }
}

const TYPE_LABELS: Record<EDIMessageType, string> = {
  ORDERS: 'Commande (ORDERS)',
  ORDRSP: 'Accusé réception (ORDRSP)',
  DESADV: 'Expédition (DESADV)',
  INVOIC: 'Facture (INVOIC)',
}

export function formatEDITypeLabel(type: EDIMessageType): string {
  return TYPE_LABELS[type]
}

const STATUS_LABELS: Record<EDIStatus, string> = {
  PENDING:  'En attente',
  SENT:     'Envoyé',
  RECEIVED: 'Reçu',
  ERROR:    'Erreur',
}

export function formatEDIStatusLabel(status: EDIStatus): string {
  return STATUS_LABELS[status]
}
```

- [ ] **Step 1.2 — Retirer le test STOCK de `ediUtils.test.ts`**

Dans `src/pages/edi/__tests__/ediUtils.test.ts`, supprimer le cas de test suivant dans `describe('formatEDITypeLabel')` :

```ts
// À supprimer :
it('maps STOCK to Stock (STOCK)', () => {
  expect(formatEDITypeLabel('STOCK')).toBe('Stock (STOCK)')
})
```

- [ ] **Step 1.3 — Vérifier que les tests passent**

```bash
npx vitest run src/pages/edi/__tests__/ediUtils.test.ts
```

Résultat attendu : tous les tests passent, aucune erreur TypeScript.

- [ ] **Step 1.4 — Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : 0 erreurs. Si `STOCK` est encore référencé quelque part (ex. `mockEDIMessages.ts` ou `EDIContext.tsx`), corriger ces occurrences maintenant.

- [ ] **Step 1.5 — Commit**

```bash
git add src/lib/ediUtils.ts src/pages/edi/__tests__/ediUtils.test.ts
git commit -m "refactor(edi): retirer STOCK du type EDIMessageType et des tests"
```

---

## Task 2 — Ajouter `getBusinessStatus` dans `ediUtils.ts` (TDD)

**Files:**
- Modify: `src/lib/ediUtils.ts`
- Modify: `src/pages/edi/__tests__/ediUtils.test.ts`

- [ ] **Step 2.1 — Écrire le test qui échoue**

Ajouter à la fin de `src/pages/edi/__tests__/ediUtils.test.ts` :

```ts
import {
  filterEDIMessages,
  getFluxCounts,
  formatEDITypeLabel,
  formatEDIStatusLabel,
  getBusinessStatus,  // ← ajouter à l'import existant
  type EDIMessage,
} from '@/lib/ediUtils'

// ... (garder les tests existants)

describe('getBusinessStatus', () => {
  it('ORDERS → Commande envoyée', () => {
    expect(getBusinessStatus('ORDERS')).toBe('Commande envoyée')
  })
  it('ORDRSP → Réponse commande reçue', () => {
    expect(getBusinessStatus('ORDRSP')).toBe('Réponse commande reçue')
  })
  it('DESADV → Info expédition reçue', () => {
    expect(getBusinessStatus('DESADV')).toBe('Info expédition reçue')
  })
  it('INVOIC → Facture reçue', () => {
    expect(getBusinessStatus('INVOIC')).toBe('Facture reçue')
  })
})
```

- [ ] **Step 2.2 — Vérifier que le test échoue**

```bash
npx vitest run src/pages/edi/__tests__/ediUtils.test.ts
```

Résultat attendu : FAIL — `getBusinessStatus is not a function` ou erreur d'import.

- [ ] **Step 2.3 — Implémenter `getBusinessStatus` dans `ediUtils.ts`**

Ajouter après `formatEDIStatusLabel` dans `src/lib/ediUtils.ts` :

```ts
const BUSINESS_STATUS: Record<EDIMessageType, string> = {
  ORDERS: 'Commande envoyée',
  ORDRSP: 'Réponse commande reçue',
  DESADV: 'Info expédition reçue',
  INVOIC: 'Facture reçue',
}

export function getBusinessStatus(type: EDIMessageType): string {
  return BUSINESS_STATUS[type]
}
```

- [ ] **Step 2.4 — Vérifier que les tests passent**

```bash
npx vitest run src/pages/edi/__tests__/ediUtils.test.ts
```

Résultat attendu : PASS — tous les tests passent.

- [ ] **Step 2.5 — Commit**

```bash
git add src/lib/ediUtils.ts src/pages/edi/__tests__/ediUtils.test.ts
git commit -m "feat(edi): ajouter getBusinessStatus — statut métier par type"
```

---

## Task 3 — Ajouter `generateEdifactPlaceholder` dans `ediUtils.ts` (TDD)

**Files:**
- Modify: `src/lib/ediUtils.ts`
- Modify: `src/pages/edi/__tests__/ediUtils.test.ts`

- [ ] **Step 3.1 — Écrire les tests qui échouent**

Ajouter à la fin de `src/pages/edi/__tests__/ediUtils.test.ts` :

```ts
import {
  // ... imports existants
  generateEdifactPlaceholder,  // ← ajouter
} from '@/lib/ediUtils'

describe('generateEdifactPlaceholder', () => {
  const base = {
    id: 'edi-test-1',
    documentRef: 'CMD-2026-0426-001',
    diffuseur: 'Diffuseur 1',
    detail: '5 ex.',
    createdAt: '2026-04-26T14:32:00.000Z',
    payload: {},
  }

  it('ORDERS contient les segments UNH et BGM+220', () => {
    const msg = { ...base, type: 'ORDERS' as const, status: 'SENT' as const }
    const result = generateEdifactPlaceholder(msg)
    expect(result).toContain("UNH+1+ORDERS:D:96A:UN'")
    expect(result).toContain("BGM+220+CMD-2026-0426-001")
  })

  it('ORDRSP contient BGM+231', () => {
    const msg = { ...base, type: 'ORDRSP' as const, status: 'RECEIVED' as const }
    const result = generateEdifactPlaceholder(msg)
    expect(result).toContain("BGM+231+")
  })

  it('DESADV contient BGM+351 et CPS', () => {
    const msg = { ...base, type: 'DESADV' as const, status: 'RECEIVED' as const }
    const result = generateEdifactPlaceholder(msg)
    expect(result).toContain("BGM+351+")
    expect(result).toContain("CPS+1'")
  })

  it('INVOIC contient BGM+380 et TAX', () => {
    const msg = { ...base, type: 'INVOIC' as const, status: 'RECEIVED' as const }
    const result = generateEdifactPlaceholder(msg)
    expect(result).toContain("BGM+380+")
    expect(result).toContain("TAX+7+VAT")
  })

  it('retourne toujours UNB et UNZ', () => {
    const msg = { ...base, type: 'ORDERS' as const, status: 'SENT' as const }
    const result = generateEdifactPlaceholder(msg)
    expect(result).toContain("UNB+UNOA:1+")
    expect(result).toContain("UNZ+")
  })
})
```

- [ ] **Step 3.2 — Vérifier que les tests échouent**

```bash
npx vitest run src/pages/edi/__tests__/ediUtils.test.ts
```

Résultat attendu : FAIL — `generateEdifactPlaceholder is not a function`.

- [ ] **Step 3.3 — Implémenter `generateEdifactPlaceholder` dans `ediUtils.ts`**

Ajouter à la fin de `src/lib/ediUtils.ts` :

```ts
function fmtEdifactDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '')
}

function fmtEdifactTime(iso: string): string {
  return iso.slice(11, 16).replace(':', '')
}

const EDIFACT_TEMPLATES: Record<EDIMessageType, (msg: EDIMessage) => string> = {
  ORDERS: (msg) => [
    `UNB+UNOA:1+3012345678901:14+GLN-DIFFUSEUR:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+ORDERS:D:96A:UN'`,
    `BGM+220+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `NAD+BY+3012345678901::9'`,
    `NAD+SU+GLN-DIFFUSEUR::9'`,
    `LIN+1++9782070360024:EN'`,
    `QTY+21:5'`,
    `UNS+S'`,
    `UNZ+8+1'`,
  ].join('\n'),

  ORDRSP: (msg) => [
    `UNB+UNOA:1+GLN-DIFFUSEUR:14+3012345678901:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+ORDRSP:D:96A:UN'`,
    `BGM+231+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `DOC+1+${msg.documentRef}'`,
    `RFF+ON:${msg.documentRef}'`,
    `UNS+S'`,
    `UNZ+6+1'`,
  ].join('\n'),

  DESADV: (msg) => [
    `UNB+UNOA:1+GLN-DIFFUSEUR:14+3012345678901:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+DESADV:D:96A:UN'`,
    `BGM+351+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `CPS+1'`,
    `QTY+52:5'`,
    `UNS+S'`,
    `UNZ+7+1'`,
  ].join('\n'),

  INVOIC: (msg) => [
    `UNB+UNOA:1+GLN-DIFFUSEUR:14+3012345678901:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+INVOIC:D:96A:UN'`,
    `BGM+380+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `NAD+SE+GLN-DIFFUSEUR::9'`,
    `NAD+BY+3012345678901::9'`,
    `MOA+79:856.00:EUR'`,
    `TAX+7+VAT+++:::5.5+S'`,
    `UNS+S'`,
    `UNZ+9+1'`,
  ].join('\n'),
}

export function generateEdifactPlaceholder(msg: EDIMessage): string {
  return EDIFACT_TEMPLATES[msg.type](msg)
}
```

- [ ] **Step 3.4 — Vérifier que les tests passent**

```bash
npx vitest run src/pages/edi/__tests__/ediUtils.test.ts
```

Résultat attendu : PASS — tous les tests passent.

- [ ] **Step 3.5 — Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : 0 erreurs.

- [ ] **Step 3.6 — Commit**

```bash
git add src/lib/ediUtils.ts src/pages/edi/__tests__/ediUtils.test.ts
git commit -m "feat(edi): ajouter generateEdifactPlaceholder — EDIFACT illustratif par type"
```

---

## Task 4 — Créer `EDIViewer.tsx`

**Files:**
- Create: `src/components/edi/EDIViewer.tsx`

- [ ] **Step 4.1 — Créer `src/components/edi/EDIViewer.tsx`**

```tsx
import styled from 'styled-components'
import type { EDIMessage } from '@/lib/ediUtils'
import {
  formatEDITypeLabel,
  getBusinessStatus,
  generateEdifactPlaceholder,
} from '@/lib/ediUtils'

interface Props {
  message: EDIMessage
  onClose: () => void
}

/* ── Container ── */
const Container = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  width: 100%;
  max-width: 860px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`

/* ── Header ── */
const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const TypeLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

const DocRef = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`

const BusinessBadge = styled.span<{ $type: string }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: ${({ $type, theme }) =>
    $type === 'ORDERS' ? theme.colors.accentLight : theme.colors.primaryLight};
  color: ${({ $type, theme }) =>
    $type === 'ORDERS' ? '#8B6914' : theme.colors.success};
`

const MsgId = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  line-height: 1;
  padding: 4px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

/* ── Body split ── */
const Body = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 400px;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const PaneHeader = styled.div`
  padding: 8px 14px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const JsonPane = styled.div`
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${PaneHeader} {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  }
`

const EdifactPane = styled.div`
  background: #000000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${PaneHeader} {
    background: #111;
    color: #00FF41;
    border-bottom: 1px solid #1a1a1a;
  }
`

const JsonPre = styled.pre`
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 14px;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.gray[50]};
  white-space: pre-wrap;
  word-break: break-all;
`

const EdifactPre = styled.pre`
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 14px;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.8125rem;
  color: #00FF41;
  background: #000000;
  white-space: pre-wrap;
  word-break: break-all;
`

/* ── Footer ── */
const Footer = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  justify-content: flex-end;
`

const BtnClose = styled.button`
  padding: 8px 20px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

export function EDIViewer({ message, onClose }: Props) {
  return (
    <Container onClick={e => e.stopPropagation()}>
      <Header>
        <HeaderLeft>
          <TitleRow>
            <TypeLabel>{formatEDITypeLabel(message.type)}</TypeLabel>
            <DocRef>{message.documentRef}</DocRef>
            <BusinessBadge $type={message.type}>
              {getBusinessStatus(message.type)}
            </BusinessBadge>
          </TitleRow>
          <MsgId>ID : {message.id}</MsgId>
        </HeaderLeft>
        <CloseBtn onClick={onClose} aria-label="Fermer">×</CloseBtn>
      </Header>

      <Body>
        <JsonPane>
          <PaneHeader>Données métier</PaneHeader>
          <JsonPre>{JSON.stringify(message.payload, null, 2)}</JsonPre>
        </JsonPane>
        <EdifactPane>
          <PaneHeader>Message EDIFACT</PaneHeader>
          <EdifactPre>{generateEdifactPlaceholder(message)}</EdifactPre>
        </EdifactPane>
      </Body>

      <Footer>
        <BtnClose onClick={onClose}>Fermer</BtnClose>
      </Footer>
    </Container>
  )
}
```

- [ ] **Step 4.2 — Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : 0 erreurs.

- [ ] **Step 4.3 — Commit**

```bash
git add src/components/edi/EDIViewer.tsx
git commit -m "feat(edi): créer EDIViewer — split view JSON / EDIFACT terminal"
```

---

## Task 5 — Refactorer `EDIMessageModal.tsx` en wrapper

**Files:**
- Modify: `src/components/edi/EDIMessageModal.tsx`

- [x] **Step 5.1 — Réécrire `EDIMessageModal.tsx`**

Remplacer l'intégralité du contenu par :

```tsx
import styled from 'styled-components'
import type { EDIMessage } from '@/lib/ediUtils'
import { EDIViewer } from '@/components/edi/EDIViewer'

interface Props {
  message: EDIMessage | null
  onClose: () => void
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

export function EDIMessageModal({ message, onClose }: Props) {
  if (!message) return null
  return (
    <Overlay onClick={onClose}>
      <EDIViewer message={message} onClose={onClose} />
    </Overlay>
  )
}
```

- [x] **Step 5.2 — Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : 0 erreurs. `EDIPage.tsx` continue d'importer `EDIMessageModal` avec la même interface — aucune modification nécessaire dans `EDIPage`.

- [x] **Step 5.3 — Commit**

```bash
git add src/components/edi/EDIMessageModal.tsx
git commit -m "refactor(edi): EDIMessageModal → wrapper Overlay + EDIViewer"
```

---

## Task 6 — Mettre à jour `EDIPage.tsx`

**Files:**
- Modify: `src/pages/edi/EDIPage.tsx`

- [x] **Step 6.1 — Ajouter l'import de `getBusinessStatus`**

Dans les imports de `src/pages/edi/EDIPage.tsx`, ajouter `getBusinessStatus` à l'import existant depuis `@/lib/ediUtils` :

```ts
import {
  filterEDIMessages,
  getFluxCounts,
  formatEDITypeLabel,
  formatEDIStatusLabel,
  getBusinessStatus,          // ← ajouter
  type EDIMessage,
  type EDIFilter,
} from '@/lib/ediUtils'
```

- [x] **Step 6.2 — Supprimer l'onglet STOCK des tabs**

Dans `TabsRow`, retirer l'entrée `{ key: 'STOCK', label: 'Stocks (STOCK)' }` du tableau. Le tableau doit devenir :

```tsx
{([
  { key: 'ALL',    label: 'Tous' },
  { key: 'ORDERS', label: 'Commandes' },
  { key: 'ORDRSP', label: 'Accusés (ORDRSP)' },
  { key: 'DESADV', label: 'Expéditions (DESADV)' },
  { key: 'INVOIC', label: 'Factures (INVOIC)' },
] as { key: EDIFilter; label: string }[]).map(({ key, label }) => (
  <Tab key={key} $active={activeFilter === key} onClick={() => setActiveFilter(key)}>
    {label}
  </Tab>
))}
```

- [x] **Step 6.3 — Remplacer le badge Statut dans le tableau**

Remplacer le `StatusBadgeTable` existant (basé sur `msg.status`) par un badge basé sur `msg.type` :

Avant :
```tsx
<Td>
  <StatusBadgeTable $status={msg.status}>
    {formatEDIStatusLabel(msg.status)}
  </StatusBadgeTable>
</Td>
```

Après :
```tsx
<Td>
  <StatusBadgeTable $status={msg.type}>
    {msg.status === 'ERROR'
      ? getBusinessStatus(msg.type)
      : getBusinessStatus(msg.type)}
  </StatusBadgeTable>
</Td>
```

Et mettre à jour `StatusBadgeTable` pour que `$status` soit basé sur le type (pas le status) :

```ts
const StatusBadgeTable = styled.span<{ $status: string }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: ${({ $status, theme }) =>
    $status === 'ERROR'  ? '#FDECEA' :
    $status === 'ORDERS' ? theme.colors.accentLight :
    theme.colors.primaryLight};
  color: ${({ $status, theme }) =>
    $status === 'ERROR'  ? theme.colors.error :
    $status === 'ORDERS' ? '#8B6914' :
    theme.colors.success};
`
```

**Note :** Dans le `<tbody>`, passer `$status={msg.status === 'ERROR' ? 'ERROR' : msg.type}` pour que l'override couleur erreur fonctionne tout en gardant le texte métier :

```tsx
<StatusBadgeTable $status={msg.status === 'ERROR' ? 'ERROR' : msg.type}>
  {getBusinessStatus(msg.type)}
</StatusBadgeTable>
```

- [x] **Step 6.4 — Déplacer le bouton 👁 dans sa propre colonne**

Dans `<thead>`, ajouter une colonne après "Détail" :

```tsx
<tr>
  <Th>Date / Heure</Th>
  <Th>Type de message</Th>
  <Th>Diffuseur</Th>
  <Th>N° document</Th>
  <Th>Statut</Th>
  <Th>Détail</Th>
  <Th>Voir</Th>
</tr>
```

Dans `<tbody>`, séparer le bouton 👁 de la cellule Détail :

```tsx
<tr key={msg.id}>
  <Td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
    {fmtDate(msg.createdAt)} {fmtTime(msg.createdAt)}
  </Td>
  <Td>{formatEDITypeLabel(msg.type)}</Td>
  <Td>{msg.diffuseur}</Td>
  <Td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
    {msg.documentRef}
  </Td>
  <Td>
    <StatusBadgeTable $status={msg.status === 'ERROR' ? 'ERROR' : msg.type}>
      {getBusinessStatus(msg.type)}
    </StatusBadgeTable>
  </Td>
  <Td>{msg.detail}</Td>
  <Td>
    <EyeBtn onClick={() => setSelectedMessage(msg)} aria-label="Voir le message">
      👁
    </EyeBtn>
  </Td>
</tr>
```

Et mettre à jour la cellule "Aucun message" pour couvrir 7 colonnes :

```tsx
<Td colSpan={7} style={{ textAlign: 'center', color: '#6B6B68', padding: '24px' }}>
  Aucun message pour ce filtre.
</Td>
```

- [x] **Step 6.5 — Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : 0 erreurs.

- [x] **Step 6.6 — Lancer tous les tests**

```bash
npx vitest run
```

Résultat attendu : tous les tests passent.

- [x] **Step 6.7 — Commit**

```bash
git add src/pages/edi/EDIPage.tsx
git commit -m "feat(edi): statut métier dans tableau + col Voir + suppr. onglet STOCK"
```

---

## Self-Review

**Couverture spec :**
- ✅ Statut métier basé sur `getBusinessStatus(type)` — tableau + viewer
- ✅ STOCK retiré de type TS, utils, UI, onglets
- ✅ Colonne Voir indépendante
- ✅ Viewer header : TypeLabel + documentRef + id + badge métier
- ✅ Body split 50/50 : JSON gauche, EDIFACT droite style terminal
- ✅ `EDIMessageModal` → wrapper pur
- ✅ `formatEDIStatusLabel` non utilisé dans les zones métier (conservé uniquement dans `handleExport`)
- ✅ Tests pour `getBusinessStatus` et `generateEdifactPlaceholder`

**Placeholders :** aucun.

**Cohérence des types :** `EDIMessageType` sans STOCK dès Task 1, utilisé identiquement dans Tasks 2, 3, 4, 5, 6.
