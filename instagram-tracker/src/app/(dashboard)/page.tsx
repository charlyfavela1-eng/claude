'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { PostCard } from '@/components/post-card/PostCard'

export default function ViralFeedPage() {
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string | undefined>()
  const [competitorFilter, setCompetitorFilter] = useState<string | undefined>()

  const { data: competitors } = trpc.competitors.list.useQuery()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.posts.viralFeed.useInfiniteQuery(
    {
      limit: 20,
      mediaType: mediaTypeFilter,
      competitorId: competitorFilter,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Viral Feed</h1>
        <p className="text-gray-500 mt-1 text-sm">Posts detected above your viral threshold</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={competitorFilter ?? ''}
          onChange={(e) => setCompetitorFilter(e.target.value || undefined)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All competitors</option>
          {competitors?.map((c) => (
            <option key={c.id} value={c.id}>
              @{c.instagramHandle}
            </option>
          ))}
        </select>

        <select
          value={mediaTypeFilter ?? ''}
          onChange={(e) => setMediaTypeFilter(e.target.value || undefined)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All types</option>
          <option value="IMAGE">Photos</option>
          <option value="VIDEO">Videos</option>
          <option value="CAROUSEL">Carousels</option>
          <option value="REEL">Reels</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p className="text-lg font-medium text-gray-500">No viral posts yet</p>
          <p className="text-sm mt-1">
            Add competitors and wait for posts to be detected
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
