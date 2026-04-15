import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
`

const Wrapper = styled.div<{ $width: number; $height: number }>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.navyLight};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`

const Skeleton = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.colors.navyLight};
  animation: ${pulse} 1.4s ease-in-out infinite;
`

const Img = styled.img<{ $visible: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
`

/* Couverture fictive */
const FictiveCover = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #1C3252 0%, #263F69 50%, #162840 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px 4px;
  gap: 4px;
`

const FictiveSpine = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(232, 150, 12, 0.7);
`

const FictiveTitle = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  flex: 1;
  display: flex;
  align-items: center;
`

const FictiveLabel = styled.div`
  font-size: 8px;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  font-style: italic;
  letter-spacing: 0.02em;
  flex-shrink: 0;
`

type State = 'loading' | 'ok' | 'error'

interface Props {
  isbn: string
  alt: string
  width?: number
  height?: number
}

export function BookCover({ isbn, alt, width = 80, height = 120 }: Props) {
  const [state, setState] = useState<State>('loading')

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setState(e.currentTarget.naturalWidth > 10 ? 'ok' : 'error')
  }

  const src = `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1`

  return (
    <Wrapper $width={width} $height={height}>
      {state === 'loading' && <Skeleton />}
      {state === 'error' && (
        <FictiveCover>
          <FictiveSpine />
          <FictiveTitle>{alt}</FictiveTitle>
          <FictiveLabel>couv. fictive</FictiveLabel>
        </FictiveCover>
      )}
      <Img
        src={src}
        alt={alt}
        $visible={state === 'ok'}
        onLoad={handleLoad}
        onError={() => setState('error')}
      />
    </Wrapper>
  )
}
