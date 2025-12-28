'use client'

import { useEffect, useState } from 'react'
import { Volume2, VolumeX, Eye, Type, Contrast, Sun, Moon } from 'lucide-react'
import { TextToSpeech } from './TextToSpeech'

interface AccessibleLandingWrapperProps {
  children: React.ReactNode
  enableAudioMode?: boolean
  enableHighContrast?: boolean
  enableLargeText?: boolean
  pageTitle: string
  pageDescription: string
}

/**
 * Wrapper component voor toegankelijke landingspagina's
 * Speciaal voor slechtzienden en blinden
 *
 * Features:
 * - Floating accessibility toolbar
 * - Text-to-speech page reading
 * - High contrast mode toggle
 * - Large text mode toggle
 * - Keyboard navigation hints
 */
export function AccessibleLandingWrapper({
  children,
  enableAudioMode = false,
  enableHighContrast = false,
  enableLargeText = false,
  pageTitle,
  pageDescription
}: AccessibleLandingWrapperProps) {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false)
  const [highContrast, setHighContrast] = useState(enableHighContrast)
  const [largeText, setLargeText] = useState(enableLargeText)
  const [darkMode, setDarkMode] = useState(false)

  // Apply accessibility classes to document
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    if (highContrast) {
      html.classList.add('high-contrast-mode')
      body.style.setProperty('--text-primary', '#000000')
      body.style.setProperty('--bg-primary', '#ffffff')
    } else {
      html.classList.remove('high-contrast-mode')
      body.style.removeProperty('--text-primary')
      body.style.removeProperty('--bg-primary')
    }

    if (largeText) {
      html.classList.add('large-text-mode')
      html.style.fontSize = '125%'
    } else {
      html.classList.remove('large-text-mode')
      html.style.fontSize = ''
    }

    if (darkMode) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    return () => {
      html.classList.remove('high-contrast-mode', 'large-text-mode', 'dark')
      html.style.fontSize = ''
    }
  }, [highContrast, largeText, darkMode])

  // Announce page to screen readers
  useEffect(() => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = `${pageTitle}. ${pageDescription}`
    document.body.appendChild(announcement)

    return () => {
      document.body.removeChild(announcement)
    }
  }, [pageTitle, pageDescription])

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
      >
        Ga naar hoofdinhoud
      </a>

      {/* Accessibility Toolbar - Fixed position */}
      {enableAudioMode && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Toggle Button */}
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-sky-300"
            aria-label={isToolbarOpen ? 'Sluit toegankelijkheidsmenu' : 'Open toegankelijkheidsmenu'}
            aria-expanded={isToolbarOpen}
          >
            <Eye className="w-6 h-6" />
          </button>

          {/* Toolbar Panel */}
          {isToolbarOpen && (
            <div
              className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
              role="menu"
              aria-label="Toegankelijkheidsopties"
            >
              {/* Header */}
              <div className="bg-sky-600 text-white p-4">
                <h3 className="font-bold text-lg">Toegankelijkheid</h3>
                <p className="text-sky-100 text-sm">Pas de weergave aan</p>
              </div>

              {/* Options */}
              <div className="p-4 space-y-4">
                {/* Read Page Aloud */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-sky-600" />
                    <span className="font-medium">Lees pagina voor</span>
                  </div>
                  <TextToSpeech
                    text={`${pageTitle}. ${pageDescription}`}
                    variant="minimal"
                  />
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Contrast className="w-5 h-5 text-sky-600" />
                    <span className="font-medium">Hoog contrast</span>
                  </div>
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-12 h-6 rounded-full transition-colors ${highContrast ? 'bg-sky-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={highContrast}
                    aria-label="Hoog contrast aan/uit"
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>

                {/* Large Text */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-sky-600" />
                    <span className="font-medium">Grote tekst</span>
                  </div>
                  <button
                    onClick={() => setLargeText(!largeText)}
                    className={`w-12 h-6 rounded-full transition-colors ${largeText ? 'bg-sky-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={largeText}
                    aria-label="Grote tekst aan/uit"
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${largeText ? 'translate-x-6' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-sky-600" /> : <Sun className="w-5 h-5 text-sky-600" />}
                    <span className="font-medium">Donkere modus</span>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-sky-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={darkMode}
                    aria-label="Donkere modus aan/uit"
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="bg-slate-50 p-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  <strong>Tip:</strong> Gebruik Tab om te navigeren, Enter om te activeren
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Global Accessibility Styles */}
      <style jsx global>{`
        .high-contrast-mode {
          --text-primary: #000000 !important;
          --bg-primary: #ffffff !important;
        }

        .high-contrast-mode * {
          border-color: #000000 !important;
        }

        .high-contrast-mode a,
        .high-contrast-mode button {
          text-decoration: underline;
        }

        .high-contrast-mode img {
          filter: contrast(1.2);
        }

        .large-text-mode {
          font-size: 125%;
          line-height: 1.6;
        }

        .large-text-mode h1 { font-size: 3rem; }
        .large-text-mode h2 { font-size: 2.5rem; }
        .large-text-mode h3 { font-size: 2rem; }
        .large-text-mode p { font-size: 1.25rem; }

        /* Focus indicators for keyboard navigation */
        *:focus-visible {
          outline: 3px solid #0ea5e9;
          outline-offset: 2px;
        }

        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </>
  )
}

export default AccessibleLandingWrapper
