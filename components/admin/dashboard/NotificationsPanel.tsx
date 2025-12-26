'use client'

import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { FormEvent } from 'react'

interface NotificationForm {
  title: string
  message: string
  targetUserId: string
}

interface NotificationsPanelProps {
  form: NotificationForm
  sending: boolean
  onFormChange: (field: keyof NotificationForm, value: string) => void
  onSend: () => Promise<void>
}

/**
 * Admin Notifications Panel Component
 *
 * Form to send admin notifications to users
 */
export default function NotificationsPanel({
  form,
  sending,
  onFormChange,
  onSend,
}: NotificationsPanelProps) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await toast.promise(
        onSend(),
        {
          loading: 'Sending notification...',
          success: 'Notification sent successfully!',
          error: 'Failed to send notification',
        }
      )
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Notifications</h2>

      {/* Send Notification Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Send Admin Alert</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notificationTitle" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="notificationTitle"
              value={form.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="notificationMessage" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="notificationMessage"
              value={form.message}
              onChange={(e) => onFormChange('message', e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="targetUser" className="block text-sm font-medium text-gray-700">
              Target User (leave empty to send to all users)
            </label>
            <input
              type="text"
              id="targetUser"
              value={form.targetUserId}
              onChange={(e) => onFormChange('targetUserId', e.target.value)}
              placeholder="User ID or email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Admin Notifications</h3>
        <div className="text-center text-gray-500 py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Notification history will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}
