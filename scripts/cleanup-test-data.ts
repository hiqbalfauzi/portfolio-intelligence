import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Remove BBCA test data
  const bbcas = await prisma.security.findMany({ where: { ticker: 'BBCA' } })
  for (const s of bbcas) {
    await prisma.transaction.deleteMany({ where: { securityId: s.id } })
    await prisma.thesis.deleteMany({ where: { securityId: s.id } })
    await prisma.position.deleteMany({ where: { securityId: s.id } })
    await prisma.security.delete({ where: { id: s.id } })
  }
  // Recalc portfolio totals
  const portfolios = await prisma.portfolio.findMany()
  for (const pf of portfolios) {
    const positions = await prisma.position.findMany({ where: { portfolioId: pf.id, isActive: true } })
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0)
    const totalCost = positions.reduce((sum, p) => sum + p.totalCost, 0)
    const realizedPL = positions.reduce((sum, p) => sum + p.realizedPL, 0)
    await prisma.portfolio.update({
      where: { id: pf.id },
      data: { totalValue, totalCost, unrealizedPL: totalValue - totalCost, realizedPL },
    })
    console.log(`Portfolio ${pf.name}: value=${totalValue}, cost=${totalCost}`)
  }
  console.log('✅ Test data cleaned')
}

main().finally(() => prisma.$disconnect())
