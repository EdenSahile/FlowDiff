import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'

const colorMap: Record<string, string> = adminColors.statut

const Badge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $color }) => $color}22;
  color: ${({ $color }) => $color};
  text-transform: capitalize;
  white-space: nowrap;
`

const LABELS: Record<string, string> = {
  en_preparation: 'En préparation',
  expedie:        'Expédié',
  livre:          'Livré',
  annule:         'Annulé',
  actif:          'Actif',
  bloque:         'Bloqué',
  disponible:     'Disponible',
  stock_limite:   'Stock limité',
  sur_commande:   'Sur commande',
  en_reimp:       'En réimpression',
  epuise:         'Épuisé',
  rupture:        'Rupture',
}

export function StatutBadge({ statut }: { statut: string }) {
  const color = colorMap[statut] ?? '#95a5a6'
  return <Badge $color={color}>{LABELS[statut] ?? statut}</Badge>
}
