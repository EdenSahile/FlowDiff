import { useState, useRef } from 'react'
import styled from 'styled-components'

interface TooltipInfoProps {
  text: string
  onDark?: boolean
}

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  vertical-align: middle;
`

const IconBtn = styled.button<{ $onDark: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1.5px solid ${({ $onDark }) => $onDark ? 'rgba(255,255,255,0.35)' : 'rgba(106,106,102,0.5)'};
  background: none;
  font-size: 9px;
  font-weight: 700;
  color: ${({ $onDark }) => $onDark ? 'rgba(255,255,255,0.45)' : 'rgba(106,106,102,0.7)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  font-family: inherit;
  transition: border-color 0.15s, color 0.15s;

  &:hover, &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentDark};
    outline: none;
  }
`

const Popup = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  background: ${({ theme }) => theme.colors.navy};
  color: rgba(255,255,255,0.88);
  font-size: 11px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  line-height: 1.55;
  padding: 9px 11px;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  pointer-events: none;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transition: opacity 0.15s ease;
  z-index: 9999;
  text-align: left;
  font-weight: 400;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.navy};
  }
`

export function TooltipInfo({ text, onDark = false }: TooltipInfoProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(true)
  }

  function hide() {
    timeoutRef.current = setTimeout(() => setVisible(false), 100)
  }

  function toggle() {
    setVisible(v => !v)
  }

  return (
    <Wrapper
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <IconBtn
        $onDark={onDark}
        onClick={toggle}
        aria-label="Plus d'informations"
        role="button"
        tabIndex={0}
        onFocus={show}
        onBlur={hide}
      >
        ?
      </IconBtn>
      <Popup $visible={visible} role="tooltip" aria-hidden={!visible}>
        {text}
      </Popup>
    </Wrapper>
  )
}
