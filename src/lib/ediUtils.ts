export type EDIMessageType = 'ORDERS' | 'ORDRSP' | 'DESADV' | 'INVOIC'
export type EDIStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'ERROR'
export type ORDRSPLineStatus = 'ACCEPTED' | 'BACKORDERED' | 'REJECTED'
export type ORDRSPGlobalStatus = 'ACCEPTED' | 'PARTIAL' | 'REJECTED'

export interface ORDERSLine {
  lineNumber: number
  ean: string
  title: string
  qtyRequested: number
  referenceLigne?: string
  authors?: string[]
  publisher?: string
  publishYear?: string
}

export interface ORDERSPayload {
  orderId: string
  diffuseur: string
  lines: ORDERSLine[]
  referenceGlobale?: string
  clientCode?: string
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

export interface INVOICLine {
  ean: string
  title: string
  qty: number
  unitPriceTTC: number
  author?: string
}

export interface INVOICPayload {
  invoiceRef: string
  amountTTC: number
  currency: string
  orderIds: string[]
  lines: INVOICLine[]
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

export function messageContainsISBN(msg: EDIMessage, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (msg.documentRef?.toLowerCase().includes(q)) return true
  if (msg.orderId?.toLowerCase().includes(q)) return true
  if (msg.type === 'ORDERS' || msg.type === 'ORDRSP') {
    const p = msg.payload as Partial<ORDERSPayload & ORDRSPPayload>
    if ((p as Partial<ORDERSPayload>).orderId?.toLowerCase().includes(q)) return true
    return (p.lines ?? []).some(l => (l as ORDERSLine | ORDRSPLine).ean.includes(q))
  }
  if (msg.type === 'DESADV') {
    const p = msg.payload as Partial<DESADVPayload>
    if (p.orderId?.toLowerCase().includes(q)) return true
    return (p.lines ?? []).some(l => l.isbn.includes(q))
  }
  if (msg.type === 'INVOIC') {
    const p = msg.payload as Partial<INVOICPayload>
    if ((p.orderIds ?? []).some(id => id.toLowerCase().includes(q))) return true
    return (p.lines ?? []).some(l => l.ean.includes(q))
  }
  return false
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

export function isDesadvPartial(msg: EDIMessage, messages: EDIMessage[]): boolean {
  if (msg.type !== 'DESADV') return false
  const orderId = (msg.payload as DESADVPayload).orderId
  if (!orderId) return false
  const { grouped } = groupDESADVByOrder(messages)
  const group = grouped.find(g => g.orderId === orderId)
  return group ? group.globalStatus === 'EN_COURS' : false
}

export function countPendingPartialExpeditions(messages: EDIMessage[], seenIds: Set<string>): number {
  const { grouped } = groupDESADVByOrder(messages)
  return grouped
    .filter(g => g.globalStatus === 'EN_COURS')
    .flatMap(g => g.desadvs)
    .filter(d => !seenIds.has(d.id))
    .length
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

function escEdifact(s: string): string {
  return s.replace(/[?+:']/g, c => `?${c}`)
}

const BUYER_GLN = 'ClientGLN'
const SUPPLIER_GLN = 'DiffuseurGLN'

// Retourne les segments IMD 009/010/011 pour le premier auteur
function parseAuthorImd(author: string): string[] {
  const parts = author.trim().split(/\s+/)
  if (parts.length < 2) {
    return [
      `IMD+L+009+:::${escEdifact(author + '.')}'`,
      `IMD+L+010+:::${escEdifact(author)}'`,
    ]
  }
  const lastName  = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')
  return [
    `IMD+L+009+:::${escEdifact(`${lastName}, ${firstName}.`)}'`,
    `IMD+L+010+:::${escEdifact(lastName)}'`,
    `IMD+L+011+:::${escEdifact(firstName)}'`,
  ]
}

// Découpe un titre long en segments IMD+L+050 (35 chars desc + 35 chars continuation par segment)
function titleToImd050(title: string): string[] {
  const escaped = escEdifact(title)
  if (escaped.length <= 35) return [`IMD+L+050+:::${escaped}'`]
  const segments: string[] = []
  let remaining = escaped
  while (remaining.length > 0) {
    const desc = remaining.slice(0, 35)
    remaining  = remaining.slice(35)
    if (remaining.length > 0) {
      const cont = remaining.slice(0, 35)
      remaining  = remaining.slice(35)
      segments.push(`IMD+L+050+:::${desc}:${cont}'`)
    } else {
      segments.push(`IMD+L+050+:::${desc}'`)
    }
  }
  return segments
}

const EDIFACT_TEMPLATES: Record<EDIMessageType, (msg: EDIMessage) => string> = {
  ORDERS: (msg) => {
    const p = msg.payload as Partial<ORDERSPayload> & { totalQty?: number }
    const lineCount = Array.isArray(p.lines) ? p.lines.length : 1
    const totalQty  = Array.isArray(p.lines)
      ? p.lines.reduce((s, l) => s + l.qtyRequested, 0)
      : (p.totalQty ?? 5)
    const header = [
      `UNB+UNOC:3+${BUYER_GLN}:14+${SUPPLIER_GLN}:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+1'`,
      `UNH+${msg.documentRef}+ORDERS:D:96A:UN:EAN008'`,
      `BGM+220+${msg.documentRef}+9'`,
      `DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`,
      `NAD+BY+${BUYER_GLN}::9'`,
      `NAD+SU+${SUPPLIER_GLN}::9'`,
      ...(p.clientCode ? [`RFF+API:${escEdifact(p.clientCode)}'`] : []),
      `CUX+2:EUR:9'`,
      ...(p.referenceGlobale ? [`RFF+CR:${escEdifact(p.referenceGlobale)}'`] : []),
    ]
    const lineSegments = Array.isArray(p.lines)
      ? p.lines.flatMap((line, i) => {
          const authorImds    = line.authors?.length ? parseAuthorImd(line.authors[0]) : []
          const publisherImds = line.publisher ? [`IMD+L+109+:::${escEdifact(line.publisher)}'`] : []
          const yearImds      = line.publishYear ? [`IMD+L+170+:::${line.publishYear}'`] : []
          return [
            `LIN+${i + 1}++${line.ean}:EN'`,
            `PIA+5+${line.ean}:IB'`,
            ...authorImds,
            ...titleToImd050(line.title),
            ...publisherImds,
            `IMD+L+180+:::Livre'`,
            ...yearImds,
            `QTY+21:${line.qtyRequested}'`,
            ...(line.referenceLigne ? [`RFF+LI:${escEdifact(line.referenceLigne)}'`] : []),
          ]
        })
      : [
          `LIN+1++9782070360024:EN'`,
          `PIA+5+9782070360024:IB'`,
          `IMD+L+050+:::Titre non renseigné'`,
          `IMD+L+180+:::Livre'`,
          `QTY+21:${p.totalQty ?? 5}'`,
        ]
    // UNT = segments UNH→UNT inclus : (header - UNB) + lignes + UNS + CNT×2 + UNT
    const untCount = header.length + lineSegments.length + 3
    const footer = [
      `UNS+S'`,
      `CNT+1:${lineCount}'`,
      `CNT+2:${totalQty}'`,
      `UNT+${untCount}+${msg.documentRef}'`,
      `UNZ+1+1'`,
    ]
    return [`UNA:+.? '`, ...header, ...lineSegments, ...footer].join('\n')
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
      `CPS+1'`,
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

  INVOIC: (msg) => {
    const p        = msg.payload as Partial<INVOICPayload>
    const lines    = p.lines    ?? []
    const orderIds = p.orderIds ?? []
    const currency = p.currency ?? 'EUR'

    const grandTotal = lines.reduce((s, l) => s + l.unitPriceTTC * l.qty, 0).toFixed(2)

    /* Segments UNH→UNT (UNB et UNA ajoutés à l'extérieur) */
    const seg: string[] = []

    seg.push(`UNH+${msg.documentRef}+INVOIC:D:96A:UN:EAN008'`)
    seg.push(`BGM+380+${msg.documentRef}+9'`)
    seg.push(`DTM+137:${fmtEdifactDate(msg.createdAt)}:102'`)

    /* Parties — acheteur d'abord, puis fournisseur */
    seg.push(`NAD+BY+${BUYER_GLN}::9'`)
    seg.push(`RFF+API:${BUYER_GLN}'`)
    seg.push(`NAD+SU+${SUPPLIER_GLN}::9'`)
    seg.push(`RFF+API:${SUPPLIER_GLN}'`)

    /* Devise */
    seg.push(`CUX+2:${currency}:3'`)

    /* Références des commandes couvertes par cette facture */
    orderIds.forEach(id => seg.push(`RFF+ON:${id}'`))

    /* Lignes articles */
    lines.forEach((line, i) => {
      const lineTotal = (line.qty * line.unitPriceTTC).toFixed(2)
      seg.push(`LIN+${i + 1}++${line.ean}:EN'`)
      seg.push(`PIA+5+${line.ean}:SA'`)
      if (line.author) seg.push(...parseAuthorImd(line.author))
      seg.push(...titleToImd050(line.title))
      seg.push(`QTY+47:${line.qty}'`)
      seg.push(`MOA+146:${lineTotal}:${currency}'`)
      seg.push(`MOA+203:${lineTotal}:${currency}'`)
      seg.push(`PRI+AAB:${line.unitPriceTTC}'`)
    })

    /* Récapitulatif */
    seg.push(`UNS+S'`)
    seg.push(`CNT+1:${lines.length}'`)
    seg.push(`MOA+79:${grandTotal}:${currency}'`)
    seg.push(`MOA+9:${grandTotal}:${currency}'`)

    /* UNT : compte tous les segments UNH→UNT inclus */
    seg.push(`UNT+${seg.length + 1}+${msg.documentRef}'`)

    return [
      `UNA:+.? '`,
      `UNB+UNOC:3+${SUPPLIER_GLN}:14+${BUYER_GLN}:14+${fmtEdifactDate(msg.createdAt)}:${fmtEdifactTime(msg.createdAt)}+${msg.documentRef}'`,
      ...seg,
      `UNZ+1+${msg.documentRef}'`,
    ].join('\n')
  },
}

export function generateEdifactPlaceholder(msg: EDIMessage): string {
  return EDIFACT_TEMPLATES[msg.type](msg)
}
