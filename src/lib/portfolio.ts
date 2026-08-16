import { prisma } from '@/lib/prisma'
import { PortfolioSummary } from '@/types'

export async function getPortfolioSummary(portfolioId: string): Promise<PortfolioSummary> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      positions: {
        where: { isActive: true },
        include: {
          security: true
        }
      }
    }
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  const totalValue = portfolio.positions.reduce((sum: number, pos: { currentValue: number }) => sum + pos.currentValue, 0)
  const totalCost = portfolio.positions.reduce((sum: number, pos: { totalCost: number }) => sum + pos.totalCost, 0)
  const unrealizedPL = portfolio.positions.reduce((sum: number, pos: { unrealizedPL: number }) => sum + pos.unrealizedPL, 0)
  
  return {
    totalValue,
    totalCost,
    realizedPL: portfolio.realizedPL,
    unrealizedPL,
    totalReturn: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    dailyChange: 0,
    dailyChangePercent: 0
  }
}

export async function getPortfolioPositions(portfolioId: string) {
  const positions = await prisma.position.findMany({
    where: { 
      portfolioId,
      isActive: true 
    },
    include: {
      security: true,
      thesis: true
    }
  })

  const totalValue = positions.reduce((sum: number, pos: { currentValue: number }) => sum + pos.currentValue, 0)

  return positions.map((pos: any) => ({
    id: pos.id,
    ticker: pos.security.ticker,
    name: pos.security.name,
    quantity: pos.quantity,
    averageCost: pos.averageCost,
    currentPrice: pos.currentPrice || 0,
    currentValue: pos.currentValue,
    unrealizedPL: pos.unrealizedPL,
    unrealizedPLPercent: pos.unrealizedPLPercent,
    allocation: totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0,
    thesisStatus: pos.thesis?.status
  }))
}
