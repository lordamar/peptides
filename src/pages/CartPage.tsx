import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import DisclaimerModal from '../components/DisclaimerModal'

interface CartItem {
  id: string
  product_sku: string
  quantity: number
  disclaimer_acknowledged: boolean
  product: {
    product_name: string
    specification: string
    sell_price: number
    stock_quantity: number
  }
}

export default function CartPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<{ sku: string; quantity: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const SHIPPING_FEE = 70.00

  useEffect(() => {
    fetchCart()

    const addProduct = (location.state as any)?.addProduct
    if (addProduct) {
      setPendingProduct(addProduct)
      setShowDisclaimer(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const fetchCart = async () => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_sku,
        quantity,
        disclaimer_acknowledged,
        products!inner (
          product_name,
          specification,
          sell_price,
          stock_quantity
        )
      `)
      .eq('user_id', user.id)

    if (data) {
      const formattedData = data.map((item: any) => ({
        id: item.id,
        product_sku: item.product_sku,
        quantity: item.quantity,
        disclaimer_acknowledged: item.disclaimer_acknowledged,
        product: Array.isArray(item.products) ? item.products[0] : item.products,
      }))
      setCartItems(formattedData)
    }
    setLoading(false)
  }

  const handleDisclaimerAccept = async () => {
    if (!user || !pendingProduct) return

    await supabase.from('disclaimer_acceptances').insert({
      user_id: user.id,
      disclaimer_type: 'add_to_cart',
      product_sku: pendingProduct.sku,
      ip_address: '',
    })

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_sku', pendingProduct.sku)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + pendingProduct.quantity })
        .eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_sku: pendingProduct.sku,
        quantity: pendingProduct.quantity,
        disclaimer_acknowledged: true,
      })
    }

    setShowDisclaimer(false)
    setPendingProduct(null)
    fetchCart()
  }

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false)
    setPendingProduct(null)
    navigate('/products')
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId)

    fetchCart()
  }

  const handleQuantityInputChange = async (itemId: string, value: string, maxStock: number) => {
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue < 1) return

    const clampedValue = Math.min(numValue, maxStock)

    await supabase
      .from('cart_items')
      .update({ quantity: clampedValue })
      .eq('id', itemId)

    fetchCart()
  }

  const handleRemoveItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId)
    fetchCart()
  }

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product.sell_price * item.quantity)
  }, 0)

  const total = subtotal + SHIPPING_FEE

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-xl">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
        type="add_to_cart"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{item.product.product_name}</h3>
                      <p className="text-sm text-gray-600">{item.product.specification}</p>
                      <p className="text-sm text-gray-500 mt-1">SKU: {item.product_sku}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock_quantity}
                        value={item.quantity}
                        onChange={(e) => handleQuantityInputChange(item.id, e.target.value, item.product.stock_quantity)}
                        className="w-16 text-center font-medium border border-gray-300 rounded-lg py-1"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        disabled={item.quantity >= item.product.stock_quantity}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        ${item.product.sell_price.toFixed(2)} each
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ${(item.product.sell_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping (Flat Rate - Worldwide)</span>
                    <span>${SHIPPING_FEE.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)} USD</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full bg-white text-primary-600 py-3 px-6 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
