import {
  MOCK_RETURNS,
  type ReturnRequest,
  type CreateReturnPayload,
  type ReturnsStats,
} from '@/data/mockReturns'
import { MOCK_ORDERS } from '@/data/mockOrders'

const _returns: ReturnRequest[] = [...MOCK_RETURNS]
let _nextId = 20

export async function getReturns(codeClient: string): Promise<ReturnRequest[]> {
  return _returns.filter(r => r.codeClient === codeClient)
}

export async function getReturnById(id: string): Promise<ReturnRequest | null> {
  return _returns.find(r => r.id === id) ?? null
}

export async function createReturn(payload: CreateReturnPayload): Promise<ReturnRequest> {
  const newReturn: ReturnRequest = {
    id: `RET-2025-${String(_nextId++).padStart(4, '0')}`,
    codeClient: payload.codeClient,
    orderId: payload.orderId,
    orderNumero: payload.orderNumero,
    status: 'pending',
    items: payload.items,
    notes: payload.notes,
    blNumber: null,
    blGeneratedAt: null,
    avoirAmount: null,
    avoirGeneratedAt: null,
    refusalReason: null,
    createdAt: new Date().toISOString(),
  }
  _returns.push(newReturn)
  return newReturn
}

export async function getReturnsStats(codeClient: string): Promise<ReturnsStats> {
  const clientReturns = _returns.filter(r => r.codeClient === codeClient)
  const totalOrders = Object.values(MOCK_ORDERS).flat().filter(o => o.codeClient === codeClient).length
  const currentYear = new Date().getFullYear()

  const activeCount = clientReturns.filter(r => r.status === 'pending' || r.status === 'in_transit').length

  const avoirYTD = clientReturns
    .filter(r => r.avoirGeneratedAt && new Date(r.avoirGeneratedAt).getFullYear() === currentYear)
    .reduce((sum, r) => sum + (r.avoirAmount ?? 0), 0)

  const returnRatio = totalOrders > 0 ? clientReturns.length / totalOrders : 0

  return { activeCount, avoirYTD, returnRatio, sectorAverage: 0.22 }
}
