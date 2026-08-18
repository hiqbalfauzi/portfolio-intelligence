import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const VALID_TYPES = ['DECISION', 'REVIEW', 'REFLECTION', 'NOTE']
const VALID_ACTIONS = ['BUY', 'SELL', 'HOLD', 'ADD', 'REDUCE']

// GET /api/journal
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  const securities = await prisma.security.findMany({ select: { id: true, ticker: true } })
  const tickerById = new Map(securities.map(s => [s.id, s.ticker]))
  return NextResponse.json({
    entries: entries.map(e => ({ ...e, ticker: e.securityId ? tickerById.get(e.securityId) : undefined })),
  })
}

// POST /api/journal
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()
  const type = VALID_TYPES.includes(body.type) ? body.type : 'NOTE'

  if (!title) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })
  if (!content) return NextResponse.json({ error: 'Isi catatan wajib diisi' }, { status: 400 })

  let securityId: string | null = null
  if (body.ticker) {
    const sec = await prisma.security.findFirst({ where: { ticker: String(body.ticker).toUpperCase() } })
    if (sec) securityId = sec.id
  }

  const entry = await prisma.journalEntry.create({
    data: {
      userId: user.userId,
      title,
      content,
      type,
      securityId,
      action: type === 'DECISION' && VALID_ACTIONS.includes(body.action) ? body.action : null,
      reasoning: body.reasoning ? String(body.reasoning) : null,
      emotion: body.emotion ? String(body.emotion) : null,
      expectations: body.expectations ? String(body.expectations) : null,
      reviewDate: body.reviewDate ? new Date(body.reviewDate) : null,
    },
  })
  return NextResponse.json(entry, { status: 201 })
}

// DELETE /api/journal?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const entry = await prisma.journalEntry.findFirst({ where: { id: id ?? '', userId: user.userId } })
  if (!entry) return NextResponse.json({ error: 'Catatan tidak ditemukan' }, { status: 404 })
  await prisma.journalEntry.delete({ where: { id: entry.id } })
  return NextResponse.json({ deleted: true })
}
