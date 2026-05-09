import { NextRequest, NextResponse } from 'next/server'
import { scheduleAllPolls } from '@/server/jobs/poll-competitors'
import { recalibrateAllBaselines } from '@/server/services/viral-detector'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'poll'

  try {
    if (action === 'poll') {
      await scheduleAllPolls()
      return NextResponse.json({ ok: true, action: 'poll' })
    }

    if (action === 'recalibrate') {
      await recalibrateAllBaselines()
      return NextResponse.json({ ok: true, action: 'recalibrate' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
