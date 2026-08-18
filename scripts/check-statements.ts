// Cek periode financial statement: npx tsx scripts/check-statements.ts
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const main = async () => {
  const sec = await p.security.findFirst({ where: { ticker: 'BMRI' } })
  if (!sec) return
  const stmts = await p.financialStatement.findMany({
    where: { securityId: sec.id },
    orderBy: { periodEnd: 'desc' },
    select: { type: true, periodEnd: true, periodType: true },
  })
  for (const s of stmts) console.log(s.type, s.periodEnd.toISOString().slice(0, 10), s.periodType)
  // Net income dari income statement tahunan
  const inc = await p.financialStatement.findMany({
    where: { securityId: sec.id, type: 'INCOME' },
    orderBy: { periodEnd: 'desc' },
  })
  for (const s of inc) {
    const d = JSON.parse(s.data as unknown as string) as Record<string, number>
    console.log('INCOME', s.periodEnd.toISOString().slice(0, 10), 'netIncome=', d.netIncome, 'totalRevenue=', d.totalRevenue)
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => p.$disconnect())
