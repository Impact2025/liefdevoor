/**
 * FAQ Feedback Widget
 * Allows users to rate if an FAQ article was helpful
 */

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

interface FAQFeedbackWidgetProps {
  articleId: string
}

export function FAQFeedbackWidget({ articleId }: FAQFeedbackWidgetProps) {
  const { data: session } = useSession()
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleFeedback = async (isHelpful: boolean) => {
    if (!session) {
      // Could show login prompt here
      return
    }

    setFeedback(isHelpful ? 'helpful' : 'not-helpful')

    // If not helpful, show comment form
    if (!isHelpful) {
      setShowComment(true)
      return
    }

    // Submit helpful feedback immediately
    await submitFeedback(isHelpful, '')
  }

  const submitFeedback = async (isHelpful: boolean, feedbackComment: string) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/faq/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          isHelpful,
          comment: feedbackComment || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setHasSubmitted(true)

      // Hide comment form after 3 seconds
      setTimeout(() => {
        setShowComment(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Er ging iets mis bij het versturen van je feedback. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitFeedback(false, comment)
  }

  if (hasSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-semibold text-green-900 mb-1">Bedankt voor je feedback!</h3>
        <p className="text-sm text-green-700">
          {feedback === 'helpful'
            ? 'Fijn dat dit artikel je heeft geholpen.'
            : 'We gebruiken je feedback om onze artikelen te verbeteren.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {!showComment ? (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Was dit artikel nuttig?</h3>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleFeedback(true)}
              disabled={feedback !== null}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                feedback === 'helpful'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="font-medium">Ja, nuttig</span>
            </button>

            <button
              onClick={() => handleFeedback(false)}
              disabled={feedback !== null}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                feedback === 'not-helpful'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="font-medium">Nee, niet nuttig</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCommentSubmit}>
          <h3 className="font-semibold text-gray-900 mb-2">Help ons verbeteren</h3>
          <p className="text-sm text-gray-600 mb-4">
            Vertel ons wat er ontbrak of onduidelijk was (optioneel)
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Je feedback..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent mb-4"
          />
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Verstuur feedback
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => submitFeedback(false, '')}
              disabled={isSubmitting}
            >
              Overslaan
            </Button>
          </div>
        </form>
      )}

      {!session && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Je moet ingelogd zijn om feedback te geven
        </p>
      )}
    </div>
  )
}
