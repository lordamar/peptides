import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

export default function HomePage() {
  const { user, profile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        <div className="relative bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">Research Peptides</h1>
              <p className="text-2xl mb-4">For Qualified Researchers Only</p>
              <p className="text-lg mb-8 max-w-3xl mx-auto">
                Access our comprehensive catalog of research-grade peptides for your scientific studies.
                All products are strictly for laboratory research purposes.
              </p>

              {!user ? (
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/login"
                    className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 text-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 text-lg border-2 border-white"
                  >
                    Request Researcher Access
                  </Link>
                </div>
              ) : profile?.account_status === 'approved' ? (
                <Link
                  to="/products"
                  className="inline-block bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 text-lg"
                >
                  Browse Products
                </Link>
              ) : (
                <div className="bg-yellow-500 text-yellow-900 px-6 py-3 rounded-lg inline-block">
                  Your account is pending approval
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border-2 border-red-600 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-red-800 mb-4 text-center">
              IMPORTANT: Research Use Only
            </h2>
            <div className="text-red-900 space-y-2">
              <p className="font-semibold">All products sold on this platform are:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>FOR RESEARCH PURPOSES ONLY</li>
                <li>NOT for human consumption or clinical use</li>
                <li>NOT intended for diagnostic or therapeutic purposes</li>
                <li>Only to be used by qualified researchers in approved laboratory settings</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Worldwide Shipping</h3>
              <p className="text-gray-700 mb-2">Flat rate $70 USD to any destination</p>
              <p className="text-sm text-gray-600">Fast and secure international delivery</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Assured</h3>
              <p className="text-gray-700 mb-2">Research-grade peptides</p>
              <p className="text-sm text-gray-600">Rigorous quality control and testing</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Checkout</h3>
              <p className="text-gray-700 mb-2">Encrypted payment processing</p>
              <p className="text-sm text-gray-600">Your data is protected</p>
            </div>
          </div>

          {!user && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Qualified Researcher Access Required
              </h2>
              <p className="text-gray-700 mb-4">
                To view our product catalog and pricing, you must create an account and be approved as a
                qualified researcher. Access is granted to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>University and academic researchers</li>
                <li>Government research institutions</li>
                <li>Private research laboratories</li>
                <li>Pharmaceutical research facilities</li>
              </ul>
              <Link
                to="/register"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
              >
                Apply for Access
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">
              &copy; 2025 Research Peptides. All rights reserved.
            </p>
            <p className="text-red-400 font-semibold">
              All products are for research use only - Not for human consumption
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
