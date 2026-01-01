/**
 * Unit Tests for SensitiveDataDetector
 *
 * Tests detection of:
 * - Dutch phone numbers
 * - IBAN bank accounts
 * - External email addresses
 * - Money-related words
 * - Crypto addresses
 * - External links
 * - Personal info keywords
 */

import { describe, it, expect } from 'vitest'
import {
  detectSensitiveData,
  shouldWarnLVBUser,
  maskSensitiveData
} from '@/lib/safety/sensitiveDataDetector'

describe('SensitiveDataDetector', () => {
  describe('detectSensitiveData', () => {
    describe('Phone number detection', () => {
      it('detects Dutch mobile numbers (06 format)', () => {
        const result = detectSensitiveData('Bel me op 06 12345678')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections).toHaveLength(1)
        expect(result.detections[0].type).toBe('phone')
        expect(result.detections[0].value).toContain('06')
      })

      it('detects Dutch mobile numbers with spaces', () => {
        const result = detectSensitiveData('Mijn nummer is 06 12 34 56 78')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections[0].type).toBe('phone')
      })

      it('detects Dutch mobile numbers with dashes', () => {
        const result = detectSensitiveData('Bel: 06-12-34-56-78')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections[0].type).toBe('phone')
      })

      it('detects international format +31', () => {
        const result = detectSensitiveData('WhatsApp: +31 6 12345678')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections[0].type).toBe('phone')
      })

      it('detects international format 0031', () => {
        const result = detectSensitiveData('Bereikbaar op 0031 6 12345678')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections[0].type).toBe('phone')
      })
    })

    describe('IBAN detection', () => {
      it('detects Dutch IBAN', () => {
        const result = detectSensitiveData('Stuur naar NL91 ABNA 0417 1643 00')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections[0].type).toBe('iban')
        expect(result.highestRisk).toBe('critical')
      })

      it('detects IBAN without spaces', () => {
        const result = detectSensitiveData('NL91ABNA0417164300')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections[0].type).toBe('iban')
      })

      it('detects IBAN with label', () => {
        const result = detectSensitiveData('iban: NL91 ABNA 0417 1643 00')
        expect(result.hasSensitiveData).toBe(true)
      })
    })

    describe('Email detection', () => {
      it('detects external email addresses', () => {
        const result = detectSensitiveData('Mail me op test@gmail.com')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections[0].type).toBe('email')
      })

      it('ignores platform email addresses', () => {
        // The regex excludes @liefdevooriederen.nl
        const result = detectSensitiveData('Contact: user@liefdevooriederen.nl')
        // This should NOT be flagged as it's the platform's domain
        const emailDetections = result.detections.filter(d => d.type === 'email')
        expect(emailDetections).toHaveLength(0)
      })
    })

    describe('Money words detection', () => {
      it('detects tikkie', () => {
        const result = detectSensitiveData('Stuur me een tikkie')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections.some(d => d.type === 'money_word')).toBe(true)
      })

      it('detects betalen', () => {
        const result = detectSensitiveData('Kun je me betalen?')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections.some(d => d.type === 'money_word')).toBe(true)
      })

      it('detects bankrekening', () => {
        const result = detectSensitiveData('Mijn bankrekening is geheim')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections.some(d => d.type === 'money_word')).toBe(true)
      })

      it('detects English money words', () => {
        const result = detectSensitiveData('Can you send money via bank account?')
        expect(result.hasSensitiveData).toBe(true)
      })
    })

    describe('Crypto detection', () => {
      it('detects crypto keywords', () => {
        const testCases = ['bitcoin', 'btc', 'ethereum', 'crypto', 'wallet', 'usdt', 'binance']

        testCases.forEach(word => {
          const result = detectSensitiveData(`Betaal met ${word}`)
          expect(result.hasSensitiveData).toBe(true)
          expect(result.detections.some(d => d.type === 'crypto')).toBe(true)
        })
      })

      it('detects Ethereum addresses', () => {
        const result = detectSensitiveData('Stuur naar 0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
        expect(result.hasSensitiveData).toBe(true)
      })
    })

    describe('Link detection', () => {
      it('detects URLs', () => {
        const result = detectSensitiveData('Check https://example.com')
        expect(result.hasSensitiveData).toBe(true)
        expect(result.detections.some(d => d.type === 'link')).toBe(true)
      })

      it('detects www links', () => {
        const result = detectSensitiveData('Ga naar www.example.com')
        expect(result.hasSensitiveData).toBe(true)
      })
    })

    describe('Personal info detection', () => {
      it('detects address-related words', () => {
        const testCases = ['mijn adres', 'woonplaats', 'postcode', 'huisnummer']

        testCases.forEach(word => {
          const result = detectSensitiveData(`Wat is je ${word}?`)
          expect(result.hasSensitiveData).toBe(true)
          expect(result.detections.some(d => d.type === 'personal_info')).toBe(true)
        })
      })

      it('detects ID-related words', () => {
        const testCases = ['bsn', 'burger service nummer', 'paspoort', 'rijbewijs', 'id-kaart']

        testCases.forEach(word => {
          const result = detectSensitiveData(`Stuur je ${word}`)
          expect(result.hasSensitiveData).toBe(true)
        })
      })
    })

    describe('Risk levels', () => {
      it('assigns critical risk to IBAN', () => {
        const result = detectSensitiveData('NL91 ABNA 0417 1643 00')
        expect(result.highestRisk).toBe('critical')
      })

      it('assigns critical risk to crypto', () => {
        const result = detectSensitiveData('Betaal met bitcoin')
        expect(result.highestRisk).toBe('critical')
      })

      it('assigns high risk to phone numbers', () => {
        const result = detectSensitiveData('06 12345678')
        expect(result.highestRisk).toBe('high')
      })

      it('assigns medium risk to money words', () => {
        const result = detectSensitiveData('stuur een tikkie')
        expect(result.highestRisk).toBe('medium')
      })
    })

    describe('Clean messages', () => {
      it('returns no detections for safe messages', () => {
        const safeMessages = [
          'Hallo! Hoe gaat het met je?',
          'Ik hou van wandelen en films',
          'Zullen we een keer koffie drinken?',
          'Wat zijn je hobby\'s?',
        ]

        safeMessages.forEach(msg => {
          const result = detectSensitiveData(msg)
          expect(result.hasSensitiveData).toBe(false)
          expect(result.detections).toHaveLength(0)
        })
      })
    })
  })

  describe('shouldWarnLVBUser', () => {
    it('warns on medium risk and above', () => {
      const mediumRisk = shouldWarnLVBUser('stuur me een tikkie')
      expect(mediumRisk.shouldWarn).toBe(true)

      const highRisk = shouldWarnLVBUser('bel me op 06 12345678')
      expect(highRisk.shouldWarn).toBe(true)

      const criticalRisk = shouldWarnLVBUser('NL91 ABNA 0417 1643 00')
      expect(criticalRisk.shouldWarn).toBe(true)
    })

    it('returns correct warning type', () => {
      const phoneWarning = shouldWarnLVBUser('06 12345678')
      expect(phoneWarning.warningType).toBe('phone')

      const ibanWarning = shouldWarnLVBUser('NL91 ABNA 0417 1643 00')
      expect(ibanWarning.warningType).toBe('iban')

      const moneyWarning = shouldWarnLVBUser('tikkie sturen')
      expect(moneyWarning.warningType).toBe('money')
    })

    it('does not warn on safe messages', () => {
      const result = shouldWarnLVBUser('Hallo, hoe gaat het?')
      expect(result.shouldWarn).toBe(false)
    })
  })

  describe('maskSensitiveData', () => {
    it('masks phone numbers', () => {
      const result = maskSensitiveData('Bel me op 06 12345678')
      expect(result).not.toContain('06 12345678')
      expect(result).toContain('***')
    })

    it('masks IBAN', () => {
      const result = maskSensitiveData('NL91 ABNA 0417 1643 00')
      expect(result).not.toContain('NL91')
      expect(result).toContain('***')
    })

    it('preserves non-sensitive content', () => {
      const result = maskSensitiveData('Hallo! Bel me op 06 12345678 voor info')
      expect(result).toContain('Hallo!')
      expect(result).toContain('voor info')
    })
  })
})
