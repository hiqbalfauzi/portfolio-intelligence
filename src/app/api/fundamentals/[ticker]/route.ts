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

  // FUND-05: deteksi perubahan material antarperiode (threshold terdokumentasi)
  // Threshold: |Δ revenue| >= 10%, |Δ net income| >= 15%, |Δ margin| >= 2 poin persentase
  const materialChanges: { metric: string; prev: number; curr: number; change: string; note: string }[] = []
  const inc = incomeStatements
  if (inc.length >= 2) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const num = (d: Record<string, any>, k: string): number | null =>
      typeof d[k] === 'number' && Number.isFinite(d[k]) ? d[k] : null
    const curr = inc[0], prevP = inc[1]
    const checks: { key: string; label: string; thresholdPct: number }[] = [
      { key: 'totalRevenue', label: 'Total Pendapatan', thresholdPct: 10 },
      { key: 'netIncome', label: 'Laba Bersih', thresholdPct: 15 },
      { key: 'operatingIncome', label: 'Laba Operasi', thresholdPct: 15 },
    ]
    for (const c of checks) {
      const a = num(curr.data, c.key), b = num(prevP.data, c.key)
      if (a == null || b == null || b === 0) continue
      const pct = ((a - b) / Math.abs(b)) * 100
      if (Math.abs(pct) >= c.thresholdPct) {
        materialChanges.push({
          metric: c.label,
          prev: b,
          curr: a,
          change: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
          note: `Berubah ≥ ${c.thresholdPct}% dari periode sebelumnya (${prevP.periodEnd.toISOString().slice(0, 10)})`,
        })
      }
    }
    // Net margin shift (poin persentase)
    const margin = (d: Record<string, number | null>) => {
      const rev = typeof d.totalRevenue === 'number' ? d.totalRevenue : null
      const ni = typeof d.netIncome === 'number' ? d.netIncome : null
      return rev && ni != null && rev !== 0 ? (ni / rev) * 100 : null
    }
    const mCurr = margin(curr.data), mPrev = margin(prevP.data)
    if (mCurr != null && mPrev != null && Math.abs(mCurr - mPrev) >= 2) {
      materialChanges.push({
        metric: 'Net Margin',
        prev: mPrev,
        curr: mCurr,
        change: `${mCurr - mPrev >= 0 ? '+' : ''}${(mCurr - mPrev).toFixed(1)} pp`,
        note: `Berubah ≥ 2 poin persentase dari periode sebelumnya (${prevP.periodEnd.toISOString().slice(0, 10)})`,
      })
    }
  }

  // FUND-04: metrik sector-aware — metrik tambahan sesuai karakter sektor
  // Dihitung dari data tersedia; yang tidak tersedia dinyatakan eksplisit (bukan dikarang)
  const sectorMetrics: { label: string; value: string; note: string }[] = []
  const sector = security.sector?.toLowerCase() ?? ''
  const latestBS = balanceSheets[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bsData: Record<string, any> = latestBS?.data ?? {}
  const latestInc = incomeStatements[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const incData: Record<string, any> = latestInc?.data ?? {}
  const numVal = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

  if (sector.includes('financial')) {
    // Bank/finansial: NIM proxy dari interest income/expense
    const intInc = numVal(incData.interestIncome)
    const intExp = numVal(incData.interestExpense)
    const totalAssets = numVal(bsData.totalAssets)
    if (intInc != null && intExp != null && totalAssets != null && totalAssets > 0) {
      const nim = ((intInc - intExp) / totalAssets) * 100
      sectorMetrics.push({
        label: 'Net Interest Margin (proxy)',
        value: `${nim.toFixed(2)}%`,
        note: '(Pendapatan Bunga - Beban Bunga) / Total Aset — proxy, bukan NIM laporan bank',
      })
    } else {
      sectorMetrics.push({ label: 'Net Interest Margin', value: '-', note: 'Data interest income/expense tidak tersedia dari Yahoo Finance' })
    }
    sectorMetrics.push({ label: 'NPL / CAR', value: '-', note: 'Tidak tersedia dari Yahoo Finance — cek laporan bank / OJK' })
  } else if (sector.includes('energy') || sector.includes('basic material')) {
    // Komoditas: margin sensitif harga komoditas
    const rev = numVal(incData.totalRevenue)
    const gp = numVal(incData.grossProfit)
    if (rev != null && gp != null && rev > 0 && gp !== 0) {
      sectorMetrics.push({
        label: 'Gross Margin',
        value: `${((gp / rev) * 100).toFixed(2)}%`,
        note: 'Sektor komoditas: margin sangat tergantung harga komoditas global',
      })
    }
  } else if (sector.includes('consumer')) {
    const rev = numVal(incData.totalRevenue)
    const gp = numVal(incData.grossProfit)
    if (rev != null && gp != null && rev > 0 && gp !== 0) {
      sectorMetrics.push({
        label: 'Gross Margin',
        value: `${((gp / rev) * 100).toFixed(2)}%`,
        note: 'Indikator pricing power untuk sektor konsumer',
      })
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
    materialChanges,
    sectorMetrics,
    dataSource: 'Yahoo Finance',
    fetchedAt: new Date().toISOString(),
  })
}
