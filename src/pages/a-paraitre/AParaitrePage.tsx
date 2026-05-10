import { useState, useDeferredValue } from 'react'
import styled, { keyframes } from 'styled-components'
import { BookCard } from '@/components/catalogue/BookCard'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'
import { Input } from '@/components/ui/Input'
import { BackButton } from '@/components/ui/BackButton'

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

const ProgrammeSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const ProgrammeTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: baseline;
  gap: 10px;
`

const ProgrammeCount = styled.span`
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.normal};
  color: ${({ theme }) => theme.colors.gray[400]};
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
        <BackButton />
        <PageEyebrow>Catalogue</PageEyebrow>
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

        <FilterGroup role="group" aria-label="Filtres">
          <FilterRow>
            <FilterLabel>Thématique</FilterLabel>
            <UniverseFilter value={universe} onChange={setUniverse} />
          </FilterRow>
        </FilterGroup>
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
              {prog}
              <ProgrammeCount>{books.length} titre{books.length > 1 ? 's' : ''}</ProgrammeCount>
            </ProgrammeTitle>
            <Grid>
              {books.map(book => <BookCard key={book.id} book={book} coverFirst />)}
            </Grid>
          </ProgrammeSection>
        )
      })}
    </Page>
  )
}
