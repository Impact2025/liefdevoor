/**
 * Email Templates
 *
 * Professional, minimalist email templates with brand consistency
 */

// Brand configuration
const BRAND = {
  name: 'Liefde Voor Iedereen',
  logoUrl: 'https://liefdevooriedereen.nl/images/LiefdevoorIedereen_logo.png',
  primaryColor: '#C34C60',
  primaryDark: '#a83d4f',
  textColor: '#1f2937',
  textMuted: '#6b7280',
  bgColor: '#f9fafb',
  borderColor: '#e5e7eb',
  email: 'info@liefdevooriedereen.nl',
  website: 'https://liefdevooriedereen.nl'
}

// Shared email header with logo
function getEmailHeader(): string {
  return `
    <!-- Header -->
    <tr>
      <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid ${BRAND.borderColor};">
        <img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="180" height="auto" style="display: block; margin: 0 auto;" />
      </td>
    </tr>
  `
}

// Shared email footer with logo
function getEmailFooter(): string {
  return `
    <!-- Footer -->
    <tr>
      <td style="background-color: ${BRAND.bgColor}; padding: 32px 40px; border-top: 1px solid ${BRAND.borderColor};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="120" height="auto" style="display: block; margin: 0 auto 16px;" />
              <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.5;">
                ${BRAND.name}
              </p>
              <p style="margin: 0 0 16px; color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.5;">
                <a href="mailto:${BRAND.email}" style="color: ${BRAND.primaryColor}; text-decoration: none;">${BRAND.email}</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Dit bericht is verzonden door ${BRAND.name}.<br />
                <a href="${BRAND.website}/settings/notifications" style="color: ${BRAND.textMuted}; text-decoration: underline;">Emailvoorkeuren beheren</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

// Base email wrapper
function getEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND.bgColor}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.bgColor}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); overflow: hidden;">
          ${getEmailHeader()}
          ${content}
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Primary CTA button style
function getPrimaryButton(text: string, url: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 24px 0;">
          <a href="${url}" style="display: inline-block; background-color: ${BRAND.primaryColor}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; letter-spacing: 0.01em;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `
}

interface EmailVerificationData {
  name: string
  verificationUrl: string
}

export function getVerificationEmailHtml(data: EmailVerificationData): string {
  const content = `
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600; line-height: 1.3;">
          Welkom, ${data.name}
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px; line-height: 1.6;">
          Bedankt voor je aanmelding bij ${BRAND.name}. Om je account te activeren, verifieer je emailadres via onderstaande knop.
        </p>

        ${getPrimaryButton('Account activeren', data.verificationUrl)}

        <p style="margin: 24px 0 0; color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.6;">
          Deze link is 24 uur geldig. Heb je je niet aangemeld bij ${BRAND.name}? Dan kun je deze email negeren.
        </p>

        <!-- Alternative Link -->
        <div style="margin: 24px 0 0; padding: 16px; background-color: ${BRAND.bgColor}; border-radius: 6px;">
          <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 12px;">
            Werkt de knop niet? Kopieer deze link:
          </p>
          <p style="margin: 0; color: ${BRAND.textColor}; font-size: 12px; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.5;">
            <a href="${data.verificationUrl}" style="color: ${BRAND.primaryColor}; text-decoration: underline;">${data.verificationUrl}</a>
          </p>
        </div>
      </td>
    </tr>
  `
  return getEmailWrapper(content)
}

export function getVerificationEmailText(data: EmailVerificationData): string {
  return `
Welkom, ${data.name}

Bedankt voor je aanmelding bij ${BRAND.name}. Om je account te activeren, verifieer je emailadres via onderstaande link.

ACCOUNT ACTIVEREN:
${data.verificationUrl}

Deze link is 24 uur geldig. Heb je je niet aangemeld bij ${BRAND.name}? Dan kun je deze email negeren.

---
${BRAND.name}
${BRAND.email}
  `.trim()
}

interface PasswordResetEmailData {
  name: string
  resetUrl: string
}

export function getPasswordResetEmailHtml(data: PasswordResetEmailData): string {
  const content = `
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600; line-height: 1.3;">
          Wachtwoord herstellen
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px; line-height: 1.6;">
          Hoi ${data.name},
        </p>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px; line-height: 1.6;">
          Je hebt een verzoek ingediend om je wachtwoord te herstellen. Klik op onderstaande knop om een nieuw wachtwoord in te stellen.
        </p>

        ${getPrimaryButton('Nieuw wachtwoord instellen', data.resetUrl)}

        <!-- Warning -->
        <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
            <strong>Let op:</strong> Deze link is 1 uur geldig en kan slechts eenmaal worden gebruikt.
          </p>
        </div>

        <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.6;">
          Heb je dit verzoek niet gedaan? Dan kun je deze email veilig negeren. Je wachtwoord blijft ongewijzigd.
        </p>

        <!-- Alternative Link -->
        <div style="margin: 24px 0 0; padding: 16px; background-color: ${BRAND.bgColor}; border-radius: 6px;">
          <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 12px;">
            Werkt de knop niet? Kopieer deze link:
          </p>
          <p style="margin: 0; color: ${BRAND.textColor}; font-size: 12px; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.5;">
            <a href="${data.resetUrl}" style="color: ${BRAND.primaryColor}; text-decoration: underline;">${data.resetUrl}</a>
          </p>
        </div>
      </td>
    </tr>
  `
  return getEmailWrapper(content)
}

export function getPasswordResetEmailText(data: PasswordResetEmailData): string {
  return `
Wachtwoord herstellen

Hoi ${data.name},

Je hebt een verzoek ingediend om je wachtwoord te herstellen. Gebruik onderstaande link om een nieuw wachtwoord in te stellen.

NIEUW WACHTWOORD INSTELLEN:
${data.resetUrl}

Let op: Deze link is 1 uur geldig en kan slechts eenmaal worden gebruikt.

Heb je dit verzoek niet gedaan? Dan kun je deze email veilig negeren. Je wachtwoord blijft ongewijzigd.

---
${BRAND.name}
${BRAND.email}
  `.trim()
}

interface WelcomeEmailData {
  name: string
  loginUrl: string
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  const content = `
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600; line-height: 1.3;">
          Je account is geactiveerd
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px; line-height: 1.6;">
          Hoi ${data.name},
        </p>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px; line-height: 1.6;">
          Je emailadres is geverifieerd en je account is nu actief. Je kunt direct beginnen met het ontdekken van nieuwe mensen.
        </p>

        <!-- Features list -->
        <div style="margin: 24px 0; padding: 20px; background-color: ${BRAND.bgColor}; border-radius: 6px;">
          <p style="margin: 0 0 12px; color: ${BRAND.textColor}; font-size: 14px; font-weight: 600;">
            Wat je nu kunt doen:
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 6px 0; color: ${BRAND.textColor}; font-size: 14px; line-height: 1.5;">
                Ontdek nieuwe mensen in je omgeving
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: ${BRAND.textColor}; font-size: 14px; line-height: 1.5;">
                Stuur likes en maak matches
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: ${BRAND.textColor}; font-size: 14px; line-height: 1.5;">
                Chat met je matches
              </td>
            </tr>
          </table>
        </div>

        ${getPrimaryButton('Ga naar de app', data.loginUrl)}
      </td>
    </tr>
  `
  return getEmailWrapper(content)
}

export function getWelcomeEmailText(data: WelcomeEmailData): string {
  return `
Je account is geactiveerd

Hoi ${data.name},

Je emailadres is geverifieerd en je account is nu actief. Je kunt direct beginnen met het ontdekken van nieuwe mensen.

Wat je nu kunt doen:
- Ontdek nieuwe mensen in je omgeving
- Stuur likes en maak matches
- Chat met je matches

GA NAAR DE APP:
${data.loginUrl}

---
${BRAND.name}
${BRAND.email}
  `.trim()
}

// Export brand config for use in other templates
export { BRAND, getEmailWrapper, getEmailHeader, getEmailFooter, getPrimaryButton }
