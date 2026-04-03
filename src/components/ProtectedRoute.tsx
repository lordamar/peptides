import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.account_status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Account Rejected</h2>
          <p className="text-gray-700">
            Your researcher account application has been rejected. Please contact support for more information.
          </p>
        </div>
      </div>
    )
  }

  if (profile?.account_status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Account Pending Approval</h2>
          <p className="text-gray-700 mb-4">
            Your researcher account is currently under review. You will be notified via email once your account has been approved.
          </p>
          <p className="text-sm text-gray-600">
            This process typically takes 1-2 business days.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
