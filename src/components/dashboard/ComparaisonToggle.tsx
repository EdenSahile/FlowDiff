import styled from 'styled-components'
import type { UsePeriodFilterReturn } from '../../hooks/usePeriodFilter'

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: white;
  padding: 5px 10px;
  height: 32px;
`

const Label = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
`

const Switch = styled.button<{ $on: boolean }>`
  width: 28px;
  height: 16px;
  background: ${({ $on, theme }) => $on ? theme.colors.navy : theme.colors.gray[200]};
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  border: none;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.15s;

  &::after {
    content: '';
    position: absolute;
    left: ${({ $on }) => $on ? '14px' : '2px'};
    top: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    transition: left 0.15s;
  }
`

const ModeLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
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
    <Wrap>
      <Label>Comparer à</Label>
      <Switch
        type="button"
        $on={isOn}
        role="switch"
        aria-checked={isOn}
        aria-label="Activer la comparaison avec le mois précédent"
        onClick={() => setCompareMode(isOn ? 'none' : 'previous')}
      />
      <ModeLabel>Mois préc.</ModeLabel>
    </Wrap>
  )
}
