'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Shield, Lock, Key, Download, CheckCircle, AlertCircle, Smartphone } from 'lucide-react'

export default function Admin2FASetup() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ isSetup: boolean; isEnabled: boolean } | null>(null)
  const [setupData, setSetupData] = useState<{
    secret: string
    qrCode: string
    backupCodes: string[]
  } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/admin/2fa/setup')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('2FA status ophalen mislukt:', error)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setSetupData(data)
      } else {
        const error = await response.json()
        setError(error.error || '2FA instellen mislukt')
      }
    } catch (error) {
      setError('2FA instellen mislukt')
      console.error('2FA setup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess('2FA is succesvol geactiveerd!')
        setVerificationCode('')
        setSetupData(null)
        await checkStatus()
      } else {
        const error = await response.json()
        setError(error.error || 'Ongeldige verificatiecode')
      }
    } catch (error) {
      setError('Verificatie mislukt')
      console.error('2FA verification error:', error)
    } finally {
      setVerifying(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Weet je zeker dat je 2FA wilt uitschakelen? Dit maakt je account minder veilig.')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('2FA is uitgeschakeld')
        await checkStatus()
      } else {
        const error = await response.json()
        setError(error.error || '2FA uitschakelen mislukt')
      }
    } catch (error) {
      setError('2FA uitschakelen mislukt')
      console.error('2FA disable error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return

    const content = `Liefde Voor Iedereen - 2FA Backup Codes
Aangemaakt: ${new Date().toLocaleString('nl-NL')}

BELANGRIJK: Bewaar deze codes op een veilige plek!
Elke code kan slechts één keer worden gebruikt.

${setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Als je geen toegang meer hebt tot je authenticator app, kun je een van deze codes gebruiken om in te loggen.
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '2fa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Laden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Tweefactorauthenticatie</h1>
          <p className="mt-2 text-gray-600">
            Bescherm je admin account met een extra beveiligingslaag
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Status Card */}
        {!setupData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Huidige Status</h2>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">2FA Configuratie</span>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                status.isSetup
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {status.isSetup ? 'Geconfigureerd' : 'Niet geconfigureerd'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">2FA Status</span>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                status.isEnabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.isEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
              </span>
            </div>

            {!status.isEnabled && (
              <div className="mt-6">
                <button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Key className="w-5 h-5 mr-2" />
                  {loading ? 'Instellen...' : '2FA Instellen'}
                </button>
              </div>
            )}

            {status.isEnabled && (
              <div className="mt-6">
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {loading ? 'Uitschakelen...' : '2FA Uitschakelen'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Setup Flow */}
        {setupData && (
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="w-6 h-6 mr-2 text-blue-600" />
                Stap 1: Scan de QR-code
              </h2>
              <p className="text-gray-600 mb-4">
                Scan deze QR-code met je authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>

              <div className="flex justify-center mb-4">
                <img src={setupData.qrCode} alt="2FA QR Code" className="w-64 h-64 border-4 border-gray-200 rounded-lg" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Handmatige invoer sleutel:</p>
                <code className="block bg-white px-3 py-2 rounded border border-gray-200 text-sm font-mono break-all">
                  {setupData.secret}
                </code>
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Key className="w-6 h-6 mr-2 text-blue-600" />
                Stap 2: Verifieer de code
              </h2>
              <p className="text-gray-600 mb-4">
                Voer de 6-cijferige code in van je authenticator app om de installatie te bevestigen:
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying || verificationCode.length !== 6}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {verifying ? 'Verifiëren...' : 'Verifieer'}
                </button>
              </div>
            </div>

            {/* Backup Codes Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="w-6 h-6 mr-2 text-blue-600" />
                Stap 3: Bewaar de backup codes
              </h2>
              <p className="text-gray-600 mb-4">
                Bewaar deze backup codes op een veilige plek. Je kunt ze gebruiken om toegang te krijgen tot je account als je je authenticator apparaat verliest.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Elke code kan slechts één keer worden gebruikt. Download en bewaar ze veilig!</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="bg-gray-50 px-3 py-2 rounded border border-gray-200 font-mono text-sm text-center">
                    {code}
                  </div>
                ))}
              </div>

              <button
                onClick={downloadBackupCodes}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Backup Codes
              </button>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Wat is tweefactorauthenticatie?</h3>
          <p className="text-blue-800 mb-3">
            2FA voegt een extra beveiligingslaag toe aan je account door zowel je wachtwoord als een tijdgebaseerde code van je authenticator app te vereisen.
          </p>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Beschermt tegen wachtwoorddiefstal</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Industriestandaard beveiliging (TOTP)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Werkt offline met authenticator apps</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
