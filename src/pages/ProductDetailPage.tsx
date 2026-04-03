import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import DisclaimerModal from '../components/DisclaimerModal'

interface Product {
  id: string
  sku: string
  product_name: string
  specification: string
  sell_price: number
  description: string
  research_applications: string
  storage_requirements: string
  reconstitution_guide: string
  stock_quantity: number
}

export default function ProductDetailPage() {
  const { sku } = useParams<{ sku: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sku) {
      checkDisclaimerStatus()
      fetchProduct()
    }
  }, [sku])

  const checkDisclaimerStatus = async () => {
    if (!user) return

    const { data } = await supabase
      .from('disclaimer_acceptances')
      .select('*')
      .eq('user_id', user.id)
      .eq('disclaimer_type', 'product_view')
      .eq('product_sku', sku)
      .maybeSingle()

    if (data) {
      setDisclaimerAccepted(true)
    } else {
      setShowDisclaimer(true)
    }
  }

  const fetchProduct = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .eq('is_active', true)
      .maybeSingle()

    if (data) setProduct(data)
    setLoading(false)
  }

  const handleDisclaimerAccept = async () => {
    if (!user || !sku) return

    await supabase.from('disclaimer_acceptances').insert({
      user_id: user.id,
      disclaimer_type: 'product_view',
      product_sku: sku,
      ip_address: '',
    })

    setDisclaimerAccepted(true)
    setShowDisclaimer(false)
  }

  const handleDisclaimerDecline = () => {
    navigate('/products')
  }

  const handleAddToCart = () => {
    navigate('/cart', { state: { addProduct: { sku, quantity } } })
  }

  if (!disclaimerAccepted) {
    return (
      <>
        <Navbar />
        <DisclaimerModal
          isOpen={showDisclaimer}
          onAccept={handleDisclaimerAccept}
          onDecline={handleDisclaimerDecline}
          type="product_view"
        />
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-xl">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-red-600">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 mb-6">
          <p className="text-red-900 font-semibold text-center">
            FOR RESEARCH USE ONLY - NOT FOR HUMAN CONSUMPTION
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">SKU: {product.sku}</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.product_name}</h1>
              <p className="text-xl text-gray-600">{product.specification}</p>
            </div>

            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div>
                <span className="text-4xl font-bold text-primary-600">
                  ${product.sell_price.toFixed(2)}
                </span>
                <p className="text-sm text-gray-500 mt-1">Per box</p>
              </div>
              <div>
                {product.stock_quantity > 0 ? (
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                    In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                <p className="text-gray-700 mb-6">{product.description}</p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Research Applications</h3>
                <p className="text-gray-700">{product.research_applications}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Storage Requirements</h3>
                <p className="text-gray-700 mb-6">{product.storage_requirements}</p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Reconstitution Guide</h3>
                <p className="text-gray-700">{product.reconstitution_guide}</p>
              </div>
            </div>

            {product.stock_quantity > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add to Cart</h3>
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 mt-6"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
