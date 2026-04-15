import styled from 'styled-components'

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 680px;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 6px;
`

const UpdateDate = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.xl};
`

const Article = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`

const ArticleTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`

const ArticleText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`

/* ── Component ── */
export function CGVPage() {
  return (
    <Page>
      <Title>Conditions Générales de Vente</Title>
      <UpdateDate>Dernière mise à jour : 1er janvier 2025</UpdateDate>

      <Card>
        <Article>
          <ArticleTitle>Article 1 — Objet</ArticleTitle>
          <ArticleText>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations
            commerciales entre BookFlow (ci-après "l'Éditeur") et les libraires
            professionnels (ci-après "le Client") utilisant l'application BookFlow.
          </ArticleText>
          <ArticleText>
            L'application BookFlow est réservée exclusivement aux professionnels de la
            librairie disposant d'un code client valide. Toute utilisation à des fins
            personnelles ou grand public est strictement interdite.
          </ArticleText>
        </Article>

        <Article>
          <ArticleTitle>Article 2 — Commandes</ArticleTitle>
          <ArticleText>
            Les commandes passées via l'application sont fermes et définitives dès
            confirmation par le Client. Elles sont transmises automatiquement au
            système de gestion (AS400/CRM) de l'Éditeur.
          </ArticleText>
          <ArticleText>
            Seuls les titres disponibles au catalogue (fonds et nouveautés du mois)
            sont commandables. Les titres "à paraître" ne peuvent être réservés
            qu'auprès du représentant commercial.
          </ArticleText>
        </Article>

        <Article>
          <ArticleTitle>Article 3 — Prix et remises</ArticleTitle>
          <ArticleText>
            Les prix affichés sont les prix publics conseillés hors taxes (HT).
            Les remises personnalisées accordées au Client s'appliquent automatiquement
            par univers (BD/Mangas, Jeunesse, Littérature, Adulte-pratique) selon les
            conditions négociées dans le contrat de référencement.
          </ArticleText>
          <ArticleText>
            La TVA applicable est de 5,5 % sur les livres. Le montant TTC est
            calculé sur la base du net HT après application des remises.
          </ArticleText>
        </Article>

        <Article>
          <ArticleTitle>Article 4 — Livraison</ArticleTitle>
          <ArticleText>
            Les délais de livraison habituels sont de 1 à 3 jours ouvrés à compter
            de la confirmation de commande, selon disponibilité en stock. Une date
            de livraison spécifique peut être demandée lors de la validation.
          </ArticleText>
          <ArticleText>
            Les livraisons sont effectuées à l'adresse indiquée dans le compte du
            Client. Toute modification d'adresse doit être signalée au service clients.
          </ArticleText>
        </Article>

        <Article>
          <ArticleTitle>Article 5 — Retours</ArticleTitle>
          <ArticleText>
            Les retours de livres sont soumis aux conditions générales de retour en
            vigueur dans la profession. Ils doivent être signalés dans un délai de
            30 jours à compter de la réception, en contactant votre représentant
            commercial ou le service clients via l'application.
          </ArticleText>
        </Article>

        <Article>
          <ArticleTitle>Article 6 — Protection des données</ArticleTitle>
          <ArticleText>
            Les données personnelles collectées (nom, email, code client, adresse)
            sont utilisées exclusivement dans le cadre de la relation commerciale.
            Conformément au RGPD, le Client dispose d'un droit d'accès, de
            rectification et de suppression de ses données en contactant le
            service clients.
          </ArticleText>
        </Article>

        <Article>
          <ArticleTitle>Article 7 — Droit applicable</ArticleTitle>
          <ArticleText>
            Les présentes CGV sont régies par le droit français. Tout litige
            relatif à leur interprétation ou exécution sera soumis aux tribunaux
            compétents du siège social de l'Éditeur.
          </ArticleText>
        </Article>
      </Card>
    </Page>
  )
}
