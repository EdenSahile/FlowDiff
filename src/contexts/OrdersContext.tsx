import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { MOCK_ORDERS, type Order, type OrderItem } from '@/data/mockOrders'
import type { CartItem } from '@/contexts/CartContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { storedOrdersSchema } from '@/lib/storageSchemas'

/* Hoisted — MOCK_ORDERS est statique, pas besoin de recalculer à chaque render */
const MOCK_IDS = new Set(Object.values(MOCK_ORDERS).flat().map(o => o.id))

function ordersKey(codeClient: string | undefined) {
  return `bookflow_orders_${codeClient ?? 'guest'}`
}

/* ── Migration localStorage : efface les commandes ancienne numérotation ── */
const STORAGE_VERSION_KEY = 'bookflow_storage_version'
const STORAGE_VERSION = '2'

function migrateStorage() {
  if (localStorage.getItem(STORAGE_VERSION_KEY) === STORAGE_VERSION) return
  Object.keys(localStorage)
    .filter(k => k.startsWith('bookflow_orders_'))
    .forEach(k => localStorage.removeItem(k))
  localStorage.setItem(ORDER_COUNTER_KEY, String(ORDER_COUNTER_INITIAL))
  localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
}

migrateStorage()

/* ── Génération numéro de commande ── */
const ORDER_COUNTER_KEY = 'bookflow_order_counter'

const ORDER_COUNTER_INITIAL = 2 // CMD0000001 et CMD0000002 sont réservés aux mocks

function generateNumero(): string {
  const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) ?? String(ORDER_COUNTER_INITIAL), 10)
  const next = current + 1
  localStorage.setItem(ORDER_COUNTER_KEY, String(next))
  return `CMD${String(next).padStart(7, '0')}`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/* ── Context type ── */
interface OrdersContextValue {
  orders: Order[]
  userOrders: Order[]   // commandes réellement passées (hors mocks statiques)
  addOrder: (params: {
    codeClient: string
    adresseLivraison: string
    items: CartItem[]
    subtotalHT: number
    remiseAmount: number
    netHT: number
    tva: number
    totalTTC: number
    deliveryMode: 'standard' | 'specific'
    deliveryDate?: string
    transmissionMode: 'FLOWDIFF' | 'EDI'
  }) => Order
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

/* ── Provider ── */
function loadOrders(key: string): Order[] {
  const base = Object.values(MOCK_ORDERS).flat()
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      const result = storedOrdersSchema.safeParse(parsed)
      if (!result.success) { localStorage.removeItem(key); return base }
      const existingIds     = new Set(base.map(o => o.id))
      const existingNumeros = new Set(base.map(o => o.numero))
      const extras = (result.data as Order[]).filter(
        o => !existingIds.has(o.id) && !existingNumeros.has(o.numero)
      )
      return [...base, ...extras]
    }
  } catch {
    localStorage.removeItem(key)
  }
  return base
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const key = ordersKey(user?.codeClient)

  const [orders, setOrders] = useState<Order[]>(() => loadOrders(ordersKey(user?.codeClient)))

  /* Re-charger les commandes quand l'utilisateur change */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(loadOrders(key))
  }, [key])

  /* Persister uniquement les nouvelles commandes (pas les mocks statiques) */
  useEffect(() => {
    const newOrders = orders.filter(o => !MOCK_IDS.has(o.id))
    localStorage.setItem(key, JSON.stringify(newOrders))
  }, [orders, key])

  const userOrders = useMemo(() => orders.filter(o => !MOCK_IDS.has(o.id)), [orders])

  function addOrder(params: {
    codeClient: string
    adresseLivraison: string
    items: CartItem[]
    subtotalHT: number
    remiseAmount: number
    netHT: number
    tva: number
    totalTTC: number
    deliveryMode: 'standard' | 'specific'
    deliveryDate?: string
    transmissionMode: 'FLOWDIFF' | 'EDI'
  }): Order {
    const orderItems: OrderItem[] = params.items.map(({ book, quantity, statut, enReliquat }) => ({
      bookId: book.id,
      title: book.title,
      author: book.authors.join(', '),
      publisher: book.publisher,
      isbn: book.isbn,
      quantity,
      unitPriceHT: book.price,
      unitPriceTTC: book.priceTTC,
      universe: book.universe,
      statut,
      enReliquat,
    }))

    const order: Order = {
      id: `ord-${Date.now()}`,
      numero: generateNumero(),
      date: todayISO(),
      status: 'en préparation',
      codeClient: params.codeClient,
      adresseLivraison: params.adresseLivraison,
      deliveryMode: params.deliveryMode,
      deliveryDate: params.deliveryDate,
      transmissionMode: params.transmissionMode,
      ediStatus: params.transmissionMode === 'EDI' ? 'PENDING' : undefined,
      items: orderItems,
      subtotalHT: params.subtotalHT,
      remiseAmount: params.remiseAmount,
      netHT: params.netHT,
      tva: params.tva,
      totalTTC: params.totalTTC,
    }

    setOrders(prev => [order, ...prev])
    return order
  }

  return (
    <OrdersContext.Provider value={{ orders, userOrders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders doit être dans <OrdersProvider>')
  return ctx
}

/* Hook filtré par code client */
export function useClientOrders(codeClient: string): Order[] {
  const { orders } = useOrders()
  return orders.filter(o => o.codeClient === codeClient)
}
