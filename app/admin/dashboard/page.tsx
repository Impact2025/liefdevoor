'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Users, Heart, Shield, BarChart3, Settings, Ban, UserCheck, Search, ChevronLeft, ChevronRight, Mail, Send, Filter, Calendar, TrendingUp, FileText } from 'lucide-react'
import AIGeneratorForm from '@/components/admin/AIGeneratorForm'
import GeneratedContentPreview from '@/components/admin/GeneratedContentPreview'
import BlogPostsTable from '@/components/admin/BlogPostsTable'
import type { AIGeneratorParams, GeneratedBlogContent, SavePostData, BlogPost, BlogCategory, BlogStats, BlogPagination } from '@/lib/types'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    activeUsers: 0,
    reportedUsers: 0
  })

  const [users, setUsers] = useState([])
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const [matches, setMatches] = useState([])
  const [matchPagination, setMatchPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [matchStats, setMatchStats] = useState({
    totalMatches: 0,
    matchesLast30Days: 0,
    avgMessagesPerMatch: 0
  })

  const [reports, setReports] = useState([])
  const [reportPagination, setReportPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [reportStatusFilter, setReportStatusFilter] = useState('pending')

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    targetUserId: ''
  })
  const [sendingNotification, setSendingNotification] = useState(false)

  // Email Management State
  const [emails, setEmails] = useState([])
  const [emailPagination, setEmailPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })
  const [emailStats, setEmailStats] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    totalFailed: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0
  })
  const [emailFilters, setEmailFilters] = useState({
    type: '',
    category: '',
    status: '',
    email: '',
    dateFrom: '',
    dateTo: ''
  })
  const [testEmailForm, setTestEmailForm] = useState({
    type: 'match',
    email: ''
  })
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  // Blog Management State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [generatedContent, setGeneratedContent] = useState<GeneratedBlogContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [blogStats, setBlogStats] = useState<BlogStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0
  })
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([])
  const [blogPagination, setBlogPagination] = useState<BlogPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [blogFilters, setBlogFilters] = useState({
    category: '',
    status: '',
    search: ''
  })

  useEffect(() => {
    // Fetch dashboard stats
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'matches') {
      fetchMatches()
    } else if (activeTab === 'reports') {
      fetchReports()
    } else if (activeTab === 'emails') {
      fetchEmails()
    } else if (activeTab === 'blog') {
      fetchBlogPosts()
      fetchBlogCategories()
    }
  }, [activeTab, userPagination.page, userSearch, userRoleFilter, matchPagination.page, reportPagination.page, reportStatusFilter, emailPagination.page, emailFilters, blogPagination.page, blogFilters])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: userPagination.page.toString(),
        limit: userPagination.limit.toString(),
        search: userSearch,
        role: userRoleFilter
      })
      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setUserPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let response
      if (action === 'block' || action === 'unblock') {
        response = await fetch('/api/block', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, action })
        })
      } else {
        response = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, action })
        })
      }
      if (response.ok) {
        fetchUsers() // Refresh the user list
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: matchPagination.page.toString(),
        limit: matchPagination.limit.toString()
      })
      const response = await fetch(`/api/admin/matches?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
        setMatchPagination(data.pagination)
        setMatchStats(data.statistics)
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: reportPagination.page.toString(),
        limit: reportPagination.limit.toString(),
        status: reportStatusFilter
      })
      const response = await fetch(`/api/report?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        setReportPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: string) => {
    try {
      const response = await fetch('/api/report', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportId, action })
      })
      if (response.ok) {
        fetchReports() // Refresh the reports list
      }
    } catch (error) {
      console.error('Failed to update report:', error)
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingNotification(true)

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'admin_alert',
          title: notificationForm.title,
          message: notificationForm.message,
          targetUserId: notificationForm.targetUserId || undefined
        })
      })

      if (response.ok) {
        setNotificationForm({ title: '', message: '', targetUserId: '' })
        alert('Notification sent successfully!')
      } else {
        alert('Failed to send notification')
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      alert('Failed to send notification')
    } finally {
      setSendingNotification(false)
    }
  }

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: emailPagination.page.toString(),
        limit: emailPagination.limit.toString(),
        ...(emailFilters.type && { type: emailFilters.type }),
        ...(emailFilters.category && { category: emailFilters.category }),
        ...(emailFilters.status && { status: emailFilters.status }),
        ...(emailFilters.email && { email: emailFilters.email }),
        ...(emailFilters.dateFrom && { dateFrom: emailFilters.dateFrom }),
        ...(emailFilters.dateTo && { dateTo: emailFilters.dateTo })
      })

      const response = await fetch(`/api/admin/emails?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEmails(data.logs || [])
        setEmailPagination(data.pagination)
        setEmailStats(data.statistics)
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingTestEmail(true)

    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testEmailForm)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Test email sent successfully!')
        setTestEmailForm({ type: 'match', email: '' })
        // Refresh email logs
        fetchEmails()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      alert('Failed to send test email')
    } finally {
      setSendingTestEmail(false)
    }
  }

  // Blog Management Functions
  const fetchBlogPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: blogPagination.page.toString(),
        limit: blogPagination.limit.toString(),
        ...(blogFilters.category && { category: blogFilters.category }),
        ...(blogFilters.status && { published: blogFilters.status === 'published' ? 'true' : 'false' }),
        ...(blogFilters.search && { search: blogFilters.search })
      })

      const response = await fetch(`/api/admin/blog/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.posts || [])
        if (data.pagination) {
          setBlogPagination(data.pagination)
        }
        // Calculate stats
        const totalPosts = data.posts?.length || 0
        const publishedPosts = data.posts?.filter((p: BlogPost) => p.published).length || 0
        setBlogStats({
          totalPosts: data.pagination?.total || totalPosts,
          publishedPosts,
          draftPosts: (data.pagination?.total || totalPosts) - publishedPosts,
          totalViews: 0 // Can be calculated from likeCount or separate view tracking
        })
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlogCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories')
      if (response.ok) {
        const data = await response.json()
        setBlogCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch blog categories:', error)
    }
  }

  const handleGenerateBlog = async (params: AIGeneratorParams) => {
    setIsGenerating(true)
    setGeneratedContent(null)
    try {
      const response = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedContent(data)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate blog post')
      }
    } catch (error) {
      console.error('Failed to generate blog:', error)
      alert('Failed to generate blog post')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveBlogPost = async (data: SavePostData) => {
    try {
      const response = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        alert(`Blog post ${data.published ? 'gepubliceerd' : 'opgeslagen als concept'}!`)
        setGeneratedContent(null)
        fetchBlogPosts() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save blog post')
      }
    } catch (error) {
      console.error('Failed to save blog post:', error)
      alert('Failed to save blog post')
    }
  }

  const togglePublishBlogPost = async (id: string, published: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ published })
      })

      if (response.ok) {
        fetchBlogPosts() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error)
      alert('Failed to update post')
    }
  }

  const deleteBlogPost = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Blog post verwijderd!')
        fetchBlogPosts() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const handleEditBlogPost = (post: BlogPost) => {
    // For now, just alert - in the future, could open edit modal
    alert(`Edit functionaliteit voor "${post.title}" komt binnenkort!`)
  }

  const handleBlogFilterChange = (filters: { category: string; status: string; search: string }) => {
    setBlogFilters(filters)
    setBlogPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1 when filters change
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'matches', label: 'Match Oversight', icon: Heart },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'emails', label: 'Email Management', icon: Mail },
    { id: 'reports', label: 'Reports', icon: Shield },
    { id: 'notifications', label: 'Send Notifications', icon: Users },
    { id: 'moderation', label: 'Content Moderation', icon: Shield },
    { id: 'safety', label: 'Safety Monitoring', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-sm text-gray-500">
              Welcome, {session?.user?.name || 'Admin'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Total Users</p>
                          <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Heart className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Total Matches</p>
                          <p className="text-2xl font-bold text-green-900">{stats.totalMatches}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-yellow-600">Active Users</p>
                          <p className="text-2xl font-bold text-yellow-900">{stats.activeUsers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-8 h-8 text-red-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-red-600">Reported Users</p>
                          <p className="text-2xl font-bold text-red-900">{stats.reportedUsers}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-gray-500">
                    <p>Select a tab from the sidebar to manage specific features.</p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

                  {/* Search and Filter */}
                  <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Roles</option>
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="BANNED">Banned</option>
                    </select>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Safety Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Matches
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                Loading...
                              </td>
                            </tr>
                          ) : users.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            users.map((user: any) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.name || 'No name'}
                                    </div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.role === 'ADMIN'
                                      ? 'bg-purple-100 text-purple-800'
                                      : user.role === 'BANNED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.isVerified
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.safetyScore}/100
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {(user._count?.matches1 || 0) + (user._count?.matches2 || 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    {user.role !== 'BANNED' ? (
                                      <button
                                        onClick={() => handleUserAction(user.id, 'ban')}
                                        className="text-red-600 hover:text-red-900 flex items-center"
                                      >
                                        <Ban className="w-4 h-4 mr-1" />
                                        Ban
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleUserAction(user.id, 'unban')}
                                        className="text-green-600 hover:text-green-900 flex items-center"
                                      >
                                        <UserCheck className="w-4 h-4 mr-1" />
                                        Unban
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {userPagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((userPagination.page - 1) * userPagination.limit) + 1} to{' '}
                        {Math.min(userPagination.page * userPagination.limit, userPagination.total)} of{' '}
                        {userPagination.total} users
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setUserPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={userPagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                          Page {userPagination.page} of {userPagination.pages}
                        </span>
                        <button
                          onClick={() => setUserPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={userPagination.page === userPagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'matches' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Oversight</h2>

                  {/* Match Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Heart className="w-8 h-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Total Matches</p>
                          <p className="text-2xl font-bold text-blue-900">{matchStats.totalMatches}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Matches (30 days)</p>
                          <p className="text-2xl font-bold text-green-900">{matchStats.matchesLast30Days}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-600">Avg Messages/Match</p>
                          <p className="text-2xl font-bold text-purple-900">{matchStats.avgMessagesPerMatch.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matches Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Match
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Users
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Safety Scores
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Messages
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                Loading...
                              </td>
                            </tr>
                          ) : matches.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                No matches found
                              </td>
                            </tr>
                          ) : (
                            matches.map((match: any) => (
                              <tr key={match.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    Match #{match.id.slice(-8)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-900">
                                      {match.user1.name || 'User 1'} ({match.user1.email})
                                    </div>
                                    <div className="text-sm text-gray-900">
                                      {match.user2.name || 'User 2'} ({match.user2.email})
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-900">
                                      User 1: {match.user1.safetyScore}/100
                                    </div>
                                    <div className="text-sm text-gray-900">
                                      User 2: {match.user2.safetyScore}/100
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {match._count.messages}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(match.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {matchPagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((matchPagination.page - 1) * matchPagination.limit) + 1} to{' '}
                        {Math.min(matchPagination.page * matchPagination.limit, matchPagination.total)} of{' '}
                        {matchPagination.total} matches
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setMatchPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={matchPagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                          Page {matchPagination.page} of {matchPagination.pages}
                        </span>
                        <button
                          onClick={() => setMatchPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={matchPagination.page === matchPagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reports' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Management</h2>

                  {/* Status Filter */}
                  <div className="mb-6">
                    <select
                      value={reportStatusFilter}
                      onChange={(e) => setReportStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending Reports</option>
                      <option value="resolved">Resolved Reports</option>
                      <option value="dismissed">Dismissed Reports</option>
                    </select>
                  </div>

                  {/* Reports Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Report Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reporter
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reported User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                Loading...
                              </td>
                            </tr>
                          ) : reports.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                No reports found
                              </td>
                            </tr>
                          ) : (
                            reports.map((report: any) => (
                              <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {report.reason.replace('_', ' ').toUpperCase()}
                                    </div>
                                    {report.description && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        {report.description}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {report.reporter.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {report.reporter.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {report.reported.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {report.reported.email}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Safety: {report.reported.safetyScore}/100
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    report.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : report.status === 'resolved'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {report.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {report.status === 'pending' && (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleReportAction(report.id, 'resolve')}
                                        className="text-green-600 hover:text-green-900"
                                      >
                                        Resolve
                                      </button>
                                      <button
                                        onClick={() => handleReportAction(report.id, 'dismiss')}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Dismiss
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {reportPagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((reportPagination.page - 1) * reportPagination.limit) + 1} to{' '}
                        {Math.min(reportPagination.page * reportPagination.limit, reportPagination.total)} of{' '}
                        {reportPagination.total} reports
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setReportPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={reportPagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                          Page {reportPagination.page} of {reportPagination.pages}
                        </span>
                        <button
                          onClick={() => setReportPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={reportPagination.page === reportPagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'emails' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Management</h2>

                  {/* Email Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Send className="w-6 h-6 text-blue-600" />
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-blue-600 mt-2">Total Sent</p>
                      <p className="text-2xl font-bold text-blue-900">{emailStats.totalSent.toLocaleString()}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Delivery Rate</p>
                      <p className="text-2xl font-bold text-green-900">{emailStats.deliveryRate}%</p>
                      <p className="text-xs text-green-600 mt-1">{emailStats.totalDelivered.toLocaleString()} delivered</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-600">Open Rate</p>
                      <p className="text-2xl font-bold text-purple-900">{emailStats.openRate}%</p>
                      <p className="text-xs text-purple-600 mt-1">{emailStats.totalOpened.toLocaleString()} opened</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-yellow-600">Click Rate</p>
                      <p className="text-2xl font-bold text-yellow-900">{emailStats.clickRate}%</p>
                      <p className="text-xs text-yellow-600 mt-1">{emailStats.totalClicked.toLocaleString()} clicked</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-600">Bounce Rate</p>
                      <p className="text-2xl font-bold text-red-900">{emailStats.bounceRate}%</p>
                      <p className="text-xs text-red-600 mt-1">{emailStats.totalBounced.toLocaleString()} bounced</p>
                    </div>
                  </div>

                  {/* Test Email Form */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <Send className="w-6 h-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">Send Test Email</h3>
                    </div>
                    <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-4">
                      <select
                        value={testEmailForm.type}
                        onChange={(e) => setTestEmailForm(prev => ({ ...prev, type: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="match">Match Notification</option>
                        <option value="message">Message Notification</option>
                        <option value="password-reset">Password Reset</option>
                        <option value="birthday">Birthday Email</option>
                      </select>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={testEmailForm.email}
                        onChange={(e) => setTestEmailForm(prev => ({ ...prev, email: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="submit"
                        disabled={sendingTestEmail}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendingTestEmail ? 'Sending...' : 'Send Test'}
                      </button>
                    </form>
                  </div>

                  {/* Filters */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <Filter className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      <select
                        value={emailFilters.type}
                        onChange={(e) => setEmailFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="transactional">Transactional</option>
                        <option value="engagement">Engagement</option>
                        <option value="marketing">Marketing</option>
                      </select>

                      <select
                        value={emailFilters.category}
                        onChange={(e) => setEmailFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Categories</option>
                        <option value="match">Match</option>
                        <option value="message">Message</option>
                        <option value="password_reset">Password Reset</option>
                        <option value="birthday">Birthday</option>
                        <option value="verification">Verification</option>
                      </select>

                      <select
                        value={emailFilters.status}
                        onChange={(e) => setEmailFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Status</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="opened">Opened</option>
                        <option value="clicked">Clicked</option>
                        <option value="bounced">Bounced</option>
                        <option value="failed">Failed</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Search email..."
                        value={emailFilters.email}
                        onChange={(e) => setEmailFilters(prev => ({ ...prev, email: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />

                      <input
                        type="date"
                        value={emailFilters.dateFrom}
                        onChange={(e) => setEmailFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="From date"
                      />

                      <input
                        type="date"
                        value={emailFilters.dateTo}
                        onChange={(e) => setEmailFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="To date"
                      />
                    </div>
                    {(emailFilters.type || emailFilters.category || emailFilters.status || emailFilters.email || emailFilters.dateFrom || emailFilters.dateTo) && (
                      <button
                        onClick={() => setEmailFilters({ type: '', category: '', status: '', email: '', dateFrom: '', dateTo: '' })}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>

                  {/* Email Logs Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type / Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Engagement
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                Loading...
                              </td>
                            </tr>
                          ) : emails.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>No emails found</p>
                                <p className="text-sm mt-2">Try adjusting your filters or send a test email to get started</p>
                              </td>
                            </tr>
                          ) : (
                            emails.map((email: any) => (
                              <tr key={email.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {email.email}
                                  </div>
                                  {email.user && (
                                    <div className="text-sm text-gray-500">
                                      {email.user.name}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 capitalize">{email.type}</div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {email.category.replace('_', ' ')}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 max-w-xs truncate">
                                    {email.subject}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    email.status === 'delivered' || email.status === 'opened' || email.status === 'clicked'
                                      ? 'bg-green-100 text-green-800'
                                      : email.status === 'sent'
                                      ? 'bg-blue-100 text-blue-800'
                                      : email.status === 'bounced'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {email.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(email.sentAt).toLocaleString('nl-NL', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2 text-xs">
                                    {email.deliveredAt && (
                                      <span className="text-green-600" title="Delivered">✓</span>
                                    )}
                                    {email.openedAt && (
                                      <span className="text-blue-600" title="Opened">👁</span>
                                    )}
                                    {email.clickedAt && (
                                      <span className="text-purple-600" title="Clicked">🖱</span>
                                    )}
                                    {email.bouncedAt && (
                                      <span className="text-yellow-600" title="Bounced">⚠</span>
                                    )}
                                    {!email.deliveredAt && !email.bouncedAt && email.status === 'failed' && (
                                      <span className="text-red-600" title="Failed">✗</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {emailPagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((emailPagination.page - 1) * emailPagination.limit) + 1} to{' '}
                        {Math.min(emailPagination.page * emailPagination.limit, emailPagination.total)} of{' '}
                        {emailPagination.total} emails
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEmailPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={emailPagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                          Page {emailPagination.page} of {emailPagination.pages}
                        </span>
                        <button
                          onClick={() => setEmailPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={emailPagination.page === emailPagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Notifications</h2>

                  {/* Send Notification Form */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Send Admin Alert</h3>
                    <form onSubmit={handleSendNotification} className="space-y-4">
                      <div>
                        <label htmlFor="notificationTitle" className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          id="notificationTitle"
                          value={notificationForm.title}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
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
                          value={notificationForm.message}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
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
                          value={notificationForm.targetUserId}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, targetUserId: e.target.value }))}
                          placeholder="User ID or email"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sendingNotification}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {sendingNotification ? 'Sending...' : 'Send Notification'}
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
              )}

              {activeTab === 'moderation' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Moderation</h2>

                  {/* Moderation Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-8 h-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-yellow-600">Profiles to Review</p>
                          <p className="text-2xl font-bold text-yellow-900">0</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Ban className="w-8 h-8 text-red-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-red-600">Reported Content</p>
                          <p className="text-2xl font-bold text-red-900">0</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <UserCheck className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Approved Today</p>
                          <p className="text-2xl font-bold text-green-900">0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Moderation Queue */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Moderation Queue</h3>
                    <div className="text-center text-gray-500 py-8">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No profiles currently require moderation.</p>
                      <p className="text-sm mt-2">Profiles with low safety scores or reported content will appear here.</p>
                    </div>
                  </div>

                  {/* Photo Moderation */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Photo Moderation</h3>
                    <div className="text-center text-gray-500 py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No photos currently require moderation.</p>
                      <p className="text-sm mt-2">Photos flagged by users or AI detection will appear here.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'blog' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Blog Management</h2>

                  {/* Blog Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-rose-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-rose-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-rose-600">Totaal Posts</p>
                          <p className="text-2xl font-bold text-rose-900">{blogStats.totalPosts}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Gepubliceerd</p>
                          <p className="text-2xl font-bold text-green-900">{blogStats.publishedPosts}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-8 h-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-yellow-600">Concept</p>
                          <p className="text-2xl font-bold text-yellow-900">{blogStats.draftPosts}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Views</p>
                          <p className="text-2xl font-bold text-blue-900">{blogStats.totalViews}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Generator Form */}
                  <AIGeneratorForm
                    categories={blogCategories}
                    onGenerate={handleGenerateBlog}
                    isGenerating={isGenerating}
                  />

                  {/* Generated Content Preview */}
                  {generatedContent && (
                    <GeneratedContentPreview
                      content={generatedContent}
                      onSave={handleSaveBlogPost}
                      onDiscard={() => setGeneratedContent(null)}
                      categories={blogCategories}
                    />
                  )}

                  {/* Blog Posts Table */}
                  <BlogPostsTable
                    posts={blogPosts}
                    categories={blogCategories}
                    onTogglePublish={togglePublishBlogPost}
                    onDelete={deleteBlogPost}
                    onEdit={handleEditBlogPost}
                    pagination={blogPagination}
                    onPageChange={(page) => setBlogPagination(prev => ({ ...prev, page }))}
                    onFilterChange={handleBlogFilterChange}
                  />
                </div>
              )}

              {activeTab === 'safety' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Monitoring</h2>

                  {/* Safety Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-red-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-8 h-8 text-red-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-red-600">High Risk Users</p>
                          <p className="text-2xl font-bold text-red-900">{stats.reportedUsers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-yellow-600">Medium Risk</p>
                          <p className="text-2xl font-bold text-yellow-900">0</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Avg Safety Score</p>
                          <p className="text-2xl font-bold text-blue-900">85</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <UserCheck className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Safe Interactions</p>
                          <p className="text-2xl font-bold text-green-900">{stats.totalMatches}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Alerts */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Alerts</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              <strong>Low Safety Score Alert:</strong> Monitor users with safety scores below 50.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              <strong>System Status:</strong> All safety monitoring systems are operational.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Safety Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Shield className="w-4 h-4 mr-2" />
                        Review High-Risk Users
                      </button>
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate Safety Report
                      </button>
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Update Safety Rules
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}