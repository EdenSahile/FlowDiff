import { useState, type JSX } from 'react'
import { theme } from '@/lib/theme'
import styled from 'styled-components'
import { MOCK_FLASH_INFOS, FLASH_CATEGORIES } from '@/data/mockFlashInfos'
import type { FlashCategory } from '@/data/mockFlashInfos'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBookById } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

/* ── Layout ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

/* ── Filtres ── */
const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`

const CategoryChip = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ theme, $active }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ theme, $active }) => $active ? theme.colors.navy : theme.colors.white};
  color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme, $active }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.navy};
  }
`

const Divider = styled.div`
  width: 1px;
  height: 28px;
  background: ${({ theme }) => theme.colors.gray[200]};
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
const Card = styled.article`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`

const CardInner = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: row;
  }
`

const MediaArea = styled.div`
  flex-shrink: 0;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 280px;
  }
`

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 100%;
    min-height: 200px;
  }
`

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
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
  padding: ${({ theme }) => theme.spacing.md};
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

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
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

export function FlashInfosPage() {
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [category, setCategory] = useState<FlashCategory | null>(null)
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const filtered = MOCK_FLASH_INFOS.filter(fi => {
    if (universe && fi.universe !== universe) return false
    if (category && fi.category !== category) return false
    return true
  })

  const handleAdd = (bookId: string) => {
    const book = getBookById(bookId)
    if (!book) return
    addToCart(book, 1)
    showToast('Ouvrage ajouté au panier')
  }

  return (
    <Page>
      <PageTitle>Flash Infos</PageTitle>

      <FiltersRow>
        <UniverseFilter value={universe} onChange={setUniverse} />

        <Divider />

        {FLASH_CATEGORIES.map(cat => (
          <CategoryChip
            key={cat}
            $active={category === cat}
            onClick={() => setCategory(c => c === cat ? null : cat)}
          >
            {cat}
          </CategoryChip>
        ))}
      </FiltersRow>

      <ResultCount>
        {filtered.length} flash info{filtered.length !== 1 ? 's' : ''}
      </ResultCount>

      {filtered.length === 0 ? (
        <EmptyState>Aucune info flash pour cette sélection.</EmptyState>
      ) : (
        <List>
          {filtered.map(fi => (
            <Card key={fi.id}>
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
                      <LinkBtn href={fi.link} target="_blank" rel="noopener noreferrer">
                        {fi.linkLabel ?? 'En savoir plus'} <IconArrow />
                      </LinkBtn>
                    )}
                    {fi.bookId && (
                      <AddBtn onClick={() => handleAdd(fi.bookId!)}>
                        <IconCartFI /> Ajouter au panier
                      </AddBtn>
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
