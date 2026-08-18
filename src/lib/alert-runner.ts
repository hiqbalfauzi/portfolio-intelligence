// Alert runner: evaluate active rules, create events. Shared by API route & CLI script.
import { evaluateRule, inCooldown, type MarketInput, type RuleInput } from './alert-engine'

type PrismaLike = {
  alertRule: {
    findMany(args: unknown): Promise<Array<{
      id: string; name: string; type: string; condition: string; priority: string
      securityId: string | null; lastTriggered: Date | null
    }>>
    update(args: unknown): Promise<unknown>
  }
  priceBar: { findMany(args: unknown): Promise<Array<{ date: Date; close: number; high: number; low: number; volume: number }>> }
  thesis: { findFirst(args: unknown): Promise<{ status: string } | null> }
  alertEvent: {
    findFirst(args: unknown): Promise<{ id: string } | null>
    create(args: unknown): Promise<unknown>
  }
}

async function buildMarketInput(prisma: PrismaLike, securityId: string): Promise<MarketInput | null> {
  const bars = await prisma.priceBar.findMany({
    where: { securityId, timeframe: '1D' },
    orderBy: { date: 'desc' },
    take: 260,
  })
  if (bars.length < 21) return null
  const asc = [...bars].reverse()
  const prev20 = bars.slice(1, 21)
  const thesis = await prisma.thesis.findFirst({ where: { securityId }, orderBy: { updatedAt: 'desc' } })
  return {
    lastClose: bars[0].close,
    prevClose: bars[1]?.close ?? null,
    lastVolume: bars[0].volume,
    avgVolume20: prev20.reduce((s, b) => s + b.volume, 0) / prev20.length,
    closes: asc.map(b => b.close),
    high20Prev: Math.max(...prev20.map(b => b.high)),
    low20Prev: Math.min(...prev20.map(b => b.low)),
    thesisStatus: thesis?.status ?? null,
  }
}

export async function runAlerts(prisma: PrismaLike): Promise<{ evaluated: number; triggered: number; details: string[] }> {
  const rules = await prisma.alertRule.findMany({ where: { isActive: true } })
  const mktCache = new Map<string, MarketInput | null>()
  const details: string[] = []
  let triggered = 0

  for (const rule of rules) {
    if (!rule.securityId) { details.push(`${rule.name}: skip (portfolio-level belum didukung)`); continue }
    if (inCooldown(rule.lastTriggered)) { details.push(`${rule.name}: cooldown aktif`); continue }

    if (!mktCache.has(rule.securityId)) mktCache.set(rule.securityId, await buildMarketInput(prisma, rule.securityId))
    const mkt = mktCache.get(rule.securityId)
    if (!mkt) { details.push(`${rule.name}: data harga kurang`); continue }

    const result = evaluateRule(rule as RuleInput, mkt)
    if (!result) { details.push(`${rule.name}: tidak trigger`); continue }

    // Dedup (ALERT-04): satu event per rule per hari
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const existing = await prisma.alertEvent.findFirst({ where: { ruleId: rule.id, createdAt: { gte: today } } })
    if (existing) { details.push(`${rule.name}: event hari ini sudah ada`); continue }

    await prisma.alertEvent.create({
      data: {
        ruleId: rule.id,
        title: result.title,
        message: result.message,
        previousValue: result.previousValue,
        currentValue: result.currentValue,
        impact: result.impact,
      },
    })
    await prisma.alertRule.update({ where: { id: rule.id }, data: { lastTriggered: new Date() } })
    details.push(`${rule.name}: TRIGGER — ${result.title}`)
    triggered++
  }
  return { evaluated: rules.length, triggered, details }
}
