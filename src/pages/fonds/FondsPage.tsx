import { useState, useDeferredValue, useMemo } from 'react'
import styled from 'styled-components'
import { BookCard } from '@/components/catalogue/BookCard'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe, StockStatut } from '@/data/mockBooks'
import { Input } from '@/components/ui/Input'

// Colors must stay in sync with STATUT_CONFIG in src/components/ui/StockStatus.tsx
const DISPO_OPTIONS: Array<{ value: StockStatut; label: string; color: string | null }> = [
  { value: 'disponible',   label: 'Disponible',      color: '#2E7D32' },
  { value: 'stock_limite', label: 'Stock limité',     color: '#C17E00' },
  { value: 'sur_commande', label: 'Sur commande',     color: '#5B7A9E' },
  { value: 'en_reimp',     label: 'En réimpression',  color: '#A07040' },
  { value: 'epuise',       label: 'Épuisé',           color: null },
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
`

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 30px;
`

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const FilterLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
  width: 80px;
`

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

const DotFilter = styled.span<{ $color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
  display: inline-block;
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
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

type SortKey = 'pertinence' | 'titre' | 'prix_asc' | 'prix_desc'

export function FondsPage() {
  const [query, setQuery]       = useState('')
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [statut, setStatut]     = useState<StockStatut | null>(null)
  const [sort, setSort]         = useState<SortKey>('pertinence')
  const deferred = useDeferredValue(query)

  const sorted = useMemo(() => {
    let books = deferred.trim()
      ? searchBooks(deferred).filter(b => b.type === 'fonds')
      : getBooksByType('fonds')

    if (universe) books = books.filter(b => b.universe === universe)
    if (statut)   books = books.filter(b => b.statut === statut)

    if (sort === 'titre')     return [...books].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'prix_asc')  return [...books].sort((a, b) => a.priceTTC - b.priceTTC)
    if (sort === 'prix_desc') return [...books].sort((a, b) => b.priceTTC - a.priceTTC)
    return books
  }, [deferred, universe, statut, sort])

  return (
    <Page>
      <PageHeader>
        <PageEyebrow>Catalogue</PageEyebrow>
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

        <FilterGroup role="group" aria-label="Filtres">
          <FilterRow>
            <FilterLabel>Thématique</FilterLabel>
            <UniverseFilter value={universe} onChange={setUniverse} />
          </FilterRow>

          <FilterRow>
            <FilterLabel>Disponibilité</FilterLabel>
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
                {opt.color ? <DotFilter $color={opt.color} /> : '❌ '}
                {opt.label}
              </DispoPill>
            ))}
          </FilterRow>
        </FilterGroup>
      </Controls>

      <ResultsBar>
        <ResultsCount>
          <strong>{sorted.length}</strong> titre{sorted.length > 1 ? 's' : ''}
        </ResultsCount>
        <SortSelect value={sort} onChange={e => setSort(e.target.value as SortKey)}>
          <option value="pertinence">Pertinence</option>
          <option value="titre">Titre A→Z</option>
          <option value="prix_asc">Prix ↑</option>
          <option value="prix_desc">Prix ↓</option>
        </SortSelect>
      </ResultsBar>

      {sorted.length > 0 ? (
        <Grid>
          {sorted.map(book => <BookCard key={book.id} book={book} showType />)}
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
