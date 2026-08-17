/**
 * Account deletion confirmation email
 *
 * BUG-FIX: de privacy-pagina plant een verwijdering maar verstuurde geen
 * bevestigingsmail (de TODO's in de route). Gebruikers dachten daardoor dat de
 * knop niet werkte. Deze helper stuurt een bevestiging met de bedenktermijn.
 */

import { sendEmail } from './send'

export async function sendAccountDeletionEmail(
  to: string,
  scheduledFor: Date
): Promise<void> {
  try {
    const dateStr = scheduledFor.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    await sendEmail({
      to,
      subject: 'Bevestiging: je account wordt verwijderd',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
          <h1 style="color: #C34C60; font-size: 22px;">Account verwijdering gepland</h1>
          <p>Beste gebruiker,</p>
          <p>Je hebt het verwijderen van je account aangevraagd. Je account wordt definitief
             verwijderd op <strong>${dateStr}</strong>.</p>
          <p>Tot die datum kun je de verwijdering kosteloos annuleren via
             Instellingen &rarr; Privacy. Na ${dateStr} worden al je gegevens permanent
             verwijderd (AVG Artikel 17).</p>
          <p style="font-size: 13px; color: #6b7280;">Kreeg je deze mail onverwacht? Dan heeft
             iemand anders toegang tot je account — verander direct je wachtwoord.</p>
        </div>
      `,
      text: `Je hebt het verwijderen van je account aangevraagd. Je account wordt definitief verwijderd op ${dateStr}. Tot die datum kun je de verwijdering annuleren via Instellingen > Privacy.`,
    })
  } catch (error) {
    console.error('[Account Deletion Email] Failed to send:', error)
  }
}
