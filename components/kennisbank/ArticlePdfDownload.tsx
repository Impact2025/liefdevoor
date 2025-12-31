'use client'

import { useState, useRef } from 'react'
import { Download, FileText, Lock, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ArticlePdfDownloadProps {
  articleId: string
  articleTitle: string
  articleContent: string
  articleCategory: string
  isProfessionalOnly?: boolean
  className?: string
}

export default function ArticlePdfDownload({
  articleId,
  articleTitle,
  articleContent,
  articleCategory,
  isProfessionalOnly = true,
  className = ''
}: ArticlePdfDownloadProps) {
  const { data: session, status } = useSession()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Check if user can download PDFs (professionals only by default)
  const canDownload = !isProfessionalOnly || (session?.user as any)?.isProfessional

  const generatePdf = async () => {
    if (!canDownload) return

    setIsGenerating(true)
    setError(null)

    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import('jspdf')

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let yPosition = margin

      // Header with logo/brand
      pdf.setFillColor(225, 29, 72) // Rose-600
      pdf.rect(0, 0, pageWidth, 25, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Liefde Voor Iedereen', margin, 16)

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Kennisbank', pageWidth - margin, 16, { align: 'right' })

      yPosition = 40

      // Category badge
      pdf.setFillColor(243, 244, 246) // Gray-100
      pdf.roundedRect(margin, yPosition - 5, 50, 8, 2, 2, 'F')
      pdf.setTextColor(75, 85, 99) // Gray-600
      pdf.setFontSize(9)
      pdf.text(articleCategory, margin + 3, yPosition)

      yPosition += 15

      // Title
      pdf.setTextColor(17, 24, 39) // Gray-900
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')

      const titleLines = pdf.splitTextToSize(articleTitle, contentWidth)
      pdf.text(titleLines, margin, yPosition)
      yPosition += titleLines.length * 10 + 10

      // Divider line
      pdf.setDrawColor(229, 231, 235) // Gray-200
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // Content
      pdf.setTextColor(55, 65, 81) // Gray-700
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')

      // Clean HTML content and convert to plain text
      const cleanContent = articleContent
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()

      const contentLines = pdf.splitTextToSize(cleanContent, contentWidth)
      const lineHeight = 6

      for (let i = 0; i < contentLines.length; i++) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.text(contentLines[i], margin, yPosition)
        yPosition += lineHeight
      }

      // Footer
      const footerY = pageHeight - 15
      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

      pdf.setFontSize(8)
      pdf.setTextColor(156, 163, 175) // Gray-400
      pdf.text(
        `Gedownload van liefdevooriederen.nl/kennisbank | ${new Date().toLocaleDateString('nl-NL')}`,
        margin,
        footerY
      )

      pdf.text(
        `Pagina 1 van ${pdf.getNumberOfPages()}`,
        pageWidth - margin,
        footerY,
        { align: 'right' }
      )

      // Download
      const filename = `${articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
      pdf.save(filename)

      // Track download
      try {
        await fetch('/api/kennisbank/articles/' + articleId + '/download', {
          method: 'POST'
        })
      } catch {
        // Ignore tracking errors
      }

    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Er ging iets mis bij het genereren van de PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  // Not logged in
  if (status === 'unauthenticated' && isProfessionalOnly) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">PDF Download</p>
            <p className="text-xs text-gray-500">
              <a href="/professionals/aanmelden" className="text-rose-600 hover:underline">
                Word professional
              </a>
              {' '}voor PDF downloads
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Logged in but not professional
  if (!canDownload && isProfessionalOnly) {
    return (
      <div className={`bg-indigo-50 border border-indigo-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-700">PDF Download</p>
            <p className="text-xs text-indigo-600">
              <a href="/professionals" className="underline">
                Upgrade naar Professional
              </a>
              {' '}voor PDF downloads
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        onClick={generatePdf}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>PDF genereren...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download als PDF</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
