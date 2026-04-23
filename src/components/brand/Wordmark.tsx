import styled from 'styled-components'

type WordmarkSize = 'sm' | 'md' | 'lg'

interface WordmarkProps {
  onDark?: boolean
  size?: WordmarkSize
  showBaseline?: boolean
}

const sizes: Record<WordmarkSize, { font: string; letterSpacing: string; tagFont: string; tagPad: string; tagBorder: string; baselineFont: string }> = {
  lg: { font: '38px', letterSpacing: '-1.2px', tagFont: '11px', tagPad: '3px 7px', tagBorder: '1.5px', baselineFont: '12px' },
  md: { font: '26px', letterSpacing: '-0.8px', tagFont: '9px',  tagPad: '2px 5px', tagBorder: '1.5px', baselineFont: '10px' },
  sm: { font: '18px', letterSpacing: '-0.5px', tagFont: '7px',  tagPad: '2px 4px', tagBorder: '1px',   baselineFont: '8px'  },
}

const Wrap = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  user-select: none;
  flex-shrink: 0;
`

const Row = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

const Text = styled.span<{ $size: WordmarkSize; $onDark: boolean }>`
  font-size: ${({ $size }) => sizes[$size].font};
  font-weight: 800;
  letter-spacing: ${({ $size }) => sizes[$size].letterSpacing};
  line-height: 1;
  color: ${({ $onDark, theme }) => ($onDark ? '#FAFAF7' : theme.colors.navy)};
`

const Diff = styled.span`
  color: #E89B2E;
`

const ProTag = styled.span<{ $size: WordmarkSize }>`
  font-size: ${({ $size }) => sizes[$size].tagFont};
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #E89B2E;
  padding: ${({ $size }) => sizes[$size].tagPad};
  border: ${({ $size }) => sizes[$size].tagBorder} solid #E89B2E;
  border-radius: 3px;
  line-height: 1;
  flex-shrink: 0;
`

const Baseline = styled.span<{ $size: WordmarkSize; $onDark: boolean }>`
  font-size: ${({ $size }) => sizes[$size].baselineFont};
  font-weight: 500;
  letter-spacing: 0.3px;
  color: ${({ $onDark }) => ($onDark ? 'rgba(250,250,247,0.7)' : 'rgba(30,58,95,0.7)')};
`

export function Wordmark({ onDark = false, size = 'md', showBaseline = false }: WordmarkProps) {
  return (
    <Wrap>
      <Row>
        <Text $size={size} $onDark={onDark}>
          Flow<Diff>Diff</Diff>
        </Text>
        <ProTag $size={size}>PRO</ProTag>
      </Row>
      {showBaseline && (
        <Baseline $size={size} $onDark={onDark}>
          La diffusion au service des libraires.
        </Baseline>
      )}
    </Wrap>
  )
}
