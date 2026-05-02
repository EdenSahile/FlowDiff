import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  getReturns,
  createReturn as serviceCreateReturn,
  getReturnsStats,
} from '@/services/returnsService'
import type { ReturnRequest, CreateReturnPayload, ReturnsStats } from '@/data/mockReturns'

interface ReturnsContextValue {
  returns: ReturnRequest[]
  loading: boolean
  stats: ReturnsStats | null
  addReturn: (payload: CreateReturnPayload) => Promise<ReturnRequest>
}

const ReturnsContext = createContext<ReturnsContextValue | null>(null)

const DEFAULT_STATS: ReturnsStats = {
  activeCount: 0,
  avoirYTD: 0,
  returnRatio: 0,
  sectorAverage: 0.22,
}

export function ReturnsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const codeClient = user?.codeClient ?? ''

  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ReturnsStats | null>(null)

  useEffect(() => {
    if (!codeClient) { setReturns([]); setLoading(false); return }
    setLoading(true)
    Promise.all([getReturns(codeClient), getReturnsStats(codeClient)]).then(([r, s]) => {
      setReturns(r)
      setStats(s)
      setLoading(false)
    })
  }, [codeClient])

  const addReturn = useCallback(async (payload: CreateReturnPayload): Promise<ReturnRequest> => {
    const optimistic: ReturnRequest = {
      id: `RET-OPT-${Date.now()}`,
      codeClient: payload.codeClient,
      orderId: payload.orderId,
      orderNumero: payload.orderNumero,
      status: 'pending',
      items: payload.items,
      notes: payload.notes,
      blNumber: null,
      blGeneratedAt: null,
      avoirAmount: null,
      avoirGeneratedAt: null,
      refusalReason: null,
      createdAt: new Date().toISOString(),
    }
    setReturns(prev => [optimistic, ...prev])
    setStats(prev => prev
      ? { ...prev, activeCount: prev.activeCount + 1 }
      : DEFAULT_STATS
    )

    try {
      const created = await serviceCreateReturn(payload)
      setReturns(prev => prev.map(r => r.id === optimistic.id ? created : r))
      return created
    } catch (err) {
      setReturns(prev => prev.filter(r => r.id !== optimistic.id))
      setStats(prev => prev ? { ...prev, activeCount: Math.max(0, prev.activeCount - 1) } : null)
      throw err
    }
  }, [])

  const value = useMemo(
    () => ({ returns, loading, stats, addReturn }),
    [returns, loading, stats, addReturn]
  )

  return (
    <ReturnsContext.Provider value={value}>
      {children}
    </ReturnsContext.Provider>
  )
}

export function useReturns(): ReturnsContextValue {
  const ctx = useContext(ReturnsContext)
  if (!ctx) throw new Error('useReturns doit être dans <ReturnsProvider>')
  return ctx
}
