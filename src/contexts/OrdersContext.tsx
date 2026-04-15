import { createContext, useContext, useState, useEffect } from 'react'
import { MOCK_ORDERS, ORDER_STATUSES, type Order, type OrderItem } from '@/data/mockOrders'
import type { CartItem } from '@/contexts/CartContext'
import { REMISE_RATES } from '@/contexts/CartContext'

const STORAGE_KEY = 'bookflow_orders'

/* ── Génération numéro de commande ── */
function generateNumero(): string {
  const year = new Date().getFullYear()
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `CMD-${year}-${rand}`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/* ── Context type ── */
interface OrdersContextValue {
  orders: Order[]
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
  }) => Order
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

/* ── Provider ── */
export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    // Initialiser avec les mock orders statiques
    const base = Object.values(MOCK_ORDERS).flat()

    // Ajouter les commandes sauvegardées en localStorage (commandes réelles passées)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: Order[] = JSON.parse(stored)
        // Garder uniquement les commandes avec un statut valide (purge des données stales)
        const validStatuses = new Set<string>(ORDER_STATUSES)
        const existingIds = new Set(base.map(o => o.id))
        const extras = parsed.filter(
          o => !existingIds.has(o.id) && validStatuses.has(o.status)
        )
        return [...base, ...extras]
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    return base
  })

  // Persister uniquement les nouvelles commandes (pas les mocks statiques)
  const mockIds = new Set(Object.values(MOCK_ORDERS).flat().map(o => o.id))

  useEffect(() => {
    const newOrders = orders.filter(o => !mockIds.has(o.id))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders))
  }, [orders])

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
  }): Order {
    const orderItems: OrderItem[] = params.items.map(({ book, quantity }) => ({
      bookId: book.id,
      title: book.title,
      author: book.authors.join(', '),
      publisher: book.publisher,
      isbn: book.isbn,
      quantity,
      unitPriceHT: book.price,
      universe: book.universe,
    }))

    const order: Order = {
      id: `ord-${Date.now()}`,
      numero: generateNumero(),
      date: todayISO(),
      status: 'en cours',
      codeClient: params.codeClient,
      adresseLivraison: params.adresseLivraison,
      deliveryMode: params.deliveryMode,
      deliveryDate: params.deliveryDate,
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
    <OrdersContext.Provider value={{ orders, addOrder }}>
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
