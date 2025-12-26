'use client'

import { Shield, Ban, UserCheck, Users } from 'lucide-react'
import StatCard from '@/components/admin/shared/StatCard'

interface ModerationStats {
  profilesToReview: number
  reportedContent: number
  approvedToday: number
}

interface ContentModerationProps {
  stats?: ModerationStats
}

/**
 * Admin Content Moderation Component
 *
 * Profile and photo moderation queue
 */
export default function ContentModeration({
  stats = { profilesToReview: 0, reportedContent: 0, approvedToday: 0 },
}: ContentModerationProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Moderation</h2>

      {/* Moderation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Profiles to Review"
          value={stats.profilesToReview}
          icon={Shield}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
          textColor="text-yellow-900"
        />

        <StatCard
          title="Reported Content"
          value={stats.reportedContent}
          icon={Ban}
          bgColor="bg-red-50"
          iconColor="text-red-600"
          textColor="text-red-900"
        />

        <StatCard
          title="Approved Today"
          value={stats.approvedToday}
          icon={UserCheck}
          bgColor="bg-green-50"
          iconColor="text-green-600"
          textColor="text-green-900"
        />
      </div>

      {/* Profile Moderation Queue */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Moderation Queue</h3>
        <div className="text-center text-gray-500 py-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No profiles currently require moderation.</p>
          <p className="text-sm mt-2">
            Profiles with low safety scores or reported content will appear here.
          </p>
        </div>
      </div>

      {/* Photo Moderation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Photo Moderation</h3>
        <div className="text-center text-gray-500 py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No photos currently require moderation.</p>
          <p className="text-sm mt-2">
            Photos flagged by users or AI detection will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
