import { useRef, useEffect, useState, type FormEvent } from 'react'
import { useAidenia } from './useAidenia'
import { aideniaConfig } from '@/aidenia.config'
import {
  FAB, OnlineDot,
  ChatWindow, ChatHeader, HeaderInfo, HeaderName, HeaderSubtitle, CloseBtn,
  MessagesArea, MessageRow, Bubble, TypingDots,
  InputArea, ChatInput, SendBtn,
} from './AideniaChat.styles'

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AideniaAvatar({ size }: { size: number }) {
  return (
    <img
      src="/assets/aidenia-avatar.png"
      alt="Aidénia"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AideniaChat() {
  const { open, toggle, close, messages, loading, sendMessage } = useAidenia()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendMessage(text)
  }

  return (
    <>
      {/* Bulle flottante */}
      <FAB
        onClick={toggle}
        aria-label={open ? 'Fermer Aidénia' : 'Ouvrir Aidénia'}
        title={open ? 'Fermer' : 'Aidénia — Assistante FlowDiff'}
        style={{ position: 'fixed' }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AideniaAvatar size={52} />
          <OnlineDot />
        </div>
      </FAB>

      {/* Fenêtre de chat */}
      {open && (
        <ChatWindow role="dialog" aria-label="Aidénia — Assistante FlowDiff">
          <ChatHeader>
            <AideniaAvatar size={38} />
            <HeaderInfo>
              <HeaderName>Aidénia</HeaderName>
              <HeaderSubtitle>{aideniaConfig.subtitleLabel}</HeaderSubtitle>
            </HeaderInfo>
            <CloseBtn onClick={close} aria-label="Fermer">
              <IconClose />
            </CloseBtn>
          </ChatHeader>

          <MessagesArea>
            {messages.map((msg) => (
              <MessageRow key={msg.id} $role={msg.role}>
                {msg.role === 'assistant' && <AideniaAvatar size={26} />}
                <Bubble $role={msg.role}>{msg.text}</Bubble>
              </MessageRow>
            ))}

            {loading && (
              <MessageRow $role="assistant">
                <AideniaAvatar size={26} />
                <Bubble $role="assistant">
                  <TypingDots>
                    <span /><span /><span />
                  </TypingDots>
                </Bubble>
              </MessageRow>
            )}

            <div ref={bottomRef} />
          </MessagesArea>

          <InputArea onSubmit={handleSubmit}>
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question…"
              disabled={loading}
              autoComplete="off"
              aria-label="Votre message"
            />
            <SendBtn type="submit" disabled={!input.trim() || loading} aria-label="Envoyer">
              <IconSend />
            </SendBtn>
          </InputArea>
        </ChatWindow>
      )}
    </>
  )
}
