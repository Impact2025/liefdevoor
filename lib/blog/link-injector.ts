/**
 * Programmatic internal link injector
 * Guarantees minimum 10 internal links regardless of AI output
 */

const STOP_WORDS = new Set([
  'voor', 'met', 'een', 'het', 'van', 'naar', 'zijn', 'haar', 'dat', 'deze',
  'alle', 'over', 'bij', 'in', 'op', 'de', 'en', 'is', 'te', 'om', 'als',
  'ook', 'nog', 'maar', 'niet', 'worden', 'kunnen', 'hebben', 'wordt',
  'kunt', 'zijn', 'door', 'aan', 'uit', 'more', 'this', 'that', 'with',
  'from', 'have', 'been', 'your', 'what', 'when', 'where', 'will', 'just',
])

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getKeywords(title: string): string[] {
  const words = title
    .replace(/[^\wàáâãäåèéêëìíîïòóôõöùúûüý\s]/gi, ' ')
    .split(/\s+/)
    .map(w => w.toLowerCase())
    .filter(w => w.length >= 5 && !STOP_WORDS.has(w))

  const phrases: string[] = []

  // 3-word phrases first (most specific)
  for (let i = 0; i <= words.length - 3; i++) {
    phrases.push(words.slice(i, i + 3).join(' '))
  }
  // 2-word phrases
  for (let i = 0; i <= words.length - 2; i++) {
    phrases.push(words.slice(i, i + 2).join(' '))
  }
  // single long words
  phrases.push(...words.filter(w => w.length >= 6))

  return phrases
}

function countInternalLinks(html: string): number {
  return (html.match(/href=["']\/(?:blog|kennisbank|register|features|veilig-daten|over-ons)[^"']*["']/gi) || []).length
}

function getLinkedUrls(html: string): Set<string> {
  const urls = new Set<string>()
  const matches = html.match(/href=["']([^"']+)["']/g) || []
  matches.forEach(m => {
    const url = m.match(/href=["']([^"']+)["']/)?.[1]
    if (url) urls.add(url)
  })
  return urls
}

/**
 * Try to inject a link inline into a paragraph containing the keyword.
 * Processes paragraph by paragraph to safely handle HTML structure.
 */
function tryInlineInject(html: string, url: string, keyword: string): { html: string; injected: boolean } {
  const esc = escapeRegex(keyword)
  const kwRegex = new RegExp(`\\b(${esc})\\b`, 'i')
  let injected = false

  const result = html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (match, attrs, inner) => {
    if (injected) return match
    // Skip paragraphs that already contain a link
    if (/<a\s/i.test(inner)) return match
    // Check if keyword appears in the text portion
    const textOnly = inner.replace(/<[^>]+>/g, '')
    if (!kwRegex.test(textOnly)) return match
    // Inject into first text node occurrence
    const newInner = inner.replace(kwRegex, `<a href="${url}">$1</a>`)
    if (newInner !== inner) {
      injected = true
      return `<p${attrs}>${newInner}</p>`
    }
    return match
  })

  return { html: result, injected }
}

/**
 * Inject internal links into HTML content.
 * Phase 1: inline injection by keyword matching in paragraphs.
 * Phase 2: append "Lees ook" section for remaining links.
 */
export function injectInternalLinks(
  html: string,
  pages: Array<{ url: string; title: string; desc?: string }>,
  targetMin = 10
): string {
  const existing = countInternalLinks(html)
  if (existing >= targetMin) return html

  const linkedUrls = getLinkedUrls(html)
  const contentText = stripHtml(html)
  let result = html
  let added = existing

  // Score pages by keyword overlap with content
  const scored = pages
    .filter(p => !linkedUrls.has(p.url))
    .map(p => {
      const kws = getKeywords(p.title)
      const score = kws.filter(kw => contentText.includes(kw)).length
      return { ...p, score, keywords: kws }
    })
    .sort((a, b) => b.score - a.score)

  // Phase 1: inline injection
  const inlineLinked = new Set<string>()
  for (const page of scored) {
    if (added >= targetMin + 3) break
    if (linkedUrls.has(page.url) || inlineLinked.has(page.url)) continue

    for (const kw of page.keywords) {
      if (!contentText.includes(kw)) continue
      const { html: newHtml, injected } = tryInlineInject(result, page.url, kw)
      if (injected) {
        result = newHtml
        added++
        inlineLinked.add(page.url)
        linkedUrls.add(page.url)
        break
      }
    }
  }

  // Phase 2: "Lees ook" section for remaining links
  if (added < targetMin) {
    const needed = targetMin - added
    const remaining = scored
      .filter(p => !linkedUrls.has(p.url))
      .slice(0, needed + 2)

    if (remaining.length > 0) {
      const items = remaining
        .map(p => `<li><a href="${p.url}">${p.title}</a></li>`)
        .join('\n')
      result += `\n<h2>Lees ook</h2>\n<ul>\n${items}\n</ul>`
    }
  }

  return result
}
