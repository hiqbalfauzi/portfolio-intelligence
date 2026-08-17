// Build grounded context from DB for AI Analyst (RAG-lite: structured retrieval, no embeddings)
// Every fact carries source + date so the model can cite it.
import { PrismaClient } from '../generated/prisma/client'

const fmtIDR = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`
const fmtDate = (d: Date) => d.toISOString().slice(0, 10)
const fmtNum = (n: number | null | undefined, digits = 2) =>
  n == null || !isFinite(n) ? 'n/a' : n.toLocaleString('id-ID', { maximumFractionDigits: digits })

export interface RetrievedContext {
  text: string
  citations: Array<{ id: string; title: string; source: string; url?: string; date: string }>
}

export async function buildContext(prisma: PrismaClient, question: string): Promise<RetrievedContext> {
  const q = question.toUpperCase()
  const tickers = (await prisma.security.findMany({ where: { isActive: true } }))
    .filter(s => q.includes(s.ticker))
    .map(s => s.ticker)

  const portfolio = await prisma.portfolio.findFirst({
    include: { positions: { where: { isActive: true }, include: { security: true } } },
  })
  if (!portfolio) return { text: 'Belum ada portofolio di database.', citations: [] }

  // No specific ticker mentioned → portfolio-wide context
  const targets = tickers.length > 0
    ? portfolio.positions.filter(p => tickers.includes(p.security.ticker))
    : portfolio.positions

  const parts: string[] = []
  const citations: RetrievedContext['citations'] = []
  let citeIdx = 0
  const addCite = (title: string, source: string, date: string, url?: string) => {
    citeIdx++
    citations.push({ id: `c${citeIdx}`, title, source, url, date })
    return `[c${citeIdx}]`
  }

  // --- Portfolio snapshot ---
  const totalValue = portfolio.positions.reduce((s, p) => s + p.currentValue, 0)
  const totalCost = portfolio.positions.reduce((s, p) => s + p.totalCost, 0)
  const snapDate = fmtDate(new Date())
  const pc = addCite('Portofolio snapshot', 'Database internal', snapDate)
  parts.push(
    `PORTOFOLIO "${portfolio.name}" per ${snapDate} ${pc}: nilai ${fmtIDR(totalValue)}, modal ${fmtIDR(totalCost)}, ` +
    `unrealized P/L ${fmtIDR(totalValue - totalCost)} (${fmtNum(((totalValue - totalCost) / totalCost) * 100)}%). ` +
    `${portfolio.positions.length} posisi aktif.`
  )

  for (const pos of targets) {
    const t = pos.security.ticker
    const weight = totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0
    const posC = addCite(`Posisi ${t}`, 'Database internal', snapDate)
    parts.push(
      `\n=== ${t} (${pos.security.name}, sektor ${pos.security.sector}) ===\n` +
      `Posisi ${posC}: ${pos.quantity} lot @ avg ${fmtIDR(pos.averageCost)}, harga kini ${fmtIDR(pos.currentPrice ?? (pos.currentValue / (pos.quantity * 100)))}, ` +
      `nilai ${fmtIDR(pos.currentValue)} (${fmtNum(weight)}% portofolio), unrealized ${fmtNum(pos.unrealizedPLPercent)}%.`
    )

    // --- Thesis ---
    const thesis = await prisma.thesis.findFirst({ where: { securityId: pos.securityId }, orderBy: { updatedAt: 'desc' } })
    if (thesis) {
      const tc = addCite(`Tesis ${t} v${thesis.version}`, 'Thesis Monitor', fmtDate(thesis.updatedAt))
      parts.push(
        `Tesis ${tc} [status ${thesis.status}, confidence ${thesis.confidence}]: ${thesis.summary}\n` +
        `Alasan beli: ${thesis.reason}\n` +
        (thesis.catalyst ? `Katalis: ${thesis.catalyst}\n` : '') +
        (thesis.risks ? `Risiko: ${thesis.risks}\n` : '') +
        (thesis.invalidation ? `Invalidasi: ${thesis.invalidation}` : '')
      )
    }

    // --- Financial metrics (latest annual) ---
    const metrics = await prisma.financialMetric.findMany({
      where: { securityId: pos.securityId, periodType: 'ANNUAL' },
      orderBy: { periodEnd: 'desc' },
      take: 40,
    })
    if (metrics.length > 0) {
      const byPeriod = new Map<string, Map<string, number>>()
      for (const m of metrics) {
        const k = fmtDate(m.periodEnd)
        if (!byPeriod.has(k)) byPeriod.set(k, new Map())
        byPeriod.get(k)!.set(m.metricName, m.metricValue)
      }
      const periods = [...byPeriod.keys()].sort().reverse().slice(0, 3)
      const names = ['PER', 'PBV', 'ROE', 'DER', 'Net Margin', 'Dividend Yield']
      const lines = periods.map(p => {
        const mm = byPeriod.get(p)!
        const src = metrics.find(m => fmtDate(m.periodEnd) === p)
        const c = addCite(`Metrik ${t} FY${p.slice(0, 4)}`, src?.dataType === 'CALCULATED' ? 'Perhitungan internal' : 'Yahoo Finance', p)
        const vals = names.filter(n => mm.has(n)).map(n => `${n}=${fmtNum(mm.get(n))}`).join(', ')
        return `FY${p.slice(0, 4)} ${c}: ${vals || 'n/a'}`
      })
      parts.push(`Fundamental ${t}:\n` + lines.join('\n'))
    }

    // --- Price trend from OHLCV ---
    const bars = await prisma.priceBar.findMany({
      where: { securityId: pos.securityId, timeframe: '1D' },
      orderBy: { date: 'desc' },
      take: 200,
    })
    if (bars.length >= 20) {
      const last = bars[0]
      const ma = (n: number) => bars.slice(0, n).reduce((s, b) => s + b.close, 0) / Math.min(n, bars.length)
      const chg = (n: number) => bars[n] ? ((last.close - bars[n].close) / bars[n].close) * 100 : null
      const high52 = Math.max(...bars.slice(0, Math.min(250, bars.length)).map(b => b.high))
      const low52 = Math.min(...bars.slice(0, Math.min(250, bars.length)).map(b => b.low))
      const priceC = addCite(`Harga ${t}`, 'Yahoo Finance (OHLCV)', fmtDate(last.date))
      parts.push(
        `Teknikal ${t} ${priceC}: close ${last.close}, MA20 ${fmtNum(ma(20), 0)}, MA50 ${fmtNum(ma(50), 0)}, MA200 ${fmtNum(ma(200), 0)}, ` +
        `1 bln ${fmtNum(chg(21))}%, 3 bln ${fmtNum(chg(63))}%, 52wk high/low ${high52}/${low52}.`
      )
    }
  }

  return { text: parts.join('\n'), citations }
}
