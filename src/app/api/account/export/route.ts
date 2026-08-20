import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/account/export — ACC-04: ekspor seluruh data pengguna sebagai JSON
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      preferences: true,
      portfolios: {
        include: {
          positions: { include: { security: { select: { ticker: true, name: true, sector: true } } } },
          transactions: { include: { security: { select: { ticker: true, name: true } } } },
        },
      },
      watchlist: { include: { security: { select: { ticker: true, name: true } } } },
      journalEntries: true,
      alertRules: true,
      aiConversations: true,
    },
  })

  return NextResponse.json(
    { exportedAt: new Date().toISOString(), data },
    {
      headers: {
        'Content-Disposition': `attachment; filename="portfolio-intelligence-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    }
  )
}
