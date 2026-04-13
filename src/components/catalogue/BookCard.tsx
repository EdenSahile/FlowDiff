import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Book } from '@/data/mockBooks'
import { BookCover } from './BookCover'
import { TextBadge } from '@/components/ui/Badge'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/Toast'

/* ── Card ── */
const Card = styled.article`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`

const CoverArea = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 0;
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
  margin-bottom: 2px;
`

const UniverseDot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const UniverseLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const Title = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Isbn = styled.p`
  font-family: monospace;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: 0.02em;
`

const Authors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Publisher = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
`

/* ── Zone prix + quantité + bouton ── */
const ActionZone = styled.div`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Price = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const QtyRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  flex-shrink: 0;
`

const QtyBtn = styled.button`
  width: 28px; height: 28px;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .1s;

  &:hover   { background: ${({ theme }) => theme.colors.gray[100]}; }
  &:disabled{ opacity: .3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  min-width: 26px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const AjouterBtn = styled.button`
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: background .15s;
  white-space: nowrap;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

/* ── Couleurs univers ── */
const universeBadgeColor: Record<string, string> = {
  'Littérature':     '#1E3A5F',
  'BD/Mangas':       '#E65100',
  'Jeunesse':        '#1565C0',
  'Adulte-pratique': '#2E7D32',
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
        <BookCover isbn={book.isbn} alt={`Couverture de ${book.title}`} width={90} height={130} />
      </CoverArea>

      <Body>
        <TopRow>
          <UniverseDot $color={universeBadgeColor[book.universe] ?? '#999'} />
          <UniverseLabel>{book.universe}</UniverseLabel>
          {showType && book.type === 'nouveaute' && (
            <TextBadge variant="new" style={{ marginLeft: 'auto' }}>Nouveau</TextBadge>
          )}
        </TopRow>

        <Title>{book.title}</Title>
        <Isbn>{book.isbn}</Isbn>
        <Authors>{book.authors.join(', ')}</Authors>
        <Publisher>{book.publisher}{book.collection ? ` — ${book.collection}` : ''}</Publisher>

        <ActionZone>
          <PriceRow>
            <Price>{book.priceTTC.toFixed(2)} €</Price>
            {book.type === 'a-paraitre' && (
              <TextBadge variant="top" style={{ background: '#E65100', color: '#fff', fontSize: '10px' }}>
                À paraître
              </TextBadge>
            )}
          </PriceRow>

          {isOrderable && (
            <QtyRow>
              <QtyControl>
                <QtyBtn onClick={e => handleQty(e, -1)} disabled={qty <= 1} aria-label="Diminuer">−</QtyBtn>
                <QtyValue>{qty}</QtyValue>
                <QtyBtn onClick={e => handleQty(e, +1)} aria-label="Augmenter">+</QtyBtn>
              </QtyControl>
              <AjouterBtn onClick={handleAdd} title="Ajouter au panier" aria-label="Ajouter au panier">
                Ajouter
              </AjouterBtn>
            </QtyRow>
          )}
        </ActionZone>
      </Body>
    </Card>
  )
}
