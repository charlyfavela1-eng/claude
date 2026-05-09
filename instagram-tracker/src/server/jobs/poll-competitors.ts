import { Queue, Worker, type Job } from 'bullmq'
import { redisConnection } from '@/lib/redis'
import { prisma } from '@/lib/prisma'
import { scrapeProfile } from '../services/instagram/scraper'
import { checkIfViral } from '../services/viral-detector'
import { sendViralAlert } from '../services/notifications'

export const pollQueue = new Queue('poll-competitors', { connection: redisConnection })

export function createPollWorker() {
  return new Worker(
    'poll-competitors',
    async (job: Job) => {
      const { competitorId } = job.data as { competitorId: string }

      const competitor = await prisma.competitor.findUnique({
        where: { id: competitorId },
        include: { user: true },
      })

      if (!competitor || !competitor.isActive) return

      console.log(`Polling @${competitor.instagramHandle}...`)

      const posts = await scrapeProfile(competitor.instagramHandle)

      for (const postData of posts.slice(0, 12)) {
        const existing = await prisma.post.findUnique({
          where: { instagramPostId: postData.postId },
        })

        if (existing) {
          await prisma.post.update({
            where: { id: existing.id },
            data: {
              likesCount: postData.likesCount,
              commentsCount: postData.commentsCount,
              viewsCount: postData.viewsCount,
            },
          })
          await prisma.postSnapshot.create({
            data: {
              postId: existing.id,
              likesCount: postData.likesCount,
              commentsCount: postData.commentsCount,
              viewsCount: postData.viewsCount,
            },
          })
          continue
        }

        const newPost = await prisma.post.create({
          data: {
            competitorId,
            instagramPostId: postData.postId,
            postUrl: postData.postUrl,
            mediaType: postData.mediaType,
            thumbnailUrl: postData.thumbnailUrl,
            caption: postData.caption,
            hashtags: postData.hashtags,
            likesCount: postData.likesCount,
            commentsCount: postData.commentsCount,
            viewsCount: postData.viewsCount,
            publishedAt: postData.publishedAt,
          },
        })

        const viralCheck = await checkIfViral(
          newPost.id,
          competitorId,
          postData.likesCount,
          postData.commentsCount,
          postData.viewsCount
        )

        if (viralCheck.isViral) {
          const updated = await prisma.post.update({
            where: { id: newPost.id },
            data: {
              isViral: true,
              viralScore: viralCheck.viralScore,
              detectedAt: new Date(),
            },
            include: { competitor: true },
          })

          await sendViralAlert(competitor.user, updated, viralCheck.viralScore)
          console.log(
            `VIRAL: @${competitor.instagramHandle} - score ${viralCheck.viralScore.toFixed(1)}x`
          )
        }
      }

      await prisma.competitor.update({
        where: { id: competitorId },
        data: { lastCheckedAt: new Date() },
      })
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  )
}

export async function scheduleAllPolls() {
  const competitors = await prisma.competitor.findMany({
    where: { isActive: true },
  })

  for (const competitor of competitors) {
    await pollQueue.add(
      'poll',
      { competitorId: competitor.id },
      {
        repeat: { every: competitor.checkInterval * 60 * 1000 },
        jobId: `poll-${competitor.id}`,
      }
    )
  }
}
