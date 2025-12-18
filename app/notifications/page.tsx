'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  relatedId?: string
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchNotifications()
  }, [session, status, router])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      } else {
        console.error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read' }),
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== id))
        // Update unread count if the deleted notification was unread
        const deletedNotif = notifications.find(n => n.id === id)
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_match':
        return '💕'
      case 'new_message':
        return '💬'
      case 'admin_alert':
        return '⚠️'
      default:
        return '🔔'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No notifications yet!</p>
            <p className="text-sm text-gray-400 mt-2">You'll receive notifications for new matches and messages.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                  notification.isRead
                    ? 'border-gray-300'
                    : 'border-primary bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}