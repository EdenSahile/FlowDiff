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

const Placeholder = styled.div`
  font-size: 1.5rem;
  opacity: 0.35;
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

  /* Google Books renvoie une image 1×1 quand la couverture est absente (pas de 404).
     On détecte ce cas en vérifiant naturalWidth après le chargement. */
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setState(e.currentTarget.naturalWidth > 10 ? 'ok' : 'error')
  }

  const src = `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1`

  return (
    <Wrapper $width={width} $height={height}>
      {state === 'loading' && <Skeleton />}
      {state === 'error'   && <Placeholder>📖</Placeholder>}
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
