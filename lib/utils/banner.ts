export type BannerColor = 'rose' | 'teal'

export function parseBannerText(raw: string | null): { text: string; color: BannerColor } {
  if (!raw) return { text: '', color: 'rose' }
  if (raw.startsWith('[teal]')) return { text: raw.slice(6), color: 'teal' }
  if (raw.startsWith('[rose]')) return { text: raw.slice(6), color: 'rose' }
  return { text: raw, color: 'rose' }
}

export function encodeBannerText(text: string, color: BannerColor): string {
  if (color === 'teal') return `[teal]${text}`
  return text
}

export const bannerGradients: Record<BannerColor, string> = {
  rose: 'from-[#C34C60] to-[#e05472]',
  teal: 'from-[#1B6874] to-[#2A8A9A]',
}
