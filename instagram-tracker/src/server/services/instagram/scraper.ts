import { chromium } from 'playwright'

export interface InstagramPostData {
  postId: string
  postUrl: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL'
  thumbnailUrl: string
  caption: string
  hashtags: string[]
  likesCount: number
  commentsCount: number
  viewsCount?: number
  publishedAt: Date
}

function randomDelay(min = 2000, max = 5000): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[\wÀ-ſ]+/g) ?? []
  return matches.map((tag) => tag.slice(1).toLowerCase())
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
]

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

// Parse raw Instagram post edge node into our type
function parsePostNode(node: Record<string, unknown>): InstagramPostData | null {
  try {
    const shortcode = node.shortcode as string
    if (!shortcode) return null

    const typename = node.__typename as string
    let mediaType: InstagramPostData['mediaType'] = 'IMAGE'
    if (typename === 'GraphVideo') mediaType = 'VIDEO'
    else if (typename === 'GraphSidecar') mediaType = 'CAROUSEL'
    else if ((node.product_type as string) === 'clips') mediaType = 'REEL'

    const captionEdges = (
      (node.edge_media_to_caption as Record<string, unknown>)?.edges as unknown[]
    ) ?? []
    const caption =
      captionEdges.length > 0
        ? (((captionEdges[0] as Record<string, unknown>).node as Record<string, unknown>)
            .text as string) ?? ''
        : ''

    const thumbnailUrl =
      (node.thumbnail_src as string) ||
      (node.display_url as string) ||
      ''

    const takenAt = node.taken_at_timestamp as number
    const likesCount =
      ((node.edge_liked_by as Record<string, unknown>)?.count as number) ||
      ((node.edge_media_preview_like as Record<string, unknown>)?.count as number) ||
      0
    const commentsCount =
      ((node.edge_media_to_comment as Record<string, unknown>)?.count as number) || 0
    const viewsCount = (node.video_view_count as number) || undefined

    return {
      postId: shortcode,
      postUrl: `https://www.instagram.com/p/${shortcode}/`,
      mediaType,
      thumbnailUrl,
      caption,
      hashtags: extractHashtags(caption),
      likesCount,
      commentsCount,
      viewsCount,
      publishedAt: new Date(takenAt * 1000),
    }
  } catch {
    return null
  }
}

export async function scrapeProfile(handle: string): Promise<InstagramPostData[]> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: randomUserAgent(),
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
  })

  try {
    const page = await context.newPage()

    // Intercept API responses for more reliable data extraction
    const capturedPosts: InstagramPostData[] = []

    page.on('response', async (response) => {
      const url = response.url()
      if (
        url.includes('api/v1/feed/user') ||
        url.includes('graphql/query') ||
        url.includes('api/v1/users/web_profile_info')
      ) {
        try {
          const json = await response.json()
          // Try different response shapes
          const edges =
            json?.data?.user?.edge_owner_to_timeline_media?.edges ||
            json?.graphql?.user?.edge_owner_to_timeline_media?.edges ||
            []
          for (const edge of edges) {
            const parsed = parsePostNode(edge.node as Record<string, unknown>)
            if (parsed) capturedPosts.push(parsed)
          }
        } catch {
          // Ignore parse errors for non-JSON or unexpected responses
        }
      }
    })

    await page.goto(`https://www.instagram.com/${handle}/`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await randomDelay()

    // Fallback: try to extract from embedded JSON scripts
    if (capturedPosts.length === 0) {
      const embeddedPosts = await page.evaluate(() => {
        const scripts = Array.from(
          document.querySelectorAll('script[type="application/json"]')
        )
        for (const script of scripts) {
          try {
            const json = JSON.parse(script.textContent ?? '')
            const edges =
              json?.data?.user?.edge_owner_to_timeline_media?.edges ||
              json?.graphql?.user?.edge_owner_to_timeline_media?.edges
            if (edges?.length > 0) return edges
          } catch {}
        }
        return []
      })

      for (const edge of embeddedPosts) {
        const parsed = parsePostNode(edge.node as Record<string, unknown>)
        if (parsed) capturedPosts.push(parsed)
      }
    }

    await page.close()
    return capturedPosts
  } finally {
    await browser.close()
  }
}

export async function getPostMetrics(postUrl: string): Promise<{
  likesCount: number
  commentsCount: number
  viewsCount?: number
}> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: randomUserAgent(),
    viewport: { width: 1280, height: 720 },
  })

  try {
    const page = await context.newPage()
    let metrics = { likesCount: 0, commentsCount: 0, viewsCount: undefined as number | undefined }

    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('graphql/query') || url.includes('api/v1/media')) {
        try {
          const json = await response.json()
          const media =
            json?.data?.shortcode_media ||
            json?.graphql?.shortcode_media ||
            json?.items?.[0]
          if (media) {
            metrics = {
              likesCount:
                media.edge_liked_by?.count ||
                media.edge_media_preview_like?.count ||
                media.like_count ||
                0,
              commentsCount: media.edge_media_to_comment?.count || media.comment_count || 0,
              viewsCount: media.video_view_count || undefined,
            }
          }
        } catch {}
      }
    })

    await page.goto(postUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await randomDelay(1000, 3000)
    await page.close()

    return metrics
  } finally {
    await browser.close()
  }
}
