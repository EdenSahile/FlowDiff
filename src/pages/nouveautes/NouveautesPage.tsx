import { useState, useDeferredValue, useMemo, useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationsContext'
import styled, { keyframes } from 'styled-components'
import { BookCard } from '@/components/catalogue/BookCard'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'
import { Input } from '@/components/ui/Input'

type SortKey = 'pertinence' | 'titre' | 'prix_asc' | 'prix_desc'

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

const SearchWrapper = styled.div`
  position: relative;

  input {
    padding-left: 40px;
  }
`

const SearchIcon = styled.span`
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  align-items: center;
  pointer-events: none;
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

  span {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`

const SortWrap = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
`

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function IconEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.35 }}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}

export function NouveautesPage() {
  const { markAsRead } = useNotifications()
  useEffect(() => { markAsRead('nouveautes') }, [markAsRead])

  const [universe, setUniverse] = useState<Universe | null>(null)
  const [query, setQuery]       = useState('')
  const [sort, setSort]         = useState<SortKey>('pertinence')
  const deferred = useDeferredValue(query)

  const nouveautes = useMemo(() => {
    let books = deferred.trim()
      ? searchBooks(deferred).filter(b => b.type === 'nouveaute')
      : getBooksByType('nouveaute')

    if (universe) books = books.filter(b => b.universe === universe)

    if (sort === 'titre')     return [...books].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'prix_asc')  return [...books].sort((a, b) => a.priceTTC - b.priceTTC)
    if (sort === 'prix_desc') return [...books].sort((a, b) => b.priceTTC - a.priceTTC)
    return books
  }, [deferred, universe, sort])

  const contextLabel = universe ? ` · ${universe}` : ' · toutes thématiques'

  return (
    <Page>
      <PageHeader>
        <PageEyebrow>Catalogue</PageEyebrow>
        <PageTitle>Nouveautés</PageTitle>
        <PageSubtitle>Titres du mois disponibles à la commande immédiate</PageSubtitle>
      </PageHeader>

      <Controls>
        <SearchWrapper>
          <SearchIcon><IconSearch /></SearchIcon>
          <Input
            id="nouveautes-search"
            type="search"
            placeholder="Titre, auteur, ISBN, éditeur…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Rechercher dans les nouveautés"
          />
        </SearchWrapper>

        <FilterGroup role="group" aria-label="Filtres">
          <FilterRow>
            <FilterLabel>Thématique</FilterLabel>
            <UniverseFilter value={universe} onChange={setUniverse} />
          </FilterRow>
        </FilterGroup>
      </Controls>

      <ResultsBar>
        <ResultsCount>
          <strong>{nouveautes.length}</strong> titre{nouveautes.length > 1 ? 's' : ''}
          <span>{contextLabel}</span>
        </ResultsCount>
        <SortWrap htmlFor="nouveautes-sort">
          Trier par :
          <SortSelect
            id="nouveautes-sort"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
          >
            <option value="pertinence">Pertinence</option>
            <option value="titre">Titre A→Z</option>
            <option value="prix_asc">Prix ↑</option>
            <option value="prix_desc">Prix ↓</option>
          </SortSelect>
        </SortWrap>
      </ResultsBar>

      {nouveautes.length > 0 ? (
        <Grid>
          {nouveautes.map(book => <BookCard key={book.id} book={book} showType coverFirst />)}
        </Grid>
      ) : (
        <EmptyState>
          <IconEmpty />
          {deferred.trim()
            ? `Aucun résultat pour « ${deferred} »`
            : 'Aucun titre pour cet univers ce mois-ci.'}
        </EmptyState>
      )}
    </Page>
  )
}
