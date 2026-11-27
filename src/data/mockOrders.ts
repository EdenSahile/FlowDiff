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

// Le type de titre au moment de la commande, figé sur la ligne (DEC-001).
// Un livre change de type après sa parution, la commande garde celui d'origine,
// ce qui permet de retrouver les titres commandés « notés » avant parution.
export type TypeCommande = 'A paraître' | 'Nouveauté' | 'Fonds'

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
  adresseFacturation?: string
  codeClient: string
  commandePar?: string   // nom de la personne ayant passé la commande
  deliveryMode: 'standard' | 'specific'
  deliveryDate?: string      // ISO date
  dateFacturation?: string   // ISO date : si facturé
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
          isbn: '9782330108724',
          quantity: 5,
          unitPriceHT: 16.97,
          unitPriceTTC: 17.90,
          universe: 'Littérature',
          typeCommande: 'Fonds',
        },
        {
          bookId: 'f-bd-spy',
          title: 'Spy x Family T.1',
          author: 'Tatsuya Endo',
          publisher: 'Kurokawa',
          isbn: '9782823878462',
          quantity: 3,
          unitPriceHT: 7.57,
          unitPriceTTC: 7.99,
          universe: 'BD/Mangas',
          typeCommande: 'Fonds',
        },
      ],
      subtotalHT: 107.56,
      remiseAmount: 36.51,
      netHT: 71.05,
      tva: 3.91,
      totalTTC: 74.96,
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
          title: 'Avant qu\'il ne soit trop tard',
          author: 'Kamel Daoud',
          publisher: 'Calmann-Lévy',
          isbn: '9782258210271',
          quantity: 8,
          unitPriceHT: 20.76,
          unitPriceTTC: 21.90,
          universe: 'Littérature',
          typeCommande: 'Nouveauté',
        },
        {
          bookId: 'f-lit-slimani',
          title: 'Le Pays des autres',
          author: 'Leïla Slimani',
          publisher: 'Gallimard',
          isbn: '9782072888021',
          quantity: 6,
          unitPriceHT: 18.48,
          unitPriceTTC: 19.50,
          universe: 'Littérature',
          typeCommande: 'Fonds',
        },
        /*
          Titre passé en rupture depuis cette commande. C'est le cas que la
          duplication doit savoir écarter en le disant : la commande reste
          l'historique de ce qui a été livré, mais ce titre ne peut pas
          retourner au panier aujourd'hui.
        */
        {
          bookId: 'n-bd-02',
          title: 'Blue Box T.1',
          author: 'Kōji Miura',
          publisher: 'Glénat',
          isbn: '9782413054580',
          quantity: 4,
          unitPriceHT: 7.57,
          unitPriceTTC: 7.99,
          universe: 'BD/Mangas',
          typeCommande: 'Nouveauté',
        },
      ],
      subtotalHT: 307.24,
      remiseAmount: 106.02,
      netHT: 201.22,
      tva: 11.07,
      totalTTC: 212.29,
    },
    // Commande de titres notés avant parution (DEC-001) : les 2 lignes portent
    // typeCommande 'A paraître', ce qu'un back-office pourra filtrer. Elle reste
    // en préparation, les titres n'étant pas encore parus.
    {
      id: 'ord-003',
      numero: 'CMD0000012',
      date: '2026-06-02',
      status: 'en préparation',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      referenceCommande: 'BC-2026-0455',
      items: [
        {
          bookId: 'ap-lit-02',
          title: 'Regardez-nous danser',
          author: 'Leïla Slimani',
          publisher: 'Gallimard',
          isbn: '9782073003720',
          quantity: 3,
          unitPriceHT: 15.00,
          unitPriceTTC: 22.50,
          universe: 'Littérature',
          typeCommande: 'A paraître',
        },
        {
          bookId: 'ap-jes-01',
          title: 'La Passe-Miroir T.2 : Les Disparus du Clairdelune',
          author: 'Christelle Dabos',
          publisher: 'Gallimard Jeunesse',
          isbn: '9782075081757',
          quantity: 2,
          unitPriceHT: 9.50,
          unitPriceTTC: 14.50,
          universe: 'Jeunesse',
          typeCommande: 'A paraître',
        },
      ],
      subtotalHT: 64.00,
      remiseAmount: 21.45,
      netHT: 42.55,
      tva: 2.34,
      totalTTC: 44.89,
    },
  ],
  LIB002: [],
  LIB003: [],
}
