import { google } from 'googleapis'

export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY
  if (!key) {
    console.warn('[IndexNow] INDEXNOW_KEY not set — skipping')
    return
  }
  if (!urls.length) return

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const host = new URL(siteUrl).host

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList: urls,
      }),
    })

    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] Submitted ${urls.length} URL(s) — status ${res.status}`)
    } else {
      console.warn(`[IndexNow] Unexpected status ${res.status}: ${await res.text()}`)
    }
  } catch (err) {
    console.error('[IndexNow] Request failed:', err)
  }
}

export async function pingGoogleIndexingAPI(url: string): Promise<void> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    console.warn('[Google Indexing] GOOGLE_SERVICE_ACCOUNT_JSON not set — skipping')
    return
  }

  try {
    const credentials = JSON.parse(raw)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    const res = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      }
    )

    if (res.ok) {
      console.log(`[Google Indexing] Submitted URL: ${url}`)
    } else {
      console.warn(`[Google Indexing] Status ${res.status}: ${await res.text()}`)
    }
  } catch (err) {
    console.error('[Google Indexing] Request failed:', err)
  }
}
