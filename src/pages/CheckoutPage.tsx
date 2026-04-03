import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import DisclaimerModal from '../components/DisclaimerModal'

interface CartItem {
  id: string
  product_sku: string
  quantity: number
  product: {
    product_name: string
    specification: string
    sell_price: number
  }
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [disclaimer1, setDisclaimer1] = useState(false)
  const [disclaimer2, setDisclaimer2] = useState(false)
  const [disclaimer3, setDisclaimer3] = useState(false)

  const SHIPPING_FEE = 70.00

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_sku,
        quantity,
        products!inner (
          product_name,
          specification,
          sell_price
        )
      `)
      .eq('user_id', user.id)

    if (data && data.length > 0) {
      const formattedData = data.map((item: any) => ({
        id: item.id,
        product_sku: item.product_sku,
        quantity: item.quantity,
        product: Array.isArray(item.products) ? item.products[0] : item.products,
      }))
      setCartItems(formattedData)
    } else {
      navigate('/cart')
    }
    setLoading(false)
  }

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product.sell_price * item.quantity)
  }, 0)

  const total = subtotal + SHIPPING_FEE

  const handlePlaceOrder = () => {
    if (!disclaimer1 || !disclaimer2 || !disclaimer3) {
      alert('Please accept all disclaimers before proceeding')
      return
    }

    if (!fullName || !streetAddress || !city || !postalCode || !country || !phoneNumber) {
      alert('Please fill in all required address fields')
      return
    }

    setShowDisclaimer(true)
  }

  const handleFinalDisclaimerAccept = async () => {
    if (!user) return

    try {
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          address_type: 'shipping',
          full_name: fullName,
          street_address: streetAddress,
          city,
          state_province: stateProvince,
          postal_code: postalCode,
          country,
          phone_number: phoneNumber,
          is_default: false,
        })
        .select()
        .single()

      if (addressError) throw addressError

      const orderNumber = `RP${Date.now()}`

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          subtotal,
          shipping_fee: SHIPPING_FEE,
          total,
          order_status: 'pending',
          shipping_address_id: addressData.id,
          checkout_disclaimer_accepted: true,
        })
        .select()
        .single()

      if (orderError) throw orderError

      for (const item of cartItems) {
        await supabase.from('order_items').insert({
          order_id: orderData.id,
          product_sku: item.product_sku,
          product_name: item.product.product_name,
          specification: item.product.specification,
          quantity: item.quantity,
          price_at_purchase: item.product.sell_price,
          line_total: item.product.sell_price * item.quantity,
        })

        await supabase
          .from('products')
          .update({
            stock_quantity: supabase.rpc('decrement_stock', {
              p_sku: item.product_sku,
              p_quantity: item.quantity,
            }),
          })
          .eq('sku', item.product_sku)
      }

      await supabase.from('disclaimer_acceptances').insert({
        user_id: user.id,
        disclaimer_type: 'checkout',
        ip_address: '',
      })

      await supabase.from('cart_items').delete().eq('user_id', user.id)

      navigate(`/order-confirmation/${orderData.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const handleFinalDisclaimerDecline = () => {
    setShowDisclaimer(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleFinalDisclaimerAccept}
        onDecline={handleFinalDisclaimerDecline}
        type="checkout"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Final Disclaimers</h2>
              <p className="text-red-900 mb-4">
                Before completing your order, you must acknowledge the following:
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="disclaimer1"
                    checked={disclaimer1}
                    onChange={(e) => setDisclaimer1(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <label htmlFor="disclaimer1" className="text-sm text-red-900 cursor-pointer">
                    I confirm these products are for qualified research purposes ONLY
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="disclaimer2"
                    checked={disclaimer2}
                    onChange={(e) => setDisclaimer2(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <label htmlFor="disclaimer2" className="text-sm text-red-900 cursor-pointer">
                    I acknowledge these products are NOT for human consumption
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="disclaimer3"
                    checked={disclaimer3}
                    onChange={(e) => setDisclaimer3(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <label htmlFor="disclaimer3" className="text-sm text-red-900 cursor-pointer">
                    I am a qualified researcher with proper authorization
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product.product_name} x{item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${(item.product.sell_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="border-t pt-3 flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>${SHIPPING_FEE.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)} USD</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!disclaimer1 || !disclaimer2 || !disclaimer3}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Place Order
              </button>

              <p className="text-xs text-gray-600 mt-4 text-center">
                Payment processing will be handled securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
