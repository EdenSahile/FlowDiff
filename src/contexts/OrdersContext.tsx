import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { MOCK_ORDERS, type Order, type OrderItem } from '@/data/mockOrders'
import { computeTotals, REMISE_RATES, type CartItem } from '@/contexts/CartContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { storedOrdersSchema } from '@/lib/storageSchemas'
import { getTypeCommande } from '@/lib/bookUtils'
import { MOCK_BOOKS } from '@/data/mockBooks'

/* Hoisted : MOCK_ORDERS est statique, pas besoin de recalculer à chaque render */
const MOCK_IDS = new Set(Object.values(MOCK_ORDERS).flat().map(o => o.id))

function ordersKey(codeClient: string | undefined) {
  return `bookflow_orders_${codeClient ?? 'guest'}`
}

/* ── Génération numéro de commande ── */
const ORDER_COUNTER_KEY = 'bookflow_order_counter'
const ORDER_COUNTER_INITIAL = 14 // CMD0000001 à CMD0000014 réservés aux mocks

/* ── Migration localStorage : efface les commandes ancienne numérotation ── */
export const STORAGE_VERSION_KEY = 'bookflow_storage_version'
export const STORAGE_VERSION = '3'

function migrateStorage() {
  if (localStorage.getItem(STORAGE_VERSION_KEY) === STORAGE_VERSION) return
  Object.keys(localStorage)
    .filter(k => k.startsWith('bookflow_orders_'))
    .forEach(k => localStorage.removeItem(k))
  localStorage.setItem(ORDER_COUNTER_KEY, String(ORDER_COUNTER_INITIAL))
  localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
}

migrateStorage()

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
    adresseFacturation?: string
    items: CartItem[]
    subtotalHT: number
    remiseAmount: number
    netHT: number
    tva: number
    totalTTC: number
    deliveryMode: 'standard' | 'specific'
    deliveryDate?: string
    transmissionMode: 'FLOWDIFF' | 'EDI'
    referenceCommande?: string
    referencesParLigne?: Record<string, string>
  }) => Order
  createEdiSimulation: () => Order
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

// Au premier rendu, `AuthContext` n'a pas encore repondu : le compte vaut
// `guest`. La `key` remonte le provider quand le compte reel arrive, ce qui
// relance le chargement sur la bonne cle.
//
// Recharger dans un effet ne suffisait pas : l'effet de persistance s'executait
// entre-temps avec l'etat de `guest` encore en memoire, et ecrasait la cle du
// vrai compte avec un tableau vide avant de la reecrire au rendu suivant. Les
// commandes etaient donc effacees du stockage, puis restaurees, a chaque
// chargement de page. Une fermeture d'onglet dans cet intervalle les perdait.
export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const codeClient = user?.codeClient

  return (
    <OrdersAccountProvider key={ordersKey(codeClient)} codeClient={codeClient}>
      {children}
    </OrdersAccountProvider>
  )
}

function OrdersAccountProvider(
  { codeClient, children }: { codeClient: string | undefined; children: React.ReactNode }
) {
  const { user } = useAuthContext()
  const key = ordersKey(codeClient)

  const [orders, setOrders] = useState<Order[]>(() => loadOrders(key))

  /* Persister uniquement les nouvelles commandes (pas les mocks statiques) */
  useEffect(() => {
    const newOrders = orders.filter(o => !MOCK_IDS.has(o.id))
    localStorage.setItem(key, JSON.stringify(newOrders))
  }, [orders, key])

  const userOrders = useMemo(() => orders.filter(o => !MOCK_IDS.has(o.id)), [orders])

  function addOrder(params: {
    codeClient: string
    adresseLivraison: string
    adresseFacturation?: string
    items: CartItem[]
    subtotalHT: number
    remiseAmount: number
    netHT: number
    tva: number
    totalTTC: number
    deliveryMode: 'standard' | 'specific'
    deliveryDate?: string
    transmissionMode: 'FLOWDIFF' | 'EDI'
    referenceCommande?: string
    referencesParLigne?: Record<string, string>
  }): Order {
    /*
      Une ligne numerique porte l'ISBN et le prix de son offre, pas ceux du
      papier : c'est une reference commerciale distincte. L'offre ne connait
      que le prix public TTC, le HT s'en deduit par le taux reduit du livre,
      5,5 %. C'est une conversion de TVA, pas un prix calcule.
    */
    const orderItems: OrderItem[] = params.items.map(({ book, quantity, statut, enReliquat, ebookOption }) => ({
      bookId: book.id,
      title: book.title,
      author: book.authors.join(', '),
      publisher: book.publisher,
      isbn: ebookOption?.isbn ?? book.isbn,
      quantity,
      unitPriceHT: ebookOption
        ? Math.round((ebookOption.priceTTC / 1.055) * 100) / 100
        : book.price,
      unitPriceTTC: ebookOption?.priceTTC ?? book.priceTTC,
      universe: book.universe,
      typeCommande: getTypeCommande(book.type),
      statut,
      enReliquat,
      referenceLigne: params.referencesParLigne
        ? (params.referencesParLigne[ebookOption ? `${book.id}::${ebookOption.isbn}` : book.id]?.trim() || undefined)
        : undefined,
    }))

    const order: Order = {
      id: `ord-${Date.now()}`,
      numero: generateNumero(),
      date: todayISO(),
      status: 'en préparation',
      codeClient: params.codeClient,
      adresseLivraison: params.adresseLivraison,
      adresseFacturation: params.adresseFacturation,
      deliveryMode: params.deliveryMode,
      deliveryDate: params.deliveryDate,
      transmissionMode: params.transmissionMode,
      // La simulation EDI génère immédiatement les trois messages : elle est
      // donc déjà transmise et accusée, sans mêler cet état au traitement métier.
      ediStatus: params.transmissionMode === 'EDI' ? 'ACK' : undefined,
      referenceCommande: params.referenceCommande,
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

  function createEdiSimulation(): Order {
    // Catalogue et règles de calcul du portail, sans jamais lire le panier.
    const items: CartItem[] = MOCK_BOOKS
      .filter(book => book.type !== 'a-paraitre' && book.statut !== 'epuise')
      .slice(0, 2)
      .map((book, index) => ({
        book,
        quantity: index + 1,
        statut: book.statut,
        enReliquat: false,
      }))
    const rates = user?.remisesParUnivers
      ? Object.fromEntries(Object.entries(user.remisesParUnivers).map(([universe, rate]) => [universe, Number(rate) / 100]))
      : REMISE_RATES
    const totals = computeTotals(items, [], rates)

    return addOrder({
      codeClient: codeClient ?? 'guest',
      adresseLivraison: user?.adresseLivraison ?? 'Adresse de démonstration',
      adresseFacturation: user?.adresseLivraison ?? 'Adresse de démonstration',
      items,
      subtotalHT: totals.subtotalTTC / 1.055,
      remiseAmount: totals.remiseAmount / 1.055,
      netHT: totals.netHT,
      tva: totals.tva,
      totalTTC: totals.totalTTC,
      deliveryMode: 'standard',
      transmissionMode: 'EDI',
      referenceCommande: 'SIMULATION EDI',
    })
  }

  return (
    <OrdersContext.Provider value={{ orders, userOrders, addOrder, createEdiSimulation }}>
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
