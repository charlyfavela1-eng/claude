import { prisma } from '@/lib/prisma'

export interface ViralCheckResult {
  isViral: boolean
  viralScore: number
  currentEngagement: number
  baselineEngagement: number
  reason?: string
}

export async function checkIfViral(
  postId: string,
  competitorId: string,
  currentLikes: number,
  currentComments: number,
  currentViews?: number
): Promise<ViralCheckResult> {
  const competitor = await prisma.competitor.findUnique({
    where: { id: competitorId },
  })

  if (!competitor) throw new Error('Competitor not found')

  const currentEngagement = currentLikes + currentComments * 2 + (currentViews ?? 0) * 0.1

  let baseline = competitor.baselineEngagement
  if (!baseline) {
    baseline = await calculateBaseline(competitorId)
    await prisma.competitor.update({
      where: { id: competitorId },
      data: { baselineEngagement: baseline },
    })
  }

  const viralScore = baseline > 0 ? currentEngagement / baseline : 0
  const isViral = viralScore >= competitor.viralThreshold

  return {
    isViral,
    viralScore,
    currentEngagement,
    baselineEngagement: baseline ?? 0,
    reason: isViral
      ? `Post has ${viralScore.toFixed(1)}x the average profile engagement`
      : undefined,
  }
}

async function calculateBaseline(competitorId: string): Promise<number> {
  const recentPosts = await prisma.post.findMany({
    where: { competitorId },
    orderBy: { publishedAt: 'desc' },
    take: 30,
  })

  if (recentPosts.length === 0) return 0

  const totalEngagement = recentPosts.reduce((sum, post) => {
    return sum + post.likesCount + post.commentsCount * 2 + (post.viewsCount ?? 0) * 0.1
  }, 0)

  return totalEngagement / recentPosts.length
}

export async function recalibrateAllBaselines() {
  const competitors = await prisma.competitor.findMany({ where: { isActive: true } })

  for (const competitor of competitors) {
    const baseline = await calculateBaseline(competitor.id)
    await prisma.competitor.update({
      where: { id: competitor.id },
      data: { baselineEngagement: baseline },
    })
  }
}
