// DEV ONLY — remplacé par Prisma/Supabase en Phase 12

export type OrderStatus = 'en cours' | 'reçu' | 'facturé' | 'expédié'

export const ORDER_STATUSES: OrderStatus[] = ['en cours', 'reçu', 'facturé', 'expédié']

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  'en cours': 'En cours',
  'reçu':     'Reçu',
  'facturé':  'Facturé',
  'expédié':  'Expédié',
}

export interface OrderItem {
  bookId: string
  title: string
  author: string
  publisher: string
  isbn: string
  quantity: number
  unitPriceHT: number
  universe: string
}

export interface Order {
  id: string
  numero: string
  date: string          // ISO date
  status: OrderStatus
  items: OrderItem[]
  subtotalHT: number
  remiseAmount: number
  netHT: number
  tva: number
  totalTTC: number
  adresseLivraison: string
  codeClient: string
  deliveryMode: 'standard' | 'specific'
  deliveryDate?: string  // ISO date — uniquement si mode specific
}

export const MOCK_ORDERS: Record<string, Order[]> = {
  LIB001: [
    {
      id: 'ord-001',
      numero: 'CMD-2024-1021',
      date: '2024-12-02',
      status: 'en cours',
      codeClient: 'LIB001',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'n-bd-02',
          title: 'My Hero Academia T.1',
          author: 'Kōhei Horikoshi',
          publisher: 'Glénat',
          isbn: '9782344000656',
          quantity: 10,
          unitPriceHT: 5.95,
          universe: 'BD/Mangas',
        },
        {
          bookId: 'f-bd-01',
          title: 'Tintin au Tibet',
          author: 'Hergé',
          publisher: 'Casterman',
          isbn: '9782203001046',
          quantity: 4,
          unitPriceHT: 8.70,
          universe: 'BD/Mangas',
        },
      ],
      subtotalHT: 94.30,
      remiseAmount: 28.29,
      netHT: 66.01,
      tva: 3.63,
      totalTTC: 69.64,
    },
    {
      id: 'ord-002',
      numero: 'CMD-2024-0971',
      date: '2024-11-20',
      status: 'reçu',
      codeClient: 'LIB001',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'f-lit-02',
          title: 'Le Petit Prince',
          author: 'Antoine de Saint-Exupéry',
          publisher: 'Gallimard',
          isbn: '9782070408504',
          quantity: 6,
          unitPriceHT: 5.20,
          universe: 'Littérature',
        },
        {
          bookId: 'n-lit-01',
          title: "L'Anomalie",
          author: 'Hervé Le Tellier',
          publisher: 'Gallimard',
          isbn: '9782072886447',
          quantity: 3,
          unitPriceHT: 14.10,
          universe: 'Littérature',
        },
      ],
      subtotalHT: 73.50,
      remiseAmount: 18.38,
      netHT: 55.12,
      tva: 3.03,
      totalTTC: 58.15,
    },
    {
      id: 'ord-003',
      numero: 'CMD-2024-0892',
      date: '2024-11-05',
      status: 'facturé',
      codeClient: 'LIB001',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'f-bd-02',
          title: 'Astérix chez les Bretons',
          author: 'René Goscinny / Albert Uderzo',
          publisher: 'Albert René',
          isbn: '9782012101517',
          quantity: 5,
          unitPriceHT: 7.30,
          universe: 'BD/Mangas',
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
        },
      ],
      subtotalHT: 89.70,
      remiseAmount: 20.00,
      netHT: 69.70,
      tva: 3.83,
      totalTTC: 73.53,
    },
    {
      id: 'ord-004',
      numero: 'CMD-2024-0751',
      date: '2024-10-14',
      status: 'expédié',
      codeClient: 'LIB001',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'specific',
      deliveryDate: '2024-10-18',
      items: [
        {
          bookId: 'f-jes-01',
          title: "Harry Potter à l'école des sorciers",
          author: 'J.K. Rowling',
          publisher: 'Gallimard Jeunesse',
          isbn: '9782070584628',
          quantity: 8,
          unitPriceHT: 7.50,
          universe: 'Jeunesse',
        },
        {
          bookId: 'f-pra-02',
          title: 'Méthode Pilates complète',
          author: 'Alice Pariaud',
          publisher: 'Hachette Pratique',
          isbn: '9782019468422',
          quantity: 3,
          unitPriceHT: 13.20,
          universe: 'Adulte-pratique',
        },
      ],
      subtotalHT: 99.60,
      remiseAmount: 24.30,
      netHT: 75.30,
      tva: 4.14,
      totalTTC: 79.44,
    },
  ],
  LIB002: [
    {
      id: 'ord-005',
      numero: 'CMD-2024-0633',
      date: '2024-11-14',
      status: 'expédié',
      codeClient: 'LIB002',
      adresseLivraison: '8 place Bellecour, 69002 Lyon',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'f-lit-01',
          title: "L'Étranger",
          author: 'Albert Camus',
          publisher: 'Gallimard',
          isbn: '9782070360024',
          quantity: 6,
          unitPriceHT: 4.90,
          universe: 'Littérature',
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
