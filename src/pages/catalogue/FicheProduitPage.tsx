import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { getBookById } from '@/data/mockBooks'
import { BookCover } from '@/components/catalogue/BookCover'
import { Button } from '@/components/ui/Button'
import { TextBadge } from '@/components/ui/Badge'
import { useCart } from '@/contexts/CartContext'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  animation: ${fadeIn} 0.25s ease;
`

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  padding: 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover { text-decoration: underline; }
`

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
`

const CardBody = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`

const CoverCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-shrink: 0;
`

const ActionLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`

const LinkButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const TypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    text-align: center;
  }
`

const Authors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const MetaGrid = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`

const MetaLabel = styled.dt`
  color: ${({ theme }) => theme.colors.gray[400]};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  white-space: nowrap;
`

const MetaValue = styled.dd`
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const Description = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
`

const CardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.md};
`

const PriceTTC = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const PriceHT = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
`

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const QtyLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`

const QtyBtn = styled.button`
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.navy};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;

  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  min-width: 40px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const ParaitreNotice = styled.div`
  background: #FFF3E0;
  border: 1px solid #E65100;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: #E65100;
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-start;
`

const NotFoundBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`

export function FicheProduitPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const book = id ? getBookById(id) : undefined

  if (!book) {
    return (
      <Page>
        <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>
        <NotFoundBox>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📖</p>
          <p>Livre introuvable.</p>
        </NotFoundBox>
      </Page>
    )
  }

  const isOrderable = book.type !== 'a-paraitre'

  const handleAddToCart = () => {
    addToCart(book, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }
  const typeLabel = book.type === 'nouveaute' ? 'Nouveauté' : book.type === 'fonds' ? 'Fonds' : 'À paraître'
  const typeBadge = book.type === 'nouveaute' ? 'new' : 'top'

  const formattedDate = new Date(book.publicationDate).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <Page>
      <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>

      <Card>
        <CardBody>
          {/* ── Colonne gauche : couverture + actions secondaires ── */}
          <CoverCol>
            <BookCover
              isbn={book.isbn}
              alt={`Couverture de ${book.title}`}
              width={160}
              height={240}
            />
            <ActionLinks>
              <LinkButton aria-label="Voir les pages intérieures">
                🖼 Pages intérieures
              </LinkButton>
              <LinkButton aria-label="Voir la bande annonce">
                ▶️ Bande annonce
              </LinkButton>
              <LinkButton aria-label="Ajouter à ma liste">
                🤍 Ma liste
              </LinkButton>
            </ActionLinks>
          </CoverCol>

          {/* ── Colonne droite : infos ── */}
          <InfoCol>
            <TypeRow>
              <TextBadge variant={typeBadge}>{typeLabel}</TextBadge>
              <TextBadge variant="top" style={{ background: 'transparent', border: '1px solid #BDBDBD', color: '#757575' }}>
                {book.universe}
              </TextBadge>
            </TypeRow>

            <Title>{book.title}</Title>
            <Authors>{book.authors.join(', ')}</Authors>

            <MetaGrid>
              <MetaLabel>Éditeur</MetaLabel>
              <MetaValue>{book.publisher}</MetaValue>

              {book.collection && (
                <>
                  <MetaLabel>Collection</MetaLabel>
                  <MetaValue>{book.collection}</MetaValue>
                </>
              )}

              <MetaLabel>ISBN</MetaLabel>
              <MetaValue><code style={{ fontFamily: 'monospace' }}>{book.isbn}</code></MetaValue>

              <MetaLabel>Format</MetaLabel>
              <MetaValue>{book.format}</MetaValue>

              {book.pages && (
                <>
                  <MetaLabel>Pages</MetaLabel>
                  <MetaValue>{book.pages}</MetaValue>
                </>
              )}

              <MetaLabel>Parution</MetaLabel>
              <MetaValue>{formattedDate}</MetaValue>
            </MetaGrid>

            {book.description && (
              <Description>{book.description}</Description>
            )}
          </InfoCol>
        </CardBody>

        {/* ── Footer : prix + commande ── */}
        <CardFooter>
          <PriceRow>
            <PriceTTC>{book.priceTTC.toFixed(2)} €</PriceTTC>
            <PriceHT>Prix public TTC — Votre prix HT : {book.price.toFixed(2)} €</PriceHT>
          </PriceRow>

          {book.type === 'a-paraitre' ? (
            <ParaitreNotice>
              🚫 <span>Ce titre n'est pas encore commandable via l'application. Contactez votre représentant commercial pour le pré-commander.</span>
            </ParaitreNotice>
          ) : (
            <QuantityRow>
              <QtyLabel>Quantité :</QtyLabel>
              <QtyControl>
                <QtyBtn onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Diminuer">−</QtyBtn>
                <QtyValue>{qty}</QtyValue>
                <QtyBtn onClick={() => setQty(q => q + 1)} aria-label="Augmenter">+</QtyBtn>
              </QtyControl>
            </QuantityRow>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isOrderable}
            onClick={handleAddToCart}
            aria-label="Ajouter au panier"
          >
            {!isOrderable
              ? 'Commande indisponible'
              : added
              ? '✓ Ajouté au panier !'
              : `Ajouter ${qty > 1 ? `${qty} ex. ` : ''}au panier`}
          </Button>
        </CardFooter>
      </Card>
    </Page>
  )
}
