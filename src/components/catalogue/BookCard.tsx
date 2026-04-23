import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Book } from '@/data/mockBooks'
import { BookCover } from './BookCover'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { ListPickerPopover } from './ListPickerPopover'
import { StockStatus } from '@/components/ui/StockStatus'
import { StockAlertModal } from '@/components/ui/StockAlertModal'
import { theme } from '@/lib/theme'

/* ── Palette catégories — ajouter ici pour étendre ── */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Littérature':     { bg: '#E8EDF3', text: '#1C3252' },
  'BD/Mangas':       { bg: '#FDEBD0', text: '#C04A00' },
  'Jeunesse':        { bg: '#F5E8F8', text: '#7B2D8B' },
  'Adulte-pratique': { bg: '#E6F4EC', text: '#1E7045' },
  'Autres':          { bg: '#F1EFE8', text: '#5F5E5A' },
}

/* ── Card ── */
const Card = styled.article`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(28, 58, 95, 0.08);
  border: 1px solid rgba(28, 58, 95, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;

  &:hover {
    box-shadow: 0 10px 32px rgba(28, 58, 95, 0.18);
    transform: translateY(-4px);
    border-color: rgba(28, 58, 95, 0.14);
  }

  &:active { transform: translateY(-2px); }
`

const CoverArea = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 0;
  background: linear-gradient(180deg, #F7F5F1 0%, transparent 100%);
`

const StarBtn = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.85)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 4px rgba(28,58,95,0.15);
  transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
  z-index: 2;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,1)'};
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(28,58,95,0.2);
  }
  &:active { transform: scale(0.95); }
`

const StarWrap = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
`

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: 4px;
  flex-wrap: wrap;
`

const UniverseBadge = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 400;
  flex-shrink: 0;
`

const NouveauteBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.accent};
  color: #3d2f00;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 400;
  flex-shrink: 0;
`

const AParaitreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  background: #E65100;
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 400;
  flex-shrink: 0;
`

const Title = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 700;
  color: #1A2332;
  line-height: 1.25;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Authors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: #555555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
`

const Publisher = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: #6B6B68;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const IsbnStockRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
`

const IsbnText = styled.span`
  font-size: 13px;
  color: #6B6B68;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
`

/* ── Zone prix + quantité + bouton ── */
const ActionZone = styled.div`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 0.5px solid ${({ theme }) => theme.colors.gray[200]};
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const PriceRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Price = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 20px;
  font-weight: 800;
  color: #1A2332;
  letter-spacing: -0.01em;
  line-height: 1.1;
`

const PriceLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  color: #6B6B68;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
  padding: 3px 6px;
`

const QtyBtn = styled.button`
  width: 24px; height: 24px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.success};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .12s;

  &:hover   { opacity: 0.7; }
  &:disabled{ opacity: .3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  width: 20px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
`

const AjouterBtn = styled.button<{ $epuise?: boolean }>`
  width: 100%;
  padding: 0.625rem;
  margin-top: 8px;
  border: none;
  border-radius: 7px;
  background: ${({ $epuise, theme }) => $epuise ? '#C9C9C2' : theme.colors.navy};
  color: ${({ $epuise }) => $epuise ? '#6B6B68' : '#fdfdfd'};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: ${({ $epuise }) => $epuise ? 'not-allowed' : 'pointer'};
  transition: background .15s, transform .1s;
  white-space: nowrap;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${({ $epuise, theme }) => $epuise ? '#C9C9C2' : theme.colors.primaryHover};
  }
  &:active { transform: ${({ $epuise }) => $epuise ? 'none' : 'scale(0.97)'}; }
`


const EpuiseNote = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
  text-align: center;
`

function IconCart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill={filled ? theme.colors.accent : 'none'}
      stroke={filled ? theme.colors.accent : theme.colors.navy}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

interface Props {
  book: Book
  showType?: boolean
}

export function BookCard({ book, showType = false }: Props) {
  const navigate       = useNavigate()
  const { addToCart }  = useCart()
  const { showToast }  = useToast()
  const { isInAnyList, getListsContaining, removeFromList } = useWishlist()
  const [qty, setQty]  = useState(1)
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const starRef = useRef<HTMLDivElement>(null)

  const isAParaitre   = book.type === 'a-paraitre'
  const isEpuise      = book.statut === 'epuise'
  const needsConfirm  = book.statut === 'sur_commande' || book.statut === 'en_reimp'
  const isOrderable   = !isAParaitre && !isEpuise
  const catColors = CATEGORY_COLORS[book.universe] ?? CATEGORY_COLORS['Autres']

  const inList = isInAnyList(book.id)

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inList) {
      getListsContaining(book.id).forEach(list => removeFromList(list.id, book.id))
    } else if (starRef.current) {
      setPopoverAnchor(starRef.current.getBoundingClientRect())
    }
  }

  const confirmAdd = (enReliquat: boolean) => {
    addToCart(book, qty, { enReliquat })
    showToast('Ouvrage ajouté au panier')
    setQty(1)
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEpuise) return
    if (needsConfirm) {
      setAlertOpen(true)
      return
    }
    confirmAdd(false)
  }

  const handleQty = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    setQty(q => Math.max(1, q + delta))
  }

  const handleCardClick = () => {
    if (window.getSelection()?.toString()) return
    navigate(`/livre/${book.id}`)
  }

  return (
    <>
    <Card
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/livre/${book.id}`)}
    >
      <CoverArea>
        <BookCover
          isbn={book.isbn}
          alt={book.title}
          width={96}
          height={138}
          universe={book.universe}
          authors={book.authors}
          publisher={book.publisher}
          collection={book.collection}
        />
        <StarWrap ref={starRef}>
          <StarBtn
            $active={inList}
            onClick={handleStarClick}
            aria-label="Ajouter à une liste"
            title="Ajouter à une liste"
          >
            <IconStar filled={inList} />
          </StarBtn>
        </StarWrap>
      </CoverArea>

      <Body>
        <TopRow>
          <UniverseBadge $bg={catColors.bg} $color={catColors.text}>
            {book.universe}
          </UniverseBadge>
          {showType && book.type === 'nouveaute' && (
            <NouveauteBadge>Nouveauté</NouveauteBadge>
          )}
          {book.type === 'a-paraitre' && (
            <AParaitreBadge>À paraître</AParaitreBadge>
          )}
        </TopRow>

        <Title>{book.title}</Title>
        <Authors>{book.authors.join(', ')}</Authors>
        {(book.publisher || book.collection) && (
          <Publisher>{book.publisher}{book.collection ? ` · ${book.collection}` : ''}</Publisher>
        )}

        <IsbnStockRow>
          <IsbnText>{book.isbn}</IsbnText>
          {book.statut && !isAParaitre && (
            <StockStatus statut={book.statut} delaiReimp={book.delaiReimp} />
          )}
        </IsbnStockRow>

        <ActionZone>
          <PriceRow>
            <PriceInfo>
              <Price>{book.priceTTC.toFixed(2)} €</Price>
              <PriceLabel>Prix public TTC</PriceLabel>
            </PriceInfo>
            {isOrderable && (
              <QtyControl>
                <QtyBtn onClick={e => handleQty(e, -1)} disabled={qty <= 1} aria-label="Diminuer">−</QtyBtn>
                <QtyValue>{qty}</QtyValue>
                <QtyBtn onClick={e => handleQty(e, +1)} aria-label="Augmenter">+</QtyBtn>
              </QtyControl>
            )}
          </PriceRow>

          {!isAParaitre && (
            isEpuise ? (
              <>
                <AjouterBtn
                  $epuise
                  disabled
                  aria-disabled="true"
                  title="Épuisé"
                  onClick={e => e.stopPropagation()}
                >
                  <IconCart /> Épuisé
                </AjouterBtn>
                <EpuiseNote>Cet ouvrage n'est plus disponible</EpuiseNote>
              </>
            ) : (
              <AjouterBtn
                onClick={handleAdd}
                title="Ajouter au panier"
                aria-label="Ajouter au panier"
              >
                <IconCart /> Ajouter au panier
              </AjouterBtn>
            )
          )}
        </ActionZone>
      </Body>
    </Card>

    {popoverAnchor && (
      <ListPickerPopover
        book={book}
        anchorRect={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
      />
    )}

    {needsConfirm && book.statut && (
      <StockAlertModal
        open={alertOpen}
        statut={book.statut}
        onConfirm={() => {
          setAlertOpen(false)
          confirmAdd(book.statut === 'en_reimp')
        }}
        onCancel={() => setAlertOpen(false)}
      />
    )}
    </>
  )
}
