'use client'

import { trpc } from '@/lib/trpc'
import Link from 'next/link'

export default function LibraryPage() {
  const { data: savedPosts, isLoading } = trpc.posts.library.useQuery()
  const utils = trpc.useUtils()

  const unsaveMutation = trpc.posts.unsave.useMutation({
    onSuccess: () => utils.posts.library.invalidate(),
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inspiration Library</h1>
        <p className="text-gray-500 mt-1 text-sm">Posts you&apos;ve saved for later reference</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : savedPosts?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">Library is empty</p>
          <p className="text-sm mt-1">Save posts from the viral feed to build your inspiration library</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedPosts?.map((saved) => (
            <div key={saved.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-4">
                <Link href={`/post/${saved.post.id}`} className="flex-shrink-0">
                  {saved.post.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={saved.post.thumbnailUrl}
                      alt="Post thumbnail"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/post/${saved.post.id}`}>
                    <p className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                      @{saved.post.competitor.instagramHandle}
                    </p>
                  </Link>
                  {saved.post.caption && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{saved.post.caption}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{saved.post.likesCount.toLocaleString()} likes</span>
                    {saved.post.viralScore && (
                      <span className="text-orange-500 font-medium">{saved.post.viralScore.toFixed(1)}x viral</span>
                    )}
                    {saved.notes && <span className="text-gray-500 italic">{saved.notes}</span>}
                  </div>
                  {saved.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {saved.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => unsaveMutation.mutate({ postId: saved.post.id })}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove from library"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
