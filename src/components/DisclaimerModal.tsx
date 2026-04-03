import { useState } from 'react'

interface DisclaimerModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
  type: 'product_view' | 'add_to_cart' | 'checkout'
}

export default function DisclaimerModal({ isOpen, onAccept, onDecline, type }: DisclaimerModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  if (!isOpen) return null

  const getTitle = () => {
    switch (type) {
      case 'product_view':
        return 'Research Use Disclaimer'
      case 'add_to_cart':
        return 'Add to Cart - Confirm Research Use'
      case 'checkout':
        return 'Final Checkout Disclaimer'
      default:
        return 'Disclaimer'
    }
  }

  const getMessage = () => {
    switch (type) {
      case 'product_view':
        return 'Before viewing product details, you must acknowledge that all products are for research purposes only.'
      case 'add_to_cart':
        return 'Before adding this item to your cart, please confirm your understanding of the research-only nature of these products.'
      case 'checkout':
        return 'This is your final acknowledgment before completing your purchase. Please read carefully.'
      default:
        return ''
    }
  }

  const handleAccept = () => {
    if (!agreedToTerms) return
    onAccept()
    setAgreedToTerms(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{getTitle()}</h2>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">{getMessage()}</p>

            <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-red-800 mb-2">IMPORTANT WARNING</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-red-900">
                <li>These products are FOR RESEARCH USE ONLY</li>
                <li>NOT for human consumption or use</li>
                <li>NOT intended for diagnostic or therapeutic purposes</li>
                <li>Should only be handled by qualified researchers</li>
                <li>Must be used in compliance with all applicable laws and regulations</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Researcher Obligations:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>You are a qualified researcher with appropriate credentials</li>
                <li>You have institutional approval for your research</li>
                <li>You will handle these materials in a professional laboratory setting</li>
                <li>You will follow all safety protocols and guidelines</li>
                <li>You understand the legal implications of misuse</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-700 cursor-pointer">
                I acknowledge that I am a qualified researcher and these products are for RESEARCH USE ONLY,
                NOT for human consumption. I understand and accept the terms outlined above.
              </label>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAccept}
              disabled={!agreedToTerms}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold ${
                agreedToTerms
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              I Agree - Continue
            </button>
            <button
              onClick={onDecline}
              className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
