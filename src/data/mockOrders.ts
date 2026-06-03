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
      numero: 'CMD-2025-0312',
      date: '2025-03-18',
      status: 'en préparation',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
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
      numero: 'CMD-2025-0187',
      date: '2025-05-02',
      status: 'livré',
      codeClient: 'LIB001',
      commandePar: 'Sophie Martin',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      dateFacturation: '2025-02-14',
      numFacture: 'FACT-2025-0187',
      shipment: {
        carrier: 'chronopost',
        trackingNumber: 'CP246813579FR',
        estimatedDelivery: '2025-02-14',
        shippedAt: '2025-02-12T09:00:00',
        deliveredAt: '2025-02-14T10:30:00',
        events: [
          { status: 'delivered', label: 'Livré', location: 'Librairie du Parc', occurredAt: '2025-02-14T10:30:00' },
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Paris 1er', occurredAt: '2025-02-14T07:45:00' },
          { status: 'in_transit', label: "Pris en charge à l'agence", location: 'Tri Postal Paris Nord', occurredAt: '2025-02-13T22:15:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2025-02-12T09:00:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2025-02-12T07:30:00' },
        ],
      },
      items: [
        {
          bookId: 'f-lit-mathieu',
          title: 'Leurs enfants après eux',
          author: 'Nicolas Mathieu',
          publisher: 'Actes Sud',
          isbn: '9782330094058',
          quantity: 8,
          unitPriceHT: 4.90,
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
          universe: 'Littérature',
          typeCommande: 'SUITE',
        },
      ],
      subtotalHT: 70.40,
      remiseAmount: 17.60,
      netHT: 52.80,
      tva: 2.90,
      totalTTC: 55.70,
    },
    {
      id: 'ord-003',
      numero: 'CMD-2025-0094',
      date: '2025-01-22',
      status: 'livré',
      codeClient: 'LIB001',
      commandePar: 'Julien Lefebvre',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      shipment: {
        carrier: 'laposte',
        trackingNumber: 'LA987654321FR',
        estimatedDelivery: '2025-01-27',
        shippedAt: '2025-01-24T10:00:00',
        deliveredAt: '2025-01-27T11:20:00',
        events: [
          { status: 'delivered', label: 'Livré', location: 'Librairie du Parc', occurredAt: '2025-01-27T11:20:00' },
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Paris 15', occurredAt: '2025-01-27T08:00:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2025-01-24T10:00:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2025-01-24T08:30:00' },
        ],
      },
      items: [
        {
          bookId: 'f-lit-mathieu',
          title: 'Leurs enfants après eux',
          author: 'Nicolas Mathieu',
          publisher: 'Actes Sud',
          isbn: '9782330094058',
          quantity: 4,
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
          quantity: 2,
          unitPriceHT: 8.70,
          universe: 'BD/Mangas',
          typeCommande: 'MONO',
        },
      ],
      subtotalHT: 37.00,
      remiseAmount: 9.61,
      netHT: 27.39,
      tva: 1.51,
      totalTTC: 28.90,
    },
    {
      id: 'ord-004',
      numero: 'CMD-2024-1021',
      date: '2024-12-02',
      status: 'livré',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      dateFacturation: '2024-12-09',
      numFacture: 'FACT-2024-1021',
      shipment: {
        carrier: 'dpd',
        trackingNumber: 'DPD135792468FR',
        estimatedDelivery: '2024-12-06',
        shippedAt: '2024-12-04T10:00:00',
        deliveredAt: '2024-12-06T11:00:00',
        events: [
          { status: 'delivered', label: 'Livré', location: 'Librairie du Parc', occurredAt: '2024-12-06T11:00:00' },
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Paris 1er', occurredAt: '2024-12-06T08:20:00' },
          { status: 'in_transit', label: "Pris en charge à l'agence", location: 'Tri Postal Paris Nord', occurredAt: '2024-12-05T21:50:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-12-04T10:00:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-12-04T08:15:00' },
        ],
      },
      items: [
        {
          bookId: 'f-lit-mathieu',
          title: 'Leurs enfants après eux',
          author: 'Nicolas Mathieu',
          publisher: 'Actes Sud',
          isbn: '9782330094058',
          quantity: 10,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'MONO',
        },
        {
          bookId: 'n-bd-02',
          title: 'Dandadan T.1',
          author: 'Yukinobu Tatsu',
          publisher: 'Glénat',
          isbn: '9782344058640',
          quantity: 10,
          unitPriceHT: 5.95,
          universe: 'BD/Mangas',
          typeCommande: 'MONO',
        },
      ],
      subtotalHT: 108.50,
      remiseAmount: 30.41,
      netHT: 78.09,
      tva: 4.29,
      totalTTC: 82.38,
    },
    {
      id: 'ord-005',
      numero: 'CMD-2024-0892',
      date: '2024-11-05',
      status: 'livré',
      codeClient: 'LIB001',
      commandePar: 'Sophie Martin',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      dateFacturation: '2024-11-12',
      numFacture: 'FACT-2024-0892',
      shipment: {
        carrier: 'ups',
        trackingNumber: '1Z999AA10123456784',
        estimatedDelivery: '2024-11-12',
        shippedAt: '2024-11-07T14:00:00',
        deliveredAt: '2024-11-12T09:45:00',
        events: [
          { status: 'delivered', label: 'Livré', location: 'Librairie du Parc', occurredAt: '2024-11-12T09:45:00' },
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Paris 15', occurredAt: '2024-11-12T07:30:00' },
          { status: 'in_transit', label: "Pris en charge à l'agence", location: 'Tri Postal Paris Sud', occurredAt: '2024-11-11T23:10:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-11-07T14:00:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-11-07T12:00:00' },
        ],
      },
      items: [
        {
          bookId: 'f-bd-jjk-01',
          title: 'Jujutsu Kaisen T.1',
          author: 'Gege Akutami',
          publisher: 'Ki-oon',
          isbn: '9782355858437',
          quantity: 5,
          unitPriceHT: 7.30,
          universe: 'BD/Mangas',
          typeCommande: 'MONO',
        },
        {
          bookId: 'f-pra-01',
          title: 'Le Grand Larousse de la cuisine',
          author: 'Collectif Larousse',
          publisher: 'Larousse',
          isbn: '9782011355737',
          quantity: 2,
          unitPriceHT: 26.60,
          universe: 'Adulte-pratique',
          typeCommande: 'AP',
        },
      ],
      subtotalHT: 89.70,
      remiseAmount: 20.00,
      netHT: 69.70,
      tva: 3.83,
      totalTTC: 73.53,
    },
    {
      id: 'ord-006',
      numero: 'CMD-2024-0751',
      date: '2024-10-14',
      status: 'expédié',
      codeClient: 'LIB001',
      commandePar: 'Julien Lefebvre',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'specific',
      deliveryDate: '2024-10-18',
      shipment: {
        carrier: 'laposte',
        trackingNumber: 'LA555666777FR',
        estimatedDelivery: '2024-10-18',
        shippedAt: '2024-10-16T11:00:00',
        deliveredAt: null,
        events: [
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Paris 15', occurredAt: '2024-10-18T08:00:00' },
          { status: 'in_transit', label: "Pris en charge à l'agence", location: 'Tri Postal Paris Sud', occurredAt: '2024-10-17T22:30:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-10-16T11:00:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-10-16T09:00:00' },
        ],
      },
      items: [
        {
          bookId: 'f-jes-animaux',
          title: 'Les Animaux fantastiques',
          author: 'J.K. Rowling',
          publisher: 'Gallimard Jeunesse',
          isbn: '9782070585113',
          quantity: 8,
          unitPriceHT: 7.50,
          universe: 'Jeunesse',
          typeCommande: 'SUITE',
        },
        {
          bookId: 'f-lit-mathieu',
          title: 'Leurs enfants après eux',
          author: 'Nicolas Mathieu',
          publisher: 'Actes Sud',
          isbn: '9782330094058',
          quantity: 3,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'AP',
        },
      ],
      subtotalHT: 74.70,
      remiseAmount: 18.45,
      netHT: 56.25,
      tva: 3.09,
      totalTTC: 59.34,
    },
    {
      id: 'ord-008',
      numero: 'CMD-2025-0401',
      date: '2025-04-01',
      status: 'expédié',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      shipment: {
        carrier: 'laposte',
        trackingNumber: 'LA123456789FR',
        estimatedDelivery: '2025-04-07',
        shippedAt: '2025-04-03T16:30:00',
        deliveredAt: null,
        events: [
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Paris 15', occurredAt: '2025-04-04T08:14:00' },
          { status: 'in_transit', label: "Pris en charge à l'agence", location: 'Tri Postal Paris Sud', occurredAt: '2025-04-03T23:02:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2025-04-03T16:30:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2025-04-03T11:45:00' },
        ],
      },
      items: [
        {
          bookId: 'f-bd-demon-01',
          title: 'Demon Slayer T.1',
          author: 'Koyoharu Gotouge',
          publisher: 'Panini Manga',
          isbn: '9782809491739',
          quantity: 5,
          unitPriceHT: 8.70,
          universe: 'BD/Mangas',
          typeCommande: 'MONO',
        },
        {
          bookId: 'f-jes-animaux',
          title: 'Les Animaux fantastiques',
          author: 'J.K. Rowling',
          publisher: 'Gallimard Jeunesse',
          isbn: '9782070585113',
          quantity: 4,
          unitPriceHT: 7.50,
          universe: 'Jeunesse',
          typeCommande: 'SUITE',
        },
        {
          bookId: 'f-pra-01',
          title: 'Le Grand Larousse de la cuisine',
          author: 'Collectif Larousse',
          publisher: 'Larousse',
          isbn: '9782011355737',
          quantity: 2,
          unitPriceHT: 26.60,
          universe: 'Adulte-pratique',
          typeCommande: 'AP',
        },
        {
          bookId: 'f-lit-mathieu',
          title: 'Leurs enfants après eux',
          author: 'Nicolas Mathieu',
          publisher: 'Actes Sud',
          isbn: '9782330094058',
          quantity: 6,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'SUITE',
        },
      ],
      subtotalHT: 146.90,
      remiseAmount: 39.89,
      netHT: 107.01,
      tva: 5.89,
      totalTTC: 112.90,
    },
    {
      id: 'ord-009',
      numero: 'CMD-2025-0355',
      date: '2025-03-28',
      status: 'en préparation',
      codeClient: 'LIB001',
      commandePar: 'Sophie Martin',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'n-bd-02',
          title: 'Dandadan T.1',
          author: 'Yukinobu Tatsu',
          publisher: 'Glénat',
          isbn: '9782344058640',
          quantity: 8,
          unitPriceHT: 5.95,
          universe: 'BD/Mangas',
          typeCommande: 'MONO',
        },
        {
          bookId: 'f-pra-01',
          title: 'Le Grand Larousse de la cuisine',
          author: 'Collectif Larousse',
          publisher: 'Larousse',
          isbn: '9782011355737',
          quantity: 1,
          unitPriceHT: 26.60,
          universe: 'Adulte-pratique',
          typeCommande: 'AP',
        },
      ],
      subtotalHT: 74.20,
      remiseAmount: 19.94,
      netHT: 54.26,
      tva: 2.98,
      totalTTC: 57.24,
    },
  ],
  LIB002: [
    {
      id: 'ord-007',
      numero: 'CMD-2024-0633',
      date: '2024-11-14',
      status: 'expédié',
      codeClient: 'LIB002',
      commandePar: 'Claire Rousseau',
      adresseLivraison: '8 place Bellecour, 69002 Lyon',
      deliveryMode: 'standard',
      shipment: {
        carrier: 'chronopost',
        trackingNumber: 'CP111222333FR',
        estimatedDelivery: '2024-11-19',
        shippedAt: '2024-11-16T09:00:00',
        deliveredAt: null,
        events: [
          { status: 'out_for_delivery', label: 'En cours de livraison', location: 'Agence Lyon Bellecour', occurredAt: '2024-11-19T09:30:00' },
          { status: 'in_transit', label: "Pris en charge à l'agence", location: 'Tri Postal Lyon', occurredAt: '2024-11-18T20:00:00' },
          { status: 'shipped', label: 'Expédié par FlowDiff', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-11-16T09:00:00' },
          { status: 'prepared', label: 'Commande préparée', location: 'Entrepôt Villeneuve-la-Garenne', occurredAt: '2024-11-16T07:30:00' },
        ],
      },
      items: [
        {
          bookId: 'f-lit-mathieu',
          title: 'Leurs enfants après eux',
          author: 'Nicolas Mathieu',
          publisher: 'Actes Sud',
          isbn: '9782330094058',
          quantity: 6,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'MONO',
        },
      ],
      subtotalHT: 29.40,
      remiseAmount: 7.35,
      netHT: 22.05,
      tva: 1.21,
      totalTTC: 23.26,
    },
  ],
  LIB003: [],
}
