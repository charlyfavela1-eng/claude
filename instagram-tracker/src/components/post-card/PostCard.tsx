'use client'

import Link from 'next/link'

// Dates become strings when serialized over tRPC/JSON
type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
    ? string | null
    : T[K]
}

type PostWithMeta = {
  id: string
  competitorId: string
  instagramPostId: string
  postUrl: string
  mediaType: string
  thumbnailUrl: string | null
  caption: string | null
  hashtags: string[]
  likesCount: number
  commentsCount: number
  viewsCount: number | null
  engagementRate: number | null
  isViral: boolean
  viralScore: number | null
  publishedAt: string
  detectedAt: string | null
  createdAt: string
  competitor: {
    id: string
    instagramHandle: string
    displayName: string | null
  }
  _count: { recreations: number; savedBy: number }
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: 'Photo',
  VIDEO: 'Video',
  CAROUSEL: 'Carousel',
  REEL: 'Reel',
}

const MEDIA_TYPE_COLORS: Record<string, string> = {
  IMAGE: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  CAROUSEL: 'bg-amber-100 text-amber-700',
  REEL: 'bg-purple-100 text-purple-700',
}

export function PostCard({ post }: { post: PostWithMeta }) {
  return (
    <Link href={`/post/${post.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all">
        {/* Thumbnail */}
        <div className="relative aspect-square bg-gray-100">
          {post.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.thumbnailUrl}
              alt={post.caption?.slice(0, 60) ?? 'Instagram post'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Viral score badge */}
          {post.viralScore && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {post.viralScore.toFixed(1)}x
            </div>
          )}

          {/* Media type badge */}
          <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${MEDIA_TYPE_COLORS[post.mediaType] ?? 'bg-gray-100 text-gray-700'}`}>
            {MEDIA_TYPE_LABELS[post.mediaType] ?? post.mediaType}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              @{post.competitor.instagramHandle}
            </span>
            {post.detectedAt && (
              <span className="text-xs text-gray-400">
                {new Date(post.detectedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {post.caption && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.caption}</p>
          )}

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {post.likesCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.commentsCount.toLocaleString()}
            </span>
            {post._count.recreations > 0 && (
              <span className="ml-auto flex items-center gap-1 text-purple-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Recreated
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
