import { useState, useMemo } from 'react'
import { theme } from '@/lib/theme'
import styled, { keyframes } from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { useCart, REMISE_RATES } from '@/contexts/CartContext'
import { useClientOrders } from '@/contexts/OrdersContext'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus, type Order } from '@/data/mockOrders'
import { TrackingModal } from '@/components/historique/TrackingModal'
import type { Shipment } from '@/data/mockOrders'
import { MOCK_BOOKS } from '@/data/mockBooks'

/* ── Animations ── */
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`

/* ── Couleurs par statut — palette Forêt & Lin ── */
const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  'en cours': { bg: '#F7F0DC', text: '#8B6914', dot: '#8B6914' },   // or — en attente
  'reçu':     { bg: '#EFF4F1', text: '#2D6A52', dot: '#2D6A52' },   // vert doux — reçu
  'facturé':  { bg: '#EAEAE6', text: '#555550', dot: '#555550' },   // gris neutre — admin
  'expédié':  { bg: '#E6EFE9', text: theme.colors.success, dot: theme.colors.success },   // vert forêt — terminé
}

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

const SelectGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`

const SelectLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  flex-shrink: 0;
`

const Select = styled.select`
  flex: 1;
  padding: 8px 30px 8px 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background-color: ${({ theme }) => theme.colors.white};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23226241' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ResultCount = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
`

/* ── Carte commande ── */
const OrderCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
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
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const OrderDate = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
`

/* ── Stepper statut ── */
const StepperWrap = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  gap: 0;
  overflow-x: auto;

  &::-webkit-scrollbar { display: none; }
`

const Step = styled.div<{ $done: boolean; $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 60px;
  position: relative;
`

const StepDot = styled.div<{ $done: boolean; $active: boolean; $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background-color: ${({ $done, $active, $color, theme }) =>
    $active ? $color : $done ? $color : theme.colors.gray[200]};
  color: ${({ $done, $active, theme }) =>
    $done || $active ? theme.colors.white : theme.colors.gray[400]};
  outline: ${({ $active }) => $active ? '3px solid rgba(34,98,65,0.25)' : 'none'};
  outline-offset: 2px;
  transform: ${({ $active }) => $active ? 'scale(1.15)' : 'scale(1)'};
  z-index: 1;
`

const StepLabel = styled.div<{ $active: boolean; $done: boolean }>`
  font-size: 10px;
  font-weight: ${({ $active, theme }) => $active ? theme.typography.weights.bold : theme.typography.weights.medium};
  color: ${({ $active, $done, theme }) =>
    $active ? theme.colors.navy : $done ? theme.colors.gray[600] : theme.colors.gray[400]};
  margin-top: 4px;
  text-align: center;
  white-space: nowrap;
`

const StepConnector = styled.div<{ $done: boolean; $color: string }>`
  flex: 1;
  height: 2px;
  background-color: ${({ $done, $color, theme }) => $done ? $color : theme.colors.gray[200]};
  margin-bottom: 18px;
  transition: background-color 0.2s ease;
  min-width: 12px;
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

const ItemIsbn = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
  font-family: monospace;
  letter-spacing: 0.03em;
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
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.md};
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

/* ── CSV Export ── */
function buildCSVRows(orders: Order[]): string {
  const BOM = '\uFEFF'
  const SEP = ';'
  const multiOrder = orders.length > 1

  const headers = [
    ...(multiOrder ? ['Numéro'] : []),
    'Date cmd.',
    'ISBN', 'Titre', 'Auteur', 'Date de parution',
    'Prix TTC (€)', 'Prix remisé TTC (€)', 'Quantité',
  ]

  const rows: string[][] = orders.flatMap(order =>
    order.items.map(item => {
      const book = MOCK_BOOKS.find(b => b.id === item.bookId)
      const pubDate = book ? book.publicationDate : ''
      const remiseRate = REMISE_RATES[item.universe as keyof typeof REMISE_RATES] ?? 0
      const prixTTC = (item.unitPriceHT * 1.055).toFixed(2).replace('.', ',')
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
        String(item.quantity),
      ]
    })
  )

  const escape = (v: string) => v.includes(SEP) || v.includes('"') || v.includes('\n')
    ? `"${v.replace(/"/g, '""')}"` : v

  const csv = [headers, ...rows].map(r => r.map(escape).join(SEP)).join('\r\n')
  return BOM + csv
}


/* ── Utils ── */
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}
function formatDateLong(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso))
}
function formatMonthKey(iso: string) { return iso.slice(0, 7) }
function formatMonthLabel(key: string) {
  const [year, month] = key.split('-')
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1))
}
function formatEur(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}

/* ── Icons ── */
function IconSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconDuplicate() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
}
function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconDownload() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
/* ── Stepper component ── */
function OrderStepper({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_STATUSES.indexOf(status)
  const color = (STATUS_COLORS[status] ?? STATUS_COLORS['en cours']).dot

  return (
    <StepperWrap aria-label="Statut de la commande">
      {ORDER_STATUSES.map((s, i) => {
        const isDone   = i < currentIndex
        const isActive = i === currentIndex
        return (
          <Step key={s} $done={isDone} $active={isActive}>
            {i > 0 && (
              <StepConnector
                $done={isDone || isActive}
                $color={color}
                style={{ position: 'absolute', left: '-50%', right: '50%', top: '13px' }}
              />
            )}
            <StepDot $done={isDone} $active={isActive} $color={isDone ? STATUS_COLORS[s].dot : color}>
              {isDone ? '✓' : i + 1}
            </StepDot>
            <StepLabel $active={isActive} $done={isDone}>
              {ORDER_STATUS_LABELS[s]}
            </StepLabel>
          </Step>
        )
      })}
    </StepperWrap>
  )
}

/* ── Component ── */
export function HistoriquePage() {
  const { user } = useAuthContext()
  const { addToCart } = useCart()
  const clientOrders = useClientOrders(user?.codeClient ?? '')

  const [search, setSearch]                 = useState('')
  const [selectedMonth, setSelectedMonth]   = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [addedMap, setAddedMap]             = useState<Record<string, boolean>>({})
  const [trackingModal, setTrackingModal]   = useState<Shipment | null>(null)
  const [newReturnOrderId, setNewReturnOrderId] = useState<string | null>(null)

  // Tous les hooks avant tout return conditionnel
  const allOrders = useMemo(
    () => clientOrders.slice().sort((a, b) => b.date.localeCompare(a.date)),
    [clientOrders]
  )

  const months = useMemo(() => {
    const keys = [...new Set(allOrders.map(o => formatMonthKey(o.date)))]
    return keys.sort((a, b) => b.localeCompare(a))
  }, [allOrders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allOrders.filter(order => {
      if (selectedMonth && formatMonthKey(order.date) !== selectedMonth) return false
      if (selectedStatus && order.status !== selectedStatus) return false
      if (!q) return true
      return order.items.some(
        item => item.title.toLowerCase().includes(q) || item.isbn.includes(q)
      )
    })
  }, [allOrders, search, selectedMonth, selectedStatus])

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

  const hasFilters = !!(search || selectedMonth || selectedStatus)

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportAll() {
    downloadCSV(buildCSVRows(filtered), 'bookflow_historique_complet.csv')
  }

  function handleExportOrder(order: Order) {
    downloadCSV(buildCSVRows([order]), `${order.numero}_commande.csv`)
  }

  return (
    <>
    <Page>
      <TitleRow>
        <Title style={{ marginBottom: 0 }}>Mon historique</Title>
        {allOrders.length > 0 && (
          <ExportAllButton onClick={handleExportAll} title="Exporter toutes les commandes en CSV">
            <IconDownload />
            Exporter tout
          </ExportAllButton>
        )}
      </TitleRow>

      {allOrders.length > 0 && (
        <FiltersBar>
          {/* Recherche */}
          <SearchWrapper>
            <SearchIconWrap><IconSearch /></SearchIconWrap>
            <SearchInput
              type="search"
              placeholder="Rechercher par titre ou ISBN…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchWrapper>

          {/* Filtre mois + statut sur la même ligne */}
          <SelectRow>
            <SelectGroup>
              <SelectLabel htmlFor="filter-month">Mois</SelectLabel>
              <Select
                id="filter-month"
                value={selectedMonth ?? ''}
                onChange={e => setSelectedMonth(e.target.value || null)}
              >
                <option value="">Tous</option>
                {months.map(m => (
                  <option key={m} value={m}>{formatMonthLabel(m)}</option>
                ))}
              </Select>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel htmlFor="filter-status">Statut</SelectLabel>
              <Select
                id="filter-status"
                value={selectedStatus ?? ''}
                onChange={e => setSelectedStatus((e.target.value as OrderStatus) || null)}
              >
                <option value="">Tous</option>
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
              </Select>
            </SelectGroup>
          </SelectRow>

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
          return (
            <OrderCard key={order.id}>
              {/* En-tête */}
              <OrderCardHeader>
                <div>
                  <OrderNumero>{order.numero}</OrderNumero>
                  <OrderDate>{formatDate(order.date)}</OrderDate>
                </div>
                {order.shipment && (
                  <TrackingLink onClick={() => setTrackingModal(order.shipment!)} aria-label="Voir le suivi">
                    📦 {order.shipment.trackingNumber}
                  </TrackingLink>
                )}
              </OrderCardHeader>

              {/* Stepper statut */}
              <OrderStepper status={order.status} />

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
                        <ItemIsbn>ISBN {item.isbn}</ItemIsbn>
                      </ItemInfo>
                      <ItemQtyPrice>
                        {item.quantity} × {formatEur(item.unitPriceHT)}
                      </ItemQtyPrice>
                    </Item>
                  ))}
                </ItemsList>

                <OrderFooter>
                  <TotalLine>
                    Total TTC : <TotalAmount>{formatEur(order.totalTTC)}</TotalAmount>
                  </TotalLine>
                  <FooterRight>
                    {(order.status === 'facturé' || order.status === 'expédié') && (
                      <ReturnButton onClick={() => setNewReturnOrderId(order.id)}>
                        ↩ Retour
                      </ReturnButton>
                    )}
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
                    </div>
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
    </Page>
    {trackingModal && (
      <TrackingModal shipment={trackingModal} onClose={() => setTrackingModal(null)} />
    )}
    </>
  )
}
