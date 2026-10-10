import styled, { keyframes, css } from 'styled-components'
import { aideniaConfig } from '@/aidenia.config'

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

// ─── Bulle flottante ──────────────────────────────────────────────────────────

export const FAB = styled.button`
  position: fixed;
  bottom: ${({ theme }) => theme.layout.bottomNavHeight};
  right: 20px;
  z-index: 901;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
  transition: transform 150ms ease, box-shadow 200ms ease;

  &:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
  }

  &:active {
    transform: scale(0.96);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: ${({ theme }) => theme.layout.footerHeight};
    right: 28px;
    width: 56px;
    height: 56px;
  }
`

export const OnlineDot = styled.span`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid ${({ theme }) => theme.colors.white};
`

// ─── Fenêtre de chat ─────────────────────────────────────────────────────────

export const ChatWindow = styled.div`
  position: fixed;
  bottom: calc(${({ theme }) => theme.layout.bottomNavHeight} + 56px);
  right: 20px;
  z-index: 901;
  width: min(350px, calc(100vw - 32px));
  height: 500px;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: ${css`${slideUp}`} 220ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: calc(${({ theme }) => theme.layout.footerHeight} + 56px);
    right: 28px;
  }
`

// ─── Header ───────────────────────────────────────────────────────────────────

export const ChatHeader = styled.div`
  background: ${aideniaConfig.headerColor};
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`

export const HeaderInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
`

export const HeaderName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.2;
`

export const HeaderSubtitle = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.2;
`

export const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  opacity: 0.8;
  transition: opacity 150ms ease;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
`

// ─── Messages ─────────────────────────────────────────────────────────────────

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${({ theme }) => theme.colors.gray[50]};

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[200]};
    border-radius: 2px;
  }
`

export const MessageRow = styled.div<{ $role: 'assistant' | 'user' }>`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-direction: ${({ $role }) => ($role === 'user' ? 'row-reverse' : 'row')};
  animation: ${css`${fadeIn}`} 200ms ease both;
`

export const Bubble = styled.div<{ $role: 'assistant' | 'user' }>`
  max-width: 78%;
  padding: 9px 12px;
  border-radius: ${({ $role }) =>
    $role === 'assistant' ? '4px 14px 14px 14px' : '14px 4px 14px 14px'};
  background: ${({ theme, $role }) =>
    $role === 'assistant' ? theme.colors.white : '#232f3e'};
  color: ${({ theme, $role }) =>
    $role === 'assistant' ? theme.colors.gray[800] : theme.colors.white};
  font-size: 0.85rem;
  line-height: 1.5;
  border: ${({ theme, $role }) =>
    $role === 'assistant' ? `1px solid ${theme.colors.gray[200]}` : 'none'};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  white-space: pre-wrap;
  word-break: break-word;
`

export const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px 14px;

  span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gray[400]};
    animation: ${css`${spin}`} 1s ease infinite;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
`

// ─── Input ────────────────────────────────────────────────────────────────────

export const InputArea = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  flex-shrink: 0;
`

export const ChatInput = styled.input`
  flex: 1;
  padding: 9px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 20px;
  font-size: 0.85rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.gray[800]};
  background: ${({ theme }) => theme.colors.gray[50]};
  outline: none;
  transition: border-color 150ms ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }

  &:focus {
    border-color: ${aideniaConfig.headerColor};
    background: ${({ theme }) => theme.colors.white};
  }
`

export const SendBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${aideniaConfig.headerColor};
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 150ms ease, transform 150ms ease;

  &:hover:not(:disabled) {
    opacity: 0.88;
    transform: scale(1.06);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`
