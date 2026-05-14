import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useRdv } from '@/contexts/RdvContext'
import { exportToCSV } from '@/lib/csv'
import { formatPrice } from '@/lib/format'
import { BookCover } from '@/components/catalogue/BookCover'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ── Icons ── */
function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function IconBook() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}

/* ── Slugify helper ── */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/* ── Styled Components ── */

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 820px;
  margin: 0 auto;
  padding-bottom: 120px;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  margin-bottom: 4px;
  transition: color .15s;

  &:hover { color: ${({ theme }) => theme.colors.navy}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.navy}; outline-offset: 2px; border-radius: 2px; }
`

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const PageSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
`

const ClearBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  min-height: 36px;
  border: 1.5px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.md};
  background: none;
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 28px;
  transition: background .15s, color .15s;

  &:hover { background: ${({ theme }) => theme.colors.error}; color: ${({ theme }) => theme.colors.white}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.error}; outline-offset: 2px; }
`

/* ── Programme Group ── */
const ProgrammeSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ProgrammeHeading = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  border-bottom: 2px solid ${({ theme }) => theme.colors.navy};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const BookList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`

/* ── Book Row ── */
const BookRow = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};

  &:first-child { border-top: 1px solid ${({ theme }) => theme.colors.gray[200]}; }
`

const BookInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const BookTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
  line-height: 1.3;
`

const BookMeta = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
`

const BookSecondary = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0;
`

const BookPrice = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const BookActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: 8px;
  flex-wrap: wrap;
`

/* ── Qty Stepper ── */
const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 2px 4px;
`

const QtyBtn = styled.button`
  width: 26px;
  height: 26px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .12s;

  &:hover    { opacity: 0.7; }
  &:disabled { opacity: .3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  width: 28px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

/* ── Remove button ── */
const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  cursor: pointer;
  transition: color .15s, background .15s;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background: rgba(192, 57, 43, 0.07);
  }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.error}; outline-offset: 2px; }
`

/* ── Sticky Footer / Recap ── */
const StickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border-top: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  z-index: 100;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const RecapText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;

  strong {
    color: ${({ theme }) => theme.colors.navy};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
`

const ExportBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.accent}; outline-offset: 2px; }
`

/* ── Empty State ── */
const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.lg};
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const EmptyIcon = styled.div`
  color: ${({ theme }) => theme.colors.gray[200]};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const EmptyTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const EmptyText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
  max-width: 340px;
`

const EmptyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.sm};
  transition: background .15s;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.accent}; outline-offset: 2px; }
`

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */

export function RdvPage() {
  const navigate = useNavigate()
  const { items, rdvCount, totalExemplaires, removeFromRdv, updateQty, clearRdv } = useRdv()
  const [confirmOpen, setConfirmOpen] = useState(false)

  /* ── Group items by programme ── */
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.book.programme ?? 'Programme non défini'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const programmeKeys = Object.keys(grouped).sort()

  /* ── CSV Export ── */
  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10)

    let slugProgramme = 'selection'
    if (programmeKeys.length === 1) {
      slugProgramme = slugify(programmeKeys[0])
    } else if (programmeKeys.length > 1) {
      slugProgramme = slugify(programmeKeys[0])
    }

    const filename = `selection-rdv-${slugProgramme}-${today}`

    const headers = [
      'Programme',
      'Titre',
      'Auteur(s)',
      'ISBN',
      'Éditeur',
      'Prix TTC',
      'Quantité souhaitée',
      'Notes',
    ]

    const rows = items.map(({ book, quantity }) => [
      book.programme ?? 'Programme non défini',
      book.title,
      book.authors.join(', '),
      book.isbn,
      book.publisher,
      formatPrice(book.priceTTC),
      quantity,
      '',
    ])

    exportToCSV(filename, headers, rows)
  }

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <Page>
        <BackBtn onClick={() => navigate(-1)}>
          <IconChevronLeft /> Retour
        </BackBtn>
        <EmptyWrapper>
          <EmptyIcon>
            <IconBook />
          </EmptyIcon>
          <EmptyTitle>Aucun titre sélectionné</EmptyTitle>
          <EmptyText>
            Vous n'avez pas encore de titres à paraître dans votre sélection RDV.
            Parcourez le catalogue pour en ajouter.
          </EmptyText>
          <EmptyBtn onClick={() => navigate('/nouveautes')}>
            Voir les titres à paraître
          </EmptyBtn>
        </EmptyWrapper>
      </Page>
    )
  }

  return (
    <>
      <Page>
        {/* ── Header ── */}
        <PageHeader>
          <HeaderLeft>
            <BackBtn onClick={() => navigate(-1)}>
              <IconChevronLeft /> Retour
            </BackBtn>
            <PageTitle>Ma sélection RDV</PageTitle>
            <PageSubtitle>
              Titres à paraître sélectionnés pour votre prochain rendez-vous représentant
            </PageSubtitle>
          </HeaderLeft>

          <ClearBtn onClick={() => setConfirmOpen(true)}>
            <IconX /> Tout effacer
          </ClearBtn>
        </PageHeader>

        {/* ── Groups par programme ── */}
        {programmeKeys.map(programme => (
          <ProgrammeSection key={programme}>
            <ProgrammeHeading>{programme}</ProgrammeHeading>
            <BookList>
              {grouped[programme].map(({ book, quantity }) => (
                <BookRow key={book.id}>
                  {/* Couverture */}
                  <BookCover
                    isbn={book.isbn}
                    alt={book.title}
                    width={60}
                    height={86}
                    universe={book.universe}
                    authors={book.authors}
                    publisher={book.publisher}
                    collection={book.collection}
                  />

                  {/* Infos + actions */}
                  <BookInfo>
                    <BookTitle>{book.title}</BookTitle>
                    <BookMeta>{book.authors.join(', ')}</BookMeta>
                    <BookSecondary>
                      {book.publisher}{book.collection ? ` · ${book.collection}` : ''}
                      {' · '}ISBN {book.isbn}
                    </BookSecondary>
                    <BookPrice>{formatPrice(book.priceTTC)} € TTC</BookPrice>

                    <BookActions>
                      {/* Stepper quantité */}
                      <QtyControl>
                        <QtyBtn
                          onClick={() => updateQty(book.id, quantity - 1)}
                          disabled={quantity <= 1}
                          aria-label="Diminuer la quantité"
                        >
                          −
                        </QtyBtn>
                        <QtyValue>{quantity}</QtyValue>
                        <QtyBtn
                          onClick={() => updateQty(book.id, quantity + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </QtyBtn>
                      </QtyControl>

                      {/* Supprimer */}
                      <RemoveBtn
                        onClick={() => removeFromRdv(book.id)}
                        aria-label={`Supprimer ${book.title} de la sélection`}
                      >
                        <IconX /> Supprimer
                      </RemoveBtn>
                    </BookActions>
                  </BookInfo>
                </BookRow>
              ))}
            </BookList>
          </ProgrammeSection>
        ))}
      </Page>

      {/* ── Sticky Footer ── */}
      <StickyFooter>
        <RecapText>
          <strong>{rdvCount}</strong> titre{rdvCount > 1 ? 's' : ''}{' '}
          — <strong>{totalExemplaires}</strong> exemplaire{totalExemplaires > 1 ? 's' : ''} au total
        </RecapText>
        <ExportBtn onClick={handleExport}>
          <IconDownload /> Exporter en CSV
        </ExportBtn>
      </StickyFooter>

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Vider la sélection ?"
        message="Cette action supprimera tous les titres de votre sélection RDV."
        confirmLabel="Tout effacer"
        destructive
        onConfirm={() => { clearRdv(); setConfirmOpen(false) }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
