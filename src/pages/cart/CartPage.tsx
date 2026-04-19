import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useCart, REMISE_RATES, getItemKey } from '@/contexts/CartContext'
import { useOrders } from '@/contexts/OrdersContext'
import { useAuth } from '@/hooks/useAuth'
import { BookCover } from '@/components/catalogue/BookCover'
import { Button } from '@/components/ui/Button'

/* ── Confirm Dialog ── */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
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

const DialogBtn = styled.button<{ $danger?: boolean }>`
  padding: 0 ${({ theme }) => theme.spacing.lg};
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  border: none;
  transition: background .15s, color .15s;
  background: ${({ $danger, theme }) => $danger ? theme.colors.error : theme.colors.gray[100]};
  color: ${({ $danger }) => $danger ? '#fff' : '#374151'};
  &:hover { filter: brightness(0.92); }
  &:focus-visible { outline: 2px solid ${({ $danger, theme }) => $danger ? theme.colors.error : theme.colors.navy}; outline-offset: 2px; }
`

type ConfirmState = { open: false } | { open: true; title: string; message: string; onConfirm: () => void }

function ConfirmDialog({ state, onCancel }: { state: ConfirmState; onCancel: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state.open) confirmRef.current?.focus()
  }, [state.open])

  useEffect(() => {
    if (!state.open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.open, onCancel])

  if (!state.open) return null

  return (
    <Overlay onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <Dialog onClick={e => e.stopPropagation()}>
        <DialogTitle id="dialog-title">{state.title}</DialogTitle>
        <DialogText>{state.message}</DialogText>
        <DialogActions>
          <DialogBtn onClick={onCancel}>Annuler</DialogBtn>
          <DialogBtn $danger ref={confirmRef} onClick={() => { state.onConfirm(); onCancel() }}>
            Supprimer
          </DialogBtn>
        </DialogActions>
      </Dialog>
    </Overlay>
  )
}

/* ── SVG Icons ── */
function IconScreen() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block', color: '#226241' }}>
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function IconCart() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
      <path d="m15 18-6-6 6-6"/>
    </svg>
  )
}

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`



/* ══════════════════════════════════════════════════════
   LAYOUT GÉNÉRAL
══════════════════════════════════════════════════════ */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ClientCode = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ClientCodeBold = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

/* ══════════════════════════════════════════════════════
   RÉSUMÉ FINANCIER
══════════════════════════════════════════════════════ */
const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.white};
`

const SummaryTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  opacity: .75;
  text-transform: uppercase;
  letter-spacing: .05em;
`

const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ $total, theme }) => $total ? theme.typography.sizes.xl : theme.typography.sizes.sm};
  font-weight: ${({ $total, theme }) => $total ? theme.typography.weights.bold : theme.typography.weights.normal};
  border-top: ${({ $total }) => $total ? '1px solid rgba(255,255,255,.2)' : 'none'};
  margin-top: ${({ $total, theme }) => $total ? theme.spacing.sm : '0'};
  padding-top: ${({ $total, theme }) => $total ? theme.spacing.sm : '5px'};
`

const SummaryLabel = styled.span`opacity: .8;`
const SummaryValue = styled.span``

const RemiseBadge = styled.span`
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 6px;
  margin-left: ${({ theme }) => theme.spacing.xs};
`

/* ══════════════════════════════════════════════════════
   SECTION + TITRES INDIVIDUELS
══════════════════════════════════════════════════════ */
const Section = styled.section`margin-bottom: ${({ theme }) => theme.spacing.xl};`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ItemCard = styled.div<{ $ebook?: boolean }>`
  background: ${({ $ebook, theme }) => $ebook ? theme.colors.accentLight : theme.colors.white};
  border: 1px solid ${({ $ebook, theme }) => $ebook ? theme.colors.gray[200] : theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const EbookFormatBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: 4px;
  padding: 2px 8px;
  margin-bottom: 3px;
`

const EbookPlatformTag = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}18;
  border: 1px solid ${({ $color }) => $color}35;
  border-radius: 20px;
  padding: 2px 8px;
  margin-left: 6px;
`

const ItemInfo = styled.div`flex: 1; min-width: 0;`

const ItemTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ItemAuthor = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 2px;
`

const ItemIsbn = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  letter-spacing: 0.02em;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ItemFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const ItemPrice = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const ItemRemise = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: #226241;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`

const QtyBtn = styled.button`
  width: 44px; height: 44px;
  background: none; border: none; cursor: pointer;
  font-size: 1.1rem; color: ${({ theme }) => theme.colors.navy};
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
  border-radius: ${({ theme }) => theme.radii.sm};
  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.navy}; outline-offset: 1px; }
  &:disabled { opacity: .35; cursor: not-allowed; }
`

const QtyValue = styled.span`
  min-width: 32px; text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const DeleteBtn = styled.button`
  background: none; border: none; cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color .15s, background .15s;
  &:hover { color: ${({ theme }) => theme.colors.error}; background: ${({ theme }) => theme.colors.gray[100]}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.error}; outline-offset: 1px; color: ${({ theme }) => theme.colors.error}; }
`

/* ══════════════════════════════════════════════════════
   BLOC OP — encadré distinctif
══════════════════════════════════════════════════════ */
const OPBlock = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.navy};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
`

/* En-tête OP */
const OPHeader = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const OPHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const OPTag = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 3px;
  align-self: flex-start;
  margin-bottom: 2px;
`

const OPTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const OPDesc = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.65);
`

const OPValidity = styled.div`
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  flex-shrink: 0;
`

const OPDeleteBtn = styled.button`
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 6px;
  color: rgba(255,255,255,0.75);
  padding: 0 14px;
  min-height: 44px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .15s, color .15s;
  &:hover { background: rgba(255,255,255,0.22); color: #fff; }
  &:focus-visible { outline: 2px solid rgba(255,255,255,0.8); outline-offset: 2px; }
`

/* Lignes du tableau OP */
const OPTable = styled.div`
  background: ${({ theme }) => theme.colors.white};
`

const OPRow = styled.div<{ $variant?: 'book' | 'cadeau' | 'plv' | 'total' }>`
  display: grid;
  grid-template-columns: 44px 1fr auto auto auto;
  align-items: center;
  gap: 0;
  padding: 0 14px;
  min-height: ${({ $variant }) =>
    $variant === 'total' ? '40px' :
    $variant === 'book'  ? '72px' : '52px'};
  background: ${({ $variant, theme }) =>
    $variant === 'cadeau' ? theme.colors.primaryLight :
    $variant === 'plv'    ? theme.colors.accentLight :
    $variant === 'total'  ? theme.colors.gray[50] :
    theme.colors.white};
  border-top: ${({ $variant, theme }) =>
    $variant === 'total'  ? `2px solid ${theme.colors.gray[200]}` :
    $variant === 'cadeau' ? `1px dashed ${theme.colors.gray[200]}` :
    $variant === 'plv'    ? `1px dashed ${theme.colors.accent}` :
    `1px solid ${theme.colors.gray[50]}`};
`

const OPCover = styled.div`
  padding: 6px 10px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const OPText = styled.div`min-width: 0; padding: 6px 8px 6px 0;`

const OPRowTitle = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const OPRowMeta = styled.div`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 1px;
`

const OPRowIsbn = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  letter-spacing: 0.02em;
  margin-top: 1px;
`

const OPCell = styled.div<{ $color?: string; $bold?: boolean }>`
  text-align: right;
  font-size: 12px;
  font-weight: ${({ $bold }) => $bold ? 700 : 500};
  color: ${({ $color, theme }) => $color ?? theme.colors.navy};
  white-space: nowrap;
  padding: 0 6px;
  min-width: 64px;
`

/* Pied de bloc OP : totaux */
const OPFooter = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2px solid ${({ theme }) => theme.colors.gray[200]};
  flex-wrap: wrap;
  gap: 8px;
`

const OPFooterStats = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
`

const OPFooterStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const OPFooterLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const OPFooterValue = styled.span<{ $highlight?: boolean }>`
  font-size: ${({ $highlight }) => $highlight ? '15px' : '12px'};
  font-weight: ${({ $highlight }) => $highlight ? 800 : 600};
  color: ${({ theme }) => theme.colors.navy};
`

/* ══════════════════════════════════════════════════════
   LIVRAISON
══════════════════════════════════════════════════════ */
const DeliveryCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
`

const DateInput = styled.input`
  margin-left: ${({ theme }) => theme.spacing.xl};
  padding: 6px 10px;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.navy}; }
`

/* ══════════════════════════════════════════════════════
   CONFIRMATION
══════════════════════════════════════════════════════ */
const ConfirmBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ConfirmTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ConfirmRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 4px 0;
`

/* ══════════════════════════════════════════════════════
   ÉTATS VIDE / SUCCÈS
══════════════════════════════════════════════════════ */
const Empty = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`
const EmptySubtext = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const SuccessBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  animation: ${fadeIn} .3s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

/* ══════════════════════════════════════════════════════
   COMPOSANT
══════════════════════════════════════════════════════ */
type Step = 'cart' | 'confirm' | 'success'
type DeliveryMode = 'standard' | 'specific'

const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €'
const today = new Date().toISOString().split('T')[0]

export function CartPage() {
  const { items, opGroups, totalItems, updateQty, removeFromCart, removeOP, clearCart } = useCart()
  const { addOrder } = useOrders()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]         = useState<Step>('cart')
  const [delivery, setDelivery] = useState<DeliveryMode>('standard')
  const [specificDate, setSpecific] = useState('')
  const [confirm, setConfirm]   = useState<ConfirmState>({ open: false })

  const askConfirm = (title: string, message: string, onConfirm: () => void) =>
    setConfirm({ open: true, title, message, onConfirm })

  /* ── Taux de remise par univers (compte connecté, sinon REMISE_RATES) ── */
  const getUserRate = (universe: string): number => {
    if (user?.remisesParUnivers) {
      const rate = user.remisesParUnivers[universe]
      if (rate !== undefined) return rate / 100
    }
    return REMISE_RATES[universe as keyof typeof REMISE_RATES] ?? 0
  }

  /* ── Totaux recalculés avec les taux personnalisés ── */
  const subtotalTTC = items.reduce((s, { book, quantity }) => s + book.priceTTC * quantity, 0)
    + opGroups.reduce((s, op) =>
        s + op.books.reduce((ss, { book, quantity }) => ss + book.priceTTC * quantity, 0)
          + op.plv.pricePerUnit * op.plv.quantity, 0)

  const remiseTotal = items.reduce((s, { book, quantity }) =>
      s + book.priceTTC * quantity * getUserRate(book.universe), 0)
    + opGroups.reduce((s, op) =>
        s + op.books.reduce((ss, { book, quantity }) =>
            ss + book.priceTTC * quantity * getUserRate(book.universe), 0), 0)

  /* Net TTC après remise → TVA extraite (5,5% inclus dans le TTC, pas ajouté par-dessus) */
  const netTTC     = subtotalTTC - remiseTotal
  const netHT      = netTTC / 1.055
  const tvaCalc    = netTTC - netHT
  const totalCalc  = netTTC
  /* Exclusion PLV du dénominateur : PLV n'est pas remisée */
  const booksTTCOnly = items.reduce((s, { book, quantity }) => s + book.priceTTC * quantity, 0)
    + opGroups.reduce((s, op) => s + op.books.reduce((ss, { book, quantity }) => ss + book.priceTTC * quantity, 0), 0)
  const remisePct  = booksTTCOnly > 0 ? (remiseTotal / booksTTCOnly) * 100 : 0

  /* Remises multiples → vérifier items ET livres OP */
  const allUniverses = [
    ...items.map(i => i.book.universe),
    ...opGroups.flatMap(op => op.books.map(b => b.book.universe)),
  ]
  const universeRates = [...new Set(allUniverses)].map(u => getUserRate(u) * 100)
  const hasMultiRates = new Set(universeRates).size > 1

  const deliveryLabel = delivery === 'standard'
    ? 'Délai habituel (1–3 jours ouvrés)'
    : specificDate || 'Date à préciser'

  const hasItems = items.length > 0 || opGroups.length > 0

  /* ─────────── SUCCÈS ─────────── */
  if (step === 'success') return (
    <Page>
      <SuccessBox>
        <IconCheck />
        <EmptyText>Commande confirmée !</EmptyText>
        <EmptySubtext style={{ marginBottom: '24px' }}>
          Votre commande a bien été transmise. Un récapitulatif vous sera envoyé par email.
        </EmptySubtext>
        <Button variant="primary" size="lg" onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </SuccessBox>
    </Page>
  )

  /* ─────────── PANIER VIDE ─────────── */
  if (!hasItems) return (
    <Page>
      <PageTitle>Panier</PageTitle>
      <Empty>
        <IconCart />
        <EmptyText>Votre panier est vide</EmptyText>
        <EmptySubtext style={{ marginBottom: '24px' }}>
          Parcourez le catalogue pour ajouter des titres.
        </EmptySubtext>
        <Button variant="primary" size="lg" onClick={() => navigate('/fonds')}>
          Voir le catalogue
        </Button>
      </Empty>
    </Page>
  )

  /* ─────────── CONFIRMATION ─────────── */
  if (step === 'confirm') return (
    <Page>
      <PageTitle>Récapitulatif</PageTitle>
      <ClientCode>
        Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold>
      </ClientCode>

      <ConfirmBox>
        <ConfirmTitle>Détail de la commande</ConfirmTitle>

        {/* Titres individuels */}
        {items.map(({ book, quantity }) => (
          <ConfirmRow key={book.id}>
            <span>{book.title} × {quantity}</span>
            <span>{fmt(book.priceTTC * quantity)}</span>
          </ConfirmRow>
        ))}

        {/* OPs */}
        {opGroups.map(op => (
          <div key={op.id} style={{ margin: '8px 0', padding: '8px 0', borderTop: '1px dashed #eee' }}>
            <ConfirmRow style={{ fontWeight: 700, color: '#226241' }}>
              <span>OP — {op.opTitle}</span>
              <span></span>
            </ConfirmRow>
            {op.books.map(({ book, quantity }) => (
              <ConfirmRow key={book.id} style={{ paddingLeft: 12 }}>
                <span>{book.title} × {quantity}</span>
                <span>{fmt(book.priceTTC * quantity)}</span>
              </ConfirmRow>
            ))}
            <ConfirmRow style={{ paddingLeft: 12, color: '#226241' }}>
              <span>{op.cadeau.emoji} {op.cadeau.label} × {op.cadeau.quantity} (offert)</span>
              <span>0,00 €</span>
            </ConfirmRow>
            <ConfirmRow style={{ paddingLeft: 12, color: '#8B6914' }}>
              <span>PLV × {op.plv.quantity}</span>
              <span>{fmt(op.plv.pricePerUnit * op.plv.quantity)}</span>
            </ConfirmRow>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '12px' }}>
          <ConfirmRow><span>Livraison</span><span>{deliveryLabel}</span></ConfirmRow>
          <ConfirmRow><span>Sous-total TTC</span><span>{fmt(subtotalTTC)}</span></ConfirmRow>
          <ConfirmRow><span>Remise</span><span>− {fmt(remiseTotal)}</span></ConfirmRow>
          <ConfirmRow><span>Net HT</span><span>{fmt(netHT)}</span></ConfirmRow>
          <ConfirmRow><span>TVA 5,5%</span><span>{fmt(tvaCalc)}</span></ConfirmRow>
          <ConfirmRow style={{ fontWeight: 700, fontSize: '1rem', color: '#226241', paddingTop: '8px' }}>
            <span>Total TTC</span><span>{fmt(totalCalc)}</span>
          </ConfirmRow>
        </div>
      </ConfirmBox>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button variant="primary" size="lg" fullWidth onClick={() => {
          addOrder({
            codeClient: user?.codeClient ?? '',
            adresseLivraison: user?.adresseLivraison ?? '',
            items,
            subtotalHT: subtotalTTC, remiseAmount: remiseTotal, netHT: netHT, tva: tvaCalc, totalTTC: totalCalc,
            deliveryMode: delivery,
            deliveryDate: delivery === 'specific' ? specificDate : undefined,
          })
          clearCart()
          setStep('success')
        }}>
          Confirmer la commande
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={() => setStep('cart')}>
          <IconChevronLeft /> Modifier le panier
        </Button>
      </div>
    </Page>
  )

  /* ─────────── PANIER PRINCIPAL ─────────── */
  return (
    <Page>
      <ConfirmDialog state={confirm} onCancel={() => setConfirm({ open: false })} />
      <PageTitle>Panier</PageTitle>
      <ClientCode>
        Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold>
        {' · '}{totalItems} article{totalItems > 1 ? 's' : ''}
      </ClientCode>

      {/* ── Résumé financier ── */}
      <SummaryCard>
        <SummaryTitle>Récapitulatif</SummaryTitle>
        <SummaryRow>
          <SummaryLabel>Sous-total TTC</SummaryLabel>
          <SummaryValue>{fmt(subtotalTTC)}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>
            Remise{' '}
            {hasMultiRates
              ? <RemiseBadge>variable / thématique</RemiseBadge>
              : <RemiseBadge>−{remisePct.toFixed(1)}%</RemiseBadge>
            }
          </SummaryLabel>
          <SummaryValue>− {fmt(remiseTotal)}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Net HT</SummaryLabel>
          <SummaryValue>{fmt(netHT)}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>TVA 5,5%</SummaryLabel>
          <SummaryValue>{fmt(tvaCalc)}</SummaryValue>
        </SummaryRow>
        <SummaryRow $total>
          <SummaryLabel>Total TTC</SummaryLabel>
          <SummaryValue>{fmt(totalCalc)}</SummaryValue>
        </SummaryRow>
      </SummaryCard>

      {/* ══ 1. TITRES INDIVIDUELS ══ */}
      {items.length > 0 && (
        <Section>
          <SectionTitle>
            {items.length} titre{items.length > 1 ? 's' : ''} à l'unité
          </SectionTitle>

          {items.map((item) => {
            const { book, quantity, ebookOption } = item
            const key     = getItemKey(item)
            const isEbook   = !!ebookOption
            const unitPrice = isEbook ? ebookOption!.price : book.priceTTC
            const remise    = getUserRate(book.universe)
            const ligneHT   = unitPrice * quantity

            const platformColor =
              ebookOption?.hebergeur === 'OpenEdition' ? '#D4500A' :
              ebookOption?.hebergeur === 'Cairn'       ? '#1A5E8A' :
              ebookOption?.hebergeur === 'Izneo'       ? '#6B3FA0' :
              ebookOption?.hebergeur === 'Numilog'     ? '#2D7A3A' : '#555'

            const showPlatformTag = isEbook && ebookOption!.hebergeur !== 'Amalivre'

            return (
              <ItemCard key={key} $ebook={isEbook}>
                <BookCover isbn={book.isbn} alt={book.title} width={56} height={80} universe={book.universe} authors={book.authors} publisher={book.publisher} />
                <ItemInfo>
                  {isEbook && (
                    <div style={{ marginBottom: 4 }}>
                      <EbookFormatBadge>
                        <IconScreen /> EBOOK · {ebookOption!.format}
                      </EbookFormatBadge>
                      {showPlatformTag && (
                        <EbookPlatformTag $color={platformColor}>
                          {ebookOption!.hebergeur}
                        </EbookPlatformTag>
                      )}
                    </div>
                  )}
                  <ItemTitle>{book.title}</ItemTitle>
                  <ItemAuthor>{book.authors.join(', ')} — {book.publisher}</ItemAuthor>
                  <ItemIsbn>ISBN {isEbook ? ebookOption!.isbnEbook : book.isbn} · {isEbook ? ebookOption!.format : book.format}</ItemIsbn>
                  <ItemFooter>
                    <div>
                      <ItemPrice>{fmt(ligneHT)}</ItemPrice>
                      <ItemRemise> (−{(remise * 100).toFixed(0)}% → {fmt(ligneHT * (1 - remise))})</ItemRemise>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <QtyControl>
                        <QtyBtn onClick={() => updateQty(key, quantity - 1)} disabled={quantity <= 1} aria-label="Diminuer">−</QtyBtn>
                        <QtyValue>{quantity}</QtyValue>
                        <QtyBtn onClick={() => updateQty(key, quantity + 1)} aria-label="Augmenter">+</QtyBtn>
                      </QtyControl>
                      <DeleteBtn
                        aria-label={`Supprimer ${book.title}`}
                        onClick={() => askConfirm(
                          'Supprimer cet article ?',
                          `"${book.title}" sera retiré de votre panier.`,
                          () => removeFromCart(key)
                        )}
                      >
                        <IconTrash />
                      </DeleteBtn>
                    </div>
                  </ItemFooter>
                </ItemInfo>
              </ItemCard>
            )
          })}
        </Section>
      )}

      {/* ══ 2. OPÉRATIONS PROMOTIONNELLES ══ */}
      {opGroups.length > 0 && (
        <Section>
          <SectionTitle>
            {opGroups.length} opération{opGroups.length > 1 ? 's' : ''} promotionnelle{opGroups.length > 1 ? 's' : ''}
          </SectionTitle>

          {opGroups.map(op => {
            const opBooksTTC = op.books.reduce((s, { book, quantity }) =>
              s + book.priceTTC * quantity, 0)
            const opRemise   = op.books.reduce((s, { book, quantity }) =>
              s + book.priceTTC * quantity * getUserRate(book.universe), 0)
            const opPLVPrice = op.plv.pricePerUnit * op.plv.quantity
            /* net TTC books après remise + PLV (déjà TTC, pas de TVA à ajouter) */
            const opTotalTTC = (opBooksTTC - opRemise) + opPLVPrice

            return (
              <OPBlock key={op.id}>

                {/* En-tête */}
                <OPHeader>
                  <OPHeaderLeft>
                    <OPTag>OP commerciale</OPTag>
                    <OPTitle>{op.opTitle}</OPTitle>
                    <OPDesc>{op.opDescription}</OPDesc>
                  </OPHeaderLeft>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    {op.validUntil && <OPValidity>jusqu'au {op.validUntil}</OPValidity>}
                    <OPDeleteBtn
                      onClick={() => askConfirm(
                        'Supprimer cette opération ?',
                        `L'opération "${op.opTitle}" et tous ses articles seront retirés du panier.`,
                        () => removeOP(op.id)
                      )}
                    >
                      Supprimer
                    </OPDeleteBtn>
                  </div>
                </OPHeader>

                <OPTable>
                  {/* En-têtes colonnes */}
                  <OPRow style={{ minHeight: 32, borderTop: 'none', background: '#FAFAF8' }}>
                    <OPCover />
                    <OPText>
                      <OPRowMeta style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7' }}>
                        Titre / Article
                      </OPRowMeta>
                    </OPText>
                    <OPCell style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7' }}>
                      Prix unit.
                    </OPCell>
                    <OPCell style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7', textAlign: 'center' }}>
                      Qté
                    </OPCell>
                    <OPCell style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7' }}>
                      Total
                    </OPCell>
                  </OPRow>

                  {/* Ouvrages */}
                  {op.books.map(({ book, quantity }) => (
                    <OPRow key={book.id} $variant="book">
                      <OPCover>
                        <BookCover isbn={book.isbn} alt={book.title} width={34} height={48} universe={book.universe} authors={book.authors} publisher={book.publisher} />
                      </OPCover>
                      <OPText>
                        <OPRowTitle>{book.title}</OPRowTitle>
                        <OPRowMeta>{book.authors[0]} · {book.format}</OPRowMeta>
                        <OPRowIsbn>ISBN {book.isbn}</OPRowIsbn>
                      </OPText>
                      <OPCell>{fmt(book.priceTTC)}</OPCell>
                      <OPCell style={{ textAlign: 'center' }}>{quantity}</OPCell>
                      <OPCell $bold>{fmt(book.priceTTC * quantity)}</OPCell>
                    </OPRow>
                  ))}

                  {/* Produit offert */}
                  <OPRow $variant="cadeau">
                    <OPCover>
                      <span style={{ fontSize: 24, lineHeight: 1 }}>{op.cadeau.emoji}</span>
                    </OPCover>
                    <OPText>
                      <OPRowTitle style={{ color: '#226241' }}>{op.cadeau.label}</OPRowTitle>
                      <OPRowMeta>Offert au lecteur final</OPRowMeta>
                      <OPRowIsbn>ISBN {op.cadeau.isbn}</OPRowIsbn>
                    </OPText>
                    <OPCell $color="#226241">0,00 €</OPCell>
                    <OPCell $color="#226241" style={{ textAlign: 'center' }}>{op.cadeau.quantity}</OPCell>
                    <OPCell $bold $color="#226241">0,00 €</OPCell>
                  </OPRow>

                  {/* PLV */}
                  <OPRow $variant="plv">
                    <OPCover style={{ color: '#8B6914' }}>
                      <IconTag />
                    </OPCover>
                    <OPText>
                      <OPRowTitle style={{ color: '#8B6914' }}>{op.plv.description}</OPRowTitle>
                      <OPRowMeta>PLV payante</OPRowMeta>
                      <OPRowIsbn>ISBN {op.plv.isbn}</OPRowIsbn>
                    </OPText>
                    <OPCell $color="#8B6914">{fmt(op.plv.pricePerUnit)}</OPCell>
                    <OPCell $color="#8B6914" style={{ textAlign: 'center' }}>{op.plv.quantity}</OPCell>
                    <OPCell $bold $color="#8B6914">{fmt(opPLVPrice)}</OPCell>
                  </OPRow>
                </OPTable>

                {/* Pied de bloc */}
                <OPFooter>
                  <OPFooterStats>
                    <OPFooterStat>
                      <OPFooterLabel>Ouvrages</OPFooterLabel>
                      <OPFooterValue>
                        {op.books.reduce((s, { quantity }) => s + quantity, 0)} ex.
                      </OPFooterValue>
                    </OPFooterStat>
                    <OPFooterStat>
                      <OPFooterLabel>Cadeaux</OPFooterLabel>
                      <OPFooterValue>{op.cadeau.quantity} offerts</OPFooterValue>
                    </OPFooterStat>
                    <OPFooterStat>
                      <OPFooterLabel>PLV</OPFooterLabel>
                      <OPFooterValue>{op.plv.quantity} unité{op.plv.quantity > 1 ? 's' : ''}</OPFooterValue>
                    </OPFooterStat>
                  </OPFooterStats>
                  <OPFooterStat style={{ alignItems: 'flex-end' }}>
                    <OPFooterLabel>Total OP TTC</OPFooterLabel>
                    <OPFooterValue $highlight>{fmt(opTotalTTC)}</OPFooterValue>
                  </OPFooterStat>
                </OPFooter>

              </OPBlock>
            )
          })}
        </Section>
      )}

      {/* ── Livraison ── */}
      <Section>
        <DeliveryCard>
          <SectionTitle style={{ marginBottom: '16px' }}>Date de livraison</SectionTitle>
          <RadioGroup>
            <RadioLabel>
              <input type="radio" name="delivery" value="standard"
                checked={delivery === 'standard'} onChange={() => setDelivery('standard')} />
              Délai habituel (1–3 jours ouvrés)
            </RadioLabel>
            <RadioLabel>
              <input type="radio" name="delivery" value="specific"
                checked={delivery === 'specific'} onChange={() => setDelivery('specific')} />
              Date spécifique
            </RadioLabel>
            {delivery === 'specific' && (
              <div style={{ marginLeft: 'calc(1rem + 20px)', marginTop: 4 }}>
                <label htmlFor="delivery-date" style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  Date souhaitée
                </label>
                <DateInput id="delivery-date" type="date" min={today} value={specificDate}
                  onChange={e => setSpecific(e.target.value)} />
              </div>
            )}
          </RadioGroup>
        </DeliveryCard>
      </Section>

      {/* ── Action ── */}
      <Button
        variant="primary" size="lg" fullWidth
        onClick={() => setStep('confirm')}
        disabled={delivery === 'specific' && !specificDate}
      >
        Valider ma commande
      </Button>
    </Page>
  )
}
