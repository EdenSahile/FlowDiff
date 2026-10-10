import { useState, useCallback } from 'react'
import { aideniaConfig } from '@/aidenia.config'

export type MessageRole = 'assistant' | 'user'

export interface ChatMessage {
  id: string
  role: MessageRole
  text: string
}

function getMockToken(): string | null {
  return localStorage.getItem('bookflow_token')
}

export function useAidenia() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: aideniaConfig.welcomeMessage },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const token = getMockToken()
      const res = await fetch('/api/aidenia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      })

      const data = await res.json().catch(() => ({}))
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res.ok
          ? (data.reply ?? 'Désolée, je n\'ai pas pu traiter votre demande.')
          : (data.error ?? 'Une erreur est survenue. Réessayez dans un instant.'),
      }
      setMessages((prev) => [...prev, reply])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: 'Connexion impossible. Vérifiez votre réseau.' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])

  return { open, toggle, close, messages, loading, sendMessage }
}
