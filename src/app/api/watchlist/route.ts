import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/watchlist — daftar watchlist user
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.watchlistItem.findMany({
    where: { userId: user.userId, isActive: true },
    include: { security: true },
    orderBy: { addedAt: 'desc' },
  })
  return NextResponse.json({ items })
}

// POST /api/watchlist — tambah saham ke watchlist (PORT-07)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { ticker, notes, targetPrice, stopLoss, thesisDraft } = body

  if (!ticker || typeof ticker !== 'string') {
    return NextResponse.json({ error: 'Ticker wajib diisi' }, { status: 400 })
  }
  const t = ticker.trim().toUpperCase()

  // Find or create security
  let security = await prisma.security.findUnique({ where: { ticker: t } })
  if (!security) {
    security = await prisma.security.create({
      data: { ticker: t, name: t, sector: 'Unknown' },
    })
  }

  // Cek duplikat
  const existing = await prisma.watchlistItem.findUnique({
    where: { userId_securityId: { userId: user.userId, securityId: security.id } },
  })
  if (existing?.isActive) {
    return NextResponse.json({ error: `${t} sudah ada di watchlist` }, { status: 409 })
  }

  const item = existing
    ? await prisma.watchlistItem.update({
        where: { id: existing.id },
        data: { isActive: true, notes: notes ?? null, targetPrice: targetPrice ?? null, stopLoss: stopLoss ?? null, thesisDraft: thesisDraft ?? null },
        include: { security: true },
      })
    : await prisma.watchlistItem.create({
        data: {
          userId: user.userId,
          securityId: security.id,
          notes: notes ?? null,
          targetPrice: targetPrice ?? null,
          stopLoss: stopLoss ?? null,
          thesisDraft: thesisDraft ?? null,
        },
        include: { security: true },
      })

  return NextResponse.json({ item }, { status: 201 })
}

// DELETE /api/watchlist?ticker=BBCA — hapus dari watchlist (soft delete)
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ticker = request.nextUrl.searchParams.get('ticker')
  if (!ticker) return NextResponse.json({ error: 'Ticker wajib diisi' }, { status: 400 })

  const security = await prisma.security.findUnique({ where: { ticker: ticker.toUpperCase() } })
  if (!security) return NextResponse.json({ error: 'Ticker tidak ditemukan' }, { status: 404 })

  const item = await prisma.watchlistItem.findUnique({
    where: { userId_securityId: { userId: user.userId, securityId: security.id } },
  })
  if (!item || !item.isActive) return NextResponse.json({ error: 'Tidak ada di watchlist' }, { status: 404 })

  await prisma.watchlistItem.update({ where: { id: item.id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
