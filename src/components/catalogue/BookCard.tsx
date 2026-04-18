import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Book } from '@/data/mockBooks'
import { BookCover } from './BookCover'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/Toast'

/* ── Couleurs univers ── */
const universeColors: Record<string, { dot: string; bg: string; text: string }> = {
  'Littérature':     { dot: '#1C3252', bg: '#EEF1F7', text: '#1C3252' },
  'BD/Mangas':       { dot: '#C04A00', bg: '#FFF0E8', text: '#C04A00' },
  'Jeunesse':        { dot: '#1565C0', bg: '#E8F0FC', text: '#1565C0' },
  'Adulte-pratique': { dot: '#1E7045', bg: '#E8F5EE', text: '#1E7045' },
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
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 0;
  background: linear-gradient(180deg, #F7F5F1 0%, transparent 100%);
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

const UniverseBadge = styled.span<{ $bg: string; $text: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $bg }) => $bg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 700;
  color: ${({ $text }) => $text};
  letter-spacing: 0.01em;
`

const UniverseDot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const NouveauteBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-left: auto;
`

const AParaitreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: #E65100;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-left: auto;
`

const Title = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.25;
  min-height: calc(2 * 15px * 1.25);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Authors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
`

const Publisher = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  line-height: 1.4;
  min-height: calc(2 * 12px * 1.4);
  color: ${({ theme }) => theme.colors.gray[600]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const IsbnLine = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: 0.01em;
`

/* ── Zone prix + quantité + bouton ── */
const ActionZone = styled.div`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Price = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.01em;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.gray[50]};
`

const QtyBtn = styled.button`
  width: 30px; height: 30px;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .12s;
  font-weight: 700;

  &:hover   { background: ${({ theme }) => theme.colors.gray[200]}; }
  &:disabled{ opacity: .3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  min-width: 28px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const AjouterBtn = styled.button`
  width: 100%;
  padding: 10px 16px;
  margin-top: 8px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: background .15s, transform .1s;
  white-space: nowrap;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover { background: #cb7d08; }
  &:active { transform: scale(0.97); }
`

function IconCart() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}

interface Props {
  book: Book
  showType?: boolean
}

export function BookCard({ book, showType = false }: Props) {
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const [qty, setQty] = useState(1)

  const isOrderable = book.type !== 'a-paraitre'
  const uColors = universeColors[book.universe] ?? { dot: '#999', bg: '#F0F0F0', text: '#555' }

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(book, qty)
    showToast('Ouvrage ajouté au panier')
    setQty(1)
  }

  const handleQty = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    setQty(q => Math.max(1, q + delta))
  }

  return (
    <Card
      onClick={() => navigate(`/livre/${book.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/livre/${book.id}`)}
    >
      <CoverArea>
        <BookCover isbn={book.isbn} alt={`Couverture de ${book.title}`} width={96} height={138} />
      </CoverArea>

      <Body>
        <TopRow>
          <UniverseBadge $bg={uColors.bg} $text={uColors.text}>
            <UniverseDot $color={uColors.dot} />
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
        <Publisher>{book.publisher}{book.collection ? ` · ${book.collection}` : ''}</Publisher>
        <IsbnLine>ISBN {book.isbn}</IsbnLine>

        <ActionZone>
          <PriceRow>
            <Price>{book.priceTTC.toFixed(2)} €</Price>
            {isOrderable && (
              <QtyControl style={{ marginLeft: 'auto' }}>
                <QtyBtn onClick={e => handleQty(e, -1)} disabled={qty <= 1} aria-label="Diminuer">−</QtyBtn>
                <QtyValue>{qty}</QtyValue>
                <QtyBtn onClick={e => handleQty(e, +1)} aria-label="Augmenter">+</QtyBtn>
              </QtyControl>
            )}
          </PriceRow>

          {isOrderable && (
            <AjouterBtn onClick={handleAdd} title="Ajouter au panier" aria-label="Ajouter au panier">
              <IconCart /> Ajouter au panier
            </AjouterBtn>
          )}
        </ActionZone>
      </Body>
    </Card>
  )
}
