export type EDIMessageType = 'ORDERS' | 'ORDRSP' | 'DESADV' | 'INVOIC'
export type EDIStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'ERROR'
export type ORDRSPLineStatus = 'ACCEPTED' | 'BACKORDERED' | 'REJECTED'
export type ORDRSPGlobalStatus = 'ACCEPTED' | 'PARTIAL' | 'REJECTED'

export interface DESADVLine {
  isbn: string
  qtyShipped: number
}

export interface DESADVPayload {
  desadvRef: string
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
  ORDERS: (msg) => [
    `UNB+UNOA:1+301234XXXXXXX:14+GLN-DIFFUSEUR:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+ORDERS:D:96A:UN'`,
    `BGM+220+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `NAD+BY+301234XXXXXXX::9'`,
    `NAD+SU+GLN-DIFFUSEUR::9'`,
    `LIN+1++9782070360024:EN'`,
    `QTY+21:5'`,
    `UNS+S'`,
    `UNZ+8+1'`,
  ].join('\n'),

  ORDRSP: (msg) => {
    const p = msg.payload as Partial<ORDRSPPayload>
    const lines = p.lines ?? []
    const bgmStatus = p.globalStatus === 'REJECTED' ? '5' : '4'
    const segments: string[] = [
      `UNB+UNOA:1+GLN-DIFFUSEUR:14+301234XXXXXXX:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
      `UNH+1+ORDRSP:D:96A:UN'`,
      `BGM+231+${msg.documentRef}+${bgmStatus}'`,
      `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
      `RFF+ON:${p.orderId ?? msg.documentRef}'`,
    ]
    if (p.rejectionReason) {
      segments.push(`FTX+ZZZ+++${p.rejectionReason}'`)
    }
    lines.forEach((line, i) => {
      segments.push(`LIN+${i + 1}++${line.ean}:EN'`)
      segments.push(`QTY+21:${line.qtyConfirmed}'`)
      segments.push(`QTY+1:${line.qtyRequested}'`)
      if (line.backorderQty) segments.push(`QTY+83:${line.backorderQty}'`)
      if (line.estimatedDelivery) segments.push(`DTM+358:${line.estimatedDelivery.replace(/-/g, '')}:102'`)
      segments.push(`PIA+1+${line.status}:ZZZ'`)
      if (line.note) segments.push(`FTX+ZZZ+++${line.note}'`)
    })
    segments.push(`UNS+S'`)
    segments.push(`UNZ+${segments.length}+1'`)
    return segments.join('\n')
  },

  DESADV: (msg) => {
    const p = msg.payload as Partial<DESADVPayload>
    const lines = p.lines ?? []
    const segments: string[] = [
      `UNH+1+DESADV:D:96A:UN'`,
      `BGM+351+${p.desadvRef ?? msg.documentRef}'`,
    ]
    lines.forEach((line, i) => {
      segments.push(`LIN+${i + 1}++${line.isbn}:EN'`)
      segments.push(`QTY+52:${line.qtyShipped}'`)
    })
    segments.push(`UNT+${segments.length + 1}+1'`)
    return segments.join('\n')
  },

  INVOIC: (msg) => [
    `UNB+UNOA:1+GLN-DIFFUSEUR:14+301234XXXXXXX:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
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
