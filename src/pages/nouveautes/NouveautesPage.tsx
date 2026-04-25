import { useState, useDeferredValue } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { BookCard } from '@/components/catalogue/BookCard'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBooksByType, searchBooks } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'
import { Input } from '@/components/ui/Input'
import { useRdv } from '@/contexts/RdvContext'

/* ── Tabs ── */
type Tab = 'mois' | 'a-paraitre'

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  padding-bottom: 80px;  /* espace pour le floating RDV bar */
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

const TabBar = styled.div`
  display: flex;
  gap: 2px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  width: fit-content;
`

const Tab = styled.button<{ $active: boolean }>`
  padding: 9px 22px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $active }) => $active ? theme.colors.navy : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme, $active }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  white-space: nowrap;
  letter-spacing: 0.01em;
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

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
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

const ParaitreInfo = styled.div`
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
  flex-wrap: wrap;
`

const RdvSelectionBtn = styled.button`
  flex-shrink: 0;
  padding: 7px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, color .15s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: #3d2f00;
  }
`

const FloatingRdvBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  z-index: 100;
  gap: 16px;
  flex-wrap: wrap;
`

const FloatingRdvText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  flex: 1;
`

const FloatingRdvBtn = styled.button`
  padding: 8px 18px;
  background: ${({ theme }) => theme.colors.accent};
  color: #3d2f00;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: opacity .15s;

  &:hover { opacity: 0.88; }
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

export function NouveautesPage() {
  const [tab, setTab]           = useState<Tab>('mois')
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [query, setQuery]       = useState('')
  const deferred = useDeferredValue(query)
  const navigate = useNavigate()
  const { rdvCount, totalExemplaires } = useRdv()

  let nouveautes = deferred.trim()
    ? searchBooks(deferred).filter(b => b.type === 'nouveaute')
    : getBooksByType('nouveaute')

  let aParaitre = deferred.trim()
    ? searchBooks(deferred).filter(b => b.type === 'a-paraitre')
    : getBooksByType('a-paraitre')

  if (universe) {
    nouveautes = nouveautes.filter(b => b.universe === universe)
    aParaitre  = aParaitre.filter(b => b.universe === universe)
  }

  /* Regrouper les "à paraître" par programme */
  const programmes = [...new Set(aParaitre.map(b => b.programme ?? 'Autres'))].sort()

  return (
    <Page>
      <PageHeader>
        <PageTitle>Nouveautés</PageTitle>
        <PageSubtitle>
          {tab === 'mois'
            ? 'Titres du mois disponibles à la commande immédiate'
            : 'Titres à venir — consultation catalogue uniquement'}
        </PageSubtitle>
      </PageHeader>

      <TabBar>
        <Tab $active={tab === 'mois'} onClick={() => setTab('mois')}>
          Nouveautés du mois
        </Tab>
        <Tab $active={tab === 'a-paraitre'} onClick={() => setTab('a-paraitre')}>
          À paraître
        </Tab>
      </TabBar>

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

      {tab === 'mois' && (
        <>
          {nouveautes.length > 0 && (
            <ResultCount>
              {nouveautes.length} titre{nouveautes.length > 1 ? 's' : ''} ce mois-ci
            </ResultCount>
          )}
          {nouveautes.length > 0 ? (
            <Grid>
              {nouveautes.map(book => <BookCard key={book.id} book={book} showType />)}
            </Grid>
          ) : (
            <EmptyState>
              <IconEmpty />
              {deferred.trim()
                ? `Aucun résultat pour « ${deferred} »`
                : 'Aucun titre pour cet univers ce mois-ci.'}
            </EmptyState>
          )}
        </>
      )}

      {tab === 'a-paraitre' && (
        <>
          <ParaitreInfo>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
              <IconInfo />
              <span>Les titres à paraître sont consultables uniquement. La commande se fait via votre représentant commercial. Vous pouvez recevoir le catalogue par email.</span>
            </div>
            {rdvCount > 0 && (
              <RdvSelectionBtn onClick={() => navigate('/rdv-representant')} aria-label="Voir ma sélection RDV">
                Ma sélection ({rdvCount} titre{rdvCount > 1 ? 's' : ''}) →
              </RdvSelectionBtn>
            )}
          </ParaitreInfo>

          {programmes.length === 0 && (
            <EmptyState>Aucun titre à paraître pour cet univers.</EmptyState>
          )}

          {programmes.map(prog => {
            const books = aParaitre.filter(b => (b.programme ?? 'Autres') === prog)
            return (
              <ProgrammeSection key={prog}>
                <ProgrammeTitle>
                  <span>{prog}</span>
                  <ResultCount as="span" style={{ marginBottom: 0, fontSize: '12px' }}>
                    {books.length} titre{books.length > 1 ? 's' : ''}
                  </ResultCount>
                </ProgrammeTitle>
                <Grid>
                  {books.map(book => <BookCard key={book.id} book={book} />)}
                </Grid>
              </ProgrammeSection>
            )
          })}
        </>
      )}

      {tab === 'a-paraitre' && rdvCount > 0 && (
        <FloatingRdvBar>
          <FloatingRdvText>
            <strong>{rdvCount} titre{rdvCount > 1 ? 's' : ''}</strong> sélectionné{rdvCount > 1 ? 's' : ''} — {totalExemplaires} ex. au total
          </FloatingRdvText>
          <FloatingRdvBtn onClick={() => navigate('/rdv-representant')}>
            Voir ma sélection →
          </FloatingRdvBtn>
        </FloatingRdvBar>
      )}
    </Page>
  )
}
