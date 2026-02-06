/**
 * Preview New Email Templates
 * Generate HTML previews of the enhanced templates
 */

import { render } from '@react-email/render'
import * as React from 'react'
import * as fs from 'fs'
import * as path from 'path'

// Import templates
import WelcomeV2 from '../lib/email/templates/migration/welcome-v2'
import ReminderV2 from '../lib/email/templates/migration/reminder-v2'

async function previewTemplates() {
  console.log('\n📧 Generating Email Template Previews...\n')

  const outputDir = path.join(process.cwd(), 'email-previews')

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  try {
    // Preview 1: Welcome V2 - VIP User
    console.log('1. Generating Welcome V2 (VIP)...')
    const welcomeVipHtml = await render(
      React.createElement(WelcomeV2, {
        userName: 'John',
        landingUrl: 'https://liefdevooriedereen.nl/welkom/demo-token',
        premiumMonths: 6,
        superMessages: 20,
        photoCount: 12,
        matchCount: 8,
        memberYears: 3,
        segment: 'VIP',
        activatedToday: 15,
        daysUntilExpiry: 30,
        claimToken: 'demo123',
        emailId: 'preview123'
      })
    )
    fs.writeFileSync(path.join(outputDir, 'welcome-v2-vip.html'), welcomeVipHtml)
    console.log('   ✅ Saved: email-previews/welcome-v2-vip.html')

    // Preview 2: Welcome V2 - GOLD User
    console.log('2. Generating Welcome V2 (GOLD)...')
    const welcomeGoldHtml = await render(
      React.createElement(WelcomeV2, {
        userName: 'Maria',
        landingUrl: 'https://liefdevooriedereen.nl/welkom/demo-token',
        premiumMonths: 4,
        superMessages: 15,
        photoCount: 8,
        matchCount: 5,
        memberYears: 2,
        segment: 'GOLD',
        activatedToday: 15,
        daysUntilExpiry: 30,
        claimToken: 'demo456',
        emailId: 'preview456'
      })
    )
    fs.writeFileSync(path.join(outputDir, 'welcome-v2-gold.html'), welcomeGoldHtml)
    console.log('   ✅ Saved: email-previews/welcome-v2-gold.html')

    // Preview 3: Reminder V2 - Opened but no click
    console.log('3. Generating Reminder V2 (Opened, No Click)...')
    const reminderOpenedHtml = await render(
      React.createElement(ReminderV2, {
        userName: 'Peter',
        landingUrl: 'https://liefdevooriedereen.nl/welkom/demo-token',
        daysRemaining: 7,
        premiumMonths: 4,
        superMessages: 15,
        photoCount: 10,
        hasOpened: true,
        hasClicked: false,
        emailId: 'preview789'
      })
    )
    fs.writeFileSync(path.join(outputDir, 'reminder-v2-opened.html'), reminderOpenedHtml)
    console.log('   ✅ Saved: email-previews/reminder-v2-opened.html')

    // Preview 4: Reminder V2 - Last Chance (urgent)
    console.log('4. Generating Reminder V2 (Last Chance)...')
    const reminderUrgentHtml = await render(
      React.createElement(ReminderV2, {
        userName: 'Sophie',
        landingUrl: 'https://liefdevooriedereen.nl/welkom/demo-token',
        daysRemaining: 2,
        premiumMonths: 3,
        superMessages: 10,
        photoCount: 6,
        hasOpened: true,
        hasClicked: true,
        emailId: 'preview101'
      })
    )
    fs.writeFileSync(path.join(outputDir, 'reminder-v2-urgent.html'), reminderUrgentHtml)
    console.log('   ✅ Saved: email-previews/reminder-v2-urgent.html')

    // Create index file
    const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Template Previews</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f6f9fc;
    }
    h1 {
      color: #1a1a1a;
      margin-bottom: 30px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .card h2 {
      color: #1a1a1a;
      margin: 0 0 8px 0;
      font-size: 18px;
    }
    .card p {
      color: #6b7280;
      margin: 0 0 16px 0;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }
    .badge-vip { background: #fef3c7; color: #92400e; }
    .badge-gold { background: #fef2f2; color: #991b1b; }
    .badge-urgent { background: #fee2e2; color: #991b1b; }
    .badge-reminder { background: #e0e7ff; color: #3730a3; }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: #ef4444;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.2s;
    }
    a:hover {
      background: #dc2626;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>📧 Email Template Previews</h1>

  <div class="grid">
    <div class="card">
      <h2><span class="badge badge-vip">VIP</span> Welcome V2</h2>
      <p>Professional welcome email with 6 months premium offer</p>
      <a href="welcome-v2-vip.html" target="_blank">Preview →</a>
    </div>

    <div class="card">
      <h2><span class="badge badge-gold">GOLD</span> Welcome V2</h2>
      <p>Welcome email with 4 months premium offer</p>
      <a href="welcome-v2-gold.html" target="_blank">Preview →</a>
    </div>

    <div class="card">
      <h2><span class="badge badge-reminder">REMINDER</span> Opened, No Click</h2>
      <p>Follow-up for users who opened but didn't click</p>
      <a href="reminder-v2-opened.html" target="_blank">Preview →</a>
    </div>

    <div class="card">
      <h2><span class="badge badge-urgent">URGENT</span> Last Chance</h2>
      <p>Final reminder for users with 2 days left</p>
      <a href="reminder-v2-urgent.html" target="_blank">Preview →</a>
    </div>
  </div>

  <div class="footer">
    <strong>✅ All templates generated successfully!</strong>
    <br><br>
    Generated: ${new Date().toLocaleString('nl-NL')}
    <br>
    Location: email-previews/
  </div>
</body>
</html>
    `
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml)
    console.log('5. Creating index.html...')
    console.log('   ✅ Saved: email-previews/index.html')

    console.log('\n✅ All email template previews generated!\n')
    console.log('📂 Open: email-previews/index.html in your browser\n')

  } catch (error) {
    console.error('❌ Error generating previews:', error)
  }
}

previewTemplates()
