// DEV ONLY — remplacé par Supabase en Phase 12

export type ReturnStatus = 'pending' | 'in_transit' | 'avoir_emis' | 'refused'

export type ReturnReason =
  | 'invendu'
  | 'defaut_impression'
  | 'mauvaise_livraison'
  | 'doublon'
  | 'autre'

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  invendu:           'Invendu non consulté',
  defaut_impression: "Défaut d'impression",
  mauvaise_livraison:'Mauvaise livraison',
  doublon:           'Doublon',
  autre:             'Autre',
}

export interface ReturnItem {
  orderItemIsbn: string
  title: string
  qty: number
  unitPrice: number
  reason: ReturnReason
}

export interface ReturnRequest {
  id: string
  codeClient: string
  orderId: string
  orderNumero: string
  status: ReturnStatus
  items: ReturnItem[]
  notes: string | null
  blNumber: string | null
  blGeneratedAt: string | null
  avoirAmount: number | null
  avoirGeneratedAt: string | null
  refusalReason: string | null
  createdAt: string
}

export interface CreateReturnPayload {
  codeClient: string
  orderId: string
  orderNumero: string
  items: ReturnItem[]
  notes: string | null
}

export interface ReturnsStats {
  activeCount: number
  avoirYTD: number
  returnRatio: number
  sectorAverage: number
}

export const MOCK_RETURNS: ReturnRequest[] = [
  {
    id: 'RET-2025-0012',
    codeClient: 'LIB001',
    orderId: 'ord-003',
    orderNumero: 'CMD-2025-0094',
    status: 'avoir_emis',
    items: [
      { orderItemIsbn: '9782070360024', title: "L'Étranger", qty: 2, unitPrice: 4.90, reason: 'invendu' },
      { orderItemIsbn: '9782203001046', title: 'Tintin au Tibet', qty: 1, unitPrice: 8.70, reason: 'defaut_impression' },
    ],
    notes: null,
    blNumber: 'BL-045821',
    blGeneratedAt: '2025-03-05T09:00:00',
    avoirAmount: 18.50,
    avoirGeneratedAt: '2025-03-10T14:00:00',
    refusalReason: null,
    createdAt: '2025-03-01T10:00:00',
  },
  {
    id: 'RET-2025-0019',
    codeClient: 'LIB001',
    orderId: 'ord-004',
    orderNumero: 'CMD-2024-1021',
    status: 'in_transit',
    items: [
      { orderItemIsbn: '9782344000656', title: 'My Hero Academia T.1', qty: 5, unitPrice: 5.95, reason: 'invendu' },
    ],
    notes: null,
    blNumber: 'BL-046203',
    blGeneratedAt: '2025-04-15T09:00:00',
    avoirAmount: null,
    avoirGeneratedAt: null,
    refusalReason: null,
    createdAt: '2025-04-14T10:00:00',
  },
  {
    id: 'RET-2025-0008',
    codeClient: 'LIB001',
    orderId: 'ord-005',
    orderNumero: 'CMD-2024-0892',
    status: 'refused',
    items: [
      { orderItemIsbn: '9782011355737', title: 'Le Grand Larousse de la cuisine', qty: 1, unitPrice: 26.60, reason: 'autre' },
    ],
    notes: 'Livre taché',
    blNumber: null,
    blGeneratedAt: null,
    avoirAmount: null,
    avoirGeneratedAt: null,
    refusalReason: 'Article non éligible (état dégradé)',
    createdAt: '2025-02-02T10:00:00',
  },
]
