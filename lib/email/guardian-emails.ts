/**
 * Guardian Email Templates
 *
 * Emails voor begeleiders van LVB gebruikers:
 * - Bevestigingsmail voor nieuwe begeleider
 * - Wekelijkse samenvatting
 * - Veiligheidswaarschuwing
 *
 * PRIVACY: Nooit chatinhoud tonen!
 */

import { sendEmail } from './send'

interface GuardianConfirmationData {
  guardianEmail: string
  guardianName: string
  userName: string
  confirmUrl: string
}

interface WeeklyDigestData {
  userId: string
  userName: string
  guardianEmail: string
  guardianName: string
  weekData: {
    newMatchesCount: number
    conversationsCount: number
    messagesReceivedCount: number
    safetyFlagsCount: number
    lastActiveAt: Date | null
    activityLevel: 'low' | 'medium' | 'high'
  }
}

interface SafetyAlertData {
  userId: string
  userName: string
  guardianEmail: string
  guardianName: string
  alertType: 'iban_shared' | 'phone_shared' | 'scam_detected'
}

/**
 * Get activity level description in Dutch
 */
function getActivityDescription(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'high':
      return 'Zeer actief - Veel interacties deze week'
    case 'medium':
      return 'Gemiddeld actief - Normale activiteit'
    case 'low':
      return 'Rustig - Weinig activiteit deze week'
  }
}

/**
 * Get safety alert message in Dutch
 */
function getSafetyAlertMessage(alertType: SafetyAlertData['alertType']): {
  title: string
  description: string
  action: string
} {
  switch (alertType) {
    case 'iban_shared':
      return {
        title: 'Bankrekening gedeeld',
        description: 'De gebruiker heeft geprobeerd een bankrekening (IBAN) te delen in een chat.',
        action: 'Neem contact op om te bespreken of dit veilig is.',
      }
    case 'phone_shared':
      return {
        title: 'Telefoonnummer gedeeld',
        description: 'De gebruiker heeft geprobeerd een telefoonnummer te delen in een chat.',
        action: 'Controleer of de gebruiker weet met wie ze praten.',
      }
    case 'scam_detected':
      return {
        title: 'Mogelijk verdacht gesprek',
        description: 'Ons systeem heeft patronen gedetecteerd die kunnen wijzen op oplichting.',
        action: 'Neem contact op om de situatie te bespreken.',
      }
  }
}

/**
 * Send confirmation email to new guardian
 */
export async function sendGuardianConfirmation(data: GuardianConfirmationData): Promise<void> {
  const { guardianEmail, guardianName, userName, confirmUrl } = data

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
      <div style="background-color: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e293b; margin: 0; font-size: 24px;">Begeleider Uitnodiging</h1>
          <p style="color: #64748b; margin-top: 8px;">Liefde Voor Iedereen</p>
        </div>

        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hallo ${guardianName},
        </p>

        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          <strong>${userName}</strong> heeft jou uitgenodigd als begeleider op Liefde Voor Iedereen.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 16px;">Wat betekent dit?</h3>
          <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Je ontvangt een wekelijkse samenvatting</li>
            <li>Je ziet hoeveel matches en gesprekken er zijn</li>
            <li>Je krijgt een melding bij veiligheidswaarschuwingen</li>
            <li><strong>Je kunt NOOIT berichten lezen - privacy blijft gewaarborgd</strong></li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmUrl}" style="display: inline-block; background-color: #7c3aed; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
            Ja, ik word begeleider
          </a>
        </div>

        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          Als je deze uitnodiging niet wilt accepteren, hoef je niets te doen. De link verloopt automatisch na 7 dagen.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Liefde Voor Iedereen - Daten voor iedereen
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
Hallo ${guardianName},

${userName} heeft jou uitgenodigd als begeleider op Liefde Voor Iedereen.

Wat betekent dit?
- Je ontvangt een wekelijkse samenvatting
- Je ziet hoeveel matches en gesprekken er zijn
- Je krijgt een melding bij veiligheidswaarschuwingen
- Je kunt NOOIT berichten lezen - privacy blijft gewaarborgd

Accepteer de uitnodiging via deze link: ${confirmUrl}

Als je deze uitnodiging niet wilt accepteren, hoef je niets te doen.

Liefde Voor Iedereen
  `

  await sendEmail({
    to: guardianEmail,
    subject: `${userName} wil jou als begeleider toevoegen`,
    html,
    text,
  })
}

/**
 * Send weekly digest to guardian
 */
export async function sendGuardianWeeklyDigest(data: WeeklyDigestData): Promise<void> {
  const { userName, guardianEmail, guardianName, weekData } = data
  const activityDescription = getActivityDescription(weekData.activityLevel)

  const hasSafetyFlags = weekData.safetyFlagsCount > 0
  const safetyColor = hasSafetyFlags ? '#fef3c7' : '#f0fdf4'
  const safetyBorderColor = hasSafetyFlags ? '#fcd34d' : '#86efac'
  const safetyTextColor = hasSafetyFlags ? '#92400e' : '#166534'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
      <div style="background-color: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e293b; margin: 0; font-size: 24px;">Wekelijkse Samenvatting</h1>
          <p style="color: #64748b; margin-top: 8px;">Voor ${userName}</p>
        </div>

        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hallo ${guardianName},
        </p>

        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hier is de wekelijkse samenvatting voor <strong>${userName}</strong>.
        </p>

        <!-- Activity Stats -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 16px;">Deze week:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Nieuwe matches</td>
              <td style="padding: 8px 0; text-align: right; color: #1e293b; font-weight: bold;">${weekData.newMatchesCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Actieve gesprekken</td>
              <td style="padding: 8px 0; text-align: right; color: #1e293b; font-weight: bold;">${weekData.conversationsCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Berichten ontvangen</td>
              <td style="padding: 8px 0; text-align: right; color: #1e293b; font-weight: bold;">${weekData.messagesReceivedCount}</td>
            </tr>
          </table>
        </div>

        <!-- Activity Level -->
        <div style="background-color: #ede9fe; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
          <p style="color: #5b21b6; margin: 0; font-weight: bold;">
            ${activityDescription}
          </p>
        </div>

        <!-- Safety Status -->
        <div style="background-color: ${safetyColor}; border: 1px solid ${safetyBorderColor}; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: ${safetyTextColor}; margin: 0 0 8px 0; font-size: 16px;">
            ${hasSafetyFlags ? '⚠️ Veiligheidsmeldingen' : '✅ Geen veiligheidsmeldingen'}
          </h3>
          <p style="color: ${safetyTextColor}; margin: 0; font-size: 14px;">
            ${hasSafetyFlags
              ? `Er waren ${weekData.safetyFlagsCount} situatie(s) waar ons systeem extra voorzichtig was. Dit betekent niet per se dat er iets mis is, maar het kan verstandig zijn om even te checken.`
              : 'Er zijn deze week geen bijzondere situaties gedetecteerd. Alles ziet er goed uit!'
            }
          </p>
        </div>

        ${weekData.lastActiveAt ? `
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          Laatst actief: ${new Date(weekData.lastActiveAt).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Je ontvangt dit bericht omdat je begeleider bent voor ${userName} op Liefde Voor Iedereen.
          <br><br>
          <em>Privacy: Je kunt nooit berichten lezen. We tonen alleen statistieken.</em>
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
Wekelijkse Samenvatting voor ${userName}

Hallo ${guardianName},

Hier is de wekelijkse samenvatting voor ${userName}.

DEZE WEEK:
- Nieuwe matches: ${weekData.newMatchesCount}
- Actieve gesprekken: ${weekData.conversationsCount}
- Berichten ontvangen: ${weekData.messagesReceivedCount}

Activiteit: ${activityDescription}

VEILIGHEID:
${hasSafetyFlags
    ? `Er waren ${weekData.safetyFlagsCount} situatie(s) waar ons systeem extra voorzichtig was.`
    : 'Geen veiligheidsmeldingen deze week. Alles ziet er goed uit!'
  }

---
Je ontvangt dit bericht omdat je begeleider bent voor ${userName} op Liefde Voor Iedereen.
Privacy: Je kunt nooit berichten lezen. We tonen alleen statistieken.
  `

  await sendEmail({
    to: guardianEmail,
    subject: `Wekelijkse samenvatting voor ${userName}`,
    html,
    text,
  })
}

/**
 * Send immediate safety alert to guardian
 */
export async function sendGuardianSafetyAlert(data: SafetyAlertData): Promise<void> {
  const { userName, guardianEmail, guardianName, alertType } = data
  const alert = getSafetyAlertMessage(alertType)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
      <div style="background-color: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background-color: #fef3c7; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px;">⚠️</span>
          </div>
          <h1 style="color: #92400e; margin: 0; font-size: 24px;">Veiligheidswaarschuwing</h1>
          <p style="color: #64748b; margin-top: 8px;">Voor ${userName}</p>
        </div>

        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hallo ${guardianName},
        </p>

        <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">
            ${alert.title}
          </h3>
          <p style="color: #92400e; margin: 0 0 12px 0; font-size: 14px;">
            ${alert.description}
          </p>
          <p style="color: #78350f; margin: 0; font-size: 14px; font-weight: bold;">
            👉 ${alert.action}
          </p>
        </div>

        <div style="background-color: #f0f9ff; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="color: #0369a1; margin: 0; font-size: 14px;">
            <strong>Belangrijk:</strong> We kunnen je niet laten zien wat er precies is gezegd vanwege privacy.
            Maar we willen je wel op de hoogte houden zodat je kunt helpen.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Je ontvangt dit bericht omdat je begeleider bent voor ${userName} op Liefde Voor Iedereen.
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
⚠️ VEILIGHEIDSWAARSCHUWING voor ${userName}

Hallo ${guardianName},

${alert.title}
${alert.description}

Actie: ${alert.action}

Belangrijk: We kunnen je niet laten zien wat er precies is gezegd vanwege privacy.
Maar we willen je wel op de hoogte houden zodat je kunt helpen.

---
Je ontvangt dit bericht omdat je begeleider bent voor ${userName} op Liefde Voor Iedereen.
  `

  await sendEmail({
    to: guardianEmail,
    subject: `⚠️ Veiligheidswaarschuwing voor ${userName}`,
    html,
    text,
  })
}
