'use client'

import { use, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { RecreateAssistant } from '@/components/recreate-assistant/RecreateAssistant'
import Link from 'next/link'

const MEDIA_LABELS: Record<string, string> = {
  IMAGE: 'Photo',
  VIDEO: 'Video',
  CAROUSEL: 'Carousel',
  REEL: 'Reel',
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [saveNotes, setSaveNotes] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  const utils = trpc.useUtils()
  const { data: post, isLoading } = trpc.posts.getById.useQuery({ id })

  const saveMutation = trpc.posts.save.useMutation({
    onSuccess: () => {
      setShowSaveForm(false)
      utils.posts.getById.invalidate({ id })
    },
  })

  const unsaveMutation = trpc.posts.unsave.useMutation({
    onSuccess: () => utils.posts.getById.invalidate({ id }),
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-8 text-center py-20 text-gray-400">
        <p className="text-lg font-medium">Post not found</p>
        <Link href="/" className="text-sm text-purple-600 hover:underline mt-2 block">
          Back to feed
        </Link>
      </div>
    )
  }

  const isSaved = post.savedBy.length > 0

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Viral Feed
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            @{post.competitor.instagramHandle}
          </h1>
          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            View on Instagram
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Original post */}
        <div className="space-y-4">
          {/* Thumbnail */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {post.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.thumbnailUrl}
                alt="Post thumbnail"
                className="w-full object-cover max-h-96"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-300 bg-gray-50">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{post.likesCount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Likes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{post.commentsCount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Comments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{post.viralScore?.toFixed(1)}x</p>
                <p className="text-xs text-gray-500 mt-0.5">Viral score</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{MEDIA_LABELS[post.mediaType] ?? post.mediaType}</span>
              {post.detectedAt && (
                <span>Detected {new Date(post.detectedAt).toLocaleDateString()}</span>
              )}
              <span>Published {new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Original Caption</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{post.caption}</p>
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.hashtags.map((tag) => (
                    <span key={tag} className="text-xs text-blue-600">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save to library */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {isSaved ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Saved to library
                </span>
                <button
                  onClick={() => unsaveMutation.mutate({ postId: post.id })}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : showSaveForm ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveMutation.mutate({ postId: post.id, notes: saveNotes })}
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveForm(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveForm(true)}
                className="w-full text-sm text-gray-600 hover:text-purple-600 flex items-center justify-center gap-2 py-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save to library
              </button>
            )}
          </div>
        </div>

        {/* Right: AI Recreator */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {post.recreations.length > 0 ? 'Recreation' : 'Recreate with AI'}
          </h2>
          <RecreateAssistant postId={post.id} />
        </div>
      </div>
    </div>
  )
}
