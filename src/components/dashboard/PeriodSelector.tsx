import styled from 'styled-components'
import type { PeriodPreset, UsePeriodFilterReturn, DateRange } from '../../hooks/usePeriodFilter'

const TABS: { value: PeriodPreset; label: string }[] = [
  { value: 'last-7',   label: '7 jours'   },
  { value: 'last-30',  label: '30 jours'  },
  { value: '3-months', label: '3 mois'    },
  { value: 'last-12',  label: '12 mois'   },
  { value: 'custom',   label: 'Personnalisé' },
]

function fmtDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function fmtDateFull(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function rangeLabel(period: DateRange): string {
  const sameYear = period.start.getFullYear() === period.end.getFullYear()
  const start = sameYear ? fmtDate(period.start) : fmtDateFull(period.start)
  const end = fmtDateFull(period.end)
  return `${start} — ${end}`
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

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

const RangeLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 2px;
`

const RangeText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const CompareSep = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[200]};
`

const CompareText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

export type PeriodSelectorProps = Pick<
  UsePeriodFilterReturn,
  | 'preset'
  | 'setPreset'
  | 'period'
> & {
  compareMode?: UsePeriodFilterReturn['compareMode']
  comparePeriod?: UsePeriodFilterReturn['comparePeriod']
}

export function PeriodSelector({
  preset,
  setPreset,
  period,
  compareMode,
  comparePeriod,
}: PeriodSelectorProps) {
  const isCustom = preset === 'custom'
  const isComparing = compareMode !== 'none' && compareMode !== undefined

  return (
    <Wrap>
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
      {!isCustom && (
        <RangeLabelRow>
          <RangeText>{rangeLabel(period)}</RangeText>
          {isComparing && comparePeriod && (
            <>
              <CompareSep>·</CompareSep>
              <CompareText>vs {rangeLabel(comparePeriod)}</CompareText>
            </>
          )}
        </RangeLabelRow>
      )}
    </Wrap>
  )
}
