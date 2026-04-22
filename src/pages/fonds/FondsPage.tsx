import { useState, useDeferredValue } from 'react'
import styled from 'styled-components'
import { BookCard } from '@/components/catalogue/BookCard'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe, StockStatut } from '@/data/mockBooks'
import { Input } from '@/components/ui/Input'

// Labels must stay in sync with STATUT_CONFIG in src/components/ui/StockStatus.tsx
const DISPO_OPTIONS: Array<{ value: StockStatut; label: string }> = [
  { value: 'disponible',   label: '✅ Disponible' },
  { value: 'stock_limite', label: '⚠️ Stock limité' },
  { value: 'sur_commande', label: '🔄 Sur commande' },
  { value: 'en_reimp',     label: '🔁 En réimpression' },
  { value: 'epuise',       label: '❌ Épuisé' },
]

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const VDivider = styled.span`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.gray[200]};
  flex-shrink: 0;
  margin: 0 4px;

  @media (max-width: 600px) { display: none; }
`

const CountLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-left: auto;
  white-space: nowrap;
  flex-shrink: 0;
`

const DispoPill = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 13px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.white};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ $active, theme }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.12s;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.navy};
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  &::before {
    content: '🔍';
    display: block;
    font-size: 2.5rem;
    margin-bottom: 12px;
  }
`

const SearchWrapper = styled.div`
  position: relative;

  input {
    padding-left: 42px;
  }
`

const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 1rem;
  pointer-events: none;
`

export function FondsPage() {
  const [query, setQuery]       = useState('')
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [statut, setStatut]     = useState<StockStatut | null>(null)
  const deferred = useDeferredValue(query)

  const allFonds = getBooksByType('fonds')

  let books = deferred.trim()
    ? searchBooks(deferred).filter(b => b.type === 'fonds')
    : allFonds

  if (universe) books = books.filter(b => b.universe === universe)
  if (statut)   books = books.filter(b => b.statut === statut)

  return (
    <Page>
      <PageHeader>
        <PageTitle>Fonds</PageTitle>
        <PageSubtitle>Titres déjà parus, disponibles à la commande immédiate</PageSubtitle>
      </PageHeader>

      <Controls>
        <SearchWrapper>
          <SearchIcon>🔍</SearchIcon>
          <Input
            id="fonds-search"
            type="search"
            placeholder="Titre, auteur, ISBN, éditeur…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Rechercher dans les fonds"
          />
        </SearchWrapper>

        <FilterRow role="group" aria-label="Filtres">
          <UniverseFilter value={universe} onChange={setUniverse} />

          <VDivider aria-hidden="true" />

          <DispoPill type="button" $active={statut === null} onClick={() => setStatut(null)}>
            Tous
          </DispoPill>
          {DISPO_OPTIONS.map(opt => (
            <DispoPill
              type="button"
              key={opt.value}
              $active={statut === opt.value}
              onClick={() => setStatut(statut === opt.value ? null : opt.value)}
            >
              {opt.label}
            </DispoPill>
          ))}

          <CountLabel>{books.length} titre{books.length > 1 ? 's' : ''}</CountLabel>
        </FilterRow>
      </Controls>

      {books.length > 0 ? (
        <Grid>
          {books.map(book => <BookCard key={book.id} book={book} showType />)}
        </Grid>
      ) : (
        <EmptyState>
          {deferred.trim()
            ? `Aucun résultat pour « ${deferred} »`
            : 'Aucun titre avec ces filtres.'}
        </EmptyState>
      )}
    </Page>
  )
}
