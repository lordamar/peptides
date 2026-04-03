import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

interface PendingUser {
  id: string
  full_name: string
  institution: string
  country: string
  created_at: string
}

interface Order {
  id: string
  order_number: string
  total: number
  order_status: string
  created_at: string
  users: {
    full_name: string
  }
}

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingUsers()
    fetchOrders()
  }, [])

  const fetchPendingUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, institution, country, created_at')
      .eq('account_status', 'pending')
      .order('created_at', { ascending: false })

    if (data) setPendingUsers(data)
  }

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total,
        order_status,
        created_at,
        users!inner (
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      const formattedData = data.map((order: any) => ({
        ...order,
        users: Array.isArray(order.users) ? order.users[0] : order.users,
      }))
      setOrders(formattedData)
    }
    setLoading(false)
  }

  const handleApproveUser = async (userId: string) => {
    await supabase
      .from('users')
      .update({ account_status: 'approved' })
      .eq('id', userId)

    fetchPendingUsers()
  }

  const handleRejectUser = async (userId: string) => {
    await supabase
      .from('users')
      .update({ account_status: 'rejected' })
      .eq('id', userId)

    fetchPendingUsers()
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId)

    fetchOrders()
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending User Approvals ({pendingUsers.length})
          </h2>

          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">No pending user approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">Institution: {user.institution}</p>
                      <p className="text-sm text-gray-600">Country: {user.country}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Applied: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Orders</h2>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.users.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary-600 hover:text-primary-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
