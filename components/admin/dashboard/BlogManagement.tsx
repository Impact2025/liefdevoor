'use client'

import Link from 'next/link'
import { FileText, Users, Shield, BarChart3, Plus } from 'lucide-react'
import StatCard from '@/components/admin/shared/StatCard'
import AIGeneratorForm from '@/components/admin/AIGeneratorForm'
import GeneratedContentPreview from '@/components/admin/GeneratedContentPreview'
import BlogPostsTable from '@/components/admin/BlogPostsTable'
import type { AIGeneratorParams, GeneratedBlogContent, SavePostData, BlogStats, BlogPagination } from '@/lib/types/blog'
import type { BlogPost, BlogCategory } from '@/lib/types/api'

interface BlogManagementProps {
  stats: BlogStats
  generatedContent: GeneratedBlogContent | null
  isGenerating: boolean
  posts: BlogPost[]
  categories: BlogCategory[]
  pagination: BlogPagination
  onGenerate: (params: AIGeneratorParams) => Promise<void>
  onSave: (data: SavePostData) => Promise<void>
  onDiscard: () => void
  onTogglePublish: (postId: string, published: boolean) => Promise<void>
  onDelete: (postId: string) => Promise<void>
  onEdit: (post: BlogPost) => void
  onPageChange: (page: number) => void
  onFilterChange: (filters: any) => void
}

/**
 * Admin Blog Management Component
 *
 * AI blog generation and post management
 */
export default function BlogManagement({
  stats,
  generatedContent,
  isGenerating,
  posts,
  categories,
  pagination,
  onGenerate,
  onSave,
  onDiscard,
  onTogglePublish,
  onDelete,
  onEdit,
  onPageChange,
  onFilterChange,
}: BlogManagementProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Blog maken
        </Link>
      </div>

      {/* Blog Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Totaal Posts"
          value={stats.totalPosts}
          icon={FileText}
          bgColor="bg-rose-50"
          iconColor="text-rose-600"
          textColor="text-rose-900"
        />

        <StatCard
          title="Gepubliceerd"
          value={stats.publishedPosts}
          icon={Users}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          textColor="text-green-900"
        />

        <StatCard
          title="Concept"
          value={stats.draftPosts}
          icon={Shield}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          textColor="text-yellow-900"
        />

        <StatCard
          title="Views"
          value={stats.totalViews}
          icon={BarChart3}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          textColor="text-blue-900"
        />
      </div>

      {/* AI Generator Form */}
      <AIGeneratorForm
        categories={categories}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
      />

      {/* Generated Content Preview */}
      {generatedContent && (
        <GeneratedContentPreview
          content={generatedContent}
          onSave={onSave}
          onDiscard={onDiscard}
          categories={categories}
        />
      )}

      {/* Blog Posts Table */}
      <BlogPostsTable
        posts={posts}
        categories={categories}
        onTogglePublish={onTogglePublish}
        onDelete={onDelete}
        onEdit={onEdit}
        pagination={pagination}
        onPageChange={onPageChange}
        onFilterChange={onFilterChange}
      />
    </div>
  )
}
