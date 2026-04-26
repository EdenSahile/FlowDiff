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
