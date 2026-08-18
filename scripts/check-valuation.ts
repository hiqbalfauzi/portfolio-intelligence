// Cek data dividend / corporate action + EBITDA availability: npx tsx scripts/check-valuation.ts
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const main = async () => {
  const sec = await p.security.findFirst({ where: { ticker: 'BMRI' } })
  if (!sec) return
  const ca = await p.corporateAction.findMany({ where: { securityId: sec.id } })
  console.log('corporateActions:', ca.length)
  for (const c of ca.slice(0, 5)) console.log(' ', c.type, c.title, c.exDate?.toISOString().slice(0, 10))
  // EBITDA dari income statement
  const inc = await p.financialStatement.findMany({ where: { securityId: sec.id, type: 'INCOME_STATEMENT' }, orderBy: { periodEnd: 'desc' } })
  for (const s of inc) {
    const d = JSON.parse(s.data as unknown as string) as Record<string, number>
    console.log('INCOME', s.periodEnd.toISOString().slice(0, 10), 'ebitda=', d.ebitda, 'opInc=', d.operatingIncome)
  }
  // Dividend metric?
  const dm = await p.financialMetric.findMany({ where: { securityId: sec.id, metricName: { contains: 'DIVIDEND' } } })
  for (const m of dm) console.log('DIV metric', m.metricName, m.metricValue, m.periodEnd.toISOString().slice(0, 10))
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => p.$disconnect())
