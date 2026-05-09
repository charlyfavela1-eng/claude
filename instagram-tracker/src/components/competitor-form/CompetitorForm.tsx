'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'

export function CompetitorForm({ onSuccess }: { onSuccess?: () => void }) {
  const [handle, setHandle] = useState('')
  const [threshold, setThreshold] = useState(3)
  const [interval, setInterval] = useState(30)
  const [error, setError] = useState('')

  const utils = trpc.useUtils()
  const addMutation = trpc.competitors.add.useMutation({
    onSuccess: () => {
      setHandle('')
      setError('')
      utils.competitors.list.invalidate()
      onSuccess?.()
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim()) return
    addMutation.mutate({
      instagramHandle: handle.trim(),
      viralThreshold: threshold,
      checkInterval: interval,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instagram Handle
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            @
          </span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="competitor_handle"
            className="flex-1 rounded-r-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Viral threshold: <span className="font-bold text-orange-600">{threshold}x</span>
        </label>
        <input
          type="range"
          min="1.5"
          max="10"
          step="0.5"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1.5x (sensitive)</span>
          <span>10x (strict)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Check interval: <span className="font-bold">{interval} min</span>
        </label>
        <input
          type="range"
          min="15"
          max="240"
          step="15"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value))}
          className="w-full accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>15 min</span>
          <span>4 hours</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={addMutation.isPending || !handle.trim()}
        className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {addMutation.isPending ? 'Adding...' : 'Add Competitor'}
      </button>
    </form>
  )
}
