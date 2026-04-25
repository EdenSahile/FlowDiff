import { createContext, useContext, useState, useEffect } from 'react'
import type { Book } from '@/data/mockBooks'
import { useAuthContext } from '@/contexts/AuthContext'
import { storedRdvSchema } from '@/lib/storageSchemas'

/* ── Types ── */

export interface RdvItem {
  book: Book
  quantity: number
}

interface RdvContextValue {
  items: RdvItem[]
  rdvCount: number
  totalExemplaires: number
  addToRdv: (book: Book, qty: number) => void
  removeFromRdv: (bookId: string) => void
  updateQty: (bookId: string, qty: number) => void
  clearRdv: () => void
  isInRdv: (bookId: string) => boolean
  getQty: (bookId: string) => number
}

const RdvContext = createContext<RdvContextValue | null>(null)

function rdvKey(codeClient: string | undefined) {
  return `bookflow_rdv_${codeClient ?? 'guest'}`
}

function loadRdv(key: string): RdvItem[] {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return []
    const raw = JSON.parse(stored)
    const result = storedRdvSchema.safeParse(raw)
    if (!result.success) { localStorage.removeItem(key); return [] }
    return result.data as unknown as RdvItem[]
  } catch { return [] }
}

export function RdvProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const key = rdvKey(user?.codeClient)

  const [items, setItems] = useState<RdvItem[]>(() => loadRdv(rdvKey(user?.codeClient)))

  /* Re-charger la sélection RDV quand l'utilisateur change (connexion/déconnexion) */
  useEffect(() => {
    setItems(loadRdv(key))
  }, [key])

  /* Persistance localStorage — clé par utilisateur (skip si non connecté) */
  useEffect(() => {
    if (!user?.codeClient) return
    localStorage.setItem(key, JSON.stringify(items))
  }, [items, key, user?.codeClient])

  const addToRdv = (book: Book, qty: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.book.id === book.id)
      if (existing) {
        return prev.map(i =>
          i.book.id === book.id ? { ...i, quantity: i.quantity + qty } : i
        )
      }
      return [...prev, { book, quantity: qty }]
    })
  }

  const removeFromRdv = (bookId: string) =>
    setItems(prev => prev.filter(i => i.book.id !== bookId))

  const updateQty = (bookId: string, qty: number) => {
    if (qty < 1) { removeFromRdv(bookId); return }
    setItems(prev => prev.map(i => i.book.id === bookId ? { ...i, quantity: qty } : i))
  }

  const clearRdv = () => setItems([])

  const isInRdv = (bookId: string) => items.some(i => i.book.id === bookId)

  const getQty = (bookId: string) => items.find(i => i.book.id === bookId)?.quantity ?? 0

  const rdvCount = items.length
  const totalExemplaires = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <RdvContext.Provider value={{
      items,
      rdvCount,
      totalExemplaires,
      addToRdv,
      removeFromRdv,
      updateQty,
      clearRdv,
      isInRdv,
      getQty,
    }}>
      {children}
    </RdvContext.Provider>
  )
}

export function useRdv(): RdvContextValue {
  const ctx = useContext(RdvContext)
  if (!ctx) throw new Error('useRdv doit être utilisé dans <RdvProvider>')
  return ctx
}
