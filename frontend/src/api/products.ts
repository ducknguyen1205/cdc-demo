import axios from 'axios'
import type { Product, ProductForm } from '../types/CdcEvent'

const api = axios.create({ baseURL: '/api' })

export const productApi = {
  list: () => api.get<Product[]>('/products').then((r) => r.data),

  create: (form: ProductForm) =>
    api.post<Product>('/products', {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    }).then((r) => r.data),

  update: (id: number, form: ProductForm) =>
    api.put<Product>(`/products/${id}`, {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    }).then((r) => r.data),

  delete: (id: number) => api.delete(`/products/${id}`),
}
