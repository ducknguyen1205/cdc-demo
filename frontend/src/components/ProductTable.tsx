import { useEffect, useState } from 'react'
import { productApi } from '../api/products'
import type { Product, ProductForm } from '../types/CdcEvent'

const EMPTY_FORM: ProductForm = { name: '', category: '', price: '', stock: '' }

export function ProductTable() {
  const [products, setProducts]     = useState<Product[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm]       = useState<ProductForm>(EMPTY_FORM)
  const [editId, setEditId]         = useState<number | null>(null)
  const [editForm, setEditForm]     = useState<ProductForm>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  const load = () => {
    productApi.list()
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    setSaving(true)
    try {
      const created = await productApi.create(addForm)
      setProducts((p) => [...p, created])
      setAddForm(EMPTY_FORM)
      setShowAddForm(false)
    } catch { setError('Failed to create product') }
    finally { setSaving(false) }
  }

  const startEdit = (p: Product) => {
    setEditId(p.id)
    setEditForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock) })
  }

  const handleUpdate = async (id: number) => {
    setSaving(true)
    try {
      const updated = await productApi.update(id, editForm)
      setProducts((ps) => ps.map((p) => p.id === id ? updated : p))
      setEditId(null)
    } catch { setError('Failed to update product') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id)
      setProducts((ps) => ps.filter((p) => p.id !== id))
    } catch { setError('Failed to delete product') }
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading products…</div>
  if (error)   return <div className="text-red-400 text-sm">{error}</div>

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-gray-200">Products Table <span className="text-gray-600">(public.products)</span></span>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs px-3 py-1.5 rounded bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
        >
          + Add Product
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-700">
              <th className="pb-2 pr-3 font-semibold">ID</th>
              <th className="pb-2 pr-3 font-semibold">Name</th>
              <th className="pb-2 pr-3 font-semibold">Category</th>
              <th className="pb-2 pr-3 font-semibold">Price</th>
              <th className="pb-2 pr-3 font-semibold">Stock</th>
              <th className="pb-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {showAddForm && (
              <tr className="border-b border-gray-800 bg-green-950/30">
                <td className="py-2 pr-3 text-gray-600">new</td>
                <td className="py-2 pr-2"><FormInput value={addForm.name}     onChange={(v) => setAddForm({ ...addForm, name: v })}     placeholder="Name" /></td>
                <td className="py-2 pr-2"><FormInput value={addForm.category} onChange={(v) => setAddForm({ ...addForm, category: v })} placeholder="Category" /></td>
                <td className="py-2 pr-2"><FormInput value={addForm.price}    onChange={(v) => setAddForm({ ...addForm, price: v })}    placeholder="0.00" type="number" /></td>
                <td className="py-2 pr-2"><FormInput value={addForm.stock}    onChange={(v) => setAddForm({ ...addForm, stock: v })}    placeholder="0" type="number" /></td>
                <td className="py-2">
                  <button onClick={handleAdd} disabled={saving} className="mr-2 text-green-400 hover:text-green-300 disabled:opacity-50">save</button>
                  <button onClick={() => setShowAddForm(false)} className="text-gray-600 hover:text-gray-400">cancel</button>
                </td>
              </tr>
            )}

            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="py-2 pr-3 text-gray-500">{p.id}</td>

                {editId === p.id ? (
                  <>
                    <td className="py-2 pr-2"><FormInput value={editForm.name}     onChange={(v) => setEditForm({ ...editForm, name: v })} /></td>
                    <td className="py-2 pr-2"><FormInput value={editForm.category} onChange={(v) => setEditForm({ ...editForm, category: v })} /></td>
                    <td className="py-2 pr-2"><FormInput value={editForm.price}    onChange={(v) => setEditForm({ ...editForm, price: v })} type="number" /></td>
                    <td className="py-2 pr-2"><FormInput value={editForm.stock}    onChange={(v) => setEditForm({ ...editForm, stock: v })} type="number" /></td>
                    <td className="py-2">
                      <button onClick={() => handleUpdate(p.id)} disabled={saving} className="mr-2 text-blue-400 hover:text-blue-300 disabled:opacity-50">save</button>
                      <button onClick={() => setEditId(null)} className="text-gray-600 hover:text-gray-400">cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pr-3 text-gray-200">{p.name}</td>
                    <td className="py-2 pr-3 text-gray-400">{p.category}</td>
                    <td className="py-2 pr-3 text-gray-300">${Number(p.price).toFixed(2)}</td>
                    <td className="py-2 pr-3 text-gray-300">{p.stock}</td>
                    <td className="py-2">
                      <button onClick={() => startEdit(p)} className="mr-3 text-blue-400 hover:text-blue-300 transition-colors">edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 transition-colors">delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !showAddForm && (
          <p className="text-center text-gray-600 text-sm mt-8">No products yet. Click "+ Add Product" to create one.</p>
        )}
      </div>
    </div>
  )
}

function FormInput({ value, onChange, placeholder, type = 'text' }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
    />
  )
}
