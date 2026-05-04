import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Book, StockStatut, Universe } from '@/data/mockBooks'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { storedCartSchema } from '@/lib/storageSchemas'
import type { TransmissionMode } from '@/pages/cart/checkoutSchemas'

export const CART_LIMIT = 30

/* ── Remises mock par univers (en attendant AS400/CRM) ── */
export const REMISE_RATES: Record<Universe, number> = {
  'BD/Mangas':       0.30,
  'Jeunesse':        0.30,
  'Littérature':     0.35,
  'Adulte-pratique': 0.35,
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
  /* Snapshot du statut au moment de l'ajout — évite un changement rétroactif */
  statut?: StockStatut
  /* true pour en_reimp (expédition différée), false sinon */
  enReliquat?: boolean
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

export interface AddToCartOptions {
  ebookOption?: EbookCartOption
  enReliquat?: boolean
}

interface CartContextValue {
  items: CartItem[]
  opGroups: OPCartGroup[]
  totalItems: number
  addToCart: (book: Book, qty?: number, opts?: AddToCartOptions) => void
  updateQty: (itemKey: string, qty: number) => void
  removeFromCart: (itemKey: string) => void
  addOPToCart: (group: Omit<OPCartGroup, 'id'>) => void
  removeOP: (opId: string) => void
  clearCart: () => void
  hasReliquatItems: boolean
  /* Totaux calculés */
  subtotalTTC: number
  remiseAmount: number
  netHT: number
  tva: number
  totalTTC: number
  /* Préférence mode de transmission */
  transmissionMode: TransmissionMode
  setTransmissionMode: (mode: TransmissionMode) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function cartKey(codeClient: string | undefined) {
  return `bookflow_cart_${codeClient ?? 'guest'}`
}

function transmissionKey(codeClient: string | undefined) {
  return `bookflow_transmission_${codeClient ?? 'guest'}`
}

function loadTransmissionMode(codeClient: string | undefined): TransmissionMode {
  try {
    const stored = localStorage.getItem(transmissionKey(codeClient))
    if (stored === 'FLOWDIFF' || stored === 'EDI') return stored
  } catch { /* ignore */ }
  return 'FLOWDIFF'
}

function loadCart(key: string): StoredCart {
  const empty: StoredCart = { items: [], opGroups: [] }
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return empty
    const raw = JSON.parse(stored)
    const normalized = Array.isArray(raw) ? { items: raw, opGroups: [] } : raw
    const result = storedCartSchema.safeParse(normalized)
    if (!result.success) { localStorage.removeItem(key); return empty }
    return normalized as StoredCart
  } catch { return empty }
}

export function computeTotals(items: CartItem[], opGroups: OPCartGroup[], rates: Record<string, number>) {
  const rate = (universe: string) => rates[universe] ?? 0

  /* Titres individuels — base TTC (prix public) */
  const booksTTC = items.reduce(
    (sum, { book, quantity }) => sum + book.priceTTC * quantity, 0)
  const booksRemise = items.reduce(
    (sum, { book, quantity }) => sum + book.priceTTC * quantity * rate(book.universe), 0)

  /* OPs : ouvrages + PLV (remise sur ouvrages, pas sur PLV) */
  const opBooksTTC = opGroups.reduce((sum, op) =>
    sum + op.books.reduce((s, { book, quantity }) => s + book.priceTTC * quantity, 0), 0)
  const opBooksRemise = opGroups.reduce((sum, op) =>
    sum + op.books.reduce((s, { book, quantity }) =>
      s + book.priceTTC * quantity * rate(book.universe), 0), 0)
  const opPLVTTC = opGroups.reduce((sum, op) =>
    sum + op.plv.pricePerUnit * op.plv.quantity, 0)

  const subtotalTTC  = booksTTC + opBooksTTC + opPLVTTC
  const remiseAmount = booksRemise + opBooksRemise
  /* Net TTC après remise → extraction TVA (5,5% inclus dans le TTC) */
  const netTTC       = subtotalTTC - remiseAmount
  const netHT        = netTTC / 1.055
  const tva          = netTTC - netHT
  const totalTTC     = netTTC
  return { subtotalTTC, remiseAmount, netHT, tva, totalTTC }
}

interface StoredCart {
  items: CartItem[]
  opGroups: OPCartGroup[]
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const { showToast } = useToast()
  const key = cartKey(user?.codeClient)

  const [{ items, opGroups }, setCart] = useState<StoredCart>(() => loadCart(cartKey(user?.codeClient)))
  const [transmissionMode, setTransmissionModeState] = useState<TransmissionMode>(() =>
    loadTransmissionMode(user?.codeClient)
  )

  /* Re-charger le panier et la préférence quand l'utilisateur change */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(loadCart(key))
    setTransmissionModeState(loadTransmissionMode(user?.codeClient))
  }, [key, user?.codeClient])

  const setItems = useCallback((fn: (prev: CartItem[]) => CartItem[]) =>
    setCart(c => ({ ...c, items: fn(c.items) }))
  , [])

  const setOpGroups = useCallback((fn: (prev: OPCartGroup[]) => OPCartGroup[]) =>
    setCart(c => ({ ...c, opGroups: fn(c.opGroups) }))
  , [])

  /* Persistance localStorage — clé par utilisateur (skip si non connecté) */
  useEffect(() => {
    if (!user?.codeClient) return
    localStorage.setItem(key, JSON.stringify({ items, opGroups }))
  }, [items, opGroups, key, user?.codeClient])

  /* Taux effectifs : remisesParUnivers du libraire connecté (÷100) ou taux par défaut */
  const effectiveRates = useMemo<Record<string, number>>(
    () => user?.remisesParUnivers
      ? Object.fromEntries(Object.entries(user.remisesParUnivers).map(([k, v]) => [k, v / 100]))
      : REMISE_RATES,
    [user]
  )

  const itemsTotal    = items.reduce((sum, i) => sum + i.quantity, 0)
  const opBooksTotal  = opGroups.reduce((sum, op) =>
    sum + op.books.reduce((s, { quantity }) => s + quantity, 0), 0)
  const totalItems    = itemsTotal + opBooksTotal

  const hasReliquatItems = items.some(i => i.enReliquat)

  /* ── Titres individuels ── */
  const removeFromCart = useCallback((itemKey: string) =>
    setItems(prev => prev.filter(i => getItemKey(i) !== itemKey))
  , [])

  const updateQty = useCallback((itemKey: string, qty: number) => {
    if (qty < 1) { removeFromCart(itemKey); return }
    setItems(prev => prev.map(i => getItemKey(i) === itemKey ? { ...i, quantity: qty } : i))
  }, [removeFromCart])

  const addToCart = useCallback((book: Book, qty = 1, opts: AddToCartOptions = {}) => {
    const { ebookOption, enReliquat } = opts
    setCart(prev => {
      const currentTotal =
        prev.items.reduce((s, i) => s + i.quantity, 0) +
        prev.opGroups.reduce((s, op) =>
          s + op.books.reduce((ss, b) => ss + b.quantity, 0), 0)
      if (currentTotal >= CART_LIMIT) {
        showToast(
          `Limite de démonstration atteinte (${CART_LIMIT} articles max). Veuillez vider votre panier pour continuer.`,
          'error'
        )
        return prev
      }
      const itemKey = ebookOption ? `${book.id}::${ebookOption.isbnEbook}` : book.id
      const existing = prev.items.find(i =>
        ebookOption
          ? i.book.id === book.id && i.ebookOption?.isbnEbook === ebookOption.isbnEbook
          : i.book.id === book.id && !i.ebookOption
      )
      const newItems = existing
        ? prev.items.map(i => {
            const iKey = i.ebookOption ? `${i.book.id}::${i.ebookOption.isbnEbook}` : i.book.id
            return iKey === itemKey ? { ...i, quantity: i.quantity + qty } : i
          })
        : [...prev.items, {
            book,
            quantity: qty,
            ebookOption,
            statut: book.statut,
            enReliquat: enReliquat ?? false,
          }]
      return { ...prev, items: newItems }
    })
  }, [showToast])

  /* ── OPs ── */
  const removeOP = useCallback((opId: string) =>
    setOpGroups(prev => prev.filter(op => op.id !== opId))
  , [])

  const addOPToCart = useCallback((group: Omit<OPCartGroup, 'id'>) => {
    const opCount = group.books.reduce((s, { quantity }) => s + quantity, 0)
    setCart(prev => {
      const currentTotal =
        prev.items.reduce((s, i) => s + i.quantity, 0) +
        prev.opGroups.reduce((s, op) =>
          s + op.books.reduce((ss, b) => ss + b.quantity, 0), 0)
      if (currentTotal + opCount > CART_LIMIT) {
        showToast(
          `Limite de démonstration atteinte (${CART_LIMIT} articles max). Veuillez vider votre panier pour continuer.`,
          'error'
        )
        return prev
      }
      const id = `op-${group.serieId}-${Date.now()}`
      return { ...prev, opGroups: [...prev.opGroups, { ...group, id }] }
    })
  }, [showToast])

  const clearCart = useCallback(() => setCart({ items: [], opGroups: [] }), [])

  const setTransmissionMode = useCallback((mode: TransmissionMode) => {
    setTransmissionModeState(mode)
    if (user?.codeClient) {
      localStorage.setItem(transmissionKey(user.codeClient), mode)
    }
  }, [user?.codeClient])

  const value = useMemo(() => ({
    items,
    opGroups,
    totalItems,
    addToCart,
    updateQty,
    removeFromCart,
    addOPToCart,
    removeOP,
    clearCart,
    hasReliquatItems,
    ...computeTotals(items, opGroups, effectiveRates),
    transmissionMode,
    setTransmissionMode,
  }), [items, opGroups, totalItems, addToCart, updateQty, removeFromCart,
      addOPToCart, removeOP, clearCart, hasReliquatItems, effectiveRates,
      transmissionMode, setTransmissionMode])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
