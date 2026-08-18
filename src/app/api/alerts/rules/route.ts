import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const VALID_TYPES = ['PRICE', 'VOLUME', 'TECHNICAL', 'THESIS']
const VALID_PRIORITIES = ['INFO', 'REVIEW', 'CRITICAL']

// GET /api/alerts/rules
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rules = await prisma.alertRule.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    include: { events: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  return NextResponse.json({ rules })
}

// POST /api/alerts/rules
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const name = String(body.name || '').trim()
  const type = String(body.type || '')
  const priority = VALID_PRIORITIES.includes(body.priority) ? body.priority : 'INFO'

  if (!name) return NextResponse.json({ error: 'Nama alert wajib diisi' }, { status: 400 })
  if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: `Tipe tidak valid: ${type}` }, { status: 400 })

  // Validate condition shape per type
  let condition: string
  try {
    const c = typeof body.condition === 'string' ? JSON.parse(body.condition) : body.condition
    if (type === 'PRICE') {
      if (!['above', 'below'].includes(c.operator) || typeof c.value !== 'number' || c.value <= 0) {
        return NextResponse.json({ error: 'Kondisi harga: operator above/below + value angka > 0' }, { status: 400 })
      }
    } else if (type === 'VOLUME') {
      if (typeof c.multiplier !== 'number' || c.multiplier <= 0) {
        return NextResponse.json({ error: 'Kondisi volume: multiplier angka > 0' }, { status: 400 })
      }
    } else if (type === 'TECHNICAL') {
      if (!['RSI_OVERBOUGHT', 'RSI_OVERSOLD', 'BREAKOUT_20D', 'BREAKDOWN_20D'].includes(c.indicator)) {
        return NextResponse.json({ error: 'Indikator teknikal tidak dikenal' }, { status: 400 })
      }
    } else if (type === 'THESIS') {
      if (!Array.isArray(c.statuses) || c.statuses.length === 0) {
        return NextResponse.json({ error: 'Kondisi tesis: statuses array wajib' }, { status: 400 })
      }
    }
    condition = JSON.stringify(c)
  } catch {
    return NextResponse.json({ error: 'Kondisi tidak valid (JSON)' }, { status: 400 })
  }

  let securityId: string | null = null
  if (body.ticker) {
    const sec = await prisma.security.findFirst({ where: { ticker: String(body.ticker).toUpperCase() } })
    if (!sec) return NextResponse.json({ error: 'Ticker tidak ditemukan' }, { status: 404 })
    securityId = sec.id
  }

  const rule = await prisma.alertRule.create({
    data: { userId: user.userId, securityId, name, type, condition, priority, isActive: true },
  })
  return NextResponse.json(rule, { status: 201 })
}

// PATCH /api/alerts/rules — toggle active
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rule = await prisma.alertRule.findFirst({ where: { id: body.id, userId: user.userId } })
  if (!rule) return NextResponse.json({ error: 'Rule tidak ditemukan' }, { status: 404 })
  const updated = await prisma.alertRule.update({ where: { id: rule.id }, data: { isActive: !rule.isActive } })
  return NextResponse.json(updated)
}

// DELETE /api/alerts/rules
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const rule = await prisma.alertRule.findFirst({ where: { id: id ?? '', userId: user.userId } })
  if (!rule) return NextResponse.json({ error: 'Rule tidak ditemukan' }, { status: 404 })
  await prisma.alertRule.delete({ where: { id: rule.id } })
  return NextResponse.json({ deleted: true })
}
