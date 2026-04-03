import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

interface Product {
  id: string
  sku: string
  product_name: string
  specification: string | null
  cost_price: number
  sell_price: number
  stock_quantity: number
  is_active: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    product_name: '',
    specification: '',
    cost_price: '',
    sell_price: '',
    stock_quantity: '100',
    is_active: true
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('product_name')

    if (error) {
      console.error('Error fetching products:', error)
    }

    if (data) {
      setProducts(data)
    }
    setLoading(false)
  }

  const calculateMarkup = (costPrice: number, sellPrice: number) => {
    if (costPrice === 0) return 0
    return ((sellPrice - costPrice) / costPrice * 100).toFixed(2)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsAddingNew(false)
    setFormData({
      sku: product.sku,
      product_name: product.product_name,
      specification: product.specification || '',
      cost_price: product.cost_price.toString(),
      sell_price: product.sell_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      is_active: product.is_active
    })
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingProduct(null)
    setFormData({
      sku: '',
      product_name: '',
      specification: '',
      cost_price: '',
      sell_price: '',
      stock_quantity: '100',
      is_active: true
    })
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setIsAddingNew(false)
    setFormData({
      sku: '',
      product_name: '',
      specification: '',
      cost_price: '',
      sell_price: '',
      stock_quantity: '100',
      is_active: true
    })
  }

  const handleSave = async () => {
    if (isAddingNew) {
      const { error } = await supabase
        .from('products')
        .insert({
          sku: formData.sku,
          product_name: formData.product_name,
          specification: formData.specification || null,
          cost_price: parseFloat(formData.cost_price),
          sell_price: parseFloat(formData.sell_price),
          stock_quantity: parseInt(formData.stock_quantity),
          is_active: formData.is_active
        })

      if (error) {
        console.error('Error adding product:', error)
        alert('Error adding product: ' + error.message)
      } else {
        handleCancel()
        fetchProducts()
      }
    } else if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update({
          sku: formData.sku,
          product_name: formData.product_name,
          specification: formData.specification || null,
          cost_price: parseFloat(formData.cost_price),
          sell_price: parseFloat(formData.sell_price),
          stock_quantity: parseInt(formData.stock_quantity),
          is_active: formData.is_active
        })
        .eq('id', editingProduct.id)

      if (error) {
        console.error('Error updating product:', error)
        alert('Error updating product: ' + error.message)
      } else {
        handleCancel()
        fetchProducts()
      }
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product: ' + error.message)
    } else {
      fetchProducts()
    }
  }

  const currentMarkup = formData.cost_price && formData.sell_price
    ? calculateMarkup(parseFloat(formData.cost_price), parseFloat(formData.sell_price))
    : '0.00'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Add New Product
          </button>
        </div>

        {(editingProduct || isAddingNew) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {isAddingNew ? 'Add New Product' : 'Edit Product'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SM05"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Semaglutide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specification</label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5mg*10vials"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sell_price}
                  onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-lg font-semibold text-blue-900">
                    Markup: {currentMarkup}%
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Active (visible to customers)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spec</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sell</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Markup</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.product_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.specification}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${product.cost_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${product.sell_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {calculateMarkup(product.cost_price, product.sell_price)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock_quantity}</td>
                    <td className="px-6 py-4 text-sm">
                      {product.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
