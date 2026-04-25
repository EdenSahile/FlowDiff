import { MOCK_ORDERS, type Order, type Shipment } from '@/data/mockOrders'

const ALL_ORDERS: Order[] = Object.values(MOCK_ORDERS).flat()

export async function getOrders(codeClient: string): Promise<Order[]> {
  return ALL_ORDERS.filter(o => o.codeClient === codeClient)
}

export async function getOrderById(id: string): Promise<Order | null> {
  return ALL_ORDERS.find(o => o.id === id) ?? null
}

export async function getShipment(orderId: string): Promise<Shipment | null> {
  const order = ALL_ORDERS.find(o => o.id === orderId)
  return order?.shipment ?? null
}
