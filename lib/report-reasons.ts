/**
 * Report Reasons - Safety System
 *
 * Predefined reasons for reporting users
 */

const REPORT_REASONS = {
  harassment: 'Intimidatie of pesterijen',
  fake_profile: 'Nep profiel',
  spam: 'Spam of reclame',
  inappropriate_content: 'Ongepaste inhoud',
  underage: 'Minderjarig',
  scam: 'Oplichting of fraude',
  hate_speech: 'Haatzaaiende uitspraken',
  other: 'Overig',
} as const

export type ReportReason = keyof typeof REPORT_REASONS

// Validation helper
export function isValidReportReason(reason: string): reason is ReportReason {
  return reason in REPORT_REASONS
}

// Get reason label
export function getReportReasonLabel(reason: ReportReason): string {
  return REPORT_REASONS[reason]
}
