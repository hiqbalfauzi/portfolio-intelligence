// Cek isi FinancialMetric per saham: npx tsx scripts/check-metrics.ts
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const main = async () => {
  const sec = await p.security.findFirst({ where: { ticker: 'BMRI' } })
  if (!sec) return
  const metrics = await p.financialMetric.findMany({
    where: { securityId: sec.id },
    orderBy: [{ metricName: 'asc' }, { periodEnd: 'desc' }],
  })
  const byName = new Map<string, { period: string; value: number }[]>()
  for (const m of metrics) {
    if (!byName.has(m.metricName)) byName.set(m.metricName, [])
    byName.get(m.metricName)!.push({ period: m.periodEnd.toISOString().slice(0, 10), value: m.metricValue })
  }
  for (const [name, vals] of byName) {
    console.log(`${name} [${vals.length} periode]: ${vals.slice(0, 5).map(v => `${v.period}=${v.value.toFixed(2)}`).join(', ')}`)
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => p.$disconnect())
