/**
 * Email Templates
 *
 * Beautiful, LVB-friendly email templates
 */

interface EmailVerificationData {
  name: string
  verificationUrl: string
}

export function getVerificationEmailHtml(data: EmailVerificationData): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activeer je account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Welkom ${data.name}! 🎉
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Super leuk dat je je hebt aangemeld bij <strong>Liefde Voor Iedereen</strong>!
              </p>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Voordat je kunt beginnen met het vinden van je perfecte match, moeten we even controleren of dit jouw email adres is.
              </p>

              <!-- Big CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.verificationUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);">
                      ✅ Activeer mijn account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instructions Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px;">
                    <p style="margin: 0 0 12px; color: #1e3a8a; font-size: 15px; font-weight: 600;">
                      Wat gebeurt er als je klikt?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                      <li>Je email adres wordt geverifieerd</li>
                      <li>Je account wordt geactiveerd</li>
                      <li>Je wordt automatisch ingelogd</li>
                      <li>Je kunt meteen beginnen met matchen!</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                <strong>Werkt de knop niet?</strong><br>
                Kopieer deze link en plak hem in je browser:
              </p>
              <p style="margin: 10px 0; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; word-break: break-all; font-size: 12px; color: #374151;">
                ${data.verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                      🔒 <strong>Veiligheid eerst!</strong><br>
                      Deze link werkt maar 24 uur en kan maar 1 keer gebruikt worden. Heb je je niet aangemeld? Negeer deze email dan.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Met liefde gemaakt door het team van
              </p>
              <p style="margin: 0 0 20px; color: #ec4899; font-size: 18px; font-weight: 700;">
                ❤️ Liefde Voor Iedereen
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Deze email werd verstuurd omdat je je hebt aangemeld op onze website.<br>
                Vragen? Stuur een email naar <a href="mailto:support@liefdevoorlvb.nl" style="color: #ec4899; text-decoration: none;">support@liefdevoorlvb.nl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function getVerificationEmailText(data: EmailVerificationData): string {
  return `
Welkom ${data.name}!

Super leuk dat je je hebt aangemeld bij Liefde Voor Iedereen!

Voordat je kunt beginnen met het vinden van je perfecte match, moeten we even controleren of dit jouw email adres is.

ACTIVEER JE ACCOUNT:
${data.verificationUrl}

Wat gebeurt er als je klikt?
- Je email adres wordt geverifieerd
- Je account wordt geactiveerd
- Je wordt automatisch ingelogd
- Je kunt meteen beginnen met matchen!

VEILIGHEID EERST:
Deze link werkt maar 24 uur en kan maar 1 keer gebruikt worden.
Heb je je niet aangemeld? Negeer deze email dan.

Met liefde gemaakt door het team van
❤️ Liefde Voor Iedereen

Vragen? Stuur een email naar support@liefdevoorlvb.nl
  `.trim()
}

interface PasswordResetEmailData {
  name: string
  resetUrl: string
}

export function getPasswordResetEmailHtml(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wachtwoord resetten</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🔐 Wachtwoord resetten
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hoi ${data.name},
              </p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Je hebt een verzoek ingediend om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.resetUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                      🔑 Nieuw wachtwoord instellen
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      ⏰ <strong>Let op:</strong> Deze link is 1 uur geldig en kan maar 1 keer gebruikt worden.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                <strong>Werkt de knop niet?</strong><br>
                Kopieer deze link en plak hem in je browser:
              </p>
              <p style="margin: 10px 0; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; word-break: break-all; font-size: 12px; color: #374151;">
                ${data.resetUrl}
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 0;">
                <tr>
                  <td style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px;">
                    <p style="margin: 0; color: #991b1b; font-size: 13px; line-height: 1.6;">
                      🚨 <strong>Niet aangevraagd?</strong><br>
                      Als jij dit verzoek niet hebt gedaan, kun je deze email veilig negeren. Je wachtwoord blijft ongewijzigd.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #ec4899; font-size: 18px; font-weight: 700;">
                ❤️ Liefde Voor Iedereen
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Vragen? Stuur een email naar <a href="mailto:support@liefdevoorlvb.nl" style="color: #ec4899; text-decoration: none;">support@liefdevoorlvb.nl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function getPasswordResetEmailText(data: PasswordResetEmailData): string {
  return `
Hoi ${data.name},

Je hebt een verzoek ingediend om je wachtwoord te resetten.

NIEUW WACHTWOORD INSTELLEN:
${data.resetUrl}

LET OP: Deze link is 1 uur geldig en kan maar 1 keer gebruikt worden.

NIET AANGEVRAAGD?
Als jij dit verzoek niet hebt gedaan, kun je deze email veilig negeren. Je wachtwoord blijft ongewijzigd.

Met vriendelijke groet,
❤️ Liefde Voor Iedereen

Vragen? Stuur een email naar support@liefdevoorlvb.nl
  `.trim()
}

interface WelcomeEmailData {
  name: string
  loginUrl: string
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welkom bij Liefde Voor Iedereen!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 32px; font-weight: 700;">
                🎉 Je account is actief!
              </h1>
              <p style="margin: 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Welkom bij de Liefde Voor Iedereen familie, ${data.name}!
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Super! Je email is geverifieerd en je account is nu actief.
              </p>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Je kunt nu beginnen met:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #fef3f2; border-radius: 8px; margin-bottom: 10px;">
                    <span style="font-size: 24px;">💘</span>
                    <strong style="color: #374151; font-size: 15px; margin-left: 10px;">Ontdek nieuwe mensen in je buurt</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #fef3f2; border-radius: 8px; margin-bottom: 10px;">
                    <span style="font-size: 24px;">💬</span>
                    <strong style="color: #374151; font-size: 15px; margin-left: 10px;">Chat met je matches</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #fef3f2; border-radius: 8px;">
                    <span style="font-size: 24px;">❤️</span>
                    <strong style="color: #374151; font-size: 15px; margin-left: 10px;">Vind je perfecte match!</strong>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.loginUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);">
                      🚀 Begin met matchen!
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #ec4899; font-size: 18px; font-weight: 700;">
                ❤️ Liefde Voor Iedereen
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Vragen? Stuur een email naar <a href="mailto:support@liefdevoorlvb.nl" style="color: #ec4899; text-decoration: none;">support@liefdevoorlvb.nl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
