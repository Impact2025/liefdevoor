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
      console.error('Failed to check 2FA status:', error)
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
        setError(error.error || 'Failed to setup 2FA')
      }
    } catch (error) {
      setError('Failed to setup 2FA')
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
        setSuccess(data.message)
        setVerificationCode('')
        setSetupData(null)
        // Refresh status
        await checkStatus()
      } else {
        const error = await response.json()
        setError(error.error || 'Invalid verification code')
      }
    } catch (error) {
      setError('Failed to verify code')
      console.error('2FA verification error:', error)
    } finally {
      setVerifying(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
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
        const data = await response.json()
        setSuccess(data.message)
        await checkStatus()
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to disable 2FA')
      }
    } catch (error) {
      setError('Failed to disable 2FA')
      console.error('2FA disable error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return

    const content = `Liefde Voor Iedereen - 2FA Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes in a safe place!
Each code can only be used once.

${setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, you can use one of these codes to log in.
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
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="mt-2 text-gray-600">
            Protect your admin account with an extra layer of security
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">2FA Setup</span>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                status.isSetup
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {status.isSetup ? 'Configured' : 'Not Configured'}
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
                {status.isEnabled ? 'Enabled' : 'Disabled'}
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
                  {loading ? 'Setting up...' : 'Setup 2FA'}
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
                  {loading ? 'Disabling...' : 'Disable 2FA'}
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
                Step 1: Scan QR Code
              </h2>
              <p className="text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>

              <div className="flex justify-center mb-4">
                <img src={setupData.qrCode} alt="2FA QR Code" className="w-64 h-64 border-4 border-gray-200 rounded-lg" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Manual Entry Key:</p>
                <code className="block bg-white px-3 py-2 rounded border border-gray-200 text-sm font-mono break-all">
                  {setupData.secret}
                </code>
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Key className="w-6 h-6 mr-2 text-blue-600" />
                Step 2: Verify Code
              </h2>
              <p className="text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app to verify the setup:
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
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>

            {/* Backup Codes Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="w-6 h-6 mr-2 text-blue-600" />
                Step 3: Save Backup Codes
              </h2>
              <p className="text-gray-600 mb-4">
                Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Each code can only be used once. Download and store them securely!</span>
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
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What is Two-Factor Authentication?</h3>
          <p className="text-blue-800 mb-3">
            2FA adds an extra layer of security to your account by requiring both your password and a time-based code from your authenticator app.
          </p>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Protects against password theft</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Industry-standard security (TOTP)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Works offline with authenticator apps</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
