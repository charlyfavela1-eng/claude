import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const postsRouter = router({
  viralFeed: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        competitorId: z.string().optional(),
        mediaType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const competitors = await ctx.prisma.competitor.findMany({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      })

      const competitorIds = competitors.map((c) => c.id)

      const posts = await ctx.prisma.post.findMany({
        where: {
          competitorId: input.competitorId
            ? { equals: input.competitorId }
            : { in: competitorIds },
          isViral: true,
          ...(input.mediaType ? { mediaType: input.mediaType } : {}),
        },
        include: {
          competitor: true,
          _count: { select: { recreations: true, savedBy: true } },
        },
        orderBy: { detectedAt: 'desc' },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: string | undefined
      if (posts.length > input.limit) {
        const next = posts.pop()
        nextCursor = next?.id
      }

      return { posts, nextCursor }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          competitor: true,
          snapshots: { orderBy: { takenAt: 'asc' } },
          recreations: {
            where: { userId: ctx.session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          savedBy: {
            where: { userId: ctx.session.user.id },
            take: 1,
          },
        },
      })
    }),

  save: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        notes: z.string().optional(),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.savedPost.upsert({
        where: { userId_postId: { userId: ctx.session.user.id, postId: input.postId } },
        create: {
          userId: ctx.session.user.id,
          postId: input.postId,
          notes: input.notes,
          tags: input.tags,
        },
        update: { notes: input.notes, tags: input.tags },
      })
    }),

  unsave: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.savedPost.delete({
        where: { userId_postId: { userId: ctx.session.user.id, postId: input.postId } },
      })
    }),

  library: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.savedPost.findMany({
      where: { userId: ctx.session.user.id },
      include: { post: { include: { competitor: true } } },
      orderBy: { savedAt: 'desc' },
    })
  }),
})
