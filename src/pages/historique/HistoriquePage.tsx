import { useState, useMemo } from 'react'
import { exportToCSV } from '@/lib/csv'
import { theme } from '@/lib/theme'
import styled, { keyframes } from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { useCart, REMISE_RATES } from '@/contexts/CartContext'
import { useClientOrders } from '@/contexts/OrdersContext'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus, type Order, type OrderItem } from '@/data/mockOrders'
import { MOCK_BOOKS } from '@/data/mockBooks'
import { TrackingModal } from '@/components/historique/TrackingModal'
import type { Shipment } from '@/data/mockOrders'
import { useReturns } from '@/contexts/ReturnsContext'
import { ReturnCard } from '@/components/historique/ReturnCard'
import { NewReturnModal } from '@/components/historique/NewReturnModal'
import { DatePicker } from '@/components/ui/DatePicker'
import { IconSearch } from '@/components/ui/icons'

/* ── Animations ── */
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ── Couleurs par statut — palette Forêt & Lin ── */
const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  'en préparation': { bg: '#F7F0DC', text: '#8B6914', dot: '#8B6914' },
  'expédié':        { bg: '#E6EFE9', text: theme.colors.success, dot: theme.colors.success },
  'livré':          { bg: '#D4EDDA', text: '#155724', dot: '#155724' },
}

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 900px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const PageHeader = styled.div`
  margin-bottom: 0;
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
  margin: 0;
`

/* ── Filtres ── */
const FiltersBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const SearchWrapper = styled.div`
  position: relative;
`

const SearchIconWrap = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  pointer-events: none;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 38px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background-color: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
`

const SelectRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`

const DateGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`

const DateLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
`

const ResultCount = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
`

/* ── Carte commande ── */
const OrderCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.gray[100]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
`

const OrderCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.navyLight};
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const OrderNumero = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const OrderDate = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
`

/* ── Badge statut ── */
const StatusBadge = styled.span<{ $bg: string; $text: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  white-space: nowrap;
  flex-shrink: 0;
`

const StatusDot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

/* ── Filtres pills statut ── */
const FilterPillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const FilterPill = styled.button<{ $active: boolean }>`
  padding: 5px 13px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.navy};
  }
`

/* ── Bandeau livraison ── */
const DeliveryBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const DeliveryLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

/* ── Corps ── */
const OrderBody = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`

const ItemsList = styled.ul`
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding: 0;
`

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child { border-bottom: none; }
`

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ItemTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ItemIsbnRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
`

const ItemIsbn = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: monospace;
  letter-spacing: 0.03em;
`

const BookTypeTag = styled.span<{ $type: 'nouveaute' | 'fonds' }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background-color: ${({ $type, theme }) =>
    $type === 'nouveaute' ? theme.colors.accentLight : theme.colors.navyLight};
  color: ${({ $type, theme }) =>
    $type === 'nouveaute' ? theme.colors.accent : theme.colors.navy};
  letter-spacing: 0.02em;
  flex-shrink: 0;
`

const PubDateNote = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const ItemStatutLine = styled.div<{ $variant: 'sur_commande' | 'reimp' }>`
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ $variant }) => $variant === 'reimp' ? '#B65A00' : '#1C3252'};
`

const ItemQtyPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 1px;
`

const OrderFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const TotalLine = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
`

const TotalAmount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.navy};
`

const FooterRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`

const DupliquerButton = styled.button<{ $done?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: ${({ $done, theme }) => $done ? '#2E7D32' : theme.colors.primary};
  color: #fdfdfd;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ $done, theme }) => $done ? '#1B5E20' : theme.colors.primaryHover};
  }
  &:disabled { cursor: not-allowed; opacity: 0.8; }
`

const SuccessAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: #2E7D32;
  animation: ${fadeSlideIn} 0.2s ease forwards;
`

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.navy};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.navy};
  }
`

const ExportAllButton = styled(ExportButton)`
  padding: 9px 16px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
`

const TrackingLink = styled.button`
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  color: ${({ theme }) => theme.colors.success};
  letter-spacing: 0.04em;
  display: flex; align-items: center; gap: 4px;
  &:hover { text-decoration: underline; }
`

const ReturnButton = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.navy};
  }
`

const ReturnDeadlineText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.error};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  text-align: right;
`

const ReturnInfoBanner = styled.div`
  background: ${({ theme }) => theme.colors.navyLight};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px 14px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ReturnInfoLine = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const TabsBar = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const TabBtn = styled.button<{ $active: boolean }>`
  padding: 8px 18px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.navy};
  }
`

const TabBadge = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: ${({ theme }) => theme.colors.accent};
  color: white; border-radius: ${({ theme }) => theme.radii.full};
  font-size: 11px; font-weight: 700;
  margin-left: 6px;
`

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  border-top: 3px solid ${({ theme }) => theme.colors.accent};
`

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 4px;
`

const StatSub = styled.div`
  font-size: 10px; color: ${({ theme }) => theme.colors.gray[400]};
  margin-top: 2px;
`

/* ── CSV Export ── */
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

/* ── Utils ── */
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}

function addDaysToDate(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getBookType(bookId: string) {
  return MOCK_BOOKS.find(b => b.id === bookId)?.type ?? 'fonds'
}

function isOrderMixed(order: Order): boolean {
  const types = new Set(order.items.map(item => getBookType(item.bookId)))
  return types.has('nouveaute') && types.has('fonds')
}

function computeReturnDeadline(order: Order): string {
  const hasNouveaute = order.items.some(item => getBookType(item.bookId) === 'nouveaute')
  return addDaysToDate(order.date, hasNouveaute ? 30 : 60)
}

function getItemReturnDeadline(item: OrderItem, orderDate: string): string {
  const days = getBookType(item.bookId) === 'nouveaute' ? 30 : 60
  return addDaysToDate(orderDate, days)
}
function formatDateLong(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso))
}
function formatEur(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}

/* ── Icons ── */
function IconDuplicate() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
}
function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconDownload() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function IconDocument() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
}
/* ── Component ── */
export function HistoriquePage() {
  const { user } = useAuthContext()
  const { addToCart } = useCart()
  const clientOrders = useClientOrders(user?.codeClient ?? '')

  const [search, setSearch]                 = useState('')
  const [dateFrom, setDateFrom]             = useState('')
  const [dateTo,   setDateTo]               = useState('')
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [addedMap, setAddedMap]             = useState<Record<string, boolean>>({})
  const [trackingModal, setTrackingModal]   = useState<{ shipment: Shipment; requestedDeliveryDate?: string } | null>(null)
  const [newReturnOrderId, setNewReturnOrderId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'commandes' | 'retours'>('commandes')
  const { returns, loading: returnsLoading, stats: returnsStats } = useReturns()

  const allOrders = useMemo(() => {
    const sorted = clientOrders.slice().sort((a, b) => b.date.localeCompare(a.date))
    const pinnedIdx = sorted.findIndex(o => o.status === 'livré')
    if (pinnedIdx <= 0) return sorted
    const [pinned] = sorted.splice(pinnedIdx, 1)
    return [pinned, ...sorted]
  }, [clientOrders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allOrders.filter(order => {
      if (dateFrom && order.date < dateFrom) return false
      if (dateTo   && order.date > dateTo)   return false
      if (selectedStatus && order.status !== selectedStatus) return false
      if (!q) return true
      return order.items.some(
        item => item.title.toLowerCase().includes(q) || item.isbn.includes(q)
      )
    })
  }, [allOrders, search, dateFrom, dateTo, selectedStatus])

  if (!user) return null

  function handleDupliquer(order: Order) {
    let added = 0
    for (const item of order.items) {
      const book = MOCK_BOOKS.find(b => b.id === item.bookId)
      if (book) { addToCart(book, item.quantity); added++ }
    }
    if (added > 0) {
      setAddedMap(prev => ({ ...prev, [order.id]: true }))
      setTimeout(() => {
        setAddedMap(prev => ({ ...prev, [order.id]: false }))
      }, 3000)
    }
  }

  const hasFilters = !!(search || dateFrom || dateTo || selectedStatus)

  function handleExportAll() {
    exportToCSV('bookflow_historique_complet.csv', getHeaders(true), buildRows(filtered))
  }

  function handleExportOrder(order: Order) {
    exportToCSV(`${order.numero}_commande.csv`, getHeaders(false), buildRows([order]))
  }

  function handleReturnSuccess() {
    setActiveTab('retours')
  }

  return (
    <>
    <Page>
      <TitleRow>
        <PageHeader>
          <PageEyebrow>Mon espace</PageEyebrow>
          <PageTitle>Mon historique</PageTitle>
        </PageHeader>
        {activeTab === 'commandes' && allOrders.length > 0 && (
          <ExportAllButton onClick={handleExportAll} title="Exporter toutes les commandes en CSV">
            <IconDownload />
            Exporter tout
          </ExportAllButton>
        )}
      </TitleRow>

      <TabsBar>
        <TabBtn $active={activeTab === 'commandes'} onClick={() => setActiveTab('commandes')}>
          Mes commandes
          {allOrders.length > 0 && <TabBadge>{allOrders.length}</TabBadge>}
        </TabBtn>
        <TabBtn $active={activeTab === 'retours'} onClick={() => setActiveTab('retours')}>
          Mes retours
          {returns.length > 0 && <TabBadge>{returns.length}</TabBadge>}
        </TabBtn>
      </TabsBar>

      {activeTab === 'commandes' && (
        <>
      {allOrders.length > 0 && (
        <FiltersBar>
          {/* Recherche + plage de dates sur la même ligne */}
          <SelectRow>
            <SearchWrapper style={{ flex: 1, maxWidth: '320px' }}>
              <SearchIconWrap><IconSearch /></SearchIconWrap>
              <SearchInput
                type="search"
                placeholder="Titre ou ISBN…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SearchWrapper>
            <DateGroup>
              <DateLabel>Du</DateLabel>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
                max={dateTo || undefined}
                placeholder="JJ/MM/AAAA"
              />
            </DateGroup>
            <DateGroup>
              <DateLabel>Au</DateLabel>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
                min={dateFrom || undefined}
                placeholder="JJ/MM/AAAA"
              />
            </DateGroup>
          </SelectRow>

          {/* Filtre statut — pills */}
          <FilterPillsRow>
            <FilterPill $active={selectedStatus === null} onClick={() => setSelectedStatus(null)}>
              Tous
            </FilterPill>
            {ORDER_STATUSES.map(s => (
              <FilterPill
                key={s}
                $active={selectedStatus === s}
                onClick={() => setSelectedStatus(prev => prev === s ? null : s)}
              >
                {ORDER_STATUS_LABELS[s]}
              </FilterPill>
            ))}
          </FilterPillsRow>

          {hasFilters && (
            <ResultCount>
              {filtered.length} commande{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
            </ResultCount>
          )}
        </FiltersBar>
      )}

      {filtered.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📦</div>
          <p>{allOrders.length === 0
            ? "Vous n'avez pas encore passé de commande."
            : 'Aucune commande ne correspond à votre recherche.'}
          </p>
        </EmptyState>
      ) : (
        filtered.map(order => {
          const isDone = !!addedMap[order.id]
          const isMixed = order.status === 'livré' && isOrderMixed(order)
          return (
            <OrderCard key={order.id}>
              {/* En-tête */}
              <OrderCardHeader>
                <div>
                  <OrderNumero>{order.numero}</OrderNumero>
                  <OrderDate>{formatDate(order.date)}</OrderDate>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {(order.status === 'expédié' || order.status === 'livré') && order.shipment && (
                    <TrackingLink
                      onClick={() => setTrackingModal({
                        shipment: order.shipment!,
                        requestedDeliveryDate: order.deliveryMode === 'specific' ? order.deliveryDate : undefined,
                      })}
                      aria-label="Voir le suivi"
                    >
                      📦 {order.shipment.trackingNumber}
                    </TrackingLink>
                  )}
                  <StatusBadge
                    $bg={STATUS_COLORS[order.status].bg}
                    $text={STATUS_COLORS[order.status].text}
                  >
                    <StatusDot $color={STATUS_COLORS[order.status].dot} />
                    {ORDER_STATUS_LABELS[order.status]}
                  </StatusBadge>
                </div>
              </OrderCardHeader>

              {/* Livraison */}
              <DeliveryBanner>
                {order.shipment ? (
                  order.shipment.deliveredAt ? (
                    <>✅ <DeliveryLabel>Livré le {formatDate(order.shipment.deliveredAt.split('T')[0])}</DeliveryLabel></>
                  ) : (
                    <>🚚 Livraison estimée :&nbsp;<DeliveryLabel>{formatDateLong(order.shipment.estimatedDelivery)}</DeliveryLabel></>
                  )
                ) : order.deliveryMode === 'specific' && order.deliveryDate ? (
                  <>Livraison prévue le&nbsp;<DeliveryLabel>{formatDate(order.deliveryDate)}</DeliveryLabel></>
                ) : (
                  <>Délai de livraison&nbsp;:&nbsp;<DeliveryLabel>1–3 jours ouvrés</DeliveryLabel></>
                )}
              </DeliveryBanner>

              {/* Articles */}
              <OrderBody>
                <ItemsList>
                  {order.items.map((item, idx) => (
                    <Item key={idx}>
                      <ItemInfo>
                        <ItemTitle>{item.title}</ItemTitle>
                        {item.enReliquat ? (
                          <ItemStatutLine $variant="reimp">
                            🔁 En attente de réimpression
                          </ItemStatutLine>
                        ) : item.statut === 'sur_commande' ? (
                          <ItemStatutLine $variant="sur_commande">
                            🔄 Commande spéciale en cours
                          </ItemStatutLine>
                        ) : null}
                        <ItemIsbnRow>
                          <ItemIsbn>ISBN {item.isbn}</ItemIsbn>
                          {(() => {
                            const book = MOCK_BOOKS.find(b => b.id === item.bookId)
                            if (!book || book.type === 'a-paraitre') return null
                            return (
                              <>
                                <BookTypeTag $type={book.type}>
                                  {book.type === 'nouveaute' ? 'Nouveauté' : 'Fonds'}
                                </BookTypeTag>
                                {book.type === 'nouveaute' && book.publicationDate && (
                                  <PubDateNote>
                                    (paru le {new Date(book.publicationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                                  </PubDateNote>
                                )}
                              </>
                            )
                          })()}
                        </ItemIsbnRow>
                        {isMixed && (
                          <ReturnDeadlineText style={{ textAlign: 'left', marginTop: '3px' }}>
                            Date limite retour : {getItemReturnDeadline(item, order.date)}
                          </ReturnDeadlineText>
                        )}
                      </ItemInfo>
                      <ItemQtyPrice>
                        {item.quantity} × {formatEur(item.unitPriceTTC ?? MOCK_BOOKS.find(b => b.id === item.bookId)?.priceTTC ?? item.unitPriceHT)}
                      </ItemQtyPrice>
                    </Item>
                  ))}
                </ItemsList>

                <OrderFooter>
                  <TotalLine>
                    Total TTC : <TotalAmount>{formatEur(order.totalTTC)}</TotalAmount>
                  </TotalLine>
                  <FooterRight>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <ExportButton
                        onClick={() => handleExportOrder(order)}
                        aria-label={`Exporter la commande ${order.numero} en CSV`}
                        title="Exporter en CSV"
                      >
                        <IconDownload />
                        CSV
                      </ExportButton>
                      <DupliquerButton
                        $done={isDone}
                        onClick={() => handleDupliquer(order)}
                        disabled={isDone}
                        aria-label={`Dupliquer la commande ${order.numero}`}
                      >
                        {isDone ? <IconCheck /> : <IconDuplicate />}
                        {isDone ? 'Ajouté au panier' : 'Dupliquer'}
                      </DupliquerButton>
                      {order.status === 'livré' && (
                        <ReturnButton onClick={() => setNewReturnOrderId(order.id)}>
                          <IconDocument /> Retour
                        </ReturnButton>
                      )}
                    </div>
                    {order.status === 'livré' && !isMixed && (
                      <ReturnDeadlineText>
                        Date limite retour : {computeReturnDeadline(order)}
                      </ReturnDeadlineText>
                    )}
                    {isDone && (
                      <SuccessAlert>
                        <IconCheck />
                        Titre{order.items.length > 1 ? 's' : ''} ajouté{order.items.length > 1 ? 's' : ''} au panier
                      </SuccessAlert>
                    )}
                  </FooterRight>
                </OrderFooter>
              </OrderBody>
            </OrderCard>
          )
        })
      )}
        </>
      )}

      {activeTab === 'retours' && (
        <>
          <ReturnInfoBanner>
            <ReturnInfoLine>Nouveautés : date limite de retour 30 jours à compter de la commande</ReturnInfoLine>
            <ReturnInfoLine>Fonds : date limite de retour 60 jours à compter de la commande</ReturnInfoLine>
          </ReturnInfoBanner>

          {!returnsLoading && returnsStats && returns.length > 0 && (
            <StatsGrid>
              <StatCard>
                <StatValue>{returnsStats.activeCount}</StatValue>
                <StatLabel>Retours en cours</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(returnsStats.avoirYTD)}
                </StatValue>
                <StatLabel>Avoirs reçus (année)</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{Math.round(returnsStats.returnRatio * 100)}%</StatValue>
                <StatLabel>Taux de retour</StatLabel>
                <StatSub>Secteur : {Math.round(returnsStats.sectorAverage * 100)}%</StatSub>
              </StatCard>
            </StatsGrid>
          )}

          {returnsLoading ? (
            <EmptyState>Chargement…</EmptyState>
          ) : returns.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📦</div>
              <p>Aucun retour pour le moment.</p>
            </EmptyState>
          ) : (
            returns.map(ret => <ReturnCard key={ret.id} ret={ret} />)
          )}
        </>
      )}
    </Page>
    {trackingModal && (
      <TrackingModal
        shipment={trackingModal.shipment}
        requestedDeliveryDate={trackingModal.requestedDeliveryDate}
        onClose={() => setTrackingModal(null)}
      />
    )}
    {newReturnOrderId !== null && (
      <NewReturnModal
        orders={allOrders}
        preselectedOrderId={newReturnOrderId}
        codeClient={user.codeClient}
        onClose={() => setNewReturnOrderId(null)}
        onSuccess={handleReturnSuccess}
      />
    )}
    </>
  )
}
