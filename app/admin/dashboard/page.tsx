'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/admin/dashboard/DashboardLayout'
import StatsOverview from '@/components/admin/dashboard/StatsOverview'
import UsersTable from '@/components/admin/dashboard/UsersTable'
import MatchesTable from '@/components/admin/dashboard/MatchesTable'
import ReportsTable from '@/components/admin/dashboard/ReportsTable'
import EmailManagement from '@/components/admin/dashboard/EmailManagement'
import NotificationsPanel from '@/components/admin/dashboard/NotificationsPanel'
import ContentModeration from '@/components/admin/dashboard/ContentModeration'
import BlogManagement from '@/components/admin/dashboard/BlogManagement'
import SafetyMonitoring from '@/components/admin/dashboard/SafetyMonitoring'
import type { AIGeneratorParams, GeneratedBlogContent, SavePostData, BlogStats, BlogPagination } from '@/lib/types/blog'
import type { BlogPost, BlogCategory } from '@/lib/types/api'

export default function AdminDashboard() {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview')

  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    activeUsers: 0,
    reportedUsers: 0
  })

  // Users state
  const [users, setUsers] = useState([])
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')

  // Matches state
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

  // Reports state
  const [reports, setReports] = useState([])
  const [reportPagination, setReportPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [reportStatusFilter, setReportStatusFilter] = useState('pending')

  // Notifications state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    targetUserId: ''
  })
  const [sendingNotification, setSendingNotification] = useState(false)

  // Email Management state
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

  // Blog Management state
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

  // Loading state
  const [loading, setLoading] = useState(false)

  // Fetch data based on active tab
  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    else if (activeTab === 'matches') fetchMatches()
    else if (activeTab === 'reports') fetchReports()
    else if (activeTab === 'emails') fetchEmails()
    else if (activeTab === 'blog') {
      fetchBlogPosts()
      fetchBlogCategories()
    }
  }, [activeTab, userPagination.page, userSearch, userRoleFilter, matchPagination.page, reportPagination.page, reportStatusFilter, emailPagination.page, emailFilters, blogPagination.page, blogFilters])

  // Fetch functions
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
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
        if (data.pagination) setBlogPagination(data.pagination)
        const totalPosts = data.posts?.length || 0
        const publishedPosts = data.posts?.filter((p: BlogPost) => p.published).length || 0
        setBlogStats({
          totalPosts: data.pagination?.total || totalPosts,
          publishedPosts,
          draftPosts: (data.pagination?.total || totalPosts) - publishedPosts,
          totalViews: 0
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

  // Handler functions
  const handleUserAction = async (userId: string, action: 'ban' | 'unban') => {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    })
    if (response.ok) fetchUsers()
    else throw new Error('Failed to update user')
  }

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    const response = await fetch('/api/report', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, action })
    })
    if (response.ok) fetchReports()
    else throw new Error('Failed to update report')
  }

  const handleSendNotification = async () => {
    setSendingNotification(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin_alert',
          ...notificationForm,
          targetUserId: notificationForm.targetUserId || undefined
        })
      })
      if (response.ok) {
        setNotificationForm({ title: '', message: '', targetUserId: '' })
      } else {
        throw new Error('Failed to send notification')
      }
    } finally {
      setSendingNotification(false)
    }
  }

  const handleSendTestEmail = async () => {
    setSendingTestEmail(true)
    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEmailForm)
      })
      if (response.ok) {
        setTestEmailForm({ type: 'match', email: '' })
        fetchEmails()
      } else {
        throw new Error('Failed to send test email')
      }
    } finally {
      setSendingTestEmail(false)
    }
  }

  const handleGenerateBlog = async (params: AIGeneratorParams) => {
    setIsGenerating(true)
    setGeneratedContent(null)
    try {
      const response = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      if (response.ok) {
        const data = await response.json()
        setGeneratedContent(data)
      } else {
        toast.error('Failed to generate blog post')
      }
    } catch (error) {
      toast.error('Failed to generate blog post')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveBlogPost = async (data: SavePostData) => {
    const response = await fetch('/api/admin/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (response.ok) {
      toast.success(`Blog post ${data.published ? 'gepubliceerd' : 'opgeslagen als concept'}!`)
      setGeneratedContent(null)
      fetchBlogPosts()
    } else {
      toast.error('Failed to save blog post')
    }
  }

  const togglePublishBlogPost = async (id: string, published: boolean) => {
    const response = await fetch(`/api/admin/blog/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published })
    })
    if (response.ok) fetchBlogPosts()
    else toast.error('Failed to update post')
  }

  const deleteBlogPost = async (id: string) => {
    const response = await fetch(`/api/admin/blog/posts/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      toast.success('Blog post verwijderd!')
      fetchBlogPosts()
    } else {
      toast.error('Failed to delete post')
    }
  }

  const handleEditBlogPost = (post: BlogPost) => {
    toast.info(`Edit functionaliteit voor "${post.title}" komt binnenkort!`)
  }

  const handleBlogFilterChange = (filters: { category: string; status: string; search: string }) => {
    setBlogFilters(filters)
    setBlogPagination(prev => ({ ...prev, page: 1 }))
  }

  // Render active tab component
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <StatsOverview stats={stats} />

      case 'users':
        return (
          <UsersTable
            users={users}
            loading={loading}
            search={userSearch}
            roleFilter={userRoleFilter}
            pagination={userPagination}
            onSearchChange={setUserSearch}
            onRoleFilterChange={setUserRoleFilter}
            onPageChange={(page) => setUserPagination(prev => ({ ...prev, page }))}
            onUserAction={handleUserAction}
          />
        )

      case 'matches':
        return (
          <MatchesTable
            matches={matches}
            matchStats={matchStats}
            loading={loading}
            pagination={matchPagination}
            onPageChange={(page) => setMatchPagination(prev => ({ ...prev, page }))}
          />
        )

      case 'reports':
        return (
          <ReportsTable
            reports={reports}
            loading={loading}
            statusFilter={reportStatusFilter}
            pagination={reportPagination}
            onStatusFilterChange={setReportStatusFilter}
            onPageChange={(page) => setReportPagination(prev => ({ ...prev, page }))}
            onReportAction={handleReportAction}
          />
        )

      case 'emails':
        return (
          <EmailManagement
            stats={emailStats}
            filters={emailFilters}
            testForm={testEmailForm}
            emails={emails}
            loading={loading}
            sendingTest={sendingTestEmail}
            pagination={emailPagination}
            onFiltersChange={(field, value) => setEmailFilters(prev => ({ ...prev, [field]: value }))}
            onClearFilters={() => setEmailFilters({ type: '', category: '', status: '', email: '', dateFrom: '', dateTo: '' })}
            onTestFormChange={(field, value) => setTestEmailForm(prev => ({ ...prev, [field]: value }))}
            onSendTest={handleSendTestEmail}
            onPageChange={(page) => setEmailPagination(prev => ({ ...prev, page }))}
          />
        )

      case 'notifications':
        return (
          <NotificationsPanel
            form={notificationForm}
            sending={sendingNotification}
            onFormChange={(field, value) => setNotificationForm(prev => ({ ...prev, [field]: value }))}
            onSend={handleSendNotification}
          />
        )

      case 'moderation':
        return <ContentModeration />

      case 'blog':
        return (
          <BlogManagement
            stats={blogStats}
            generatedContent={generatedContent}
            isGenerating={isGenerating}
            posts={blogPosts}
            categories={blogCategories}
            pagination={blogPagination}
            onGenerate={handleGenerateBlog}
            onSave={handleSaveBlogPost}
            onDiscard={() => setGeneratedContent(null)}
            onTogglePublish={async (id) => {
              const post = blogPosts.find(p => p.id === id)
              if (post) await togglePublishBlogPost(id, !post.published)
            }}
            onDelete={deleteBlogPost}
            onEdit={handleEditBlogPost}
            onPageChange={(page) => setBlogPagination(prev => ({ ...prev, page }))}
            onFilterChange={handleBlogFilterChange}
          />
        )

      case 'safety':
        return (
          <SafetyMonitoring
            stats={{
              highRiskUsers: stats.reportedUsers,
              mediumRiskUsers: 0,
              avgSafetyScore: 85,
              safeInteractions: stats.totalMatches
            }}
            onAction={(action) => toast.info(`Safety action: ${action}`)}
          />
        )

      default:
        return <StatsOverview stats={stats} />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </DashboardLayout>
  )
}
