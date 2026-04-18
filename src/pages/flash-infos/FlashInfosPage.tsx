import { useState } from 'react'
import styled from 'styled-components'
import { MOCK_FLASH_INFOS, FLASH_CATEGORIES } from '@/data/mockFlashInfos'
import type { FlashCategory } from '@/data/mockFlashInfos'
import { UniverseFilter } from '@/components/catalogue/UniverseFilter'
import { getBookById } from '@/data/mockBooks'
import type { Universe } from '@/data/mockBooks'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/Toast'

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
  color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme, $active }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.navy};
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
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
`

const CardInner = styled.div`
  display: flex;
  gap: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: row;
  }
  flex-direction: column;
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
    min-height: 180px;
  }
`

const VideoWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding-bottom: 0;
    height: 180px;
  }
`

const VideoIframe = styled.iframe`
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  border: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    position: static;
    width: 280px;
    height: 180px;
  }
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
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const UniverseBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};

  &::before {
    content: '';
    display: inline-block;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
  }
`

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.navy};
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
  margin-left: auto;
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
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover { background: #e6ac00; }
`

function IconCartFI() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}

/* ── Couleurs univers ── */
const UNIVERSE_COLORS: Record<Universe, string> = {
  'Littérature':     '#1E3A5F',
  'BD/Mangas':       '#E65100',
  'Jeunesse':        '#1565C0',
  'Adulte-pratique': '#2E7D32',
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

      {filtered.length === 0 ? (
        <EmptyState>Aucune info flash pour cette sélection.</EmptyState>
      ) : (
        <List>
          {filtered.map(fi => (
            <Card key={fi.id}>
              <CardInner>
                {/* Média : image ou vidéo */}
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
                ) : null}

                <CardBody>
                  <CardMeta>
                    <UniverseBadge $color={UNIVERSE_COLORS[fi.universe]}>
                      {fi.universe}
                    </UniverseBadge>
                    <CategoryBadge>{fi.category}</CategoryBadge>
                    <CardDate>{formatDate(fi.date)}</CardDate>
                  </CardMeta>

                  <CardTitle>{fi.title}</CardTitle>
                  <CardText>{fi.text}</CardText>

                  <CardActions>
                    {fi.link && (
                      <LinkBtn href={fi.link} target="_blank" rel="noopener noreferrer">
                        {fi.linkLabel ?? 'En savoir plus'} →
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
