/**
 * Register Page - World-Class Multi-Step Edition
 *
 * Uses the new MultiStepRegisterForm with email verification
 */

import { MultiStepRegisterForm } from '@/components/forms/MultiStepRegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            💖 Liefde Voor Iedereen
          </h1>
          <p className="text-gray-600">
            Vind je perfecte match. Begin vandaag nog!
          </p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <MultiStepRegisterForm />
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Heb je al een account?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Log hier in
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>100% Veilig & Privé</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            <span>Gratis Registratie</span>
          </div>
        </div>
      </div>
    </div>
  )
}
