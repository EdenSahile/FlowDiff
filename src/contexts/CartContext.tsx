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
export interface EbookCartOption {
  hebergeur: string
  format: string
  price: number
  isbnEbook: string
}

export interface CartItem {
  book: Book
  quantity: number
  ebookOption?: EbookCartOption
}

export interface OPCartGroup {
  id: string
  serieId: string
  serieName: string
  opTitle: string
  opDescription: string
  validUntil?: string
  books: Array<{ book: Book; quantity: number }>
  cadeau: {
    label: string
    emoji: string
    isbn: string
    quantity: number
  }
  plv: {
    isbn: string
    description: string
    quantity: number
    pricePerUnit: number
  }
}

export function getItemKey(item: CartItem): string {
  return item.ebookOption ? `${item.book.id}::${item.ebookOption.isbnEbook}` : item.book.id
}

interface CartContextValue {
  items: CartItem[]
  opGroups: OPCartGroup[]
  totalItems: number
  addToCart: (book: Book, qty?: number, ebookOption?: EbookCartOption) => void
  updateQty: (itemKey: string, qty: number) => void
  removeFromCart: (itemKey: string) => void
  addOPToCart: (group: Omit<OPCartGroup, 'id'>) => void
  removeOP: (opId: string) => void
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

function computeTotals(items: CartItem[], opGroups: OPCartGroup[]) {
  /* Titres individuels */
  const booksHT = items.reduce(
    (sum, { book, quantity }) => sum + book.price * quantity, 0)
  const booksRemise = items.reduce(
    (sum, { book, quantity }) => sum + book.price * quantity * REMISE_RATES[book.universe], 0)

  /* OPs : ouvrages + PLV (remise sur ouvrages, pas sur PLV) */
  const opBooksHT = opGroups.reduce((sum, op) =>
    sum + op.books.reduce((s, { book, quantity }) => s + book.price * quantity, 0), 0)
  const opBooksRemise = opGroups.reduce((sum, op) =>
    sum + op.books.reduce((s, { book, quantity }) =>
      s + book.price * quantity * REMISE_RATES[book.universe], 0), 0)
  const opPLVHT = opGroups.reduce((sum, op) =>
    sum + op.plv.pricePerUnit * op.plv.quantity, 0)

  const subtotalHT  = booksHT + opBooksHT + opPLVHT
  const remiseAmount = booksRemise + opBooksRemise
  const netHT       = subtotalHT - remiseAmount
  const tva         = netHT * 0.055
  const totalTTC    = netHT + tva
  return { subtotalHT, remiseAmount, netHT, tva, totalTTC }
}

interface StoredCart {
  items: CartItem[]
  opGroups: OPCartGroup[]
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      const parsed = JSON.parse(stored) as StoredCart | CartItem[]
      // Retrocompat : ancien format était un tableau direct
      return Array.isArray(parsed) ? parsed : (parsed.items ?? [])
    } catch { return [] }
  })

  const [opGroups, setOpGroups] = useState<OPCartGroup[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      const parsed = JSON.parse(stored) as StoredCart | CartItem[]
      return Array.isArray(parsed) ? [] : (parsed.opGroups ?? [])
    } catch { return [] }
  })

  /* Persistance localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, opGroups }))
  }, [items, opGroups])

  /* ── Titres individuels ── */
  const addToCart = (book: Book, qty = 1, ebookOption?: EbookCartOption) => {
    setItems(prev => {
      const key = ebookOption ? `${book.id}::${ebookOption.isbnEbook}` : book.id
      const existing = prev.find(i =>
        ebookOption
          ? i.book.id === book.id && i.ebookOption?.isbnEbook === ebookOption.isbnEbook
          : i.book.id === book.id && !i.ebookOption
      )
      if (existing)
        return prev.map(i => {
          const iKey = i.ebookOption ? `${i.book.id}::${i.ebookOption.isbnEbook}` : i.book.id
          return iKey === key ? { ...i, quantity: i.quantity + qty } : i
        })
      return [...prev, { book, quantity: qty, ebookOption }]
    })
  }

  const updateQty = (itemKey: string, qty: number) => {
    if (qty < 1) { removeFromCart(itemKey); return }
    setItems(prev => prev.map(i => getItemKey(i) === itemKey ? { ...i, quantity: qty } : i))
  }

  const removeFromCart = (itemKey: string) =>
    setItems(prev => prev.filter(i => getItemKey(i) !== itemKey))

  /* ── OPs ── */
  const addOPToCart = (group: Omit<OPCartGroup, 'id'>) => {
    const id = `op-${group.serieId}-${Date.now()}`
    setOpGroups(prev => [...prev, { ...group, id }])
  }

  const removeOP = (opId: string) =>
    setOpGroups(prev => prev.filter(op => op.id !== opId))

  const clearCart = () => { setItems([]); setOpGroups([]) }

  const itemsTotal    = items.reduce((sum, i) => sum + i.quantity, 0)
  const opBooksTotal  = opGroups.reduce((sum, op) =>
    sum + op.books.reduce((s, { quantity }) => s + quantity, 0), 0)
  const totalItems    = itemsTotal + opBooksTotal

  return (
    <CartContext.Provider value={{
      items,
      opGroups,
      totalItems,
      addToCart,
      updateQty,
      removeFromCart,
      addOPToCart,
      removeOP,
      clearCart,
      ...computeTotals(items, opGroups),
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
