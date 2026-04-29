import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { DatePicker } from '../ui/DatePicker'
import type { CompareMode, UsePeriodFilterReturn } from '../../hooks/usePeriodFilter'

/* ─────────────────────────────────────────
   Config des modes
───────────────────────────────────────── */

const MODES: { value: CompareMode; label: string; short: string }[] = [
  { value: 'none',     label: 'Pas de comparaison',   short: 'Comparer à…'        },
  { value: 'previous', label: 'Période précédente',   short: 'Période préc.'      },
  { value: 'year-ago', label: 'Même période N-1',     short: 'N-1'                },
  { value: 'custom',   label: 'Période personnalisée', short: 'Perso.'             },
]

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const _now = new Date()
const today = toLocalISO(_now)

/* ─────────────────────────────────────────
   Styled
───────────────────────────────────────── */

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 6px;
  }
`

const DropWrap = styled.div`
  position: relative;
`

const Trigger = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accentLight : theme.colors.white};
  border: 1px solid ${({ $active, theme }) =>
    $active ? theme.colors.accent : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.gray[800] : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.875rem;
  font-weight: ${({ $active, theme }) =>
    $active ? theme.typography.weights.medium : theme.typography.weights.normal};
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentLight};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 34px;
    padding: 0 10px;
    font-size: 0.8125rem;
  }
`

const CompareIcon = styled.svg`
  flex-shrink: 0;
  opacity: 0.7;
`

const ChevronIcon = styled.svg<{ $open: boolean }>`
  flex-shrink: 0;
  transition: transform 0.15s;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0)')};
`

const Menu = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 210px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 300;
`

const MenuItem = styled.li<{ $active?: boolean }>`
  padding: 9px 14px;
  font-size: 0.875rem;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray[800])};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  background: ${({ $active, theme }) => ($active ? theme.colors.primaryLight : 'transparent')};
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[50]};
  }
`

const Divider = styled.li`
  height: 1px;
  background: ${({ theme }) => theme.colors.gray[100]};
  margin: 4px 0;
  pointer-events: none;
`

const CustomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 4px;
  }
`

const RangeSep = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const CompareLabel = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
`

const CompareBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: ${({ theme }) => theme.colors.accentLight};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.gray[800]};
`

/* ─────────────────────────────────────────
   Composant principal
───────────────────────────────────────── */

export type ComparaisonToggleProps = Pick<
  UsePeriodFilterReturn,
  | 'compareMode'
  | 'setCompareMode'
  | 'comparePeriod'
  | 'customCompareStart'
  | 'setCustomCompareStart'
  | 'customCompareEnd'
  | 'setCustomCompareEnd'
>

export function ComparaisonToggle({
  compareMode,
  setCompareMode,
  comparePeriod,
  customCompareStart,
  setCustomCompareStart,
  customCompareEnd,
  setCustomCompareEnd,
}: ComparaisonToggleProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isActive  = compareMode !== 'none'
  const isCustom  = compareMode === 'custom'

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const currentMode = MODES.find(m => m.value === compareMode) ?? MODES[0]

  /* Résumé de la période de comparaison calculée */
  const compareSummary =
    !isCustom && isActive && comparePeriod
      ? `${fmtDate(toLocalISO(comparePeriod.start))} → ${fmtDate(toLocalISO(comparePeriod.end))}`
      : null

  return (
    <Wrap>
      <DropWrap ref={ref}>
        <Trigger
          type="button"
          $active={isActive}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <CompareIcon
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </CompareIcon>

          {isActive ? currentMode.short : 'Comparer à…'}

          <ChevronIcon
            $open={open}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </ChevronIcon>
        </Trigger>

        {open && (
          <Menu role="listbox">
            {MODES.map((mode, i) => (
              <>
                {i === 1 && <Divider key="div" />}
                <MenuItem
                  key={mode.value}
                  role="option"
                  aria-selected={compareMode === mode.value}
                  $active={compareMode === mode.value}
                  onClick={() => {
                    setCompareMode(mode.value)
                    setOpen(false)
                  }}
                >
                  {mode.label}
                </MenuItem>
              </>
            ))}
          </Menu>
        )}
      </DropWrap>

      {/* Période de comparaison calculée (presets auto) */}
      {compareSummary && (
        <CompareBadge>
          vs {compareSummary}
        </CompareBadge>
      )}

      {/* Date pickers pour le mode custom */}
      {isCustom && (
        <CustomRow>
          <CompareLabel>vs</CompareLabel>
          <DatePicker
            value={customCompareStart}
            onChange={setCustomCompareStart}
            max={customCompareEnd || today}
            placeholder="Début"
          />
          <RangeSep>→</RangeSep>
          <DatePicker
            value={customCompareEnd}
            onChange={setCustomCompareEnd}
            min={customCompareStart}
            max={today}
            placeholder="Fin"
          />
        </CustomRow>
      )}
    </Wrap>
  )
}
