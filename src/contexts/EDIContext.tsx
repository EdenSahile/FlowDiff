import {
  createContext, useContext, useState, useEffect, useRef, useCallback,
  type ReactNode,
} from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useOrders } from '@/contexts/OrdersContext'
import { MOCK_EDI_MESSAGES } from '@/data/mockEDIMessages'
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

const MOCK_EDI_VERSION = 'v5' // incrémenter à chaque modification de MOCK_EDI_MESSAGES

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
      // Mocks mis à jour — on réinitialise localStorage
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

export function EDIProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const { orders } = useOrders()
  const codeClient = user?.codeClient ?? 'guest'

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

      const now = new Date()

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
          orderId: order.id,
          numero: order.numero,
          lines: order.items.length,
          totalQty: order.items.reduce((s, i) => s + i.quantity, 0),
        },
      }

      setMessages(prev => [...prev, ordersMsg])

      setTimeout(() => {
        const ack: EDIMessage = {
          id: `edi-${order.id}-ordrsp`,
          type: 'ORDRSP',
          status: 'RECEIVED',
          documentRef: `ACK-${order.numero.replace('CMD-', '')}`,
          diffuseur: 'Interforum (Editis)',
          detail: 'Acceptée',
          createdAt: new Date(now.getTime() + 3000).toISOString(),
          orderId: order.id,
          payload: { ackRef: `ACK-${order.numero}`, decision: 'accepted' },
        }
        setMessages(prev => [...prev, ack])
      }, 3000)

      setTimeout(() => {
        const desadv: EDIMessage = {
          id: `edi-${order.id}-desadv`,
          type: 'DESADV',
          status: 'RECEIVED',
          documentRef: `DESADV-${order.numero.replace('CMD-', '')}`,
          diffuseur: 'Interforum (Editis)',
          detail: `${order.items.reduce((s, i) => s + i.quantity, 0)} ex.`,
          createdAt: new Date(now.getTime() + 8000).toISOString(),
          orderId: order.id,
          payload: { desadvRef: `DESADV-${order.numero}`, status: 'complete' },
        }
        setMessages(prev => [...prev, desadv])
      }, 8000)
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
