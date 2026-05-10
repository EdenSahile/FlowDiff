import styled from 'styled-components'
import type { UsePeriodFilterReturn } from '../../hooks/usePeriodFilter'

const ToggleBtn = styled.button<{ $on: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  white-space: nowrap;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ $on, theme }) => $on ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $on, theme }) => $on ? theme.colors.navy : 'white'};
  color: ${({ $on, theme }) => $on ? '#fff' : theme.colors.gray[600]};
  transition: background 0.12s, color 0.12s, border-color 0.12s;

  &:hover:not([aria-pressed="true"]) {
    background: ${({ theme }) => theme.colors.gray[50]};
    color: ${({ theme }) => theme.colors.gray[800]};
    border-color: ${({ theme }) => theme.colors.gray[200]};
  }
`

const Dot = styled.span<{ $on: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $on }) => $on ? 'rgba(255,255,255,0.7)' : 'currentColor'};
  opacity: ${({ $on }) => $on ? 1 : 0.4};
  flex-shrink: 0;
`

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
}: ComparaisonToggleProps) {
  const isOn = compareMode !== 'none'

  return (
    <ToggleBtn
      type="button"
      $on={isOn}
      role="switch"
      aria-checked={isOn}
      aria-pressed={isOn}
      aria-label="Comparer à l'année N-1"
      onClick={() => setCompareMode(isOn ? 'none' : 'year-ago')}
    >
      <Dot $on={isOn} />
      vs N-1
    </ToggleBtn>
  )
}
