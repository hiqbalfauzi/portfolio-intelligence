import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Latest AI brief per portfolio stock
export async function GET() {
  const portfolio = await prisma.portfolio.findFirst({
    include: { positions: { where: { isActive: true }, include: { security: true } } },
  })
  if (!portfolio) return NextResponse.json({ error: 'Tidak ada portofolio' }, { status: 404 })

  const briefs = await Promise.all(
    portfolio.positions.map(async (pos) => {
      const brief = await prisma.stockBrief.findFirst({
        where: { securityId: pos.securityId },
        orderBy: { date: 'desc' },
      })
      return {
        ticker: pos.security.ticker,
        name: pos.security.name,
        sector: pos.security.sector,
        lastPrice: pos.currentPrice,
        unrealizedPLPercent: pos.unrealizedPLPercent,
        currentValue: pos.currentValue,
        brief: brief ? { content: brief.content, confidence: brief.confidence, date: brief.date, generatedAt: brief.createdAt } : null,
      }
    })
  )

  return NextResponse.json({ stocks: briefs })
}
