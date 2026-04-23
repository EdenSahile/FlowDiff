import { useEffect, useRef, useState } from 'react'
import { theme } from '@/lib/theme'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/contexts/CartContext'
import { MOCK_BOOKS } from '@/data/mockBooks'
import { MOCK_FLASH_INFOS } from '@/data/mockFlashInfos'
import { BookCard } from '@/components/catalogue/BookCard'

const GREEN = theme.colors.success

const nouveautes = MOCK_BOOKS
  .filter(b => b.type === 'nouveaute')
  .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
  .slice(0, 8)

const nouveautesCount = MOCK_BOOKS.filter(b => b.type === 'nouveaute').length
const flashInfosCount = MOCK_FLASH_INFOS.length

/* ── SVG Icons ── */
function IconPackage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}

function IconBooks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  )
}

function IconChevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

/* ── Page layout ── */
const Page = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
  background-color: ${({ theme }) => theme.colors.gray[50]};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing['3xl']};
  }
`

const Content = styled.div`
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
`

/* ── Hero ── */
const HeroSection = styled.section`
  text-align: center;
`

const GreetingTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 22px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-bottom: 4px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 20px;
  }
`

const LibraireName = styled.span`
  color: ${GREEN};
`

const GreetingSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 1.5rem;
`

/* ── Stats ── */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  padding: 12px 16px;
`

const StatValue = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 20px;
  font-weight: 500;
  color: ${GREEN};
  margin-bottom: 2px;
`

const StatLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const RedDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e24b4a;
  flex-shrink: 0;
`

/* ── Shortcuts ── */
const ShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const ShortcutCard = styled(Link)`
  background: ${({ theme }) => theme.colors.gray[100]};
  border: 0.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.gray[600]};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${GREEN};
  }
`

const ShortcutLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

/* ── Nouveautés ── */
const NouveautesSection = styled.section`
  width: 100%;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
`

const SeeAllLink = styled(Link)`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 500;
  color: ${GREEN};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`

const CarouselWrapper = styled.div`
  position: relative;
`

const CardScroll = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const CardSlot = styled.div`
  flex-shrink: 0;
  width: 200px;
`

const ArrowBtn = styled.button<{ $side: 'left' | 'right'; $visible: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side === 'left' ? 'left: -18px;' : 'right: -18px;'}
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.navy};
  transition: box-shadow 0.15s, opacity 0.15s;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};

  &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
`

/* ── Component ── */
export function HomePage() {
  const { user } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  /* Raccourci / → focus champ de recherche du header */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== '/') return
      const active = document.activeElement
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
      e.preventDefault()
      const headerInput = document.getElementById('header-search-input') as HTMLInputElement | null
      headerInput?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  /* Mise à jour des flèches au scroll */
  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows)
    return () => el.removeEventListener('scroll', updateArrows)
  }, [])

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <Page>
      <Content>

        {/* 1 — Hero */}
        <HeroSection aria-label="Accueil">
          <GreetingTitle>
            {greeting}{user ? (
              <>, <LibraireName>{user.nomLibrairie}</LibraireName></>
            ) : null} 👋
          </GreetingTitle>
          <GreetingSubtitle>Que souhaitez-vous commander aujourd'hui ?</GreetingSubtitle>

        </HeroSection>

        {/* 2 — Stats */}
        <StatsGrid aria-label="Résumé du compte">
          <StatCard onClick={() => navigate('/panier')} style={{ cursor: 'pointer' }}>
            <StatValue>{totalItems}</StatValue>
            <StatLabel>Articles au panier</StatLabel>
          </StatCard>
          <StatCard onClick={() => navigate('/nouveautes')} style={{ cursor: 'pointer' }}>
            <StatValue>{nouveautesCount}</StatValue>
            <StatLabel>Nouveautés ce mois</StatLabel>
          </StatCard>
          <StatCard onClick={() => navigate('/flash-infos')} style={{ cursor: 'pointer' }}>
            <StatValue>
              {flashInfosCount}
              {flashInfosCount > 0 && <RedDot aria-hidden="true" />}
            </StatValue>
            <StatLabel>Flash infos non lus</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* 3 — Raccourcis */}
        <ShortcutsGrid aria-label="Navigation rapide">
          <ShortcutCard to="/nouveautes" aria-label="Nouveautés">
            <IconPackage />
            <ShortcutLabel>Nouveautés</ShortcutLabel>
          </ShortcutCard>
          <ShortcutCard to="/fonds" aria-label="Fonds">
            <IconBooks />
            <ShortcutLabel>Fonds</ShortcutLabel>
          </ShortcutCard>
          <ShortcutCard to="/selections" aria-label="Sélections">
            <IconStar />
            <ShortcutLabel>Sélections</ShortcutLabel>
          </ShortcutCard>
          <ShortcutCard to="/historique" aria-label="Mon historique">
            <IconClipboard />
            <ShortcutLabel>Mon historique</ShortcutLabel>
          </ShortcutCard>
        </ShortcutsGrid>

        {/* 4 — Nouveautés du mois */}
        <NouveautesSection aria-label="Nouveautés du mois">
          <SectionHeader>
            <SectionTitle>Nouveautés du mois</SectionTitle>
            <SeeAllLink to="/nouveautes">Voir tout →</SeeAllLink>
          </SectionHeader>

          <CarouselWrapper>
            <ArrowBtn
              $side="left"
              $visible={canScrollLeft}
              onClick={() => scrollBy(-220)}
              aria-label="Défiler vers la gauche"
            >
              <IconChevron dir="left" />
            </ArrowBtn>

            <CardScroll ref={scrollRef}>
              {nouveautes.map(book => (
                <CardSlot key={book.id}>
                  <BookCard book={book} />
                </CardSlot>
              ))}
            </CardScroll>

            <ArrowBtn
              $side="right"
              $visible={canScrollRight}
              onClick={() => scrollBy(220)}
              aria-label="Défiler vers la droite"
            >
              <IconChevron dir="right" />
            </ArrowBtn>
          </CarouselWrapper>
        </NouveautesSection>

      </Content>
    </Page>
  )
}
