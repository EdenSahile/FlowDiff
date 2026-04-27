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
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  )
}

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
`

const ProgrammeSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const ProgrammeTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`

const ProgrammeCount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.normal};
  color: ${({ theme }) => theme.colors.gray[600]};
`

export function AParaitrePage() {
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [query, setQuery]       = useState('')
  const deferred = useDeferredValue(query)

  let aParaitre = deferred.trim()
    ? searchBooks(deferred).filter(b => b.type === 'a-paraitre')
    : getBooksByType('a-paraitre')

  if (universe) {
    aParaitre = aParaitre.filter(b => b.universe === universe)
  }

  const programmes = [...new Set(aParaitre.map(b => b.programme ?? 'Autres'))].sort()

  return (
    <Page>
      <PageHeader>
        <PageTitle>À paraître</PageTitle>
        <PageSubtitle>Les titres seront enregistrés en notés</PageSubtitle>
      </PageHeader>

      <Controls>
        <SearchWrapper>
          <SearchIcon><IconSearch /></SearchIcon>
          <Input
            id="a-paraitre-search"
            type="search"
            placeholder="Titre, auteur, ISBN, éditeur…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Rechercher dans les titres à paraître"
          />
        </SearchWrapper>
        <UniverseFilter value={universe} onChange={setUniverse} />
      </Controls>

      {programmes.length === 0 && (
        <EmptyState>
          <IconEmpty />
          {deferred.trim()
            ? `Aucun résultat pour « ${deferred} »`
            : 'Aucun titre à paraître pour cet univers.'}
        </EmptyState>
      )}

      {programmes.map(prog => {
        const books = aParaitre.filter(b => (b.programme ?? 'Autres') === prog)
        return (
          <ProgrammeSection key={prog}>
            <ProgrammeTitle>
              <span>{prog}</span>
              <ProgrammeCount>{books.length} titre{books.length > 1 ? 's' : ''}</ProgrammeCount>
            </ProgrammeTitle>
            <Grid>
              {books.map(book => <BookCard key={book.id} book={book} />)}
            </Grid>
          </ProgrammeSection>
        )
      })}
    </Page>
  )
}
