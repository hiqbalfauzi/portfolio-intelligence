// Dump keys data income statement: npx tsx scripts/check-stmt-keys.ts
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const main = async () => {
  const sec = await p.security.findFirst({ where: { ticker: 'BMRI' } })
  if (!sec) return
  const inc = await p.financialStatement.findFirst({ where: { securityId: sec.id, type: 'INCOME_STATEMENT' }, orderBy: { periodEnd: 'desc' } })
  if (inc) {
    const d = JSON.parse(inc.data as unknown as string) as Record<string, number>
    console.log('KEYS:', Object.keys(d).join(', '))
    console.log('totalRevenue:', d.totalRevenue, 'netIncome:', d.netIncome, 'ebitda:', d.ebitda)
  }
  const allMetrics = await p.financialMetric.findMany({ where: { securityId: sec.id }, select: { metricName: true }, distinct: ['metricName'] })
  console.log('METRIC NAMES:', allMetrics.map(m => m.metricName).join(', '))
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => p.$disconnect())
