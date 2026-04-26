export type EDIMessageType = 'ORDERS' | 'ORDRSP' | 'DESADV' | 'INVOIC'
export type EDIStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'ERROR'

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

  ORDRSP: (msg) => [
    `UNB+UNOA:1+GLN-DIFFUSEUR:14+301234XXXXXXX:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+ORDRSP:D:96A:UN'`,
    `BGM+231+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `DOC+1+${msg.documentRef}'`,
    `RFF+ON:${msg.documentRef}'`,
    `UNS+S'`,
    `UNZ+6+1'`,
  ].join('\n'),

  DESADV: (msg) => [
    `UNB+UNOA:1+GLN-DIFFUSEUR:14+301234XXXXXXX:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
    `UNH+1+DESADV:D:96A:UN'`,
    `BGM+351+${msg.documentRef}+9'`,
    `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
    `CPS+1'`,
    `QTY+52:5'`,
    `UNS+S'`,
    `UNZ+6+1'`,
  ].join('\n'),

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
