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
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-red-100">
            <span className="text-xl">💕</span>
          </div>
        )
      case 'new_message':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
            <span className="text-xl">💬</span>
          </div>
        )
      case 'super_like':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100">
            <span className="text-xl">⭐</span>
          </div>
        )
      case 'admin_alert':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-red-100">
            <span className="text-xl">⚠️</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-slate-100">
            <span className="text-xl">🔔</span>
          </div>
        )
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'new_match':
        return 'Nieuwe Match!'
      case 'new_message':
        return 'Nieuw Bericht'
      case 'super_like':
        return 'Super Like!'
      case 'admin_alert':
        return 'Melding'
      default:
        return 'Notificatie'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Meldingen laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24 lg:ml-64 lg:pt-6">
      <div className="max-w-2xl mx-auto px-4 pt-6 lg:max-w-5xl xl:max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Meldingen</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full lg:w-auto bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium px-6 py-3 rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Alles als gelezen markeren ({unreadCount})
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <span className="text-4xl">🔔</span>
            </div>
            <p className="text-lg font-medium text-gray-700">Nog geen meldingen!</p>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Je ontvangt meldingen bij nieuwe matches en berichten.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                  !notification.isRead ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-red-500"></div>
                )}

                <div className="p-5 pl-6">
                  {/* Top Section: Icon + Content + Actions */}
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                          {getNotificationTypeLabel(notification.type)}
                        </h3>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-medium text-pink-600 hover:text-pink-700 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
                            >
                              Gelezen
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs font-medium text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Verwijderen
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 text-base leading-relaxed mb-3">
                        {notification.message}
                      </p>

                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(notification.createdAt).toLocaleString('nl-NL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                    </div>
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