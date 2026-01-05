'use client'

import { Instagram, Facebook, Linkedin, Twitter, Heart, MessageCircle, Share2, Send, Bookmark, MoreHorizontal } from 'lucide-react'

interface SocialMediaPreviewProps {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter'
  content: string
  imageUrl?: string
  profileName?: string
  profileImage?: string
}

export default function SocialMediaPreview({
  platform,
  content,
  imageUrl,
  profileName = 'Liefde voor Iedereen',
  profileImage = '/logo.png'
}: SocialMediaPreviewProps) {

  // Extract hashtags from content
  const hashtags = content.match(/#\w+/g) || []
  const contentWithoutHashtags = content.replace(/#\w+/g, '').trim()

  if (platform === 'instagram') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Instagram Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={profileImage}
              alt={profileName}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold text-sm">{profileName}</span>
          </div>
          <MoreHorizontal size={20} />
        </div>

        {/* Instagram Image */}
        {imageUrl && (
          <div className="w-full aspect-square bg-gray-100">
            <img
              src={imageUrl}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Instagram Actions */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart size={24} />
              <MessageCircle size={24} />
              <Send size={24} />
            </div>
            <Bookmark size={24} />
          </div>

          <div className="text-sm">
            <span className="font-semibold">1,234 likes</span>
          </div>

          {/* Instagram Caption */}
          <div className="text-sm">
            <span className="font-semibold mr-2">{profileName}</span>
            <span className="whitespace-pre-wrap">{contentWithoutHashtags}</span>
            {hashtags.length > 0 && (
              <div className="text-blue-600 mt-1">
                {hashtags.map((tag, idx) => (
                  <span key={idx} className="mr-1">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">2 uur geleden</div>
        </div>
      </div>
    )
  }

  if (platform === 'facebook') {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Facebook Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={profileImage}
              alt={profileName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold text-sm">{profileName}</div>
              <div className="text-xs text-gray-500">2 uur geleden • 🌍</div>
            </div>
          </div>
          <MoreHorizontal size={20} className="text-gray-600" />
        </div>

        {/* Facebook Content */}
        <div className="p-4">
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        </div>

        {/* Facebook Image */}
        {imageUrl && (
          <div className="w-full">
            <img
              src={imageUrl}
              alt="Post"
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Facebook Stats */}
        <div className="px-4 py-2 border-t border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-[10px]">👍</span>
              </div>
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-[10px]">❤️</span>
              </div>
            </div>
            <span>432</span>
          </div>
          <div className="flex gap-3">
            <span>23 reacties</span>
            <span>12 keer gedeeld</span>
          </div>
        </div>

        {/* Facebook Actions */}
        <div className="flex items-center justify-around p-2">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm">
            <Heart size={18} />
            Vind ik leuk
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm">
            <MessageCircle size={18} />
            Reageren
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm">
            <Share2 size={18} />
            Delen
          </button>
        </div>
      </div>
    )
  }

  if (platform === 'linkedin') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        {/* LinkedIn Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <img
              src={profileImage}
              alt={profileName}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-semibold text-sm">{profileName}</div>
              <div className="text-xs text-gray-600">Dating met een missie - Liefde voor Iedereen</div>
              <div className="text-xs text-gray-500">2u • 🌍</div>
            </div>
          </div>
          <MoreHorizontal size={20} className="text-gray-600" />
        </div>

        {/* LinkedIn Content */}
        <div className="p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        </div>

        {/* LinkedIn Image */}
        {imageUrl && (
          <div className="w-full">
            <img
              src={imageUrl}
              alt="Post"
              className="w-full object-cover"
            />
          </div>
        )}

        {/* LinkedIn Stats */}
        <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-[8px]">👍</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-[8px]">💡</span>
              </div>
            </div>
            <span>87</span>
          </div>
          <div className="flex gap-3">
            <span>14 reacties</span>
          </div>
        </div>

        {/* LinkedIn Actions */}
        <div className="flex items-center justify-around p-2 border-t border-gray-200">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm">
            <Heart size={18} />
            Waarderen
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm">
            <MessageCircle size={18} />
            Reageren
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm">
            <Share2 size={18} />
            Opnieuw plaatsen
          </button>
        </div>
      </div>
    )
  }

  if (platform === 'twitter') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="p-4">
          {/* Twitter Header */}
          <div className="flex items-start gap-3">
            <img
              src={profileImage}
              alt={profileName}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{profileName}</span>
                <span className="text-gray-500 text-sm">@liefdevoor</span>
                <span className="text-gray-500 text-sm">• 2u</span>
              </div>

              {/* Twitter Content */}
              <div className="mt-2">
                <p className="whitespace-pre-wrap text-sm">{content}</p>
              </div>

              {/* Twitter Image */}
              {imageUrl && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl}
                    alt="Post"
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* Twitter Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>234 weergaven</span>
              </div>

              {/* Twitter Actions */}
              <div className="flex items-center justify-between mt-3 text-gray-500">
                <button className="flex items-center gap-2 hover:text-blue-500">
                  <MessageCircle size={18} />
                  <span className="text-xs">12</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-500">
                  <Share2 size={18} />
                  <span className="text-xs">5</span>
                </button>
                <button className="flex items-center gap-2 hover:text-red-500">
                  <Heart size={18} />
                  <span className="text-xs">43</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500">
                  <Bookmark size={18} />
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
