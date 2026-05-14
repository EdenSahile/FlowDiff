import styled, { keyframes, css } from 'styled-components'

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px) translateX(-50%); }
  to   { opacity: 1; transform: translateY(0)     translateX(-50%); }
`

const slideUp = keyframes`
  from { opacity: 1; transform: translateY(0)     translateX(-50%); }
  to   { opacity: 0; transform: translateY(-20px) translateX(-50%); }
`

export type ToastType = 'success' | 'error'

export const ToastBox = styled.div<{ $leaving: boolean; $type: ToastType; $hasAction?: boolean }>`
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  background: ${({ $type, theme }) => $type === 'error' ? theme.colors.error : theme.colors.accent};
  color: ${({ $type }) => $type === 'error' ? '#fff' : '#3d2f00'};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  white-space: nowrap;
  pointer-events: ${({ $hasAction }) => $hasAction ? 'auto' : 'none'};
  max-width: 90vw;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0;

  animation: ${({ $leaving }) => css`${$leaving ? slideUp : slideDown} .25s ease forwards`};
`

export const ToastActionBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  padding: 0 0 0 12px;
  opacity: 0.9;
  white-space: nowrap;
  &:hover { opacity: 1; }
`
