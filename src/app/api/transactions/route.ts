import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const LOT_SIZE = 100

// Recalculate position values from current price
function calcPositionValues(quantity: number, averageCost: number, currentPrice: number) {
  const totalCost = quantity * averageCost * LOT_SIZE
  const currentValue = quantity * currentPrice * LOT_SIZE
  const unrealizedPL = currentValue - totalCost
  const unrealizedPLPercent = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0
  return { totalCost, currentValue, unrealizedPL, unrealizedPLPercent }
}

// Recalculate portfolio totals from all active positions
async function recalcPortfolio(portfolioId: string) {
  const positions = await prisma.position.findMany({
    where: { portfolioId, isActive: true },
  })
  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0)
  const totalCost = positions.reduce((s, p) => s + p.totalCost, 0)
  const realizedPL = positions.reduce((s, p) => s + p.realizedPL, 0)
  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      totalValue,
      totalCost,
      unrealizedPL: totalValue - totalCost,
      realizedPL,
    },
  })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const transactions = await prisma.transaction.findMany({
    where: { portfolio: { userId: user.userId } },
    include: { security: { select: { ticker: true, name: true } } },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json({ transactions })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { portfolioId, ticker, type, date, quantity, price, fee = 0, notes } = body

  // --- Validation (PORT-03) ---
  if (!portfolioId || !ticker || !type || !date || !quantity || !price) {
    return NextResponse.json({ error: 'Field wajib: portfolioId, ticker, type, date, quantity, price' }, { status: 400 })
  }
  if (!['BUY', 'SELL'].includes(type)) {
    return NextResponse.json({ error: 'Type harus BUY atau SELL' }, { status: 400 })
  }
  if (quantity <= 0 || price <= 0) {
    return NextResponse.json({ error: 'Quantity dan price harus > 0' }, { status: 400 })
  }

  // Verify portfolio belongs to user
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.userId },
  })
  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio tidak ditemukan' }, { status: 404 })
  }

  // Find or create security
  let security = await prisma.security.findUnique({ where: { ticker } })
  if (!security) {
    security = await prisma.security.create({
      data: { ticker, name: ticker, sector: 'Unknown' },
    })
  }

  const amount = quantity * price * LOT_SIZE
  const netAmount = type === 'BUY' ? amount + fee : amount - fee

  // Find existing position
  const position = await prisma.position.findFirst({
    where: { portfolioId, securityId: security.id, isActive: true },
  })

  // SELL validation: cannot sell more than owned
  if (type === 'SELL') {
    if (!position || position.quantity < quantity) {
      return NextResponse.json(
        { error: `Tidak bisa jual ${quantity} lot. Posisi saat ini: ${position?.quantity ?? 0} lot` },
        { status: 400 }
      )
    }
  }

  // Create transaction + update position atomically
  const result = await prisma.$transaction(async (tx) => {
    let updatedPosition

    if (type === 'BUY') {
      if (position) {
        // Average up: new avg cost = (old cost + new cost) / total qty
        const oldTotalCost = position.quantity * position.averageCost * LOT_SIZE
        const newTotalQty = position.quantity + quantity
        const newAvgCost = (oldTotalCost + amount) / (newTotalQty * LOT_SIZE)
        const currentPrice = security.lastPrice ?? price
        const vals = calcPositionValues(newTotalQty, newAvgCost, currentPrice)

        updatedPosition = await tx.position.update({
          where: { id: position.id },
          data: { quantity: newTotalQty, averageCost: newAvgCost, ...vals },
        })
      } else {
        const currentPrice = security.lastPrice ?? price
        const vals = calcPositionValues(quantity, price, currentPrice)
        updatedPosition = await tx.position.create({
          data: {
            portfolioId,
            securityId: security.id,
            quantity,
            averageCost: price,
            currentPrice,
            ...vals,
          },
        })
        // Auto-create thesis placeholder for new position
        await tx.thesis.create({
          data: {
            positionId: updatedPosition.id,
            securityId: security.id,
            title: `Tesis Investasi ${ticker}`,
            summary: `Tesis untuk ${security.name} - menunggu input pengguna`,
            reason: 'Menunggu input',
            horizon: 'long-term',
            status: 'UTUH',
            confidence: 'SEDANG',
          },
        })
      }
    } else {
      // SELL: realize P/L, avg cost unchanged
      // position guaranteed non-null by validation above
      const pos = position!
      const realizedGain = (price - pos.averageCost) * quantity * LOT_SIZE - fee
      const newQty = pos.quantity - quantity
      const currentPrice = security.lastPrice ?? price

      if (newQty === 0) {
        // Close position
        updatedPosition = await tx.position.update({
          where: { id: pos.id },
          data: {
            quantity: 0,
            totalCost: 0,
            currentValue: 0,
            unrealizedPL: 0,
            unrealizedPLPercent: 0,
            realizedPL: pos.realizedPL + realizedGain,
            isActive: false,
            closedAt: new Date(),
          },
        })
      } else {
        const vals = calcPositionValues(newQty, pos.averageCost, currentPrice)
        updatedPosition = await tx.position.update({
          where: { id: pos.id },
          data: {
            quantity: newQty,
            realizedPL: pos.realizedPL + realizedGain,
            ...vals,
          },
        })
      }
    }

    const transaction = await tx.transaction.create({
      data: {
        portfolioId,
        positionId: updatedPosition.id,
        securityId: security.id,
        type,
        date: new Date(date),
        quantity,
        price,
        amount,
        fee,
        netAmount,
        notes,
      },
      include: { security: { select: { ticker: true, name: true } } },
    })

    return transaction
  })

  await recalcPortfolio(portfolioId)

  return NextResponse.json({ transaction: result }, { status: 201 })
}
