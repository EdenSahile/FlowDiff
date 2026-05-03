import { useState, useMemo, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { MOCK_FACTURES, type Facture } from '@/data/mockFactures'
import { openInvoicePDF } from '@/lib/invoicePdf'
import { DatePicker } from '@/components/ui/DatePicker'

/* ── Helpers ── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 860px;
  margin: 0 auto;
`

const PageHeader = styled.div`
  margin-bottom: 24px;
`

const Title = styled.h1`
  font-size: 1.375rem;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.4px;
  margin-bottom: 4px;
`

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

/* ── Barre de filtres ── */
const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
  align-items: center;
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
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.875rem;
  min-width: 200px;
  flex: 1;

  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.navy};
    outline-offset: -1px;
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
  height: 38px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.navy};
  background: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.2px;

  &:hover { background: ${({ theme }) => theme.colors.navy}; color: #fff; }
  &:active { opacity: 0.85; }
`

/* ── Tableau ── */
const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
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
        <Title>Facturation</Title>
        <Subtitle>Retrouvez l'ensemble de vos factures et téléchargez-les en PDF.</Subtitle>
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

        <ExportBtn type="button" onClick={exportCSV} aria-label="Exporter les factures en CSV">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {exportLabel}
        </ExportBtn>
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
            </tr>
          </Thead>
          <Tbody>
            {pageItems.length === 0 ? (
              <EmptyRow>
                <EmptyTd colSpan={5}>
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
    </Page>
  )
}
