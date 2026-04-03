import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

interface Order {
  id: string
  order_number: string
  total: number
  created_at: string
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    if (!orderId) return

    const { data } = await supabase
      .from('orders')
      .select('id, order_number, total, created_at')
      .eq('id', orderId)
      .maybeSingle()

    if (data) setOrder(data)
    setLoading(false)
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-red-600">Order not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your order. Your order has been received and is being processed.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="text-sm text-gray-600 mb-2">Order Number</div>
            <div className="text-2xl font-bold text-gray-900 mb-4">{order.order_number}</div>

            <div className="text-sm text-gray-600 mb-2">Total Amount</div>
            <div className="text-3xl font-bold text-primary-600">${order.total.toFixed(2)} USD</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800">
              A confirmation email has been sent to your registered email address with order details.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/orders"
              className="block w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700"
            >
              View Order History
            </Link>
            <Link
              to="/products"
              className="block w-full bg-white text-primary-600 py-3 px-6 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
