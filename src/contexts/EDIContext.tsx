import {
  createContext, useContext, useState, useEffect, useRef, useCallback,
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
  preferEdiByDefault: true,
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

  const processedIds = useRef<Set<string>>(
    new Set(loadMessages(codeClient).filter(m => m.orderId).map(m => m.orderId!))
  )

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
      if (processedIds.current.has(order.id)) return
      processedIds.current.add(order.id)

      // Une commande du jour vient d'etre passee : l'heure courante est juste, et
      // les delais simulent Dilicom qui repond progressivement. Une commande plus
      // ancienne est rejouee, ses messages ayant ete purges par un changement de
      // MOCK_EDI_VERSION alors qu'elle-meme est restee : on la date depuis la
      // commande et sans delai, sinon elle reapparait avec la date du jour.
      const estDuJour    = order.date === new Date().toISOString().slice(0, 10)
      const now          = estDuJour ? new Date() : new Date(`${order.date}T09:00:00.000Z`)
      const delaiAck     = estDuJour ? 3000 : 0
      const delaiDesadv  = estDuJour ? 8000 : 0

      const ordersMsg: EDIMessage = {
        id: `edi-${order.id}-orders`,
        type: 'ORDERS',
        status: 'SENT',
        documentRef: order.numero,
        diffuseur: 'Interforum (Editis)',
        detail: `${order.items.length} lignes / ${order.items.reduce((s, i) => s + i.quantity, 0)} ex.`,
        createdAt: now.toISOString(),
        orderId: order.id,
        payload: {
          orderId: order.numero,
          diffuseur: 'Interforum (Editis)',
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

      setMessages(prev => [...prev, ordersMsg])

      setTimeout(() => {
        const ackRef    = `ACK-${order.numero.replace('CMD', '')}`
        const ackDate   = new Date(now.getTime() + 3000).toISOString()
        const ack: EDIMessage = {
          id: `edi-${order.id}-ordrsp`,
          type: 'ORDRSP',
          status: 'RECEIVED',
          documentRef: ackRef,
          diffuseur: 'Interforum (Editis)',
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
        setMessages(prev => [...prev, ack])
      }, delaiAck)

      setTimeout(() => {
        const desadvRef = `DESADV-${order.numero.replace('CMD', '')}`
        const desadv: EDIMessage = {
          id: `edi-${order.id}-desadv`,
          type: 'DESADV',
          status: 'RECEIVED',
          documentRef: desadvRef,
          diffuseur: 'Interforum (Editis)',
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
        setMessages(prev => [...prev, desadv])
      }, delaiDesadv)
    })
  }, [orders, codeClient])

  const updateParams = useCallback((p: Partial<EDIParams>) => {
    setParams(prev => ({ ...prev, ...p }))
  }, [])

  return (
    <EDIContext.Provider value={{
      messages,
      connectionStatus: 'connected',
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
