import { useState, useDeferredValue } from 'react'
import styled from 'styled-components'
import { BookCard } from '@/components/catalogue/BookCard'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'
import { Input } from '@/components/ui/Input'

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
  display: inline-flex;
  align-items: center;
  pointer-events: none;
`

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function IconEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.44 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 6.29 6.29l.77-.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

const ResultCount = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 19px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
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

export function NouveautesPage() {
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [query, setQuery]       = useState('')
  const deferred = useDeferredValue(query)

  let nouveautes = deferred.trim()
    ? searchBooks(deferred).filter(b => b.type === 'nouveaute')
    : getBooksByType('nouveaute')

  if (universe) {
    nouveautes = nouveautes.filter(b => b.universe === universe)
  }

  return (
    <Page>
      <PageHeader>
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
        <UniverseFilter value={universe} onChange={setUniverse} />
      </Controls>

      {nouveautes.length > 0 && (
        <ResultCount>
          {nouveautes.length} titre{nouveautes.length > 1 ? 's' : ''} ce mois-ci
        </ResultCount>
      )}

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
