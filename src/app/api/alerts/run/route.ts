import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { runAlerts } from '@/lib/alert-runner'

export const runtime = 'nodejs'

// POST /api/alerts/run — evaluate all active rules now
export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await runAlerts(prisma as never)
  return NextResponse.json(result)
}
