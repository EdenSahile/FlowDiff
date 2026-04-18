import styled from 'styled-components'
import type { Universe } from '@/data/mockBooks'

/* ── deterministic hash ── */
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0 }
  return Math.abs(h)
}

/* ── palette: [bg, accent, text] par univers ── */
const PALETTES: Record<Universe, Array<[string, string, string]>> = {
  'Littérature': [
    ['#1a2744', '#c9a96e', '#f0e6d3'],
    ['#2c1810', '#d4956a', '#f5e8dc'],
    ['#1a3a2a', '#9ab87a', '#e8f0e0'],
    ['#2d1b3d', '#c89fc4', '#f0e0f0'],
    ['#3a2010', '#e8a84a', '#fff3d8'],
  ],
  'BD/Mangas': [
    ['#1e0a3c', '#e89b2e', '#fff3d8'],
    ['#0a0a2e', '#ff6b8a', '#ffe8ee'],
    ['#0a2040', '#5bc4f5', '#e0f4ff'],
    ['#2a0a1e', '#f07de8', '#fce0f8'],
    ['#1a2a00', '#a8e060', '#e8f8d0'],
  ],
  'Jeunesse': [
    ['#7a2800', '#ffd166', '#fff8e0'],
    ['#005a30', '#7ee8a2', '#e0f8eb'],
    ['#004a6a', '#7ed8f8', '#e0f5ff'],
    ['#5a1030', '#ffaac0', '#ffe8ee'],
    ['#4a3a00', '#f0c040', '#fff8d0'],
  ],
  'Adulte-pratique': [
    ['#062030', '#3ecfcf', '#d0f8f8'],
    ['#102808', '#78c840', '#e8f8d8'],
    ['#282808', '#e8c040', '#fff8d8'],
    ['#200840', '#9878f8', '#ece0ff'],
    ['#101828', '#60a8e8', '#d8eeff'],
  ],
}

/* ── decorative SVG by universe ── */
function Deco({ universe, accent, w, h }: { universe: Universe; accent: string; w: number; h: number }) {
  const mid = w / 2
  switch (universe) {
    case 'Littérature':
      return (
        <svg width={w} height={h * 0.38} viewBox={`0 0 ${w} ${h * 0.38}`} style={{ position: 'absolute', top: h * 0.12, left: 0 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1={w * 0.12} y1={h * 0.04 + i * h * 0.06} x2={w * 0.88} y2={h * 0.04 + i * h * 0.06}
              stroke={accent} strokeWidth={i === 2 ? 2 : 0.8} strokeOpacity={i === 2 ? 0.8 : 0.25} />
          ))}
          <circle cx={mid} cy={h * 0.19} r={h * 0.08} fill="none" stroke={accent} strokeWidth={1} strokeOpacity={0.5} />
        </svg>
      )
    case 'BD/Mangas':
      return (
        <svg width={w} height={h * 0.45} viewBox={`0 0 ${w} ${h * 0.45}`} style={{ position: 'absolute', top: h * 0.06, left: 0 }}>
          <polygon points={`0,${h*0.18} ${w},0 ${w},${h*0.27} 0,${h*0.45}`} fill={accent} fillOpacity={0.18} />
          <polygon points={`0,0 ${w*0.6},0 ${w*0.4},${h*0.45} 0,${h*0.45}`} fill={accent} fillOpacity={0.08} />
          {[0,1,2].map(i => (
            <line key={i} x1={w*0.1+i*w*0.28} y1={0} x2={w*0.05+i*w*0.28} y2={h*0.45}
              stroke={accent} strokeWidth={1.5} strokeOpacity={0.3} />
          ))}
        </svg>
      )
    case 'Jeunesse':
      return (
        <svg width={w} height={h * 0.42} viewBox={`0 0 ${w} ${h * 0.42}`} style={{ position: 'absolute', top: h * 0.08, left: 0 }}>
          <circle cx={mid} cy={h*0.21} r={h*0.14} fill={accent} fillOpacity={0.2} />
          <circle cx={mid} cy={h*0.21} r={h*0.10} fill={accent} fillOpacity={0.15} />
          <circle cx={mid} cy={h*0.21} r={h*0.05} fill={accent} fillOpacity={0.35} />
          {[0,1,2,3,4,5].map(i => {
            const angle = (i / 6) * Math.PI * 2
            const r = h * 0.18
            return <circle key={i} cx={mid + Math.cos(angle) * r} cy={h*0.21 + Math.sin(angle) * r}
              r={h*0.025} fill={accent} fillOpacity={0.5} />
          })}
        </svg>
      )
    case 'Adulte-pratique':
      return (
        <svg width={w} height={h * 0.38} viewBox={`0 0 ${w} ${h * 0.38}`} style={{ position: 'absolute', top: h * 0.1, left: 0 }}>
          {[0,1,2,3,4].map(col => [0,1,2,3,4,5].map(row => (
            <circle key={`${col}-${row}`}
              cx={w*0.15 + col * w*0.175} cy={h*0.05 + row * h*0.063}
              r={h*0.016} fill={accent} fillOpacity={0.3} />
          )))}
          <rect x={w*0.1} y={h*0.18} width={w*0.8} height={h*0.04} rx={2} fill={accent} fillOpacity={0.25} />
        </svg>
      )
    default:
      return null
  }
}

/* ── Styled wrappers ── */
const Wrapper = styled.div<{ $w: number; $h: number }>`
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 3px 4px 14px rgba(0,0,0,0.28);
  flex-shrink: 0;
  position: relative;
  font-family: 'Inter', -apple-system, sans-serif;
`

const Bg = styled.div<{ $bg: string }>`
  position: absolute;
  inset: 0;
  background: ${({ $bg }) => $bg};
`

const Spine = styled.div<{ $accent: string }>`
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: ${({ $accent }) => $accent};
  opacity: 0.7;
`

const PubBadge = styled.div`
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 9px;
  padding: 2px 7px;
  border-radius: 3px;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 18px);
  z-index: 1;
`

const TitleArea = styled.div<{ $pad: number }>`
  position: absolute;
  bottom: 0;
  left: 0; right: 0;
  padding: ${({ $pad }) => $pad}px ${({ $pad }) => $pad + 2}px;
  background: rgba(0,0,0,0.38);
`

const TitleText = styled.div<{ $fs: number }>`
  font-size: ${({ $fs }) => $fs}px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
`

const AuthorText = styled.div<{ $fs: number }>`
  font-size: ${({ $fs }) => $fs}px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

/* ── Props ── */
interface Props {
  isbn: string
  alt: string
  width?: number
  height?: number
  universe?: Universe
  authors?: string[]
  publisher?: string
  collection?: string
}

export function BookCover({
  isbn,
  alt,
  width = 80,
  height = 120,
  universe = 'Littérature',
  authors = [],
  publisher = '',
  collection,
}: Props) {
  const palette = PALETTES[universe]
  const idx = hash(isbn) % palette.length
  const [bg, accent] = palette[idx]

  /* échelles relatives à la hauteur */
  const titleFs  = Math.max(8,  Math.round(height * 0.10))
  const authorFs = Math.max(7,  Math.round(height * 0.08))
  const pad      = Math.max(4,  Math.round(width  * 0.07))

  const pubLabel = [publisher || null, collection || null].filter(Boolean).join(' · ')

  return (
    <Wrapper $w={width} $h={height}>
      <Bg $bg={bg} />
      <Spine $accent={accent} />

      {/* Publisher + collection badge */}
      {pubLabel && <PubBadge>{pubLabel}</PubBadge>}

      {/* Decorative graphic */}
      <Deco universe={universe} accent={accent} w={width} h={height} />

      {/* Title + Author */}
      <TitleArea $pad={pad}>
        <TitleText $fs={titleFs}>{alt}</TitleText>
        {authors[0] && (
          <AuthorText $fs={authorFs}>{authors[0]}</AuthorText>
        )}
      </TitleArea>
    </Wrapper>
  )
}
