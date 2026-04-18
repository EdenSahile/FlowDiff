import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { MOCK_BOOKS, type Book, type Universe } from '@/data/mockBooks'
import { BookCover } from '@/components/catalogue/BookCover'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/Toast'

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

const UNIVERSE_COLORS: Record<Universe, { bg: string; text: string; dot: string }> = {
  'BD/Mangas':       { bg: '#FFF0E8', text: '#C04A00', dot: '#C04A00' },
  'Jeunesse':        { bg: '#E8F0FC', text: '#1565C0', dot: '#1565C0' },
  'Littérature':     { bg: '#EEF1F7', text: '#1C3252', dot: '#1C3252' },
  'Adulte-pratique': { bg: '#E8F5EE', text: '#1E7045', dot: '#1E7045' },
}

const SECTION_BORDER: Record<Universe, string> = {
  'BD/Mangas':       '#C04A00',
  'Jeunesse':        '#1565C0',
  'Littérature':     '#1C3252',
  'Adulte-pratique': '#1E7045',
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
   ICÔNES
══════════════════════════════════════════════════════ */

function IconCart() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}

function TrendIcon({ trend }: { trend: SalesData['trend'] }) {
  if (trend === 'up')     return <TrendUp>↑</TrendUp>
  if (trend === 'down')   return <TrendDown>↓</TrendDown>
  return <TrendStable>→</TrendStable>
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

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 18px;
  }
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
  background: ${({ $active, theme }) => $active ? '#fff' : 'transparent'};
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
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'rgba(28,50,82,0.12)'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.navy};
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
  border-left: 4px solid ${({ $universe }) =>
    $universe ? SECTION_BORDER[$universe] : '#1E3A5F'};
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

/* ── Podium ── */
const PodiumRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 8px;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`

const PodiumCard = styled.article<{ $rank: number }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(28,50,82,0.10);
  border: 1px solid rgba(28,50,82,0.07);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  width: 185px;
  flex-shrink: 0;
  margin-bottom: ${({ $rank }) => $rank === 1 ? '28px' : '0'};

  &:hover {
    box-shadow: 0 8px 24px rgba(28,50,82,0.16);
    transform: translateY(-3px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 150px;
    margin-bottom: ${({ $rank }) => $rank === 1 ? '20px' : '0'};
  }
`

const PodiumCover = styled.div`
  display: flex;
  justify-content: center;
  padding: 14px 14px 0;
  background: linear-gradient(180deg, #F7F5F1 0%, transparent 100%);
  border-radius: 14px 14px 0 0;
  position: relative;
`

const RankBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: 8px;
  left: 8px;
  width: ${({ $rank }) => $rank === 1 ? '38px' : '32px'};
  height: ${({ $rank }) => $rank === 1 ? '38px' : '32px'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ $rank }) => $rank === 1 ? '11px' : '10px'};
  font-weight: 800;
  letter-spacing: 0.03em;
  background: ${({ $rank }) =>
    $rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
    $rank === 2 ? 'linear-gradient(135deg, #E0E0E0, #A8A8A8)' :
    'linear-gradient(135deg, #CD9B6A, #A0652A)'};
  color: ${({ $rank }) => $rank === 1 ? '#5A3A00' : $rank === 2 ? '#3A3A3A' : '#fff'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.20);
`

const PodiumBody = styled.div`
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
`

const PodiumTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.25;
  min-height: calc(2 * 13px * 1.25);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PodiumAuthor = styled.p`
  font-size: 11px;
  font-style: italic;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PodiumMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  gap: 4px;
`

const PodiumPrice = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
`

const PodiumSales = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
`

const PodiumAddBtn = styled.button`
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.15s, transform 0.1s;
  &:hover { background: #cb7d08; }
  &:active { transform: scale(0.97); }
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

/* ── Liste compacte ── */
const ListRows = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(28,50,82,0.07);
  overflow: hidden;
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
  color: rgba(28,50,82,0.18);
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
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
  &:hover { background: #cb7d08; }
`

const TrendUp     = styled.span`color: #1E7045; font-size: 11px; font-weight: 700;`
const TrendDown   = styled.span`color: #C0392B; font-size: 11px; font-weight: 700;`
const TrendStable = styled.span`color: ${({ theme }) => theme.colors.gray[400]}; font-size: 11px; font-weight: 700;`

const EmptySection = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-align: center;
  padding: 24px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
`

/* ══════════════════════════════════════════════════════
   COMPOSANT PODIUM CARD
══════════════════════════════════════════════════════ */

function PodiumItem({
  book, rank, showUniverse, onAdd
}: { book: Book; rank: number; showUniverse: boolean; onAdd: (b: Book) => void }) {
  const navigate = useNavigate()
  const sales    = SALES[book.id]
  const uc       = UNIVERSE_COLORS[book.universe]

  return (
    <PodiumCard $rank={rank} onClick={() => navigate(`/livre/${book.id}`)}>
      <PodiumCover>
        <BookCover isbn={book.isbn} alt={book.title} width={100} height={140} />
        <RankBadge $rank={rank}>TOP{rank}</RankBadge>
      </PodiumCover>
      <PodiumBody>
        <PodiumTitle>{book.title}</PodiumTitle>
        <PodiumAuthor>{book.authors[0]}</PodiumAuthor>

        <PodiumMeta>
          <PodiumPrice>{book.priceTTC.toFixed(2)} €</PodiumPrice>
          {sales && (
            <PodiumSales>
              <TrendIcon trend={sales.trend} /> {sales.units.toLocaleString('fr-FR')} ex.
            </PodiumSales>
          )}
        </PodiumMeta>

        {showUniverse && (
          <UnivBadge $bg={uc.bg} $text={uc.text} style={{ marginTop: 4, alignSelf: 'flex-start' }}>
            <UnivDot $color={uc.dot} />
            {book.universe}
          </UnivBadge>
        )}

        <PodiumAddBtn onClick={e => { e.stopPropagation(); onAdd(book) }}>
          <IconCart /> Ajouter
        </PodiumAddBtn>
      </PodiumBody>
    </PodiumCard>
  )
}

/* ══════════════════════════════════════════════════════
   COMPOSANT ROW LISTE
══════════════════════════════════════════════════════ */

function ListItem({
  book, rank, showUniverse, onAdd
}: { book: Book; rank: number; showUniverse: boolean; onAdd: (b: Book) => void }) {
  const navigate = useNavigate()
  const sales    = SALES[book.id]
  const uc       = UNIVERSE_COLORS[book.universe]

  return (
    <ListRow onClick={() => navigate(`/livre/${book.id}`)}>
      <RowRank>{rank}</RowRank>
      <div style={{ flexShrink: 0, borderRadius: 4, overflow: 'hidden' }}>
        <BookCover isbn={book.isbn} alt={book.title} width={42} height={58} />
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
   COMPOSANT SECTION (nouveauté ou fonds)
══════════════════════════════════════════════════════ */

function TopSection({
  label, books, showUniverse, universe, onAdd
}: {
  label: string
  books: Book[]
  showUniverse: boolean
  universe?: Universe
  onAdd: (b: Book) => void
}) {
  const podium = books.slice(0, 3)
  const list   = books.slice(3, 10)
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

  /* Ordre podium : TOP2 | TOP1 | TOP3 */
  const orderedPodium =
    podium.length === 3 ? [podium[1], podium[0], podium[2]] :
    podium.length === 2 ? [podium[1], podium[0]] :
    podium

  const rankOf = (b: Book) => podium.indexOf(b) + 1

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

      <PodiumRow>
        {orderedPodium.map(book => (
          <PodiumItem
            key={book.id}
            book={book}
            rank={rankOf(book)}
            showUniverse={showUniverse}
            onAdd={onAdd}
          />
        ))}
      </PodiumRow>

      {list.length > 0 && (
        <ListRows>
          {list.map((book, i) => (
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
  const [period,  setPeriod]  = useState<Period>('30j')
  const [activeTab, setTab]   = useState<TabView>('tous')
  const { addToCart }         = useCart()
  const { showToast }         = useToast()

  const handleAdd = (book: Book) => {
    addToCart(book, 1)
    showToast('Ouvrage ajouté au panier')
  }

  const showUniverse = activeTab === 'tous'
  const sectionUniverse = activeTab !== 'tous' ? activeTab : undefined

  const nouveautes = getSection('nouveaute', activeTab)
  const fonds      = getSection('fonds',     activeTab)

  return (
    <Page>
      <PageHeader>
        <PageTitle>Top Ventes</PageTitle>
        <HeaderRight>
          <PeriodSelector>
            <PeriodBtn $active={period === '30j'}    onClick={() => setPeriod('30j')}>30 jours</PeriodBtn>
            <PeriodBtn $active={period === '3mois'}  onClick={() => setPeriod('3mois')}>3 mois</PeriodBtn>
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
          showUniverse={showUniverse}
          universe={sectionUniverse}
          onAdd={handleAdd}
        />
        <TopSection
          label="Top Fonds"
          books={fonds}
          showUniverse={showUniverse}
          universe={sectionUniverse}
          onAdd={handleAdd}
        />
      </Content>
    </Page>
  )
}
