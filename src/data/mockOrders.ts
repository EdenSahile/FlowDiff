// DEV ONLY — remplacé par Prisma/Supabase en Phase 12

export type OrderStatus = 'en cours' | 'reçu' | 'facturé' | 'expédié'

export const ORDER_STATUSES: OrderStatus[] = ['en cours', 'reçu', 'facturé', 'expédié']

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  'en cours': 'En cours',
  'reçu':     'Reçu',
  'facturé':  'Facturé',
  'expédié':  'Expédié',
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
  universe: string
  typeCommande?: TypeCommande
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
      status: 'en cours',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'f-lit-01',
          title: "L'Étranger",
          author: 'Albert Camus',
          publisher: 'Gallimard',
          isbn: '9782070360024',
          quantity: 5,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'SUITE',
        },
        {
          bookId: 'f-bd-01',
          title: 'Tintin au Tibet',
          author: 'Hergé',
          publisher: 'Casterman',
          isbn: '9782203001046',
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
      date: '2025-02-10',
      status: 'facturé',
      codeClient: 'LIB001',
      commandePar: 'Sophie Martin',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      dateFacturation: '2025-02-14',
      numFacture: 'FACT-2025-0187',
      items: [
        {
          bookId: 'f-lit-01',
          title: "L'Étranger",
          author: 'Albert Camus',
          publisher: 'Gallimard',
          isbn: '9782070360024',
          quantity: 8,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'MONO',
        },
        {
          bookId: 'f-lit-02',
          title: 'Le Petit Prince',
          author: 'Antoine de Saint-Exupéry',
          publisher: 'Gallimard',
          isbn: '9782070408504',
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
      status: 'expédié',
      codeClient: 'LIB001',
      commandePar: 'Julien Lefebvre',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'f-lit-01',
          title: "L'Étranger",
          author: 'Albert Camus',
          publisher: 'Gallimard',
          isbn: '9782070360024',
          quantity: 4,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'SUITE',
        },
        {
          bookId: 'f-bd-01',
          title: 'Tintin au Tibet',
          author: 'Hergé',
          publisher: 'Casterman',
          isbn: '9782203001046',
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
      status: 'facturé',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      dateFacturation: '2024-12-09',
      numFacture: 'FACT-2024-1021',
      items: [
        {
          bookId: 'f-lit-01',
          title: "L'Étranger",
          author: 'Albert Camus',
          publisher: 'Gallimard',
          isbn: '9782070360024',
          quantity: 10,
          unitPriceHT: 4.90,
          universe: 'Littérature',
          typeCommande: 'MONO',
        },
        {
          bookId: 'n-bd-02',
          title: 'My Hero Academia T.1',
          author: 'Kōhei Horikoshi',
          publisher: 'Glénat',
          isbn: '9782344000656',
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
      status: 'facturé',
      codeClient: 'LIB001',
      commandePar: 'Sophie Martin',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      dateFacturation: '2024-11-12',
      numFacture: 'FACT-2024-0892',
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
          typeCommande: 'SUITE',
        },
        {
          bookId: 'f-lit-01',
          title: "L'Étranger",
          author: 'Albert Camus',
          publisher: 'Gallimard',
          isbn: '9782070360024',
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
      status: 'en cours',
      codeClient: 'LIB001',
      commandePar: 'Marc Dupont',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'f-bd-01',
          title: 'Tintin au Tibet',
          author: 'Hergé',
          publisher: 'Casterman',
          isbn: '9782203001046',
          quantity: 5,
          unitPriceHT: 8.70,
          universe: 'BD/Mangas',
          typeCommande: 'MONO',
        },
        {
          bookId: 'f-jes-01',
          title: "Harry Potter à l'école des sorciers",
          author: 'J.K. Rowling',
          publisher: 'Gallimard Jeunesse',
          isbn: '9782070584628',
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
          bookId: 'f-lit-01',
          title: "L'Étranger",
          author: 'Albert Camus',
          publisher: 'Gallimard',
          isbn: '9782070360024',
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
      status: 'reçu',
      codeClient: 'LIB001',
      commandePar: 'Sophie Martin',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      items: [
        {
          bookId: 'n-bd-02',
          title: 'My Hero Academia T.1',
          author: 'Kōhei Horikoshi',
          publisher: 'Glénat',
          isbn: '9782344000656',
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
