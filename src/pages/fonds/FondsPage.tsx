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

const ResultCount = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  strong {
    color: ${({ theme }) => theme.colors.navy};
    font-weight: 700;
  }
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
  const deferred = useDeferredValue(query)

  const allFonds = getBooksByType('fonds')

  let books = deferred.trim()
    ? searchBooks(deferred).filter(b => b.type === 'fonds')
    : allFonds

  if (universe) {
    books = books.filter(b => b.universe === universe)
  }

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

        <UniverseFilter value={universe} onChange={setUniverse} />
      </Controls>

      <ResultCount>
        <strong>{books.length}</strong> titre{books.length > 1 ? 's' : ''} disponible{books.length > 1 ? 's' : ''}
        {universe && ` en ${universe}`}
      </ResultCount>

      {books.length > 0 ? (
        <Grid>
          {books.map(book => <BookCard key={book.id} book={book} showType />)}
        </Grid>
      ) : (
        <EmptyState>
          {deferred.trim()
            ? `Aucun résultat pour « ${deferred} »`
            : 'Aucun titre dans cet univers.'}
        </EmptyState>
      )}
    </Page>
  )
}
