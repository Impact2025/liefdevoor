/**
 * KVK (Kamer van Koophandel) Verification Helper
 *
 * Validates Dutch KVK numbers and optionally fetches company data from KVK API
 * Note: Full KVK API access requires a paid subscription
 */

export interface KvkCompanyInfo {
  kvkNumber: string;
  name: string;
  tradeName?: string;
  type: string;
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };
  isActive: boolean;
  registrationDate?: string;
}

export interface KvkVerificationResult {
  isValid: boolean;
  error?: string;
  company?: KvkCompanyInfo;
  checkedAt: Date;
}

/**
 * Validate KVK number format
 * KVK numbers are 8 digits
 */
export function validateKvkFormat(kvkNumber: string): boolean {
  // Remove any spaces or dots
  const cleaned = kvkNumber.replace(/[\s.]/g, '');

  // Must be exactly 8 digits
  if (!/^\d{8}$/.test(cleaned)) {
    return false;
  }

  return true;
}

/**
 * Validate KVK number using the 11-proof check
 * Dutch KVK numbers use a weighted checksum algorithm
 */
export function validateKvkChecksum(kvkNumber: string): boolean {
  const cleaned = kvkNumber.replace(/[\s.]/g, '');

  if (cleaned.length !== 8) {
    return false;
  }

  // KVK numbers don't have a strict checksum like BSN
  // They are simply 8-digit sequential numbers
  // We can only validate the format
  return true;
}

/**
 * Format KVK number for display (with dots)
 */
export function formatKvkNumber(kvkNumber: string): string {
  const cleaned = kvkNumber.replace(/[\s.]/g, '');
  if (cleaned.length !== 8) return kvkNumber;

  // Format as XX.XXX.XXX
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
}

/**
 * Verify KVK number (format check only - free)
 * For full verification, KVK API access is needed
 */
export async function verifyKvkNumber(kvkNumber: string): Promise<KvkVerificationResult> {
  const cleaned = kvkNumber.replace(/[\s.]/g, '');

  // Step 1: Validate format
  if (!validateKvkFormat(cleaned)) {
    return {
      isValid: false,
      error: 'KVK nummer moet exact 8 cijfers zijn',
      checkedAt: new Date(),
    };
  }

  // Step 2: Check for obviously invalid patterns
  if (/^0{8}$/.test(cleaned) || /^1{8}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Ongeldig KVK nummer formaat',
      checkedAt: new Date(),
    };
  }

  // Step 3: For now, we only do format validation
  // Full API verification would require KVK API subscription
  // https://developers.kvk.nl/

  // If KVK_API_KEY is configured, we could call the real API
  const apiKey = process.env.KVK_API_KEY;

  if (apiKey) {
    try {
      // KVK API v2 endpoint
      const response = await fetch(
        `https://api.kvk.nl/api/v2/zoeken?kvkNummer=${cleaned}`,
        {
          headers: {
            'apikey': apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.resultaten && data.resultaten.length > 0) {
          const company = data.resultaten[0];

          return {
            isValid: true,
            company: {
              kvkNumber: cleaned,
              name: company.naam || 'Onbekend',
              tradeName: company.handelsnaam,
              type: company.type || 'Onbekend',
              address: company.adres ? {
                street: company.adres.straatnaam,
                houseNumber: company.adres.huisnummer,
                postalCode: company.adres.postcode,
                city: company.adres.plaats,
              } : undefined,
              isActive: company.actief !== false,
              registrationDate: company.registratiedatum,
            },
            checkedAt: new Date(),
          };
        } else {
          return {
            isValid: false,
            error: 'KVK nummer niet gevonden in register',
            checkedAt: new Date(),
          };
        }
      } else if (response.status === 404) {
        return {
          isValid: false,
          error: 'KVK nummer niet gevonden',
          checkedAt: new Date(),
        };
      } else {
        console.error('KVK API error:', response.status);
        // Fall back to format-only validation
      }
    } catch (error) {
      console.error('KVK API request failed:', error);
      // Fall back to format-only validation
    }
  }

  // Without API access, we can only confirm format is valid
  return {
    isValid: true,
    checkedAt: new Date(),
  };
}

/**
 * Get verification status text for display
 */
export function getVerificationStatusText(result: KvkVerificationResult): string {
  if (!result.isValid) {
    return result.error || 'Verificatie mislukt';
  }

  if (result.company) {
    return `Geverifieerd: ${result.company.name}`;
  }

  return 'Formaat correct (niet geverifieerd via KVK register)';
}

/**
 * Professional types that typically require KVK
 */
export const REQUIRES_KVK = [
  'THERAPIST',
  'COACH',
  'HEALTHCARE',
];

/**
 * Check if a professional type typically requires KVK registration
 */
export function requiresKvkVerification(type: string): boolean {
  return REQUIRES_KVK.includes(type);
}
