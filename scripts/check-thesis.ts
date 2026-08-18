// Cek tesis + posisi saat ini
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const main = async () => {
  const th = await p.thesis.findMany({ include: { security: { select: { ticker: true } } } })
  console.log('=== THESIS ===')
  for (const t of th) console.log(t.security.ticker, '|', t.status, '|', t.title.slice(0, 60), '|', t.reason.slice(0, 80))
  const pos = await p.position.findMany({ where: { isActive: true }, include: { security: { select: { ticker: true } } } })
  console.log('=== POSITIONS ===')
  for (const q of pos) console.log(q.security.ticker, q.quantity, 'lot @', q.averageCost, '| posId:', q.id, '| secId:', q.securityId)
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => p.$disconnect())
