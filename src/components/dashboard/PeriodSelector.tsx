import styled from 'styled-components'
import { DatePicker } from '../ui/DatePicker'
import type { PeriodPreset, UsePeriodFilterReturn } from '../../hooks/usePeriodFilter'

const TABS: { value: PeriodPreset; label: string }[] = [
  { value: 'last-7',   label: '7j'          },
  { value: 'last-30',  label: '30j'         },
  { value: '3-months', label: '3m'          },
  { value: 'last-12',  label: '12m'         },
  { value: 'custom',   label: 'Personnalisé' },
]

const today = new Date().toISOString().slice(0, 10)

const TabGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: white;
`

const TabBtn = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'transparent'};
  border: none;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  cursor: pointer;
  font-family: inherit;
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.gray[600]};
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;

  &:last-child { border-right: none; }
  &:hover:not([aria-pressed="true"]) {
    background: ${({ theme }) => theme.colors.gray[50]};
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`

const CustomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`

const RangeSep = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

export type PeriodSelectorProps = Pick<
  UsePeriodFilterReturn,
  | 'preset'
  | 'setPreset'
  | 'period'
  | 'customStart'
  | 'setCustomStart'
  | 'customEnd'
  | 'setCustomEnd'
>

export function PeriodSelector({
  preset,
  setPreset,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
}: PeriodSelectorProps) {
  const isCustom = preset === 'custom'

  return (
    <>
      <TabGroup>
        {TABS.map(tab => (
          <TabBtn
            key={tab.value}
            type="button"
            $active={preset === tab.value}
            aria-pressed={preset === tab.value}
            onClick={() => setPreset(tab.value)}
          >
            {tab.label}
          </TabBtn>
        ))}
      </TabGroup>
      {isCustom && (
        <CustomRow>
          <DatePicker
            value={customStart}
            onChange={setCustomStart}
            max={customEnd || today}
            placeholder="Début"
          />
          <RangeSep>→</RangeSep>
          <DatePicker
            value={customEnd}
            onChange={setCustomEnd}
            min={customStart}
            max={today}
            placeholder="Fin"
          />
        </CustomRow>
      )}
    </>
  )
}
