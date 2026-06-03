// DEV ONLY — remplacé par Prisma/Supabase en Phase 12

import type { StockStatut } from './mockBooks'

export type TrackingEventStatus =
  | 'prepared'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'

export interface TrackingEvent {
  status: TrackingEventStatus
  label: string
  location: string
  occurredAt: string
}

export type Carrier = 'laposte' | 'chronopost' | 'ups' | 'dpd'

export interface Shipment {
  carrier: Carrier
  trackingNumber: string
  estimatedDelivery: string
  shippedAt: string
  deliveredAt: string | null
  events: TrackingEvent[]
}

export type OrderStatus = 'en préparation' | 'expédié' | 'livré'

export const ORDER_STATUSES: OrderStatus[] = ['en préparation', 'expédié', 'livré']

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  'en préparation': 'En préparation',
  'expédié':        'Expédié',
  'livré':          'Livré',
}

export type TypeCommande = 'MONO' | 'AP' | 'SUITE'

export interface OrderItem {
  bookId: string
  title: string
  author: string
  publisher: string
  isbn: string
  quantity: number
  unitPriceHT: number
  unitPriceTTC?: number   // prix public TTC affiché sur les blocs ouvrages
  universe: string
  typeCommande?: TypeCommande
  statut?: StockStatut
  enReliquat?: boolean
  referenceLigne?: string
}

export interface Order {
  id: string
  numero: string
  date: string           // ISO date
  status: OrderStatus
  items: OrderItem[]
  subtotalHT: number
  remiseAmount: number
  netHT: number
  tva: number
  totalTTC: number
  adresseLivraison: string
  codeClient: string
  commandePar?: string   // nom de la personne ayant passé la commande
  deliveryMode: 'standard' | 'specific'
  deliveryDate?: string      // ISO date
  dateFacturation?: string   // ISO date — si facturé
  numFacture?: string        // ex. FACT-2024-0892
  shipment?: Shipment
  transmissionMode?: 'FLOWDIFF' | 'EDI'
  ediStatus?: 'PENDING' | 'SENT' | 'ACK' | 'ERROR'
  referenceCommande?: string
}

export const MOCK_CLIENT_NAMES: Record<string, string> = {
  LIB001: 'Librairie du Parc',
  LIB002: 'Librairie Bellecour',
  LIB003: 'Librairie des Arts',
}

export const MOCK_ORDERS: Record<string, Order[]> = {
  LIB001: [
    {
      id: 'ord-001',
      numero: 'CMD0000013',
      date: '2026-05-25',
      status: 'en préparation',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      referenceCommande: 'BC-2026-0412',
      items: [
        {
          bookId: 'f-lit-mathieu',
          title: 'Leurs enfants après eux',
          author: 'Nicolas Mathieu',
          publisher: 'Actes Sud',
          isbn: '9782330094058',
          quantity: 5,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'SUITE',
        },
        {
          bookId: 'f-bd-demon-01',
          title: 'Demon Slayer T.1',
          author: 'Koyoharu Gotouge',
          publisher: 'Panini Manga',
          isbn: '9782809491739',
          quantity: 3,
          unitPriceHT: 8.70,
          universe: 'BD/Mangas',
          typeCommande: 'SUITE',
        },
      ],
      subtotalHT: 50.60,
      remiseAmount: 13.94,
      netHT: 36.66,
      tva: 2.02,
      totalTTC: 38.68,
    },
    {
      id: 'ord-002',
      numero: 'CMD0000014',
      date: '2026-05-28',
      status: 'livré',
      codeClient: 'LIB001',
      commandePar: 'Sophie Martin',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      dateFacturation: '2026-05-23',
      numFacture: 'FACT-2026-0342',
      transmissionMode: 'FLOWDIFF',
      shipment: {
        carrier: 'chronopost',
        trackingNumber: 'CP246813579FR',
        estimatedDelivery: '2026-05-22',
        shippedAt: '2026-05-21T09:00:00',
        deliveredAt: '2026-05-22T10:30:00',
        events: [
          { status: 'delivered', label: 'Livré', location: 'Librairie du Parc', occurredAt: '2026-05-22T10:30:00' },
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Paris 1er', occurredAt: '2026-05-22T07:45:00' },
          { status: 'in_transit', label: "Pris en charge à l'agence", location: 'Tri Postal Paris Nord', occurredAt: '2026-05-21T22:15:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2026-05-21T09:00:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2026-05-21T07:30:00' },
        ],
      },
      items: [
        {
          bookId: 'n-lit-01',
          title: 'Houris',
          author: 'Kamel Daoud',
          publisher: 'Gallimard',
          isbn: '9782073063991',
          quantity: 8,
          unitPriceHT: 18.48,
          unitPriceTTC: 19.50,
          universe: 'Littérature',
          typeCommande: 'MONO',
        },
        {
          bookId: 'f-lit-perrin',
          title: "Changer l'eau des fleurs",
          author: 'Valérie Perrin',
          publisher: 'Albin Michel',
          isbn: '9782226392336',
          quantity: 6,
          unitPriceHT: 5.20,
          unitPriceTTC: 5.49,
          universe: 'Littérature',
          typeCommande: 'SUITE',
        },
        {
          bookId: 'f-bd-demon-01',
          title: 'Demon Slayer T.1',
          author: 'Koyoharu Gotouge',
          publisher: 'Panini Manga',
          isbn: '9782809491739',
          quantity: 4,
          unitPriceHT: 6.84,
          unitPriceTTC: 7.22,
          universe: 'BD/Mangas',
          typeCommande: 'SUITE',
        },
      ],
      subtotalHT: 218.28,
      remiseAmount: 54.57,
      netHT: 163.71,
      tva: 9.00,
      totalTTC: 172.71,
    },
  ],
  LIB002: [],
  LIB003: [],
}
