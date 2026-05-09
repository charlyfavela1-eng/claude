import { router } from './trpc'
import { competitorsRouter } from './routers/competitors'
import { postsRouter } from './routers/posts'
import { recreateRouter } from './routers/recreate'

export const appRouter = router({
  competitors: competitorsRouter,
  posts: postsRouter,
  recreate: recreateRouter,
})

export type AppRouter = typeof appRouter
