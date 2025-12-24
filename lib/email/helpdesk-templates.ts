/**
 * Helpdesk Email Templates
 * Email notifications for support tickets and FAQ
 */

import { sendEmail } from './send'

// Import brand constants and helpers from main templates
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

function getEmailHeader(): string {
  return `
    <tr>
      <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid ${BRAND.borderColor};">
        <img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="180" height="auto" style="display: block; margin: 0 auto;" />
      </td>
    </tr>
  `
}

function getEmailFooter(): string {
  return `
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

function getEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND.name}</title>
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

// ============================================
// TICKET CREATED - User notification
// ============================================

interface TicketCreatedData {
  to: string
  name: string
  ticketId: string
  subject: string
}

export async function sendTicketCreatedEmail(data: TicketCreatedData) {
  const ticketNumber = data.ticketId.slice(-8).toUpperCase()

  const content = `
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600;">
          Je support ticket is aangemaakt
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          Hoi ${data.name},
        </p>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          We hebben je supportverzoek ontvangen en ons team gaat er zo snel mogelijk mee aan de slag.
        </p>

        <div style="margin: 24px 0; padding: 20px; background-color: ${BRAND.bgColor}; border-radius: 6px; border-left: 3px solid ${BRAND.primaryColor};">
          <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 13px;">
            Ticket nummer
          </p>
          <p style="margin: 0 0 12px; color: ${BRAND.textColor}; font-size: 16px; font-weight: 600;">
            #${ticketNumber}
          </p>
          <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 13px;">
            Onderwerp
          </p>
          <p style="margin: 0; color: ${BRAND.textColor}; font-size: 15px;">
            ${data.subject}
          </p>
        </div>

        ${getPrimaryButton('Bekijk ticket', `${BRAND.website}/support/tickets/${data.ticketId}`)}

        <p style="margin: 24px 0 0; color: ${BRAND.textMuted}; font-size: 13px;">
          Je ontvangt een email zodra er een reactie is op je ticket.
        </p>
      </td>
    </tr>
  `

  await sendEmail({
    to: data.to,
    subject: `Support Ticket #${ticketNumber} - ${data.subject}`,
    html: getEmailWrapper(content),
    text: `
Je support ticket is aangemaakt

Hoi ${data.name},

We hebben je supportverzoek ontvangen en ons team gaat er zo snel mogelijk mee aan de slag.

Ticket nummer: #${ticketNumber}
Onderwerp: ${data.subject}

Bekijk ticket: ${BRAND.website}/support/tickets/${data.ticketId}

Je ontvangt een email zodra er een reactie is op je ticket.

---
${BRAND.name}
${BRAND.email}
    `.trim()
  })
}

// ============================================
// TICKET REPLY - User notification
// ============================================

interface TicketReplyData {
  to: string
  name: string
  ticketId: string
  subject: string
  replyMessage: string
}

export async function sendTicketReplyEmail(data: TicketReplyData) {
  const ticketNumber = data.ticketId.slice(-8).toUpperCase()
  const messagePreview = data.replyMessage.length > 300
    ? data.replyMessage.substring(0, 300) + '...'
    : data.replyMessage

  const content = `
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600;">
          Nieuwe reactie op je support ticket
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          Hoi ${data.name},
        </p>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          Er is een nieuwe reactie geplaatst op je support ticket.
        </p>

        <div style="margin: 24px 0; padding: 20px; background-color: ${BRAND.bgColor}; border-radius: 6px;">
          <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 13px;">
            Ticket #${ticketNumber}: ${data.subject}
          </p>
          <p style="margin: 12px 0 0; color: ${BRAND.textColor}; font-size: 15px; line-height: 1.6;">
            ${messagePreview}
          </p>
        </div>

        ${getPrimaryButton('Bekijk en reageer', `${BRAND.website}/support/tickets/${data.ticketId}`)}
      </td>
    </tr>
  `

  await sendEmail({
    to: data.to,
    subject: `Re: Ticket #${ticketNumber} - ${data.subject}`,
    html: getEmailWrapper(content),
    text: `
Nieuwe reactie op je support ticket

Hoi ${data.name},

Er is een nieuwe reactie geplaatst op je support ticket.

Ticket #${ticketNumber}: ${data.subject}

${data.replyMessage}

Bekijk en reageer: ${BRAND.website}/support/tickets/${data.ticketId}

---
${BRAND.name}
${BRAND.email}
    `.trim()
  })
}

// ============================================
// TICKET STATUS CHANGED - User notification
// ============================================

interface TicketStatusChangedData {
  to: string
  name: string
  ticketId: string
  subject: string
  status: string
}

const statusLabels: Record<string, string> = {
  'OPEN': 'Open',
  'IN_PROGRESS': 'In behandeling',
  'WAITING': 'Wacht op jouw reactie',
  'RESOLVED': 'Opgelost',
  'CLOSED': 'Gesloten'
}

export async function sendTicketStatusChangedEmail(data: TicketStatusChangedData) {
  const ticketNumber = data.ticketId.slice(-8).toUpperCase()
  const statusLabel = statusLabels[data.status] || data.status

  const content = `
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600;">
          Status van je ticket is gewijzigd
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          Hoi ${data.name},
        </p>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          De status van je support ticket is bijgewerkt.
        </p>

        <div style="margin: 24px 0; padding: 20px; background-color: ${BRAND.bgColor}; border-radius: 6px;">
          <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 13px;">
            Ticket #${ticketNumber}: ${data.subject}
          </p>
          <p style="margin: 12px 0 0; color: ${BRAND.textColor}; font-size: 18px; font-weight: 600;">
            Status: ${statusLabel}
          </p>
        </div>

        ${getPrimaryButton('Bekijk ticket', `${BRAND.website}/support/tickets/${data.ticketId}`)}
      </td>
    </tr>
  `

  await sendEmail({
    to: data.to,
    subject: `Ticket #${ticketNumber} - Status: ${statusLabel}`,
    html: getEmailWrapper(content),
    text: `
Status van je ticket is gewijzigd

Hoi ${data.name},

De status van je support ticket is bijgewerkt.

Ticket #${ticketNumber}: ${data.subject}
Nieuwe status: ${statusLabel}

Bekijk ticket: ${BRAND.website}/support/tickets/${data.ticketId}

---
${BRAND.name}
${BRAND.email}
    `.trim()
  })
}

// ============================================
// NEW TICKET - Admin notification
// ============================================

interface NewTicketToAdminData {
  to: string
  adminName: string
  ticketId: string
  subject: string
  category: string
  userName: string
}

export async function sendNewTicketToAdminEmail(data: NewTicketToAdminData) {
  const ticketNumber = data.ticketId.slice(-8).toUpperCase()

  const content = `
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600;">
          Nieuw support ticket
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          Hoi ${data.adminName},
        </p>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          Er is een nieuw support ticket aangemaakt dat aandacht vereist.
        </p>

        <div style="margin: 24px 0; padding: 20px; background-color: ${BRAND.bgColor}; border-radius: 6px; border-left: 3px solid ${BRAND.primaryColor};">
          <p style="margin: 0 0 12px;">
            <span style="color: ${BRAND.textMuted}; font-size: 13px;">Ticket:</span><br />
            <span style="color: ${BRAND.textColor}; font-size: 16px; font-weight: 600;">#${ticketNumber}</span>
          </p>
          <p style="margin: 0 0 12px;">
            <span style="color: ${BRAND.textMuted}; font-size: 13px;">Van:</span><br />
            <span style="color: ${BRAND.textColor}; font-size: 15px;">${data.userName}</span>
          </p>
          <p style="margin: 0 0 12px;">
            <span style="color: ${BRAND.textMuted}; font-size: 13px;">Categorie:</span><br />
            <span style="color: ${BRAND.textColor}; font-size: 15px;">${data.category}</span>
          </p>
          <p style="margin: 0;">
            <span style="color: ${BRAND.textMuted}; font-size: 13px;">Onderwerp:</span><br />
            <span style="color: ${BRAND.textColor}; font-size: 15px;">${data.subject}</span>
          </p>
        </div>

        ${getPrimaryButton('Bekijk en reageer', `${BRAND.website}/admin/helpdesk/tickets/${data.ticketId}`)}
      </td>
    </tr>
  `

  await sendEmail({
    to: data.to,
    subject: `[Support] Nieuw Ticket #${ticketNumber} - ${data.category}`,
    html: getEmailWrapper(content),
    text: `
Nieuw support ticket

Hoi ${data.adminName},

Er is een nieuw support ticket aangemaakt dat aandacht vereist.

Ticket: #${ticketNumber}
Van: ${data.userName}
Categorie: ${data.category}
Onderwerp: ${data.subject}

Bekijk en reageer: ${BRAND.website}/admin/helpdesk/tickets/${data.ticketId}

---
${BRAND.name} Support Team
    `.trim()
  })
}

// ============================================
// NEW TICKET REPLY - Admin notification
// ============================================

interface NewTicketReplyToAdminData {
  to: string
  adminName: string
  ticketId: string
  subject: string
  replyMessage: string
  userName: string
}

export async function sendNewTicketReplyToAdminEmail(data: NewTicketReplyToAdminData) {
  const ticketNumber = data.ticketId.slice(-8).toUpperCase()
  const messagePreview = data.replyMessage.length > 200
    ? data.replyMessage.substring(0, 200) + '...'
    : data.replyMessage

  const content = `
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px; color: ${BRAND.textColor}; font-size: 24px; font-weight: 600;">
          Nieuwe reactie op ticket
        </h1>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          Hoi ${data.adminName},
        </p>

        <p style="margin: 0 0 16px; color: ${BRAND.textColor}; font-size: 15px;">
          ${data.userName} heeft gereageerd op ticket #${ticketNumber}.
        </p>

        <div style="margin: 24px 0; padding: 20px; background-color: ${BRAND.bgColor}; border-radius: 6px;">
          <p style="margin: 0 0 8px; color: ${BRAND.textMuted}; font-size: 13px;">
            ${data.subject}
          </p>
          <p style="margin: 12px 0 0; color: ${BRAND.textColor}; font-size: 15px; line-height: 1.6;">
            ${messagePreview}
          </p>
        </div>

        ${getPrimaryButton('Bekijk en reageer', `${BRAND.website}/admin/helpdesk/tickets/${data.ticketId}`)}
      </td>
    </tr>
  `

  await sendEmail({
    to: data.to,
    subject: `[Support] Reactie op #${ticketNumber} van ${data.userName}`,
    html: getEmailWrapper(content),
    text: `
Nieuwe reactie op ticket

Hoi ${data.adminName},

${data.userName} heeft gereageerd op ticket #${ticketNumber}.

${data.subject}

${data.replyMessage}

Bekijk en reageer: ${BRAND.website}/admin/helpdesk/tickets/${data.ticketId}

---
${BRAND.name} Support Team
    `.trim()
  })
}
