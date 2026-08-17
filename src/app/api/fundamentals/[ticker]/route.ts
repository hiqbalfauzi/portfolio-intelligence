import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ticker } = await params
  const tickerUpper = ticker.toUpperCase()

  const security = await prisma.security.findUnique({
    where: { ticker: tickerUpper },
  })
  if (!security) {
    return NextResponse.json({ error: 'Ticker tidak ditemukan' }, { status: 404 })
  }

  const [statements, metrics] = await Promise.all([
    prisma.financialStatement.findMany({
      where: { securityId: security.id },
      orderBy: { periodEnd: 'desc' },
    }),
    prisma.financialMetric.findMany({
      where: { securityId: security.id },
      orderBy: { periodEnd: 'desc' },
    }),
  ])

  // Group statements by type
  const incomeStatements = statements
    .filter(s => s.type === 'INCOME_STATEMENT')
    .map(s => ({ periodEnd: s.periodEnd, periodType: s.periodType, source: s.source, data: JSON.parse(s.data) }))
  const balanceSheets = statements
    .filter(s => s.type === 'BALANCE_SHEET')
    .map(s => ({ periodEnd: s.periodEnd, periodType: s.periodType, source: s.source, data: JSON.parse(s.data) }))

  // Latest metrics as key-value map
  const latestMetrics: Record<string, { value: number; formula?: string; periodEnd: string }> = {}
  for (const m of metrics) {
    if (!latestMetrics[m.metricName]) {
      latestMetrics[m.metricName] = {
        value: m.metricValue,
        formula: m.formula || undefined,
        periodEnd: m.periodEnd.toISOString(),
      }
    }
  }

  return NextResponse.json({
    security: {
      ticker: security.ticker,
      name: security.name,
      sector: security.sector,
      lastPrice: security.lastPrice,
      lastUpdate: security.lastUpdate,
    },
    incomeStatements,
    balanceSheets,
    metrics: latestMetrics,
    dataSource: 'Yahoo Finance',
    fetchedAt: new Date().toISOString(),
  })
}
