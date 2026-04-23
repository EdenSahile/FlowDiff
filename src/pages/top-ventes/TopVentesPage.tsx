import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { theme } from '@/lib/theme'
import styled from 'styled-components'
import { MOCK_BOOKS, type Book, type Universe } from '@/data/mockBooks'
import { BookCard } from '@/components/catalogue/BookCard'
import { BookCover } from '@/components/catalogue/BookCover'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

/* ══════════════════════════════════════════════════════
   DONNÉES MOCK — ventes rolling 30 jours
══════════════════════════════════════════════════════ */

interface SalesData { units: number; trend: 'up' | 'down' | 'stable' }

const SALES: Record<string, SalesData> = {
  'n-bd-01':  { units: 1247, trend: 'up' },
  'n-bd-02':  { units: 1089, trend: 'up' },
  'n-bd-03':  { units: 876,  trend: 'stable' },
  'n-lit-01': { units: 943,  trend: 'up' },
  'n-lit-02': { units: 812,  trend: 'down' },
  'n-lit-03': { units: 567,  trend: 'stable' },
  'n-jes-01': { units: 734,  trend: 'up' },
  'n-jes-02': { units: 698,  trend: 'stable' },
  'n-pra-01': { units: 445,  trend: 'down' },
  'n-pra-02': { units: 389,  trend: 'stable' },
  'f-bd-01':  { units: 2341, trend: 'up' },
  'f-bd-02':  { units: 1987, trend: 'stable' },
  'f-lit-01': { units: 2156, trend: 'stable' },
  'f-lit-02': { units: 1834, trend: 'up' },
  'f-lit-03': { units: 987,  trend: 'down' },
  'f-jes-01': { units: 3412, trend: 'up' },
  'f-jes-02': { units: 1234, trend: 'stable' },
  'f-pra-01': { units: 876,  trend: 'down' },
  'f-pra-02': { units: 567,  trend: 'stable' },
  's-ttn-01': { units: 1654, trend: 'up' },
}

type Period  = '30j' | '3mois'
type TabView = 'tous' | Universe

const UNIVERSES: Universe[] = ['BD/Mangas', 'Jeunesse', 'Littérature', 'Adulte-pratique']

/* Palette Forêt & Lin — cohérente avec UniverseFilter et FlashInfosPage */
const UNIVERSE_COLORS: Record<Universe, { bg: string; text: string; dot: string }> = {
  'BD/Mangas':       { bg: '#F7F0DC', text: '#8B6914', dot: '#8B6914' },
  'Jeunesse':        { bg: '#EFF4F1', text: '#2D6A52', dot: '#2D6A52' },
  'Littérature':     { bg: '#E6EFE9', text: theme.colors.success, dot: theme.colors.success },
  'Adulte-pratique': { bg: '#F0EDE8', text: '#6B5440', dot: '#6B5440' },
}

const SECTION_BORDER: Record<Universe, string> = {
  'BD/Mangas':       '#8B6914',
  'Jeunesse':        '#2D6A52',
  'Littérature':     theme.colors.success,
  'Adulte-pratique': '#6B5440',
}

function getRankedBooks(books: Book[]) {
  return [...books]
    .filter(b => SALES[b.id])
    .sort((a, b) => (SALES[b.id]?.units ?? 0) - (SALES[a.id]?.units ?? 0))
}

function getSection(type: 'nouveaute' | 'fonds', universe: TabView) {
  const base = MOCK_BOOKS.filter(b =>
    b.type === type &&
    (universe === 'tous' || b.universe === universe)
  )
  return getRankedBooks(base)
}

/* ══════════════════════════════════════════════════════
   STYLED — PAGE
══════════════════════════════════════════════════════ */

const Page = styled.div`
  min-height: 100%;
  background: ${({ theme }) => theme.colors.gray[50]};
  padding-bottom: 40px;
`

const PageHeader = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  padding: 20px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px;
  }
`

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PeriodSelector = styled.div`
  display: flex;
  background: rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 3px;
  gap: 2px;
`

const PeriodBtn = styled.button<{ $active: boolean }>`
  padding: 5px 14px;
  border: none;
  border-radius: 17px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $active }) => $active ? '#fff' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.navy : 'rgba(255,255,255,0.75)'};
`

/* ══════════════════════════════════════════════════════
   STYLED — TABS
══════════════════════════════════════════════════════ */

const TabBar = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  overflow-x: auto;
  padding: 6px 16px;
  gap: 6px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const Tab = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  padding: 7px 16px;
  border: none;
  border-radius: 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  background: ${({ $active }) => $active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'};
  color: ${({ $active }) => $active ? '#fff' : 'rgba(232,242,238,0.7)'};
`

/* ══════════════════════════════════════════════════════
   STYLED — CONTENU
══════════════════════════════════════════════════════ */

const Content = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px;
  }
`

const Section = styled.section`
  margin-bottom: 40px;
`

const SectionHeader = styled.div<{ $universe?: Universe }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-left: 14px;
  border-left: 4px solid ${({ $universe, theme }) =>
    $universe ? SECTION_BORDER[$universe] : theme.colors.primary};
`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const SectionSub = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-left: 8px;
`

const PodiumGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primaryLight};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};

  & > * {
    width: 200px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    & > * { width: calc(50% - 8px); }
  }
`

const CardWrapper = styled.div<{ $ranked: boolean }>`
  position: relative;
  padding-top: ${({ $ranked }) => $ranked ? '26px' : '0'};
`

const TopBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 3px 10px rgba(0,0,0,0.25);
  background: ${({ $rank }) =>
    $rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
    $rank === 2 ? 'linear-gradient(135deg, #E8E8E8, #A8A8A8)' :
                  'linear-gradient(135deg, #CD9B6A, #A0652A)'};
  color: ${({ $rank }) =>
    $rank === 1 ? '#5A3A00' :
    $rank === 2 ? '#3A3A3A' :
                  '#fff'};
`

const BadgeTop = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
`

const BadgeNum = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 900;
  line-height: 1;
`

/* ── Liste compacte (rangs 4–10) ── */
const ListRows = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.md};
`

const ListRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  cursor: pointer;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

const RowRank = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 22px;
  font-weight: 800;
  color: rgba(34,98,65,0.2);
  width: 32px;
  text-align: center;
  flex-shrink: 0;
`

const RowInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const RowTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowSub = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
`

const RowRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`

const RowPrice = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
`

const RowSales = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
`

const RowAddBtn = styled.button`
  width: 32px; height: 32px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fdfdfd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

const UnivBadge = styled.span<{ $bg: string; $text: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 999px;
  background: ${({ $bg }) => $bg};
  font-size: 10px;
  font-weight: 700;
  color: ${({ $text }) => $text};
`

const UnivDot = styled.span<{ $color: string }>`
  width: 5px; height: 5px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const TrendUp     = styled.span`color: ${({ theme }) => theme.colors.success}; display: inline-flex; align-items: center;`
const TrendDown   = styled.span`color: #C0392B; display: inline-flex; align-items: center;`
const TrendStable = styled.span`color: ${({ theme }) => theme.colors.gray[400]}; display: inline-flex; align-items: center;`

function IconCart() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}

function IconUp() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
}
function IconDown() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
function IconStable() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
}

function TrendIcon({ trend }: { trend: SalesData['trend'] }) {
  if (trend === 'up')   return <TrendUp><IconUp /></TrendUp>
  if (trend === 'down') return <TrendDown><IconDown /></TrendDown>
  return <TrendStable><IconStable /></TrendStable>
}

const EmptySection = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-align: center;
  padding: 24px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

/* ══════════════════════════════════════════════════════
   COMPOSANT ROW LISTE (rangs 4–10)
══════════════════════════════════════════════════════ */

function ListItem({
  book, rank, showUniverse, onAdd,
}: { book: Book; rank: number; showUniverse: boolean; onAdd: (b: Book) => void }) {
  const navigate = useNavigate()
  const sales    = SALES[book.id]
  const uc       = UNIVERSE_COLORS[book.universe]

  return (
    <ListRow onClick={() => navigate(`/livre/${book.id}`)}>
      <RowRank>{rank}</RowRank>
      <div style={{ flexShrink: 0, borderRadius: 4, overflow: 'hidden' }}>
        <BookCover isbn={book.isbn} alt={book.title} width={42} height={58}
          universe={book.universe} authors={book.authors} publisher={book.publisher} />
      </div>
      <RowInfo>
        <RowTitle>{book.title}</RowTitle>
        <RowSub>
          {book.authors[0]}
          {showUniverse && (
            <UnivBadge $bg={uc.bg} $text={uc.text} style={{ marginLeft: 6 }}>
              <UnivDot $color={uc.dot} />{book.universe}
            </UnivBadge>
          )}
        </RowSub>
      </RowInfo>
      <RowRight onClick={e => e.stopPropagation()}>
        {sales && <RowSales><TrendIcon trend={sales.trend} /> {sales.units.toLocaleString('fr-FR')} ex.</RowSales>}
        <RowPrice>{book.priceTTC.toFixed(2)} €</RowPrice>
        <RowAddBtn onClick={() => onAdd(book)} aria-label="Ajouter au panier">
          <IconCart />
        </RowAddBtn>
      </RowRight>
    </ListRow>
  )
}

/* ══════════════════════════════════════════════════════
   COMPOSANT SECTION
══════════════════════════════════════════════════════ */

function TopSection({
  label, books, universe, showUniverse, onAdd,
}: {
  label: string
  books: Book[]
  universe?: Universe
  showUniverse: boolean
  onAdd: (b: Book) => void
}) {
  const podium     = books.slice(0, 3)
  const listItems  = books.slice(3, 10)
  const totalUnits = books.reduce((s, b) => s + (SALES[b.id]?.units ?? 0), 0)

  if (books.length === 0) {
    return (
      <Section>
        <SectionHeader $universe={universe}>
          <SectionTitle>{label}</SectionTitle>
        </SectionHeader>
        <EmptySection>Aucune donnée disponible</EmptySection>
      </Section>
    )
  }

  return (
    <Section>
      <SectionHeader $universe={universe}>
        <div>
          <SectionTitle>
            {label}
            <SectionSub>{totalUnits.toLocaleString('fr-FR')} ex. vendus (30j réseau)</SectionSub>
          </SectionTitle>
        </div>
      </SectionHeader>

      {/* TOP 1–3 : BookCards avec badge */}
      <PodiumGrid>
        {podium.map((book, i) => {
          const rank = i + 1
          return (
            <CardWrapper key={book.id} $ranked>
              <TopBadge $rank={rank}>
                <BadgeTop>TOP</BadgeTop>
                <BadgeNum>{rank}</BadgeNum>
              </TopBadge>
              <BookCard book={book} showType />
            </CardWrapper>
          )
        })}
      </PodiumGrid>

      {/* TOP 4–10 : liste compacte */}
      {listItems.length > 0 && (
        <ListRows>
          {listItems.map((book, i) => (
            <ListItem
              key={book.id}
              book={book}
              rank={i + 4}
              showUniverse={showUniverse}
              onAdd={onAdd}
            />
          ))}
        </ListRows>
      )}
    </Section>
  )
}

/* ══════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════ */

export function TopVentesPage() {
  const [period,    setPeriod] = useState<Period>('30j')
  const [activeTab, setTab]    = useState<TabView>('tous')
  const { addToCart }          = useCart()
  const { showToast }          = useToast()

  const handleAdd = (book: Book) => {
    addToCart(book, 1)
    showToast('Ouvrage ajouté au panier')
  }

  const showUniverse    = activeTab === 'tous'
  const sectionUniverse = activeTab !== 'tous' ? activeTab : undefined

  const nouveautes = getSection('nouveaute', activeTab)
  const fonds      = getSection('fonds',     activeTab)

  return (
    <Page>
      <PageHeader>
        <PageTitle>Top Ventes</PageTitle>
        <HeaderRight>
          <PeriodSelector>
            <PeriodBtn $active={period === '30j'}   onClick={() => setPeriod('30j')}>30 jours</PeriodBtn>
            <PeriodBtn $active={period === '3mois'} onClick={() => setPeriod('3mois')}>3 mois</PeriodBtn>
          </PeriodSelector>
        </HeaderRight>
      </PageHeader>

      <TabBar>
        <Tab $active={activeTab === 'tous'} onClick={() => setTab('tous')}>Tous</Tab>
        {UNIVERSES.map(u => (
          <Tab key={u} $active={activeTab === u} onClick={() => setTab(u)}>{u}</Tab>
        ))}
      </TabBar>

      <Content>
        <TopSection
          label="Top Nouveautés"
          books={nouveautes}
          universe={sectionUniverse}
          showUniverse={showUniverse}
          onAdd={handleAdd}
        />
        <TopSection
          label="Top Fonds"
          books={fonds}
          universe={sectionUniverse}
          showUniverse={showUniverse}
          onAdd={handleAdd}
        />
      </Content>
    </Page>
  )
}
