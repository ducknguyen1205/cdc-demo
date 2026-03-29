import axios from 'axios'
import type { CdcEvent } from '../types/CdcEvent'

const api = axios.create({ baseURL: '/api' })

export const auditLogApi = {
  list: () => api.get<CdcEvent[]>('/audit-logs').then((r) => r.data),
  count: () => api.get<number>('/audit-logs/count').then((r) => r.data),
}
