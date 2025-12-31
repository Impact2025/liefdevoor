'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Check, MessageSquare } from 'lucide-react'

interface ArticleFeedbackProps {
  articleId: string
  className?: string
}

export default function ArticleFeedback({
  articleId,
  className = ''
}: ArticleFeedbackProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedback(isHelpful ? 'helpful' : 'not_helpful')

    // If not helpful, show comment box
    if (!isHelpful) {
      setShowComment(true)
      return
    }

    // Submit positive feedback immediately
    await submitFeedback(isHelpful, '')
  }

  const submitFeedback = async (isHelpful: boolean, feedbackComment: string) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/kennisbank/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          isHelpful,
          comment: feedbackComment,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentSubmit = async () => {
    await submitFeedback(false, comment)
  }

  if (submitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-6 text-center ${className}`}>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium text-green-800">Bedankt voor je feedback!</p>
        <p className="text-sm text-green-600 mt-1">
          Dit helpt ons de kennisbank te verbeteren.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-6 ${className}`}>
      <p className="font-medium text-gray-900 text-center mb-4">
        Was dit artikel nuttig?
      </p>

      {!feedback && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleFeedback(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors"
          >
            <ThumbsUp className="w-5 h-5" />
            Ja
          </button>
          <button
            onClick={() => handleFeedback(false)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <ThumbsDown className="w-5 h-5" />
            Nee
          </button>
        </div>
      )}

      {showComment && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Wat kunnen we verbeteren?</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Je feedback helpt ons deze pagina te verbeteren..."
            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleCommentSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verzenden...' : 'Verstuur Feedback'}
            </button>
            <button
              onClick={() => submitFeedback(false, '')}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
            >
              Overslaan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
