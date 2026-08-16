import { prisma } from '@/lib/prisma'
import { OverviewClient } from './OverviewClient'

export default async function OverviewPage() {
  // Fetch portfolio with positions
  const portfolio = await prisma.portfolio.findFirst({
    include: {
      positions: {
        where: { isActive: true },
        include: {
          security: true,
          thesis: true,
        },
      },
    },
  })

  // Fetch recent alerts
  const alerts = await prisma.alertEvent.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      rule: true,
    },
  })

  // Calculate portfolio metrics
  const totalValue = portfolio?.positions.reduce((sum, pos) => sum + pos.currentValue, 0) || 0
  const totalCost = portfolio?.positions.reduce((sum, pos) => sum + pos.totalCost, 0) || 0
  const unrealizedPL = totalValue - totalCost
  const totalReturn = totalCost > 0 ? ((unrealizedPL / totalCost) * 100) : 0

  // Calculate allocation per position
  const positions = portfolio?.positions.map(pos => ({
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
    thesisStatus: pos.thesis?.status || 'UTUH',
  })) || []

  // Sector allocation
  const sectorAllocation = portfolio?.positions.reduce((acc, pos) => {
    const sector = pos.security.sector
    const value = pos.currentValue
    acc[sector] = (acc[sector] || 0) + value
    return acc
  }, {} as Record<string, number>) || {}

  const sectorData = Object.entries(sectorAllocation).map(([name, value]) => ({
    name,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
  }))

  return (
    <OverviewClient
      portfolio={{
        totalValue,
        totalCost,
        unrealizedPL,
        realizedPL: portfolio?.realizedPL || 0,
        totalReturn,
        dailyChange: 0,
        dailyChangePercent: 0,
      }}
      positions={positions}
      sectorData={sectorData}
      alerts={alerts.map(a => ({
        id: a.id,
        type: a.rule.type,
        priority: a.rule.priority as 'INFO' | 'REVIEW' | 'CRITICAL',
        title: a.title,
        message: a.message,
        createdAt: a.createdAt,
        isRead: a.isRead,
      }))}
    />
  )
}
