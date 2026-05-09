'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import type { RecreationResult } from '@/server/services/ai-recreator'

export function RecreateAssistant({ postId }: { postId: string }) {
  const [result, setResult] = useState<RecreationResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const generateMutation = trpc.recreate.generate.useMutation({
    onSuccess: (data) => setResult(data),
  })

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Recreator</h2>
        <p className="text-sm text-gray-500 mb-6">
          Generate adapted content for your brand based on what made this post viral.
        </p>
        <button
          onClick={() => generateMutation.mutate({ postId })}
          disabled={generateMutation.isPending}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          {generateMutation.isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating with Claude AI...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recreate with AI
            </>
          )}
        </button>
        {generateMutation.isError && (
          <p className="mt-3 text-sm text-red-600 text-center">
            {generateMutation.error.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tone Analysis */}
      <Section title="Tone Analysis" icon="chart">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.toneAnalysis}</p>
      </Section>

      {/* Structure */}
      <Section title="Structure Breakdown" icon="list">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.structureBreakdown}</p>
      </Section>

      {/* Creative Brief */}
      <Section title="Creative Brief" icon="lightbulb">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.brief}</p>
        <CopyButton
          text={result.brief}
          copied={copied === 'brief'}
          onClick={() => copyToClipboard(result.brief, 'brief')}
        />
      </Section>

      {/* Visual Notes */}
      <Section title="Visual Notes" icon="image">
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.visualNotes}</p>
      </Section>

      {/* Generated Caption */}
      <Section title="Adapted Caption" icon="edit" highlight>
        <p className="text-sm text-gray-800 whitespace-pre-wrap font-medium">{result.caption}</p>
        <CopyButton
          text={result.caption}
          copied={copied === 'caption'}
          onClick={() => copyToClipboard(result.caption, 'caption')}
        />
      </Section>

      {/* Hashtags */}
      <Section title="Suggested Hashtags" icon="hash">
        <div className="flex flex-wrap gap-2">
          {result.hashtags.map((tag) => (
            <span
              key={tag}
              className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <CopyButton
          text={result.hashtags.map((t) => `#${t}`).join(' ')}
          copied={copied === 'hashtags'}
          onClick={() => copyToClipboard(result.hashtags.map((t) => `#${t}`).join(' '), 'hashtags')}
        />
      </Section>

      {/* Copy All */}
      <button
        onClick={() =>
          copyToClipboard(
            `${result.caption}\n\n${result.hashtags.map((t) => `#${t}`).join(' ')}`,
            'all'
          )
        }
        className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        {copied === 'all' ? 'Copied!' : 'Copy Caption + Hashtags'}
      </button>

      <button
        onClick={() => setResult(null)}
        className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
      >
        Regenerate
      </button>
    </div>
  )
}

function Section({
  title,
  children,
  icon,
  highlight,
}: {
  title: string
  children: React.ReactNode
  icon?: string
  highlight?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${highlight ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200'}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function CopyButton({
  text,
  copied,
  onClick,
}: {
  text: string
  copied: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}
