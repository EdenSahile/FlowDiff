import { useState, type JSX } from 'react'
import { theme } from '@/lib/theme'
import styled, { keyframes } from 'styled-components'
import { mq } from '@/lib/responsive'
import { MOCK_FLASH_INFOS, FLASH_CATEGORIES } from '@/data/mockFlashInfos'
import type { FlashCategory } from '@/data/mockFlashInfos'
import { getBookById, UNIVERSES } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

/* ── Layout ── */
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

/* ── Filtres ── */
const FiltersGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`

const FilterLabel = styled.span`
  flex-shrink: 0;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const FilterPillsBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`

const FilterPill = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 2px solid ${({ theme, $active }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ theme, $active }) => $active ? theme.colors.navy : theme.colors.white};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme, $active }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.navy};
  }
`

/* ── Liste ── */
const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const ResultCount = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
`

/* ── Card Flash Info ── */
const Card = styled.article<{ $clickable: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  box-shadow: 0 1px 4px rgba(35, 47, 62, 0.06);
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:hover {
    transform: ${({ $clickable }) => ($clickable ? 'translateY(-2px)' : 'none')};
    box-shadow: ${({ $clickable }) => $clickable ? '0 4px 14px rgba(35,47,62,0.12)' : '0 1px 4px rgba(35,47,62,0.06)'};
  }
`

const CardInner = styled.div`
  display: flex;
  flex-direction: column;

  ${mq.md} {
    flex-direction: row;
  }
`

const MediaArea = styled.div`
  flex-shrink: 0;
  width: 100%;

  ${mq.md} {
    width: 280px;
  }
`

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;

  ${mq.md} {
    height: 100%;
    min-height: 200px;
  }
`

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;

  ${mq.md} {
    height: 100%;
    min-height: 200px;
  }
`

const VideoIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
`

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
`

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`

const CardMetaBadges = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const UniverseBadge = styled.span<{ $color: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $bg }) => $bg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ $color }) => $color};

  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
  }
`

const CategoryBadge = styled.span<{ $bg: string; $color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const CardDate = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  flex-shrink: 0;
`

const CardTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  margin: 0;
`

const CardText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  margin: 0;
`

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.sm};
`

const LinkBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  text-decoration: underline;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.navyHover}; }
`

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

/* ── Placeholder média ── */
const MediaPlaceholder = styled.div<{ $bg: string }>`
  flex-shrink: 0;
  width: 100%;
  height: 120px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;

  ${mq.md} {
    width: 280px;
    height: 100%;
    min-height: 200px;
  }
`

const PlaceholderIcon = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
  opacity: 0.6;
`

function IconAuteurs() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function IconFonds() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}

function IconNouveautes() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconFlowDiff() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}

function IconCartFI() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}

/* ── Couleurs univers — palette Forêt & Lin ── */
const UNIVERSE_COLORS: Record<Universe, string> = {
  'Littérature':     theme.colors.success,   // vert forêt
  'BD/Mangas':       theme.colors.accent,   // or
  'Jeunesse':        '#4A8C6F',   // vert clair
  'Adulte-pratique': '#8B7355',   // brun lin
}

const UNIVERSE_BG: Record<Universe, string> = {
  'Littérature':     '#E6EFE9',   // primaryLight
  'BD/Mangas':       '#F7F0DC',   // accentLight
  'Jeunesse':        '#EFF4F1',   // vert très pâle
  'Adulte-pratique': '#F0EDE8',   // lin chaud
}

const CATEGORY_COLORS: Record<FlashCategory, { bg: string; text: string }> = {
  'Auteurs':    { bg: '#F7F0DC', text: '#8B6914' },   // or pâle / or foncé
  'Fonds':      { bg: '#E6EFE9', text: theme.colors.success },   // vert pâle / vert forêt
  'Nouveautés': { bg: '#E6EFE9', text: '#1A4D32' },   // vert pâle / vert profond
  'FlowDiff':   { bg: '#EAEAE6', text: '#555550' },   // gris neutre
}

const CATEGORY_ICON: Record<string, JSX.Element> = {
  'Auteurs':    <IconAuteurs />,
  'Fonds':      <IconFonds />,
  'Nouveautés': <IconNouveautes />,
  'FlowDiff':   <IconFlowDiff />,
}

/* ── Format date ── */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/* ── Stepper quantité ── */
const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 2px 4px;
`

const QtyBtn = styled.button`
  width: 24px; height: 24px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .12s;

  &:hover    { opacity: 0.6; }
  &:disabled { opacity: .3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  width: 22px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
`

export function FlashInfosPage() {
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [category, setCategory] = useState<FlashCategory | null>(null)
  const [qtys, setQtys] = useState<Record<string, number>>({})
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const getQty = (id: string) => qtys[id] ?? 1
  const changeQty = (id: string, delta: number) =>
    setQtys(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }))

  const filtered = MOCK_FLASH_INFOS.filter(fi => {
    if (universe && fi.universe !== universe) return false
    if (category && fi.category !== category) return false
    return true
  })

  const handleAdd = (fiId: string, bookId: string) => {
    const book = getBookById(bookId)
    if (!book) return
    addToCart(book, getQty(fiId))
    showToast('Ouvrage ajouté au panier')
    setQtys(prev => ({ ...prev, [fiId]: 1 }))
  }

  return (
    <Page>
      <PageHeader>
        <PageEyebrow>Actualités</PageEyebrow>
        <PageTitle>Flash Infos</PageTitle>
        <PageSubtitle>Auteurs, fonds, nouveautés — toute l'actualité FlowDiff en temps réel</PageSubtitle>
      </PageHeader>

      <FiltersGroup>
        <FilterRow>
          <FilterLabel>Rayon</FilterLabel>
          <FilterPillsBar>
            <FilterPill $active={universe === null} onClick={() => setUniverse(null)}>Tous</FilterPill>
            {UNIVERSES.map(u => (
              <FilterPill
                key={u}
                $active={universe === u}
                onClick={() => setUniverse(universe === u ? null : u)}
              >
                {u}
              </FilterPill>
            ))}
          </FilterPillsBar>
        </FilterRow>

        <FilterRow>
          <FilterLabel>Type d'info</FilterLabel>
          <FilterPillsBar>
            <FilterPill $active={category === null} onClick={() => setCategory(null)}>Tous</FilterPill>
            {FLASH_CATEGORIES.map(cat => (
              <FilterPill
                key={cat}
                $active={category === cat}
                onClick={() => setCategory(c => c === cat ? null : cat)}
              >
                {cat}
              </FilterPill>
            ))}
          </FilterPillsBar>
        </FilterRow>
      </FiltersGroup>

      <ResultCount>
        {filtered.length} flash info{filtered.length !== 1 ? 's' : ''}
      </ResultCount>

      {filtered.length === 0 ? (
        <EmptyState>Aucune info flash pour cette sélection.</EmptyState>
      ) : (
        <List>
          {filtered.map(fi => (
            <Card
              key={fi.id}
              $clickable={!!fi.link}
              onClick={() => fi.link && window.open(fi.link, '_blank', 'noopener,noreferrer')}
            >
              <CardInner>
                {/* Média : vidéo, image, ou placeholder */}
                {fi.videoUrl ? (
                  <MediaArea>
                    <VideoWrapper>
                      <VideoIframe
                        src={fi.videoUrl}
                        title={fi.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </VideoWrapper>
                  </MediaArea>
                ) : fi.imageUrl ? (
                  <MediaArea>
                    <CardImage src={fi.imageUrl} alt={fi.title} loading="lazy" />
                  </MediaArea>
                ) : (
                  <MediaPlaceholder $bg={UNIVERSE_BG[fi.universe]}>
                    <PlaceholderIcon $color={UNIVERSE_COLORS[fi.universe]}>
                      {CATEGORY_ICON[fi.category]}
                    </PlaceholderIcon>
                  </MediaPlaceholder>
                )}

                <CardBody>
                  <CardMeta>
                    <CardMetaBadges>
                      <UniverseBadge
                        $color={UNIVERSE_COLORS[fi.universe]}
                        $bg={UNIVERSE_BG[fi.universe]}
                      >
                        {fi.universe}
                      </UniverseBadge>
                      <CategoryBadge
                        $bg={CATEGORY_COLORS[fi.category].bg}
                        $color={CATEGORY_COLORS[fi.category].text}
                      >
                        {fi.category}
                      </CategoryBadge>
                    </CardMetaBadges>
                    <CardDate>{formatDate(fi.date)}</CardDate>
                  </CardMeta>

                  <CardTitle>{fi.title}</CardTitle>
                  <CardText>{fi.text}</CardText>

                  <CardActions>
                    {fi.link && (
                      <LinkBtn
                        href={fi.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {fi.linkLabel ?? 'En savoir plus'} <IconArrow />
                      </LinkBtn>
                    )}
                    {fi.bookId && (
                      <>
                        <QtyControl onClick={(e) => e.stopPropagation()}>
                          <QtyBtn
                            onClick={(e) => { e.stopPropagation(); changeQty(fi.id, -1) }}
                            disabled={getQty(fi.id) <= 1}
                            aria-label="Diminuer la quantité"
                          >−</QtyBtn>
                          <QtyValue>{getQty(fi.id)}</QtyValue>
                          <QtyBtn
                            onClick={(e) => { e.stopPropagation(); changeQty(fi.id, +1) }}
                            aria-label="Augmenter la quantité"
                          >+</QtyBtn>
                        </QtyControl>
                        <AddBtn onClick={(e) => { e.stopPropagation(); handleAdd(fi.id, fi.bookId!) }}>
                          <IconCartFI /> Ajouter au panier
                        </AddBtn>
                      </>
                    )}
                  </CardActions>
                </CardBody>
              </CardInner>
            </Card>
          ))}
        </List>
      )}
    </Page>
  )
}
