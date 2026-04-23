import { type JSX } from 'react'
import { theme } from '@/lib/theme'
import styled from 'styled-components'
import type { Universe } from '@/data/mockBooks'
import { UNIVERSES } from '@/data/mockBooks'

/* ── Icônes SVG par univers ── */
function IconBD() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="18" rx="1"/>
      <rect x="9.5" y="5" width="7" height="16" rx="1"/>
      <path d="M17.5 7l3.5-1v13l-3.5 1"/>
    </svg>
  )
}

function IconJeunesse() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconLitterature() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

function IconPratique() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6H8.3C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/>
    </svg>
  )
}

const UNIVERSE_ICONS: Record<Universe, JSX.Element> = {
  'BD/Mangas':       <IconBD />,
  'Jeunesse':        <IconJeunesse />,
  'Littérature':     <IconLitterature />,
  'Adulte-pratique': <IconPratique />,
}

/* Couleurs alignées palette Forêt & Lin — toutes accessibles blanc/4.5:1+ */
const UNIVERSE_ACTIVE_COLORS: Record<Universe, string> = {
  'BD/Mangas':       '#8B6914',   // or foncé
  'Jeunesse':        '#2D6A52',   // vert profond
  'Littérature':     theme.colors.success,   // vert forêt (primary)
  'Adulte-pratique': '#6B5440',   // brun foncé
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
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
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
