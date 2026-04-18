import styled from 'styled-components'
import type { Universe } from '@/data/mockBooks'
import { UNIVERSES } from '@/data/mockBooks'

const UNIVERSE_ICONS: Record<Universe, string> = {
  'BD/Mangas':       '📚',
  'Jeunesse':        '⭐',
  'Littérature':     '📖',
  'Adulte-pratique': '💡',
}

const UNIVERSE_ACTIVE_COLORS: Record<Universe, string> = {
  'BD/Mangas':       '#C04A00',
  'Jeunesse':        '#1565C0',
  'Littérature':     '#1C3252',
  'Adulte-pratique': '#1E7045',
}

const Bar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`

const Pill = styled.button<{ $active: boolean; $universeColor?: string }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 15px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 2px solid ${({ $active, $universeColor, theme }) =>
    $active && $universeColor ? $universeColor :
    $active ? theme.colors.navy :
    theme.colors.gray[200]};
  background: ${({ $active, $universeColor, theme }) =>
    $active && $universeColor ? $universeColor :
    $active ? theme.colors.navy :
    theme.colors.white};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme, $active }) => $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.12s;
  white-space: nowrap;

  &:hover {
    border-color: ${({ $universeColor, theme }) => $universeColor ?? theme.colors.navy};
    color: ${({ $active, $universeColor, theme }) =>
      $active ? theme.colors.white : ($universeColor ?? theme.colors.navy)};
    transform: translateY(-1px);
  }

  &:active { transform: translateY(0); }
`

const PillIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`

interface Props {
  value: Universe | null
  onChange: (v: Universe | null) => void
  showAll?: boolean
}

export function UniverseFilter({ value, onChange, showAll = true }: Props) {
  return (
    <Bar role="group" aria-label="Filtrer par univers">
      {showAll && (
        <Pill $active={value === null} onClick={() => onChange(null)}>
          Tous
        </Pill>
      )}
      {UNIVERSES.map(u => (
        <Pill
          key={u}
          $active={value === u}
          $universeColor={UNIVERSE_ACTIVE_COLORS[u]}
          onClick={() => onChange(u === value ? null : u)}
        >
          <PillIcon>{UNIVERSE_ICONS[u]}</PillIcon>
          {u}
        </Pill>
      ))}
    </Bar>
  )
}
