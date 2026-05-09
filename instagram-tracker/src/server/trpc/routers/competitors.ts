import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { pollQueue } from '@/server/jobs/poll-competitors'

export const competitorsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.competitor.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        _count: { select: { posts: true } },
        posts: {
          where: { isViral: true },
          orderBy: { detectedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  add: protectedProcedure
    .input(
      z.object({
        instagramHandle: z.string().min(1).max(30),
        viralThreshold: z.number().min(1.5).max(20).default(3),
        checkInterval: z.number().min(15).max(1440).default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const competitor = await ctx.prisma.competitor.create({
        data: {
          userId: ctx.session.user.id,
          instagramHandle: input.instagramHandle.replace('@', '').toLowerCase(),
          viralThreshold: input.viralThreshold,
          checkInterval: input.checkInterval,
        },
      })

      await pollQueue.add('poll', { competitorId: competitor.id })
      return competitor
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.competitor.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      })
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        viralThreshold: z.number().min(1.5).max(20).optional(),
        checkInterval: z.number().min(15).max(1440).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.competitor.update({
        where: { id, userId: ctx.session.user.id },
        data,
      })
    }),

  triggerPoll: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const competitor = await ctx.prisma.competitor.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      })
      if (!competitor) throw new Error('Competitor not found')
      await pollQueue.add('poll', { competitorId: competitor.id })
      return { queued: true }
    }),
})
