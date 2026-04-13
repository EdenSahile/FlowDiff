import { createContext, useContext, useState, useEffect } from 'react'
import type { Book, Universe } from '@/data/mockBooks'

/* ── Remises mock par univers (en attendant AS400/CRM) ── */
export const REMISE_RATES: Record<Universe, number> = {
  'BD/Mangas':       0.30,
  'Jeunesse':        0.28,
  'Littérature':     0.25,
  'Adulte-pratique': 0.20,
}

/* ── Types ── */
export interface CartItem {
  book: Book
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  addToCart: (book: Book, qty?: number) => void
  updateQty: (bookId: string, qty: number) => void
  removeFromCart: (bookId: string) => void
  clearCart: () => void
  /* Totaux calculés */
  subtotalHT: number
  remiseAmount: number
  netHT: number
  tva: number
  totalTTC: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'bookflow_cart'

function computeTotals(items: CartItem[]) {
  const subtotalHT = items.reduce(
    (sum, { book, quantity }) => sum + book.price * quantity,
    0
  )
  const remiseAmount = items.reduce(
    (sum, { book, quantity }) =>
      sum + book.price * quantity * REMISE_RATES[book.universe],
    0
  )
  const netHT    = subtotalHT - remiseAmount
  const tva      = netHT * 0.055
  const totalTTC = netHT + tva
  return { subtotalHT, remiseAmount, netHT, tva, totalTTC }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as CartItem[]) : []
    } catch {
      return []
    }
  })

  /* Persistance localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (book: Book, qty = 1) => {
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

  const updateQty = (bookId: string, qty: number) => {
    if (qty < 1) { removeFromCart(bookId); return }
    setItems(prev =>
      prev.map(i => i.book.id === bookId ? { ...i, quantity: qty } : i)
    )
  }

  const removeFromCart = (bookId: string) =>
    setItems(prev => prev.filter(i => i.book.id !== bookId))

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      ...computeTotals(items),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
