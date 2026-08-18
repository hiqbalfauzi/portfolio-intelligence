import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const main = async () => {
  const n = await p.stockBrief.count()
  console.log('total briefs:', n)
  const briefs = await p.stockBrief.findMany({ orderBy: { date: 'desc' }, take: 12, include: { security: { select: { ticker: true } } } })
  for (const b of briefs) console.log(b.date.toISOString().slice(0, 10), b.security.ticker, b.confidence, b.content.slice(0, 40).replace(/\n/g, ' | '))
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => p.$disconnect())
