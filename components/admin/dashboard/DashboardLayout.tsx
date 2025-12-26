'use client'

import { ReactNode } from 'react'
import { Users, Heart, Shield, BarChart3, Settings, Mail, Bell, FileText, Eye } from 'lucide-react'

export interface Tab {
  id: string
  label: string
  icon: typeof Users
}

interface DashboardLayoutProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  children: ReactNode
}

/**
 * Admin Dashboard Layout Component
 *
 * Provides consistent layout with sidebar navigation for all dashboard tabs
 */
export default function DashboardLayout({
  activeTab,
  onTabChange,
  children,
}: DashboardLayoutProps) {
  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'matches', label: 'Matches', icon: Heart },
    { id: 'reports', label: 'Reports', icon: Shield },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'moderation', label: 'Moderation', icon: Eye },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'safety', label: 'Safety', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage users, content, and system settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id

                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mr-3 ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
