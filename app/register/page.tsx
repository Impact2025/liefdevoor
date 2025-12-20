/**
 * Register Page - World-Class Edition
 *
 * Premium registration experience with logo and brand colors
 */

import { MultiStepRegisterForm } from '@/components/forms/MultiStepRegisterForm'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={280}
              height={80}
              priority
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            Vind je perfecte match. Begin vandaag nog!
          </p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-slate-100">
          <MultiStepRegisterForm />
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>100% Veilig</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>Gratis Registratie</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>1000+ Matches</span>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>
            Door te registreren ga je akkoord met onze{' '}
            <Link href="/terms" className="text-rose-500 hover:underline">
              voorwaarden
            </Link>{' '}
            en{' '}
            <Link href="/privacy" className="text-rose-500 hover:underline">
              privacybeleid
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
