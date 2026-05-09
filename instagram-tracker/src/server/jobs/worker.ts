import { createPollWorker, scheduleAllPolls } from './poll-competitors'
import { recalibrateAllBaselines } from '../services/viral-detector'

async function start() {
  console.log('Starting Instagram Tracker worker...')

  const worker = createPollWorker()

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err)
  })

  // Schedule all active competitors
  await scheduleAllPolls()

  // Recalibrate baselines on startup
  await recalibrateAllBaselines()

  console.log('Worker running. Press Ctrl+C to stop.')

  process.on('SIGTERM', async () => {
    await worker.close()
    process.exit(0)
  })
}

start().catch((err) => {
  console.error('Worker failed to start:', err)
  process.exit(1)
})
