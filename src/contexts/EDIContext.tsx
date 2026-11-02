import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useOrders } from '@/contexts/OrdersContext'
import { MOCK_EDI_MESSAGES } from '@/data/mockEDIMessages'
import { MOCK_BOOKS } from '@/data/mockBooks'
import type { EDIMessage, EDIParams } from '@/lib/ediUtils'

export type { EDIMessage, EDIParams }

export type ConnectionStatus = 'connected' | 'incident' | 'disconnected'

interface EDIContextValue {
  messages: EDIMessage[]
  connectionStatus: ConnectionStatus
  lastSync: string
  params: EDIParams
  updateParams: (p: Partial<EDIParams>) => void
}

const EDIContext = createContext<EDIContextValue | null>(null)

// Incrémenter à chaque modification de MOCK_EDI_MESSAGES ou de la forme des
// payloads générés : v9 purge les ORDRSP/DESADV écrits sans `lines` par v8,
// v10 ceux que v9 avait redatés du jour au lieu de la date de la commande.
const MOCK_EDI_VERSION = 'v10'

function messagesKey(cc: string)  { return `bookflow_edi_${cc}` }
function paramsKey(cc: string)    { return `bookflow_edi_params_${cc}` }
function versionKey(cc: string)   { return `bookflow_edi_version_${cc}` }

const DEFAULT_PARAMS: EDIParams = {
  emailNotifications: true,
  relanceDelay: '24h',
}

function loadMessages(cc: string): EDIMessage[] {
  try {
    const storedVersion = localStorage.getItem(versionKey(cc))
    if (storedVersion !== MOCK_EDI_VERSION) {
      // Mocks mis à jour : on réinitialise localStorage
      localStorage.removeItem(messagesKey(cc))
      localStorage.setItem(versionKey(cc), MOCK_EDI_VERSION)
      return MOCK_EDI_MESSAGES
    }
    const raw = localStorage.getItem(messagesKey(cc))
    if (raw) {
      const parsed = JSON.parse(raw) as EDIMessage[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* ignore */ }
  return MOCK_EDI_MESSAGES
}

function loadParams(cc: string): EDIParams {
  try {
    const raw = localStorage.getItem(paramsKey(cc))
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EDIParams>
      return { ...DEFAULT_PARAMS, ...parsed }
    }
  } catch { /* ignore */ }
  return DEFAULT_PARAMS
}

// Au premier rendu, `AuthContext` n'a pas encore repondu : `user` est nul et le
// compte vaudrait `guest`. Les initialiseurs d'etat ne tournant qu'une fois, ils
// resteraient figes sur ce stockage-la. La `key` remonte le provider quand le
// compte reel arrive, ce qui les relance sur la bonne cle. Sans elle, les
// messages deja stockes sont ignores et chaque commande EDI est regeneree avec
// la date du jour a chaque chargement de page.
export function EDIProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const codeClient = user?.codeClient ?? 'guest'

  return (
    <EDIAccountProvider key={codeClient} codeClient={codeClient}>
      {children}
    </EDIAccountProvider>
  )
}

function EDIAccountProvider(
  { codeClient, children }: { codeClient: string; children: ReactNode }
) {
  const { orders } = useOrders()

  const [messages, setMessages] = useState<EDIMessage[]>(() => loadMessages(codeClient))
  const [params, setParams]     = useState<EDIParams>(() => loadParams(codeClient))
  const [lastSync]              = useState<string>(() => new Date().toISOString())

  useEffect(() => {
    localStorage.setItem(messagesKey(codeClient), JSON.stringify(messages))
  }, [messages, codeClient])

  useEffect(() => {
    localStorage.setItem(paramsKey(codeClient), JSON.stringify(params))
  }, [params, codeClient])

  useEffect(() => {
    const ediOrders = orders.filter(
      o => o.transmissionMode === 'EDI' && o.codeClient === codeClient
    )

    ediOrders.forEach(order => {
      const now = order.date === new Date().toISOString().slice(0, 10)
        ? new Date()
        : new Date(`${order.date}T09:00:00.000Z`)

      const ordersMsg: EDIMessage = {
        id: `edi-${order.id}-orders`,
        type: 'ORDERS',
        status: 'SENT',
        documentRef: order.numero,
        diffuseur: 'FlowDiff — distributeur fictif',
        detail: `${order.items.length} lignes / ${order.items.reduce((s, i) => s + i.quantity, 0)} ex.`,
        createdAt: now.toISOString(),
        orderId: order.id,
        payload: {
          orderId: order.numero,
          diffuseur: 'FlowDiff — distributeur fictif',
          lines: order.items.map((item, i) => {
            const book = MOCK_BOOKS.find(b => b.isbn === item.isbn)
            return {
              lineNumber: i + 1,
              ean: item.isbn,
              title: item.title,
              qtyRequested: item.quantity,
              referenceLigne: item.referenceLigne,
              authors: book?.authors,
              publisher: book?.publisher,
              publishYear: book?.publicationDate?.slice(0, 4),
            }
          }),
          referenceGlobale: order.referenceCommande,
          clientCode: codeClient,
        },
      }

      const ackRef    = `ACK-${order.numero.replace('CMD', '')}`
      const ackDate   = new Date(now.getTime() + 3000).toISOString()
      const ack: EDIMessage = {
          id: `edi-${order.id}-ordrsp`,
          type: 'ORDRSP',
          status: 'RECEIVED',
          documentRef: ackRef,
          diffuseur: 'FlowDiff — distributeur fictif',
          detail: 'Acceptée',
          createdAt: ackDate,
          orderId: order.id,
          payload: {
            orderId: order.numero,
            orderResponseId: ackRef,
            responseDate: ackDate,
            globalStatus: 'ACCEPTED',
            lines: order.items.map((item, i) => ({
              lineNumber: i + 1,
              ean: item.isbn,
              title: item.title,
              qtyRequested: item.quantity,
              qtyConfirmed: item.quantity,
              status: 'ACCEPTED',
            })),
          },
        }
      const desadvRef = `DESADV-${order.numero.replace('CMD', '')}`
      const desadv: EDIMessage = {
          id: `edi-${order.id}-desadv`,
          type: 'DESADV',
          status: 'RECEIVED',
          documentRef: desadvRef,
          diffuseur: 'FlowDiff — distributeur fictif',
          detail: `${order.items.reduce((s, i) => s + i.quantity, 0)} ex.`,
          createdAt: new Date(now.getTime() + 8000).toISOString(),
          orderId: order.id,
          payload: {
            desadvRef,
            orderId: order.numero,
            lines: order.items.map(item => ({
              isbn: item.isbn,
              qtyShipped: item.quantity,
            })),
          },
        }
      // Les trois documents sont instantanés par choix de démonstration. La
      // garde par identifiant rend l'opération idempotente après rechargement.
      setMessages(prev => {
        const ids = new Set(prev.map(message => message.id))
        const additions = [ordersMsg, ack, desadv].filter(message => !ids.has(message.id))
        return additions.length ? [...prev, ...additions] : prev
      })
    })
  }, [orders, codeClient])

  const updateParams = useCallback((p: Partial<EDIParams>) => {
    setParams(prev => ({ ...prev, ...p }))
  }, [])

  return (
    <EDIContext.Provider value={{
      messages,
      connectionStatus: 'disconnected',
      lastSync,
      params,
      updateParams,
    }}>
      {children}
    </EDIContext.Provider>
  )
}

export function useEDI(): EDIContextValue {
  const ctx = useContext(EDIContext)
  if (!ctx) throw new Error('useEDI doit être dans <EDIProvider>')
  return ctx
}
