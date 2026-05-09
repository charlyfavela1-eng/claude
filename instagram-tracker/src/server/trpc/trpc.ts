import { initTRPC, TRPCError } from '@trpc/server'
import type { Session } from 'next-auth'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createContext() {
  const session = await auth()
  return { session, prisma }
}

type Context = Awaited<ReturnType<typeof createContext>>

type AuthenticatedSession = Session & { user: NonNullable<Session['user']> & { id: string } }

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session as AuthenticatedSession,
    },
  })
})
