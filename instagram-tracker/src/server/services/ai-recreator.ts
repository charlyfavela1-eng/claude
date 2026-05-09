import { anthropic } from '@/lib/claude'
import { prisma } from '@/lib/prisma'

export interface RecreationResult {
  brief: string
  caption: string
  hashtags: string[]
  visualNotes: string
  toneAnalysis: string
  structureBreakdown: string
}

export async function recreatePost(postId: string, userId: string): Promise<RecreationResult> {
  const [post, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      include: { competitor: true },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])

  if (!post || !user) throw new Error('Post or user not found')

  const brandName = user.brandName ?? 'My Brand'
  const brandVoice = user.brandVoice ?? 'professional, approachable and authentic'

  const prompt = `You are an expert Instagram content strategist.
Analyze the following viral competitor post and generate adapted content for my brand.

## Viral post analyzed:
- **Profile:** @${post.competitor.instagramHandle}
- **Content type:** ${post.mediaType}
- **Original caption:** ${post.caption ?? '(no caption)'}
- **Hashtags used:** ${post.hashtags.join(', ') || 'none'}
- **Metrics:** ${post.likesCount} likes, ${post.commentsCount} comments${post.viewsCount ? `, ${post.viewsCount} views` : ''}
- **Viral score:** ${post.viralScore?.toFixed(1)}x the profile average
- **Post URL:** ${post.postUrl}

## My brand:
- **Name:** ${brandName}
- **Tone & voice:** ${brandVoice}

## Your task:
Generate a structured analysis in JSON with exactly these keys:
{
  "toneAnalysis": "Analysis of the original post tone: what emotions it evokes, rhetorical devices used, why it connects with the audience (2-3 paragraphs)",
  "structureBreakdown": "Structure breakdown: how the caption opens, what information it provides, how it closes, what CTA is used, punctuation and emoji patterns",
  "brief": "Creative brief for the content team: what type of visual to produce, what it should communicate, style references, recommended format (reel/carousel/image), duration if video",
  "caption": "Completely new caption adapted to ${brandName}'s tone, using the same winning structure but with original content. Must include a clear CTA.",
  "visualNotes": "Specific notes for the creative team: suggested color palette, shot type if video, key visual elements, on-screen text if applicable",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Respond ONLY with the JSON. No additional text, no markdown fences.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system:
      'You are an expert Instagram content strategist. Always respond with valid JSON only.',
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('')

  const result = JSON.parse(text) as RecreationResult

  await prisma.recreation.create({
    data: {
      postId,
      userId,
      brief: result.brief,
      caption: result.caption,
      hashtags: result.hashtags,
      visualNotes: result.visualNotes,
      toneAnalysis: result.toneAnalysis,
      structureBreakdown: result.structureBreakdown,
    },
  })

  return result
}
