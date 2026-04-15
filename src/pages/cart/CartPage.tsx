import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useCart, REMISE_RATES } from '@/contexts/CartContext'
import { useOrders } from '@/contexts/OrdersContext'
import { useAuth } from '@/hooks/useAuth'
import { BookCover } from '@/components/catalogue/BookCover'
import { Button } from '@/components/ui/Button'

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 720px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
`

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ClientCode = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ClientCodeBold = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

/* ── Résumé financier ── */
const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.white};
`

const SummaryTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  opacity: .75;
  text-transform: uppercase;
  letter-spacing: .05em;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
`

const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ $total, theme }) => $total ? theme.typography.sizes.xl : theme.typography.sizes.sm};
  font-weight: ${({ $total, theme }) => $total ? theme.typography.weights.bold : theme.typography.weights.normal};
  border-top: ${({ $total }) => $total ? '1px solid rgba(255,255,255,.2)' : 'none'};
  margin-top: ${({ $total, theme }) => $total ? theme.spacing.sm : '0'};
  padding-top: ${({ $total, theme }) => $total ? theme.spacing.sm : '5px'};
`

const SummaryLabel = styled.span`opacity: .8;`
const SummaryValue = styled.span``

const RemiseBadge = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.navy};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 6px;
  margin-left: ${({ theme }) => theme.spacing.xs};
`

/* ── Articles ── */
const Section = styled.section`margin-bottom: ${({ theme }) => theme.spacing.xl};`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ItemCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ItemTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ItemAuthor = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ItemFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const ItemPrice = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const ItemRemise = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: #2E7D32;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
`

const QtyBtn = styled.button`
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.navy};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .1s;
  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
  &:disabled { opacity: .35; cursor: not-allowed; }
`

const QtyValue = styled.span`
  min-width: 32px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 1.1rem;
  padding: 4px;
  transition: color .15s;
  &:hover { color: ${({ theme }) => theme.colors.error}; }
`

/* ── Livraison ── */
const DeliveryCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
`

const DateInput = styled.input`
  margin-left: ${({ theme }) => theme.spacing.xl};
  padding: 6px 10px;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.navy}; }
`

/* ── Confirmation ── */
const ConfirmBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ConfirmTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ConfirmRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 4px 0;
`

/* ── Panier vide ── */
const Empty = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const EmptyIcon = styled.p`font-size: 3rem; margin-bottom: ${({ theme }) => theme.spacing.md};`
const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`
const EmptySubtext = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
`

/* ── Succès ── */
const SuccessBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  animation: ${fadeIn} .3s ease;
`

/* ── Component ── */
type Step = 'cart' | 'confirm' | 'success'
type DeliveryMode = 'standard' | 'specific'

const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €'
const today = new Date().toISOString().split('T')[0]

export function CartPage() {
  const { items, totalItems, subtotalHT, remiseAmount, netHT, tva, totalTTC,
          updateQty, removeFromCart, clearCart } = useCart()
  const { addOrder } = useOrders()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]             = useState<Step>('cart')
  const [delivery, setDelivery]     = useState<DeliveryMode>('standard')
  const [specificDate, setSpecific] = useState('')

  const remisePct = subtotalHT > 0 ? (remiseAmount / subtotalHT) * 100 : 0

  const deliveryLabel = delivery === 'standard'
    ? 'Délai habituel (1–3 jours ouvrés)'
    : specificDate || 'Date à préciser'

  /* ─────────── SUCCÈS ─────────── */
  if (step === 'success') {
    return (
      <Page>
        <SuccessBox>
          <EmptyIcon>✅</EmptyIcon>
          <EmptyText>Commande confirmée !</EmptyText>
          <EmptySubtext style={{ marginBottom: '24px' }}>
            Votre commande a bien été transmise. Un récapitulatif vous sera envoyé par email.
          </EmptySubtext>
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </SuccessBox>
      </Page>
    )
  }

  /* ─────────── PANIER VIDE ─────────── */
  if (items.length === 0) {
    return (
      <Page>
        <PageTitle>Panier</PageTitle>
        <Empty>
          <EmptyIcon>🛒</EmptyIcon>
          <EmptyText>Votre panier est vide</EmptyText>
          <EmptySubtext style={{ marginBottom: '24px' }}>
            Parcourez le catalogue pour ajouter des titres.
          </EmptySubtext>
          <Button variant="primary" size="lg" onClick={() => navigate('/fonds')}>
            Voir le catalogue
          </Button>
        </Empty>
      </Page>
    )
  }

  /* ─────────── CONFIRMATION ─────────── */
  if (step === 'confirm') {
    return (
      <Page>
        <PageTitle>Récapitulatif</PageTitle>
        <ClientCode>
          Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold>
        </ClientCode>

        <ConfirmBox>
          <ConfirmTitle>Détail de la commande</ConfirmTitle>
          {items.map(({ book, quantity }) => (
            <ConfirmRow key={book.id}>
              <span>{book.title} × {quantity}</span>
              <span>{fmt(book.price * quantity)}</span>
            </ConfirmRow>
          ))}
          <div style={{ borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '12px' }}>
            <ConfirmRow>
              <span>Livraison</span>
              <span>{deliveryLabel}</span>
            </ConfirmRow>
            <ConfirmRow>
              <span>Montant HT</span>
              <span>{fmt(subtotalHT)}</span>
            </ConfirmRow>
            <ConfirmRow>
              <span>Remise ({remisePct.toFixed(1)}%)</span>
              <span>− {fmt(remiseAmount)}</span>
            </ConfirmRow>
            <ConfirmRow>
              <span>Net HT</span>
              <span>{fmt(netHT)}</span>
            </ConfirmRow>
            <ConfirmRow>
              <span>TVA 5,5%</span>
              <span>{fmt(tva)}</span>
            </ConfirmRow>
            <ConfirmRow style={{ fontWeight: 700, fontSize: '1rem', color: '#1E3A5F', paddingTop: '8px' }}>
              <span>Total TTC</span>
              <span>{fmt(totalTTC)}</span>
            </ConfirmRow>
          </div>
        </ConfirmBox>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => {
            addOrder({
              codeClient: user?.codeClient ?? '',
              adresseLivraison: user?.adresseLivraison ?? '',
              items,
              subtotalHT,
              remiseAmount,
              netHT,
              tva,
              totalTTC,
              deliveryMode: delivery,
              deliveryDate: delivery === 'specific' ? specificDate : undefined,
            })
            clearCart()
            setStep('success')
          }}>
            Confirmer la commande
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => setStep('cart')}>
            ← Modifier le panier
          </Button>
        </div>
      </Page>
    )
  }

  /* ─────────── PANIER PRINCIPAL ─────────── */
  return (
    <Page>
      <PageTitle>Panier</PageTitle>
      <ClientCode>
        Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold>
        {' · '}{totalItems} article{totalItems > 1 ? 's' : ''}
      </ClientCode>

      {/* ── Résumé financier ── */}
      <SummaryCard>
        <SummaryTitle>Récapitulatif</SummaryTitle>
        <SummaryRow>
          <SummaryLabel>Montant HT</SummaryLabel>
          <SummaryValue>{fmt(subtotalHT)}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>
            Remise
            <RemiseBadge>−{remisePct.toFixed(1)}%</RemiseBadge>
          </SummaryLabel>
          <SummaryValue>− {fmt(remiseAmount)}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Net HT</SummaryLabel>
          <SummaryValue>{fmt(netHT)}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>TVA 5,5%</SummaryLabel>
          <SummaryValue>{fmt(tva)}</SummaryValue>
        </SummaryRow>
        <SummaryRow $total>
          <SummaryLabel>Total TTC</SummaryLabel>
          <SummaryValue>{fmt(totalTTC)}</SummaryValue>
        </SummaryRow>
      </SummaryCard>

      {/* ── Articles ── */}
      <Section>
        <SectionTitle>{totalItems} article{totalItems > 1 ? 's' : ''}</SectionTitle>
        {items.map(({ book, quantity }) => {
          const remise = REMISE_RATES[book.universe]
          const ligneHT = book.price * quantity
          return (
            <ItemCard key={book.id}>
              <BookCover isbn={book.isbn} alt={book.title} width={56} height={80} />
              <ItemInfo>
                <ItemTitle>{book.title}</ItemTitle>
                <ItemAuthor>{book.authors.join(', ')} — {book.publisher}</ItemAuthor>
                <ItemFooter>
                  <div>
                    <ItemPrice>{fmt(ligneHT)}</ItemPrice>
                    <ItemRemise> (−{(remise * 100).toFixed(0)}% → {fmt(ligneHT * (1 - remise))})</ItemRemise>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QtyControl>
                      <QtyBtn onClick={() => updateQty(book.id, quantity - 1)} disabled={quantity <= 1} aria-label="Diminuer">−</QtyBtn>
                      <QtyValue>{quantity}</QtyValue>
                      <QtyBtn onClick={() => updateQty(book.id, quantity + 1)} aria-label="Augmenter">+</QtyBtn>
                    </QtyControl>
                    <DeleteBtn onClick={() => removeFromCart(book.id)} aria-label="Supprimer">🗑</DeleteBtn>
                  </div>
                </ItemFooter>
              </ItemInfo>
            </ItemCard>
          )
        })}
      </Section>

      {/* ── Livraison ── */}
      <Section>
        <DeliveryCard>
          <SectionTitle style={{ marginBottom: '16px' }}>Date de livraison</SectionTitle>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio" name="delivery" value="standard"
                checked={delivery === 'standard'}
                onChange={() => setDelivery('standard')}
              />
              Délai habituel (1–3 jours ouvrés)
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio" name="delivery" value="specific"
                checked={delivery === 'specific'}
                onChange={() => setDelivery('specific')}
              />
              Date spécifique
            </RadioLabel>
            {delivery === 'specific' && (
              <DateInput
                type="date"
                min={today}
                value={specificDate}
                onChange={e => setSpecific(e.target.value)}
              />
            )}
          </RadioGroup>
        </DeliveryCard>
      </Section>

      {/* ── Action ── */}
      <Button
        variant="primary" size="lg" fullWidth
        onClick={() => setStep('confirm')}
        disabled={delivery === 'specific' && !specificDate}
      >
        Valider ma commande
      </Button>
    </Page>
  )
}
