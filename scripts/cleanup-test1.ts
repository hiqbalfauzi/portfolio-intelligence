import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })

async function main() {
  const s = await prisma.security.findUnique({ where: { ticker: 'TEST1' } })
  if (s) {
    await prisma.transaction.deleteMany({ where: { securityId: s.id } })
    await prisma.thesis.deleteMany({ where: { securityId: s.id } })
    await prisma.position.deleteMany({ where: { securityId: s.id } })
    await prisma.security.delete({ where: { id: s.id } })
    console.log('TEST1 cleaned')
  } else {
    console.log('TEST1 not found')
  }

  const pf = await prisma.portfolio.findMany()
  for (const p of pf) {
    const pos = await prisma.position.findMany({ where: { portfolioId: p.id, isActive: true } })
    const tv = pos.reduce((a, x) => a + x.currentValue, 0)
    const tc = pos.reduce((a, x) => a + x.totalCost, 0)
    const rp = pos.reduce((a, x) => a + x.realizedPL, 0)
    await prisma.portfolio.update({ where: { id: p.id }, data: { totalValue: tv, totalCost: tc, unrealizedPL: tv - tc, realizedPL: rp } })
  }
  console.log('portfolio recalced, tx total:', await prisma.transaction.count())
}

main().catch(e => { console.error(e); process.exit(1) })
