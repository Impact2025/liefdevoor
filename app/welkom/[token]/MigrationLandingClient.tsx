'use client'

/**
 * Migration Landing Page Client Component - OPTIMIZED V2
 *
 * Optimizations:
 * - Prominent incentive above form (↑ visibility)
 * - Larger CTA with urgency (↑ conversions)
 * - Better social proof positioning (↑ trust)
 * - Reduced friction: single password + strength indicator (↓ abandonment)
 * - Countdown timer for urgency (↑ FOMO)
 *
 * Expected: 65% → 75%+ conversion (landing → activation)
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MigrationData {
  firstName: string
  lastName?: string
  email: string
  profilePhoto?: string
  memberSince: string
  photoCount: number
  messageCount: number
  matchCount: number
  segment: string
  couponCode?: string
  couponExpiresAt?: string
  daysRemaining: number
  incentive: {
    premiumMonths: number
    superMessages: number
  }
  socialProof: {
    activatedCount: number
    recentCount: number
  }
}

interface Props {
  token: string
}

export function MigrationLandingClient({ token }: Props) {
  const router = useRouter()
  const [data, setData] = useState<MigrationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [alreadyClaimed, setAlreadyClaimed] = useState(false)

  // Form state
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimSuccess, setClaimSuccess] = useState(false)

  // Countdown state (for urgency)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 })

  // Load migration data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/migration/claim/${token}`)
        const result = await response.json()

        if (!response.ok) {
          if (result.expired) {
            setExpired(true)
          } else if (result.alreadyClaimed) {
            setAlreadyClaimed(true)
          }
          setError(result.error || 'Er ging iets mis')
          return
        }

        setData(result.data)
      } catch (err) {
        setError('Kon gegevens niet laden')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  // Countdown timer effect
  useEffect(() => {
    if (!data?.couponExpiresAt) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const expiry = new Date(data.couponExpiresAt!).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0 })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft({ hours, minutes })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [data])

  // Password strength calculator
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(null)
      return
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak'

    // Check length
    if (password.length >= 12) strength = 'medium'
    if (password.length >= 16) strength = 'strong'

    // Check complexity
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password)

    const complexity = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length

    if (password.length >= 8 && complexity >= 3) strength = 'medium'
    if (password.length >= 12 && complexity >= 4) strength = 'strong'

    setPasswordStrength(strength)
  }, [password])

  // Handle account claim
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setClaimError(null)

    // Validation
    if (password.length < 8) {
      setClaimError('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }

    setClaiming(true)

    try {
      const response = await fetch(`/api/migration/claim/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const result = await response.json()

      if (!response.ok) {
        setClaimError(result.error || 'Er ging iets mis')
        return
      }

      setClaimSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?welcome=true')
      }, 3000)
    } catch (err) {
      setClaimError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setClaiming(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Even geduld...</p>
        </div>
      </div>
    )
  }

  // Already claimed state
  if (alreadyClaimed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Account al geactiveerd</h1>
          <p className="text-slate-600 mb-6">
            Je account is al geactiveerd. Je kunt nu inloggen om verder te gaan.
          </p>
          <Link
            href="/login"
            className="inline-block bg-rose-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Ga naar Login
          </Link>
        </div>
      </div>
    )
  }

  // Expired state
  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Link verlopen</h1>
          <p className="text-slate-600 mb-6">
            Deze activatielink is helaas verlopen. Neem contact op met support
            als je toch nog wilt overstappen.
          </p>
          <Link
            href="/support"
            className="inline-block bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Er ging iets mis</h1>
          <p className="text-slate-600 mb-6">{error || 'Kon de pagina niet laden'}</p>
          <Link
            href="/"
            className="inline-block bg-rose-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Naar Homepage
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (claimSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welkom, {data.firstName}!</h1>
          <p className="text-slate-600 mb-4">
            Je account is succesvol geactiveerd.
          </p>
          {data.incentive.premiumMonths > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-semibold">
                Je hebt {data.incentive.premiumMonths} maanden gratis Premium ontvangen!
              </p>
            </div>
          )}
          <p className="text-sm text-slate-500 mb-4">
            Je wordt automatisch doorgestuurd naar de login pagina...
          </p>
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  const memberYear = new Date(data.memberSince).getFullYear()
  const strengthColors = {
    weak: 'bg-red-400',
    medium: 'bg-amber-400',
    strong: 'bg-emerald-400'
  }
  const strengthLabels = {
    weak: 'Zwak',
    medium: 'Redelijk',
    strong: 'Sterk'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Image
            src="/images/LiefdevoorIedereen_logo.png"
            alt="Liefde Voor Iedereen"
            width={240}
            height={70}
            priority
            className="h-14 sm:h-16 w-auto mx-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-16">
        <div className="max-w-2xl mx-auto">

          {/* Social Proof Banner - MOVED TO TOP */}
          {data.socialProof.activatedCount > 0 && (
            <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <p className="font-semibold">
                  <strong className="text-lg">{data.socialProof.activatedCount.toLocaleString('nl-NL')}</strong> leden zijn al overgestapt
                </p>
              </div>
              {data.socialProof.recentCount > 0 && (
                <p className="text-emerald-700 text-sm mt-1">
                  🔥 <strong>{data.socialProof.recentCount}</strong> vandaag geactiveerd
                </p>
              )}
            </div>
          )}

          {/* Personalized Welcome */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
              Welkom terug, {data.firstName}! 👋
            </h1>
            <p className="text-lg text-slate-600">
              OogvoorLiefde wordt <strong className="text-rose-600">LiefdevoorIedereen</strong> -
              een compleet vernieuwde dating ervaring.
            </p>
          </div>

          {/* MEGA INCENTIVE CARD - PROMINENT */}
          {data.couponCode && (
            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-rose-500 rounded-2xl p-8 mb-6 text-white shadow-2xl relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24" />
              </div>

              <div className="relative">
                {/* Urgency Timer */}
                {timeLeft.hours > 0 && (
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm font-semibold">
                    ⏰ Nog {timeLeft.hours}u {timeLeft.minutes}m geldig
                  </div>
                )}

                <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                  🎁 Jouw Welkomstcadeau
                </h3>
                <p className="text-3xl sm:text-4xl font-black mb-2">
                  {data.incentive.premiumMonths} Maanden Premium GRATIS
                </p>
                {data.incentive.superMessages > 0 && (
                  <p className="text-xl font-semibold mb-4">
                    + {data.incentive.superMessages} SuperBerichten 🌟
                  </p>
                )}

                {/* Coupon Code */}
                <div className="bg-white/20 backdrop-blur-sm border-2 border-white/40 border-dashed rounded-xl p-4 mt-4">
                  <p className="text-sm uppercase tracking-wide mb-1 text-white/90">
                    Jouw persoonlijke code
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold font-mono tracking-wider">
                    {data.couponCode}
                  </p>
                </div>

                {/* Value callout */}
                <div className="mt-4 text-center">
                  <p className="text-white/90 text-sm">
                    Waarde: <span className="font-bold text-lg">€{(data.incentive.premiumMonths * 9.99).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Claim Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
              Activeer in 30 seconden ⚡
            </h2>
            <p className="text-slate-600 text-center mb-6">
              Kies een wachtwoord en start direct
            </p>

            <form onSubmit={handleClaim}>
              {/* Email (read-only) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Je email
                </label>
                <input
                  type="email"
                  value={data.email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>

              {/* Single Password Field with Strength */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kies een wachtwoord (minimaal 8 tekens)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Voer een sterk wachtwoord in"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength !== null ? strengthColors[passwordStrength] : 'bg-slate-200'}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'medium' || passwordStrength === 'strong' ? strengthColors[passwordStrength] : 'bg-slate-200'}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'strong' ? strengthColors[passwordStrength] : 'bg-slate-200'}`} />
                    </div>
                    <p className="text-xs text-slate-600">
                      Wachtwoord sterkte: <span className="font-semibold">{strengthLabels[passwordStrength]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Error message */}
              {claimError && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {claimError}
                </div>
              )}

              {/* MEGA CTA BUTTON */}
              <button
                type="submit"
                disabled={claiming || !password || password.length < 8}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg py-5 rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {claiming ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Activeren...
                  </>
                ) : (
                  <>
                    <span>Claim {data.incentive.premiumMonths} Maanden Premium GRATIS</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Data Preserved - Below CTA */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-slate-700 font-semibold text-center mb-3 flex items-center justify-center gap-2 text-sm">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Al je data is overgezet
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{data.photoCount}</div>
                  <div className="text-xs text-slate-500">foto's</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{data.messageCount}</div>
                  <div className="text-xs text-slate-500">berichten</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{memberYear}</div>
                  <div className="text-xs text-slate-500">lid sinds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">100% Veilig</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Gratis Overstap</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">AVG-proof</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center text-sm text-slate-500">
          <p className="mb-2 font-medium text-slate-700">Liefde Voor Iedereen</p>
          <p className="mb-2">
            <Link href="/support/faq" className="hover:text-slate-700 hover:underline">FAQ</Link>
            {' · '}
            <Link href="/over-ons" className="hover:text-slate-700 hover:underline">Over Ons</Link>
          </p>
          <p>
            <Link href="/privacy" className="hover:text-slate-700 hover:underline">Privacy</Link>
            {' · '}
            <Link href="/terms" className="hover:text-slate-700 hover:underline">Voorwaarden</Link>
            {' · '}
            <Link href="/support" className="hover:text-slate-700 hover:underline">Support</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
