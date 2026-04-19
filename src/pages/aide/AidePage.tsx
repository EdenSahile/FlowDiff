import styled from 'styled-components'

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 600px;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 6px;
`

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Section = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.navyLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const SectionIcon = styled.div`
  font-size: 1.25rem;
`

const SectionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const Item = styled.div`
  padding: 14px ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`

const ItemTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 4px;
`

const ItemText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`

const Badge = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  margin-left: 8px;
  vertical-align: middle;
`

/* ── Component ── */
export function AidePage() {
  return (
    <Page>
      <Title>Aide</Title>
      <Subtitle>Découvrez comment utiliser FlowDiff au quotidien.</Subtitle>

      <Section>
        <SectionHeader>
          <SectionIcon>🔍</SectionIcon>
          <SectionTitle>Rechercher un livre</SectionTitle>
        </SectionHeader>
        <Item>
          <ItemTitle>Par titre, auteur ou éditeur</ItemTitle>
          <ItemText>
            Tapez votre recherche dans la barre en haut de l'accueil. Les résultats
            apparaissent en temps réel depuis le catalogue complet.
          </ItemText>
        </Item>
        <Item>
          <ItemTitle>Par ISBN / EAN <Badge>Rapide</Badge></ItemTitle>
          <ItemText>
            Saisissez directement le code ISBN (13 chiffres) dans la barre de recherche
            pour accéder instantanément à la fiche produit.
          </ItemText>
        </Item>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon>🛒</SectionIcon>
          <SectionTitle>Passer une commande</SectionTitle>
        </SectionHeader>
        <Item>
          <ItemTitle>Ajouter au panier</ItemTitle>
          <ItemText>
            Sur chaque fiche produit, choisissez la quantité puis appuyez sur
            "Ajouter au panier". Vous pouvez aussi ajouter directement depuis
            les listes et les Flash Infos.
          </ItemText>
        </Item>
        <Item>
          <ItemTitle>Valider la commande</ItemTitle>
          <ItemText>
            Accédez au panier (icône en haut à droite), vérifiez le récapitulatif
            avec vos remises personnalisées, choisissez une date de livraison
            et confirmez.
          </ItemText>
        </Item>
        <Item>
          <ItemTitle>Remises automatiques</ItemTitle>
          <ItemText>
            Vos remises sont appliquées automatiquement par univers (BD, Jeunesse…)
            selon votre contrat. Elles apparaissent dans le récapitulatif du panier.
          </ItemText>
        </Item>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon>📦</SectionIcon>
          <SectionTitle>Mon historique</SectionTitle>
        </SectionHeader>
        <Item>
          <ItemTitle>Retrouver une commande</ItemTitle>
          <ItemText>
            Accédez à l'historique via le menu (icône ☰) → "Mon historique".
            Toutes vos commandes passées y sont listées avec leur statut.
          </ItemText>
        </Item>
        <Item>
          <ItemTitle>Dupliquer en 1 clic</ItemTitle>
          <ItemText>
            Sur n'importe quelle commande, appuyez sur "Dupliquer" pour rajouter
            directement tous ses articles dans votre panier actuel.
          </ItemText>
        </Item>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon>💬</SectionIcon>
          <SectionTitle>Besoin d'aide supplémentaire ?</SectionTitle>
        </SectionHeader>
        <Item>
          <ItemTitle>Contacter le support</ItemTitle>
          <ItemText>
            Via le menu → "Contact", vous pouvez envoyer un message directement
            à votre représentant commercial ou au service clients.
          </ItemText>
        </Item>
      </Section>
    </Page>
  )
}
