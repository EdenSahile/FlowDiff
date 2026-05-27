import { memo, useState, useEffect } from 'react'
import styled from 'styled-components'
import type { Universe } from '@/data/mockBooks'

/* ══════════════════════════════════════════════
   Module-level cover cache (survit aux re-renders)
   string  = URL trouvée
   null    = aucune cover disponible
   absent  = pas encore cherché
   ══════════════════════════════════════════════ */
const coverCache = new Map<string, string | null>()
const pendingFetches = new Map<string, Promise<string | null>>()

async function fetchGoogleBooksCover(isbn: string): Promise<string | null> {
  if (coverCache.has(isbn)) return coverCache.get(isbn)!
  if (pendingFetches.has(isbn)) return pendingFetches.get(isbn)!

  const promise = (async (): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&fields=items(volumeInfo/imageLinks)&maxResults=1`
      )
      if (!res.ok) { coverCache.set(isbn, null); return null }
      const data = await res.json()
      const links = data?.items?.[0]?.volumeInfo?.imageLinks
      const raw: string | undefined =
        links?.large || links?.medium || links?.thumbnail || links?.smallThumbnail
      if (!raw) { coverCache.set(isbn, null); return null }
      // Améliore la qualité + force HTTPS + retire le curl décoratif
      const url = raw
        .replace('zoom=1', 'zoom=3')
        .replace('http://', 'https://')
        .replace('&edge=curl', '')
      coverCache.set(isbn, url)
      return url
    } catch {
      coverCache.set(isbn, null)
      return null
    } finally {
      pendingFetches.delete(isbn)
    }
  })()

  pendingFetches.set(isbn, promise)
  return promise
}

/* ── États de la machine de couverture ── */
type CoverState = 'openlibrary' | 'googlebooks' | 'failed'

/* ── Déco SVG par univers ── */
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

/* ── Styled components ── */
const Wrapper = styled.div<{ $w: number; $h: number; $fill?: boolean }>`
  width: ${({ $w, $fill }) => $fill ? '100%' : `${$w}px`};
  height: ${({ $h, $fill }) => $fill ? '100%' : `${$h}px`};
  border-radius: ${({ $fill, theme }) => $fill ? '0' : theme.radii.sm};
  overflow: hidden;
  box-shadow: ${({ $fill }) => $fill ? 'none' : '3px 4px 14px rgba(0,0,0,0.28)'};
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
  border-radius: ${({ theme }) => theme.radii.sm};
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

const CoverImg = styled.img<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.25s ease;
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
  fill?: boolean
}

function BookCoverBase({
  isbn,
  alt,
  width = 80,
  height = 120,
  universe = 'Littérature',
  authors = [],
  publisher = '',
  collection,
  fill = false,
}: Props) {
  const [coverState, setCoverState] = useState<CoverState>('openlibrary')
  const [imgLoaded, setImgLoaded] = useState(false)
  const [googleUrl, setGoogleUrl] = useState<string | null>(null)

  // Reset quand l'ISBN change
  useEffect(() => {
    setCoverState('openlibrary')
    setImgLoaded(false)
    setGoogleUrl(null)
  }, [isbn])

  // Fetch Google Books quand Open Library échoue
  useEffect(() => {
    if (coverState !== 'googlebooks') return
    let cancelled = false
    fetchGoogleBooksCover(isbn).then(url => {
      if (cancelled) return
      if (url) {
        setGoogleUrl(url)
      } else {
        setCoverState('failed')
      }
    })
    return () => { cancelled = true }
  }, [coverState, isbn])

  const titleFs  = Math.max(8,  Math.round(height * 0.10))
  const authorFs = Math.max(7,  Math.round(height * 0.08))
  const pad      = Math.max(4,  Math.round(width  * 0.07))
  const pubLabel = [publisher || null, collection || null].filter(Boolean).join(' · ')

  const fallbackBg     = '#232f3e'
  const fallbackAccent = '#C9A84C'

  // URL selon l'état actuel
  const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

  return (
    <Wrapper $w={width} $h={height} $fill={fill}>
      {/* Placeholder toujours en dessous */}
      <Bg $bg={fallbackBg} />
      <Spine $accent={fallbackAccent} />
      {pubLabel && !fill && <PubBadge>{pubLabel}</PubBadge>}
      <Deco universe={universe} accent={fallbackAccent} w={width} h={height} />
      {!fill && (
        <TitleArea $pad={pad}>
          <TitleText $fs={titleFs}>{alt}</TitleText>
          {authors[0] && <AuthorText $fs={authorFs}>{authors[0]}</AuthorText>}
        </TitleArea>
      )}

      {/* Open Library — tentative 1 */}
      {coverState === 'openlibrary' && (
        <CoverImg
          src={openLibraryUrl}
          alt={alt}
          loading="lazy"
          $visible={imgLoaded}
          onError={() => {
            setImgLoaded(false)
            setCoverState('googlebooks')
          }}
          onLoad={(e) => {
            const img = e.currentTarget
            // Open Library renvoie une image 1×1 si pas de couverture
            if (img.naturalWidth < 10 || img.naturalHeight < 10) {
              setCoverState('googlebooks')
            } else {
              setImgLoaded(true)
            }
          }}
        />
      )}

      {/* Google Books — tentative 2 */}
      {coverState === 'googlebooks' && googleUrl && (
        <CoverImg
          src={googleUrl}
          alt={alt}
          loading="lazy"
          $visible={imgLoaded}
          onError={() => {
            setImgLoaded(false)
            setCoverState('failed')
          }}
          onLoad={(e) => {
            const img = e.currentTarget
            if (img.naturalWidth < 10 || img.naturalHeight < 10) {
              setCoverState('failed')
            } else {
              setImgLoaded(true)
            }
          }}
        />
      )}
    </Wrapper>
  )
}

export const BookCover = memo(BookCoverBase, (prev, next) =>
  prev.isbn === next.isbn && prev.width === next.width && prev.height === next.height
)
