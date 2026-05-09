import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { recreatePost } from '@/server/services/ai-recreator'

export const recreateRouter = router({
  generate: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return recreatePost(input.postId, ctx.session.user.id)
    }),

  updateBrandVoice: protectedProcedure
    .input(
      z.object({
        brandName: z.string().min(1).max(100),
        brandVoice: z.string().min(20).max(500),
        slackWebhook: z.string().url().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          brandName: input.brandName,
          brandVoice: input.brandVoice,
          ...(input.slackWebhook !== undefined ? { slackWebhook: input.slackWebhook || null } : {}),
        },
      })
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { brandName: true, brandVoice: true, slackWebhook: true },
    })
  }),
})
