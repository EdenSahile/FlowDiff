export type EDIMessageType = 'ORDERS' | 'ORDRSP' | 'DESADV' | 'INVOIC'
export type EDIStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'ERROR'
export type ORDRSPLineStatus = 'ACCEPTED' | 'BACKORDERED' | 'REJECTED'
export type ORDRSPGlobalStatus = 'ACCEPTED' | 'PARTIAL' | 'REJECTED'

export interface ORDERSLine {
  lineNumber: number
  ean: string
  title: string
  qtyRequested: number
}

export interface ORDERSPayload {
  orderId: string
  diffuseur: string
  lines: ORDERSLine[]
}

export interface DESADVLine {
  isbn: string
  qtyShipped: number
}

export interface DESADVPayload {
  desadvRef: string
  orderId?: string
  lines: DESADVLine[]
}

export interface ORDRSPLine {
  lineNumber: number
  ean: string
  title: string
  qtyRequested: number
  qtyConfirmed: number
  status: ORDRSPLineStatus
  backorderQty?: number
  estimatedDelivery?: string
  note?: string
}

export interface ORDRSPPayload {
  orderId: string
  orderResponseId: string
  responseDate: string
  globalStatus: ORDRSPGlobalStatus
  rejectionReason?: string
  lines: ORDRSPLine[]
}

export interface EDIMessage {
  id: string
  type: EDIMessageType
  status: EDIStatus
  documentRef: string
  diffuseur: string
  detail: string
  createdAt: string
  orderId?: string
  payload: object
}

export interface EDIParams {
  preferEdiByDefault: boolean
  emailNotifications: boolean
  relanceDelay: '12h' | '24h' | '48h'
}

export type EDIFilter = 'ALL' | EDIMessageType

export type DesadvDeliveryStatus = 'EN_COURS' | 'SOLDE'

export interface DesadvGroupLine {
  isbn: string
  title?: string
  qtyConfirmed: number
  qtyShippedTotal: number
  status: DesadvDeliveryStatus
}

export interface DesadvGroup {
  orderId: string
  diffuseur: string
  desadvs: EDIMessage[]
  lines: DesadvGroupLine[]
  globalStatus: DesadvDeliveryStatus
  lastShipDate: string
}

export function groupDESADVByOrder(messages: EDIMessage[]): {
  grouped: DesadvGroup[]
  ungrouped: EDIMessage[]
} {
  const ordrspByOrder = new Map<string, ORDRSPPayload>()
  messages
    .filter(m => m.type === 'ORDRSP')
    .forEach(m => {
      const p = m.payload as ORDRSPPayload
      if (p.orderId) ordrspByOrder.set(p.orderId, p)
    })

  const desadvsByOrder = new Map<string, EDIMessage[]>()
  const ungrouped: EDIMessage[] = []

  messages
    .filter(m => m.type === 'DESADV')
    .forEach(m => {
      const orderId = (m.payload as DESADVPayload).orderId
      if (!orderId) { ungrouped.push(m); return }
      if (!desadvsByOrder.has(orderId)) desadvsByOrder.set(orderId, [])
      desadvsByOrder.get(orderId)!.push(m)
    })

  const grouped: DesadvGroup[] = []

  desadvsByOrder.forEach((desadvList, orderId) => {
    const ordrsp = ordrspByOrder.get(orderId)

    const shippedByIsbn = new Map<string, number>()
    desadvList.forEach(msg => {
      ;(msg.payload as DESADVPayload).lines.forEach(l => {
        shippedByIsbn.set(l.isbn, (shippedByIsbn.get(l.isbn) ?? 0) + l.qtyShipped)
      })
    })

    const lines: DesadvGroupLine[] = ordrsp
      ? ordrsp.lines.map(ol => {
          const qtyShippedTotal = shippedByIsbn.get(ol.ean) ?? 0
          return {
            isbn: ol.ean,
            title: ol.title,
            qtyConfirmed: ol.qtyConfirmed,
            qtyShippedTotal,
            status: (qtyShippedTotal >= ol.qtyConfirmed ? 'SOLDE' : 'EN_COURS') as DesadvDeliveryStatus,
          }
        })
      : []

    const globalStatus: DesadvDeliveryStatus =
      lines.length > 0 && lines.every(l => l.status === 'SOLDE') ? 'SOLDE' : 'EN_COURS'

    const lastShipDate = desadvList.reduce(
      (max, m) => (m.createdAt > max ? m.createdAt : max),
      desadvList[0].createdAt
    )

    grouped.push({
      orderId,
      diffuseur: desadvList[0].diffuseur,
      desadvs: [...desadvList].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      lines,
      globalStatus,
      lastShipDate,
    })
  })

  grouped.sort((a, b) => b.lastShipDate.localeCompare(a.lastShipDate))
  return { grouped, ungrouped }
}

export function filterEDIMessages(messages: EDIMessage[], filter: EDIFilter): EDIMessage[] {
  if (filter === 'ALL') return messages
  return messages.filter(m => m.type === filter)
}

export function getFluxCounts(messages: EDIMessage[]): {
  orders: number
  expeditions: number
  factures: number
  errors: number
} {
  return {
    orders:      messages.filter(m => m.type === 'ORDERS' && m.status === 'PENDING').length,
    expeditions: messages.filter(m => m.type === 'DESADV').length,
    factures:    messages.filter(m => m.type === 'INVOIC' && m.status === 'PENDING').length,
    errors:      messages.filter(m => m.status === 'ERROR').length,
  }
}

const TYPE_LABELS: Record<EDIMessageType, string> = {
  ORDERS: 'Commande (ORDERS)',
  ORDRSP: 'Accusé réception (ORDRSP)',
  DESADV: 'Expédition (DESADV)',
  INVOIC: 'Facture (INVOIC)',
}

export function formatEDITypeLabel(type: EDIMessageType): string {
  return TYPE_LABELS[type]
}

const STATUS_LABELS: Record<EDIStatus, string> = {
  PENDING:  'En attente',
  SENT:     'Envoyé',
  RECEIVED: 'Reçu',
  ERROR:    'Erreur',
}

export function formatEDIStatusLabel(status: EDIStatus): string {
  return STATUS_LABELS[status]
}

const BUSINESS_STATUS: Record<EDIMessageType, string> = {
  ORDERS: 'Commande envoyée',
  ORDRSP: 'Réponse commande reçue',
  DESADV: 'Info expédition reçue',
  INVOIC: 'Facture reçue',
}

export function getBusinessStatus(type: EDIMessageType): string {
  return BUSINESS_STATUS[type]
}

function fmtEdifactDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '')
}

function fmtEdifactTime(iso: string): string {
  return iso.slice(11, 16).replace(':', '')
}

const EDIFACT_TEMPLATES: Record<EDIMessageType, (msg: EDIMessage) => string> = {
  ORDERS: (msg) => {
    const p = msg.payload as Partial<ORDERSPayload> & { totalQty?: number }
    const header = [
      `UNB+UNOC:3+301234XXXXXXX:14+GLN-DIFFUSEUR:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
      `UNH+1+ORDERS:D:96A:UN'`,
      `BGM+220+${msg.documentRef}+9'`,
      `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
      `NAD+BY+301234XXXXXXX::9'`,
      `NAD+SU+GLN-DIFFUSEUR::9'`,
    ]
    const lineSegments = Array.isArray(p.lines)
      ? p.lines.flatMap((line, i) => [
          `LIN+${i + 1}++${line.ean}:EN'`,
          `QTY+21:${line.qtyRequested}'`,
        ])
      : [`LIN+1++9782070360024:EN'`, `QTY+21:${p.totalQty ?? 5}'`]
    // UNT compte UNH→UNT inclus : (header - UNB) + lignes + UNS + UNT
    const untCount = header.length + lineSegments.length + 1
    const footer = [`UNS+S'`, `UNT+${untCount}+1'`, `UNZ+1+1'`]
    return [...header, ...lineSegments, ...footer].join('\n')
  },

  ORDRSP: (msg) => {
    const p = msg.payload as Partial<ORDRSPPayload>
    const lines = p.lines ?? []
    const bgmStatus = '4'
    const segments: string[] = [
      `UNB+UNOC:3+GLN-DIFFUSEUR:14+301234XXXXXXX:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
      `UNH+1+ORDRSP:D:96A:UN'`,
      `BGM+231+${msg.documentRef}+${bgmStatus}'`,
      `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
      `RFF+ON:${p.orderId ?? msg.documentRef}'`,
      `NAD+SE+GLN-DIFFUSEUR::9'`,
      `NAD+BY+301234XXXXXXX::9'`,
    ]
    if (p.rejectionReason) {
      segments.push(`FTX+ZZZ+++${p.rejectionReason}'`)
    }
    lines.forEach((line, i) => {
      segments.push(`LIN+${i + 1}++${line.ean}:EN'`)
      segments.push(`QTY+21:${line.qtyRequested}'`)
      segments.push(`QTY+1:${line.qtyConfirmed}'`)
      if (line.backorderQty) segments.push(`QTY+83:${line.backorderQty}'`)
      if (line.estimatedDelivery) segments.push(`DTM+358:${line.estimatedDelivery.replace(/-/g, '')}:102'`)
      if (line.note) segments.push(`FTX+ZZZ+++${line.note}'`)
    })
    segments.push(`UNS+S'`)
    // UNT : segments.length inclut UNB (non compté) mais pas UNT → net = segments.length
    segments.push(`UNT+${segments.length}+1'`)
    segments.push(`UNZ+1+1'`)
    return segments.join('\n')
  },

  DESADV: (msg) => {
    const p = msg.payload as Partial<DESADVPayload>
    const lines = p.lines ?? []
    const segments: string[] = [
      `UNB+UNOC:3+GLN-DIFFUSEUR:14+301234XXXXXXX:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
      `UNH+1+DESADV:D:96A:UN'`,
      `BGM+351+${p.desadvRef ?? msg.documentRef}'`,
      `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
      `DTM+11:${fmtEdifactDate(msg.createdAt)}:102'`,
    ]
    if (p.orderId) segments.push(`RFF+ON:${p.orderId}'`)
    lines.forEach((line, i) => {
      segments.push(`LIN+${i + 1}++${line.isbn}:EN'`)
      segments.push(`QTY+12:${line.qtyShipped}'`)
    })
    // UNT : segments.length - 1 (UNB non compté) + 1 (UNT lui-même) = segments.length
    segments.push(`UNT+${segments.length}+1'`)
    segments.push(`UNZ+1+1'`)
    return segments.join('\n')
  },

  INVOIC: (msg) => [
    `UNB+UNOC:3+GLN-DIFFUSEUR:14+301234XXXXXXX:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+INVOIC:D:96A:UN'`,
    `BGM+380+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `NAD+SE+GLN-DIFFUSEUR::9'`,
    `NAD+BY+301234XXXXXXX::9'`,
    `MOA+79:856.00:EUR'`,
    `TAX+7+VAT+++:::5.5+S'`,
    `UNS+S'`,
    `UNZ+8+1'`,
  ].join('\n'),
}

export function generateEdifactPlaceholder(msg: EDIMessage): string {
  return EDIFACT_TEMPLATES[msg.type](msg)
}
