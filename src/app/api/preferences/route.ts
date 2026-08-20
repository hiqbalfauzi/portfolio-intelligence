import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const HORIZONS = ['short-term', 'medium-term', 'long-term']
const RISKS = ['conservative', 'moderate', 'aggressive']
const STYLES = ['fundamental', 'technical', 'balanced']
const BENCHMARKS = ['IHSG', 'LQ45', 'IDX30']
const CURRENCIES = ['IDR', 'USD']

// GET /api/preferences — ambil preferensi user
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prefs = await prisma.userPreference.findUnique({ where: { userId: user.userId } })
  return NextResponse.json({ preferences: prefs })
}

// PUT /api/preferences — ACC-02/03: update preferensi investasi & notifikasi
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { horizon, riskTolerance, benchmark, analysisStyle, currency, emailNotifications, quietHoursStart, quietHoursEnd } = body

  if (horizon && !HORIZONS.includes(horizon)) return NextResponse.json({ error: `Horizon harus salah satu: ${HORIZONS.join(', ')}` }, { status: 400 })
  if (riskTolerance && !RISKS.includes(riskTolerance)) return NextResponse.json({ error: `Risk tolerance harus salah satu: ${RISKS.join(', ')}` }, { status: 400 })
  if (analysisStyle && !STYLES.includes(analysisStyle)) return NextResponse.json({ error: `Gaya analisis harus salah satu: ${STYLES.join(', ')}` }, { status: 400 })
  if (benchmark && !BENCHMARKS.includes(benchmark)) return NextResponse.json({ error: `Benchmark harus salah satu: ${BENCHMARKS.join(', ')}` }, { status: 400 })
  if (currency && !CURRENCIES.includes(currency)) return NextResponse.json({ error: `Currency harus salah satu: ${CURRENCIES.join(', ')}` }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (horizon) data.horizon = horizon
  if (riskTolerance) data.riskTolerance = riskTolerance
  if (benchmark) data.benchmark = benchmark
  if (analysisStyle) data.analysisStyle = analysisStyle
  if (currency) data.currency = currency
  if (typeof emailNotifications === 'boolean') data.emailNotifications = emailNotifications
  if (quietHoursStart !== undefined) data.quietHoursStart = quietHoursStart || null
  if (quietHoursEnd !== undefined) data.quietHoursEnd = quietHoursEnd || null

  const prefs = await prisma.userPreference.upsert({
    where: { userId: user.userId },
    update: data,
    create: { userId: user.userId, ...data },
  })

  return NextResponse.json({ preferences: prefs })
}
