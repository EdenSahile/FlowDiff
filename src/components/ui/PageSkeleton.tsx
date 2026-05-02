import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0%   { opacity: 0.5; }
  50%  { opacity: 0.8; }
  100% { opacity: 0.5; }
`

const Wrap = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.7;
  }
`

const Logo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
`

export function PageSkeleton() {
  return <Wrap><Logo /></Wrap>
}
