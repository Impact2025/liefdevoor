'use client'

/**
 * AccessibilityContext - Wereldklasse Toegankelijkheid
 *
 * Centrale context voor alle accessibility features:
 * - Vision Impaired Mode (slechtzienden/blinden)
 * - High Contrast Mode (WCAG AAA compliance)
 * - Large Text Mode (125% scaling)
 * - Large Targets Mode (grotere knoppen)
 * - Text-to-Speech
 * - Color Blind Modes
 * - LVB Mode (Licht Verstandelijke Beperking)
 * - Guardian/Begeleider systeem
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface AccessibilitySettings {
  // Vision Impaired
  visionImpairedMode: boolean
  extraHighContrast: boolean
  textToSpeech: boolean
  voiceCommands: boolean
  colorBlindMode: string | null
  largeTextMode: boolean
  largeTargetsMode: boolean
  registrationSource: string | null

  // LVB Mode - Licht Verstandelijke Beperking
  lvbMode: boolean
  preferSimpleLanguage: boolean
  preferEasyRead: boolean
  dailyMessageLimit: number | null
  messageCooldownSeconds: number

  // Guardian/Begeleider
  guardianEnabled: boolean
  guardianConfirmed: boolean
  guardianName: string | null
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  isLoading: boolean
  updateSettings: (updates: Partial<AccessibilitySettings>) => Promise<void>
  speak: (text: string) => void
  speakForced: (text: string) => void // Spreekt altijd, ook zonder textToSpeech aan
  stopSpeaking: () => void
  isSpeaking: boolean
  isLVBMode: boolean // Handige shortcut
}

const defaultSettings: AccessibilitySettings = {
  // Vision Impaired
  visionImpairedMode: false,
  extraHighContrast: false,
  textToSpeech: false,
  voiceCommands: false,
  colorBlindMode: null,
  largeTextMode: false,
  largeTargetsMode: false,
  registrationSource: null,

  // LVB Mode
  lvbMode: false,
  preferSimpleLanguage: false,
  preferEasyRead: false,
  dailyMessageLimit: null,
  messageCooldownSeconds: 0,

  // Guardian
  guardianEnabled: false,
  guardianConfirmed: false,
  guardianName: null,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Fetch accessibility settings from API when user logs in
  useEffect(() => {
    const fetchSettings = async () => {
      if (status === 'loading') return

      if (status === 'unauthenticated') {
        setSettings(defaultSettings)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/accessibility')
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings)
        } else {
          setSettings(defaultSettings)
        }
      } catch (error) {
        console.error('Failed to fetch accessibility settings:', error)
        setSettings(defaultSettings)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [status])

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement

    // High Contrast Mode
    if (settings.extraHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Large Text Mode (125%)
    if (settings.largeTextMode) {
      root.classList.add('large-text')
      root.style.fontSize = '125%'
    } else {
      root.classList.remove('large-text')
      root.style.fontSize = ''
    }

    // Large Targets Mode (grotere knoppen)
    if (settings.largeTargetsMode) {
      root.classList.add('large-targets')
    } else {
      root.classList.remove('large-targets')
    }

    // Color Blind Mode
    if (settings.colorBlindMode && settings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${settings.colorBlindMode}`)
    } else {
      root.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia')
    }

    // Vision Impaired Mode (combines all visual aids)
    if (settings.visionImpairedMode) {
      root.classList.add('vision-impaired')
      root.setAttribute('data-accessibility-mode', 'vision-impaired')
    } else {
      root.classList.remove('vision-impaired')
      root.removeAttribute('data-accessibility-mode')
    }

    // LVB Mode - Licht Verstandelijke Beperking
    if (settings.lvbMode) {
      root.classList.add('lvb-mode')
      root.setAttribute('data-lvb-mode', 'true')
      // LVB Mode enables these by default
      root.classList.add('large-text', 'large-targets')
      root.style.fontSize = '125%'
    } else {
      root.classList.remove('lvb-mode')
      root.removeAttribute('data-lvb-mode')
    }
  }, [settings])

  // Update settings via API
  const updateSettings = useCallback(async (updates: Partial<AccessibilitySettings>) => {
    try {
      const response = await fetch('/api/user/accessibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Failed to update accessibility settings:', error)
      throw error
    }
  }, [])

  // Text-to-Speech functionality
  const speak = useCallback((text: string) => {
    if (!settings.textToSpeech && !settings.lvbMode) return

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'nl-NL'
    // LVB mode uses slower speech rate for better comprehension
    utterance.rate = settings.lvbMode ? 0.8 : 0.9
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [settings.textToSpeech, settings.lvbMode])

  // speakForced - Always speaks regardless of settings (for explicit audio buttons)
  const speakForced = useCallback((text: string) => {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'nl-NL'
    utterance.rate = settings.lvbMode ? 0.8 : 0.9
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [settings.lvbMode])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Convenience property for LVB mode check
  const isLVBMode = settings.lvbMode || settings.registrationSource === 'lvb'

  const value: AccessibilityContextType = {
    settings,
    isLoading,
    updateSettings,
    speak,
    speakForced,
    stopSpeaking,
    isSpeaking,
    isLVBMode,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
