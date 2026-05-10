import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { MOCK_FACTURES, type Facture } from '@/data/mockFactures'
import { openInvoicePDF } from '@/lib/invoicePdf'
import { DatePicker } from '@/components/ui/DatePicker'
import { mq } from '@/lib/responsive'

/* ── Helpers ── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 860px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }

  ${mq.md} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const PageHeader = styled.div`
  margin-bottom: 24px;
`

const PageEyebrow = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 4px;
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

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0 0 4px;
`

const PageSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0;
`

/* ── Barre de filtres ── */
const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
  align-items: center;
`

const FilterBreak = styled.div`
  width: 100%;
  height: 0;
`

/* ── Filtre date ── */
const DateGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const DateLabel = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`

const SearchInput = styled.input`
  height: 38px;
  padding: 0 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.875rem;
  min-width: 200px;
  flex: 1;

  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.navy};
  }
`

const ResultCount = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-left: auto;
  white-space: nowrap;
`

const ExportBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  height: 38px;
  padding: 0 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.md};
  background: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, color .15s;

  &:hover { background: ${({ theme }) => theme.colors.navy}; color: #fff; }
  &:active { opacity: 0.85; }
`

const ResetBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  height: 38px;
  padding: 0 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: none;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: border-color .15s, color .15s;

  &:hover { border-color: ${({ theme }) => theme.colors.error}; color: ${({ theme }) => theme.colors.error}; }
  &:active { opacity: 0.85; }
`

/* ── Tableau ── */
const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
`

type ThProps = { $sortable?: boolean; $active?: boolean }

const Th = styled.th<ThProps>`
  padding: 11px 14px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  letter-spacing: 0.5px;
  white-space: nowrap;
  user-select: none;
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};

  ${({ $sortable, $active }) =>
    $sortable &&
    `&:hover { background: rgba(255,255,255,0.08); }
     ${$active ? 'background: rgba(255,255,255,0.12);' : ''}`}
`

const ThCheck = styled.th`
  padding: 11px 14px;
  width: 36px;
  text-align: center;
`

const SortIcon = styled.span<{ $dir: 'asc' | 'desc' | null }>`
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  opacity: ${({ $dir }) => ($dir !== null ? 1 : 0.35)};
`

const Tbody = styled.tbody``

const Tr = styled.tr<{ $selected?: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  background: ${({ $selected, theme }) => $selected ? theme.colors.accentLight : 'transparent'};

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ $selected, theme }) => $selected ? theme.colors.accentLight : theme.colors.gray[50]}; }
`

const Td = styled.td`
  padding: 11px 14px;
  color: ${({ theme }) => theme.colors.gray[800]};
  vertical-align: middle;
`

const TdCheck = styled.td`
  padding: 11px 14px;
  text-align: center;
  vertical-align: middle;
  width: 36px;
`

const TdMono = styled(Td)`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[600]};
  letter-spacing: 0.01em;
`

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.navy};
`

/* Checkbox visible sur fond navy (header) */
const HeaderCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.75);
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  display: block;

  &:checked {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
    &::after {
      content: '';
      position: absolute;
      left: 2px;
      top: -1px;
      width: 5px;
      height: 9px;
      border: 2px solid ${({ theme }) => theme.colors.navy};
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }
  }

  &:indeterminate {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
    &::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 5px;
      width: 7px;
      height: 2px;
      background: ${({ theme }) => theme.colors.navy};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`

const EmptyRow = styled.tr``
const EmptyTd = styled.td`
  padding: 40px 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 0.875rem;
`

/* ── Bouton PDF ── */
const PdfBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 44px;
  padding: 5px 10px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  letter-spacing: 0.3px;
  white-space: nowrap;

  &:hover { background: #fdf2f2; border-color: ${({ theme }) => theme.colors.error}; }
  &:active { opacity: 0.85; }
`

/* ── Pagination ── */
const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.8125rem;
  flex-wrap: wrap;
  gap: 8px;
`

const PaginationInfo = styled.span`
  color: ${({ theme }) => theme.colors.gray[400]};
`

const PaginationBtns = styled.div`
  display: flex;
  gap: 4px;
`

type PageBtnProps = { $active?: boolean; $disabled?: boolean }

const PageBtn = styled.button<PageBtnProps>`
  min-width: 32px;
  min-height: 44px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid ${({ $active, theme }) =>
    $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.navy : theme.colors.white};
  color: ${({ $active, theme }) =>
    $active ? '#fff' : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  font-weight: ${({ $active, theme }) =>
    $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.35 : 1)};

  &:hover:not(:disabled) {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.gray[50]};
  }
`

/* ── Bouton Payer ── */
const PayBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 44px;
  padding: 5px 12px;
  background: ${({ theme }) => theme.colors.navy};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, transform .1s;

  &:hover  { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:active { transform: scale(0.96); }
`

const PaidBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #E6F4EC;
  color: #1E7045;
  border-radius: ${({ theme }) => theme.radii.xl};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`

/* ── Modal paiement ── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  width: 100%;
  max-width: 420px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const ModalTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const ModalSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 2px 0 0;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  cursor: pointer;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.gray[800]}; }
`

const TabRow = styled.div`
  display: flex;
  gap: 0;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`

const TabBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 9px;
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, color .15s;
  &:hover { background: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[50]}; }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const FormLabel = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const FormInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.gray[800]};
  background: ${({ theme }) => theme.colors.white};
  outline: none;
  transition: border-color .15s;
  &:focus { border-color: ${({ theme }) => theme.colors.navy}; }
  &::placeholder { color: ${({ theme }) => theme.colors.gray[200]}; font-family: ${({ theme }) => theme.typography.fontFamily}; }
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  & > * { min-width: 0; }
`

const PayNowBtn = styled.button<{ $loading?: boolean; $success?: boolean }>`
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $success, theme }) => $success ? '#1E7045' : theme.colors.navy};
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  transition: background .2s, transform .1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) { background: ${({ $success, theme }) => $success ? '#1E7045' : theme.colors.primaryHover}; }
  &:active:not(:disabled) { transform: scale(0.98); }
`

const IbanBlock = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const IbanRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const IbanLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const IbanValue = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[800]};
  font-weight: 600;
  letter-spacing: 0.04em;
`

const CopyBtn = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 8px;
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  white-space: nowrap;
  transition: background .12s;
  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
`

const VirBtn = styled.button`
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s, transform .1s;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:active { transform: scale(0.98); }
`

const SimulationBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.accentLight};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.45;

  svg { flex-shrink: 0; margin-top: 1px; color: ${({ theme }) => theme.colors.accent}; }
`

const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0 8px;
`

const SuccessIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #E6F4EC;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SuccessTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 1rem;
  font-weight: 700;
  color: #1E7045;
  margin: 0;
  text-align: center;
`

const SuccessText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0;
  text-align: center;
`

/* ── Icônes ── */
function IconPDF() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
      <line x1="9" y1="11" x2="11" y2="11"/>
    </svg>
  )
}


function IconCheck() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E7045" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function IconCard() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

function IconTransfer() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

/* ── localStorage ── */
const PAID_KEY = 'flowdiff_paid_invoices'
function loadPaid(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(PAID_KEY) ?? '[]') as string[]) }
  catch { return new Set() }
}
function savePaid(ids: Set<string>) {
  localStorage.setItem(PAID_KEY, JSON.stringify([...ids]))
}

/* ── Constantes ── */
const PAGE_SIZE = 10

type SortKey = 'date' | 'numero'
type SortDir = 'asc' | 'desc'

/* ════════════════════════════════════════════════════════
   Composant principal
════════════════════════════════════════════════════════ */
export function FacturationPage() {
  const { user } = useAuthContext()

  const allFactures: Facture[] = useMemo(
    () => MOCK_FACTURES[user?.codeClient ?? ''] ?? [],
    [user?.codeClient],
  )

  /* ── Paiement ── */
  const [paidIds,       setPaidIds]       = useState<Set<string>>(() => loadPaid())
  const [paymentModal,  setPaymentModal]  = useState<Facture | null>(null)
  const [payTab,        setPayTab]        = useState<'cb' | 'virement'>('cb')
  const [cardNumber,    setCardNumber]    = useState('')
  const [cardExpiry,    setCardExpiry]    = useState('')
  const [cardCvv,       setCardCvv]       = useState('')
  const [payLoading,    setPayLoading]    = useState(false)
  const [paySuccess,    setPaySuccess]    = useState(false)

  function openPayment(f: Facture) {
    setPaymentModal(f)
    setPayTab('cb')
    setCardNumber('')
    setCardExpiry('')
    setCardCvv('')
    setPayLoading(false)
    setPaySuccess(false)
  }

  function closePayment() { setPaymentModal(null) }

  function handleResetPaid() {
    const next = new Set<string>()
    setPaidIds(next)
    savePaid(next)
  }

  function handlePay() {
    setPayLoading(true)
    setTimeout(() => {
      setPayLoading(false)
      setPaySuccess(true)
      if (paymentModal) {
        const next = new Set(paidIds)
        next.add(paymentModal.id)
        setPaidIds(next)
        savePaid(next)
      }
    }, 1600)
  }

  function handleVirement() {
    setPaySuccess(true)
    if (paymentModal) {
      const next = new Set(paidIds)
      next.add(paymentModal.id)
      setPaidIds(next)
      savePaid(next)
    }
  }

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits
  }

  /* ── Ref pour le checkbox "tout sélectionner" ── */
  const refSelectAll = useRef<HTMLInputElement>(null)

  /* ── État filtres / tri / pagination ── */
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [search,   setSearch]   = useState('')
  const [sortKey,  setSortKey]  = useState<SortKey>('date')
  const [sortDir,  setSortDir]  = useState<SortDir>('desc')
  const [page,     setPage]     = useState(1)

  /* ── Sélection pour export ── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  /* ── Tri toggle ── */
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(1)
  }

  /* ── Filtres + tri ── */
  const filtered = useMemo(() => {
    let list = [...allFactures]

    if (dateFrom) list = list.filter(f => f.date >= dateFrom)
    if (dateTo)   list = list.filter(f => f.date <= dateTo)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(f => f.numero.toLowerCase().includes(q))
    }

    list.sort((a, b) => {
      const cmp = sortKey === 'date'
        ? a.date.localeCompare(b.date)
        : a.numero.localeCompare(b.numero)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [allFactures, dateFrom, dateTo, search, sortKey, sortDir])

  /* ── Ref pour lire filtered dans les effects sans dépendance ── */
  const filteredRef = useRef(filtered)
  filteredRef.current = filtered

  /* ── Auto-sélection quand le filtre date change ── */
  useEffect(() => {
    setPage(1)
    if (dateFrom || dateTo) {
      setSelectedIds(new Set(filteredRef.current.map(f => f.id)))
    } else {
      setSelectedIds(new Set())
    }
  }, [dateFrom, dateTo])

  /* ── Reset sélection quand la recherche change ── */
  useEffect(() => { setSelectedIds(new Set()); setPage(1) }, [search])

  /* ── État du checkbox "tout sélectionner" ── */
  const allFilteredSelected = filtered.length > 0 && filtered.every(f => selectedIds.has(f.id))
  const someSelected        = filtered.some(f => selectedIds.has(f.id))

  useEffect(() => {
    if (!refSelectAll.current) return
    refSelectAll.current.indeterminate = someSelected && !allFilteredSelected
  }, [someSelected, allFilteredSelected])

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(f => f.id)))
    }
  }

  function toggleRow(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* ── Pagination ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function goToPage(p: number) { setPage(Math.max(1, Math.min(p, totalPages))) }

  /* ── Handlers filtres ── */
  function handleDateFrom(v: string) { setDateFrom(v) }
  function handleDateTo(v: string)   { setDateTo(v) }
  function handleSearch(v: string)   { setSearch(v) }

  /* ── Export CSV ── */
  function exportCSV() {
    const source = selectedIds.size > 0
      ? filtered.filter(f => selectedIds.has(f.id))
      : filtered

    const headers = ['Numéro', 'Date émission', 'Date échéance', 'Date livraison', 'Réf. commande', 'Net HT (€)', 'TVA (€)', 'Total TTC (€)', 'Mode paiement', 'Conditions']
    const rows = source.map(f => [
      f.numero,
      fmtDate(f.date),
      fmtDate(f.dateEcheance),
      fmtDate(f.dateLivraison),
      f.refCommande,
      f.netHT.toFixed(2).replace('.', ','),
      f.montantTVA.toFixed(2).replace('.', ','),
      f.totalTTC.toFixed(2).replace('.', ','),
      f.modePaiement,
      f.conditionsPaiement,
    ])

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_')
    a.download = `Facture_${today}.csv`

    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── Icône de tri ── */
  function sortIcon(key: SortKey) {
    if (sortKey !== key) return <SortIcon $dir={null}>↕</SortIcon>
    return <SortIcon $dir={sortDir}>{sortDir === 'asc' ? '↑' : '↓'}</SortIcon>
  }

  /* ── Pages à afficher dans la pagination ── */
  const pageNumbers = useMemo(() => {
    const range: (number | '…')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i)
    } else {
      range.push(1)
      if (currentPage > 3) range.push('…')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        range.push(i)
      }
      if (currentPage < totalPages - 2) range.push('…')
      range.push(totalPages)
    }
    return range
  }, [currentPage, totalPages])

  const exportLabel = selectedIds.size > 0
    ? `Export CSV (${selectedIds.size} sélectionnée${selectedIds.size > 1 ? 's' : ''})`
    : 'Export CSV'

  /* ── Rendu ── */
  return (
    <Page>
      <PageHeader>
        <PageEyebrow>Mon espace</PageEyebrow>
        <PageTitle>Facturation</PageTitle>
        <PageSubtitle>Retrouvez l'ensemble de vos factures et téléchargez-les en PDF.</PageSubtitle>
      </PageHeader>

      {/* Filtres */}
      <FiltersRow>
        {/* Du */}
        <DateGroup>
          <DateLabel>Du</DateLabel>
          <DatePicker
            value={dateFrom}
            onChange={handleDateFrom}
            max={dateTo || undefined}
          />
        </DateGroup>

        {/* Au */}
        <DateGroup>
          <DateLabel>Au</DateLabel>
          <DatePicker
            value={dateTo}
            onChange={handleDateTo}
            min={dateFrom || undefined}
          />
        </DateGroup>

        <SearchInput
          type="search"
          placeholder="Rechercher un numéro de facture…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          aria-label="Rechercher par numéro de facture"
        />

        <ResultCount>
          {filtered.length} facture{filtered.length !== 1 ? 's' : ''}
        </ResultCount>

        <FilterBreak />

        <ExportBtn type="button" onClick={exportCSV} aria-label="Exporter les factures en CSV">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {exportLabel}
        </ExportBtn>

        {paidIds.size > 0 && (
          <ResetBtn
            type="button"
            onClick={handleResetPaid}
            aria-label="Réinitialiser les paiements de démonstration"
            style={{ marginLeft: 'auto' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Réinitialiser les paiements
          </ResetBtn>
        )}
      </FiltersRow>

      {/* Tableau */}
      <TableWrapper>
        <Table>
          <Thead>
            <tr>
              <ThCheck>
                <HeaderCheckbox
                  ref={refSelectAll}
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  aria-label="Sélectionner toutes les factures"
                />
              </ThCheck>
              <Th
                $sortable
                $active={sortKey === 'date'}
                onClick={() => handleSort('date')}
                title="Trier par date"
              >
                Date fact. {sortIcon('date')}
              </Th>
              <Th
                $sortable
                $active={sortKey === 'numero'}
                onClick={() => handleSort('numero')}
                title="Trier par numéro"
              >
                Numéro fact. {sortIcon('numero')}
              </Th>
              <Th>Montant T.T.C.</Th>
              <Th aria-label="PDF">PDF</Th>
              <Th aria-label="Payer">Payer</Th>
            </tr>
          </Thead>
          <Tbody>
            {pageItems.length === 0 ? (
              <EmptyRow>
                <EmptyTd colSpan={6}>
                  Aucune facture ne correspond à votre recherche.
                </EmptyTd>
              </EmptyRow>
            ) : (
              pageItems.map(f => {
                const isSelected = selectedIds.has(f.id)
                return (
                  <Tr key={f.id} $selected={isSelected}>
                    <TdCheck>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(f.id)}
                        aria-label={`Sélectionner la facture ${f.numero}`}
                      />
                    </TdCheck>
                    <Td>{fmtDate(f.date)}</Td>
                    <TdMono>{f.numero}</TdMono>
                    <Td>
                      {f.totalTTC.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} €
                    </Td>
                    <Td>
                      <PdfBtn
                        type="button"
                        onClick={() => openInvoicePDF(f)}
                        aria-label={`Ouvrir la facture ${f.numero} en PDF`}
                        title={`Ouvrir la facture ${f.numero}`}
                      >
                        <IconPDF />
                        PDF
                      </PdfBtn>
                    </Td>
                    <Td>
                      {paidIds.has(f.id) ? (
                        <PaidBadge aria-label="Facture payée">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Payé
                        </PaidBadge>
                      ) : (
                        <PayBtn
                          type="button"
                          onClick={() => openPayment(f)}
                          aria-label={`Payer la facture ${f.numero}`}
                        >
                          <IconCard />
                          Payer
                        </PayBtn>
                      )}
                    </Td>
                  </Tr>
                )
              })
            )}
          </Tbody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationBar>
            <PaginationInfo>
              Page {currentPage} / {totalPages} — {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
              {selectedIds.size > 0 && ` — ${selectedIds.size} sélectionnée${selectedIds.size > 1 ? 's' : ''}`}
            </PaginationInfo>

            <PaginationBtns>
              <PageBtn
                type="button"
                onClick={() => goToPage(1)}
                $disabled={currentPage === 1}
                disabled={currentPage === 1}
                title="Première page"
                aria-label="Aller à la première page"
              >«</PageBtn>
              <PageBtn
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                $disabled={currentPage === 1}
                disabled={currentPage === 1}
                title="Page précédente"
                aria-label="Page précédente"
              >‹</PageBtn>

              {pageNumbers.map((p, i) =>
                p === '…' ? (
                  <PageBtn key={`ellipsis-${i}`} $disabled disabled style={{ cursor: 'default' }}>…</PageBtn>
                ) : (
                  <PageBtn
                    key={p}
                    type="button"
                    $active={p === currentPage}
                    onClick={() => goToPage(p as number)}
                    aria-label={`Page ${p}`}
                    aria-current={p === currentPage ? 'page' : undefined}
                  >{p}</PageBtn>
                ),
              )}

              <PageBtn
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                $disabled={currentPage === totalPages}
                disabled={currentPage === totalPages}
                title="Page suivante"
                aria-label="Page suivante"
              >›</PageBtn>
              <PageBtn
                type="button"
                onClick={() => goToPage(totalPages)}
                $disabled={currentPage === totalPages}
                disabled={currentPage === totalPages}
                title="Dernière page"
                aria-label="Aller à la dernière page"
              >»</PageBtn>
            </PaginationBtns>
          </PaginationBar>
        )}
      </TableWrapper>


      {/* ── Modal paiement ── */}
      {paymentModal && createPortal(
        <Overlay onClick={e => { if (e.target === e.currentTarget) closePayment() }}>
          <ModalBox role="dialog" aria-modal="true" aria-label="Paiement de la facture">
            <ModalHeader>
              <div>
                <ModalTitle>Règlement de la facture</ModalTitle>
                <ModalSubtitle>{paymentModal.numero} · {paymentModal.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</ModalSubtitle>
              </div>
              <CloseBtn onClick={closePayment} aria-label="Fermer">×</CloseBtn>
            </ModalHeader>

            {!paySuccess && (
              <SimulationBanner role="note">
                <IconInfo />
                <span><strong>Application de démonstration&nbsp;— aucun paiement réel ne sera effectué.</strong> Cliquez sur&nbsp;«&nbsp;Payer&nbsp;» pour simuler le règlement de cette facture.</span>
              </SimulationBanner>
            )}

            {paySuccess ? (
              <SuccessBox>
                <SuccessIcon><IconCheck /></SuccessIcon>
                <SuccessTitle>Paiement confirmé</SuccessTitle>
                <SuccessText>La facture {paymentModal.numero} a bien été réglée.</SuccessText>
                <PayNowBtn $success onClick={closePayment}>Fermer</PayNowBtn>
              </SuccessBox>
            ) : (
              <>
                <TabRow>
                  <TabBtn $active={payTab === 'cb'} onClick={() => setPayTab('cb')}>
                    <IconCard /> Carte bancaire
                  </TabBtn>
                  <TabBtn $active={payTab === 'virement'} onClick={() => setPayTab('virement')}>
                    <IconTransfer /> Virement
                  </TabBtn>
                </TabRow>

                {payTab === 'cb' ? (
                  <>
                    <FormGroup>
                      <FormLabel>Numéro de carte</FormLabel>
                      <FormInput
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        autoComplete="cc-number"
                      />
                    </FormGroup>
                    <FormRow>
                      <FormGroup>
                        <FormLabel>Expiration</FormLabel>
                        <FormInput
                          type="text"
                          inputMode="numeric"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                          autoComplete="cc-exp"
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormLabel>CVV</FormLabel>
                        <FormInput
                          type="text"
                          inputMode="numeric"
                          placeholder="123"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                          autoComplete="cc-csc"
                        />
                      </FormGroup>
                    </FormRow>
                    <PayNowBtn
                      onClick={handlePay}
                      disabled={payLoading}
                      $loading={payLoading}
                      aria-label="Confirmer le paiement"
                    >
                      {payLoading ? 'Traitement en cours…' : `Payer ${paymentModal.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                    </PayNowBtn>
                  </>
                ) : (
                  <>
                    <IbanBlock>
                      <IbanRow>
                        <div>
                          <IbanLabel>IBAN</IbanLabel>
                          <div><IbanValue>FR76 9999 9000 0012 3456 7890 077</IbanValue></div>
                        </div>
                        <CopyBtn onClick={() => navigator.clipboard.writeText('FR7699999000001234567890077')}>Copier</CopyBtn>
                      </IbanRow>
                      <IbanRow>
                        <div>
                          <IbanLabel>BIC</IbanLabel>
                          <div><IbanValue>FICTFR99XXX</IbanValue></div>
                        </div>
                        <CopyBtn onClick={() => navigator.clipboard.writeText('FICTFR99XXX')}>Copier</CopyBtn>
                      </IbanRow>
                      <IbanRow>
                        <div>
                          <IbanLabel>Référence</IbanLabel>
                          <div><IbanValue>{paymentModal.numero}</IbanValue></div>
                        </div>
                        <CopyBtn onClick={() => navigator.clipboard.writeText(paymentModal.numero)}>Copier</CopyBtn>
                      </IbanRow>
                    </IbanBlock>
                    <VirBtn onClick={handleVirement} aria-label="Confirmer le virement">
                      J'ai effectué le virement
                    </VirBtn>
                  </>
                )}
              </>
            )}
          </ModalBox>
        </Overlay>,
        document.body,
      )}
    </Page>
  )
}
