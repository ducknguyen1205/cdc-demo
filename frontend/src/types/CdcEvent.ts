export type Operation = 'INSERT' | 'UPDATE' | 'DELETE' | 'SNAPSHOT'

export interface CdcEvent {
  eventId: string
  operation: Operation
  tableName: string
  timestamp: number
  lsn: string | null
  txId: number | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
}

export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  createdAt: string
  updatedAt: string
}

export interface ProductForm {
  name: string
  category: string
  price: string
  stock: string
}
