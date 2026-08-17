import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') })
const prisma = new PrismaClient({ adapter })

async function main() {
  const portfolios = await prisma.portfolio.findMany({ include: { positions: true } })
  console.log(`Found ${portfolios.length} portfolios`)

  // Keep the portfolio with the most positions; delete empty duplicates
  const withPositions = portfolios.filter(p => p.positions.length > 0)
  const empty = portfolios.filter(p => p.positions.length === 0)

  // If multiple have positions, keep the one with highest totalValue
  let keeper = withPositions.sort((a, b) => b.totalValue - a.totalValue)[0]

  for (const p of portfolios) {
    if (p.id === keeper?.id) continue
    // delete positions, transactions, theses tied to this portfolio
    await prisma.transaction.deleteMany({ where: { portfolioId: p.id } })
    const positions = await prisma.position.findMany({ where: { portfolioId: p.id } })
    for (const pos of positions) {
      await prisma.thesis.deleteMany({ where: { positionId: pos.id } })
    }
    await prisma.position.deleteMany({ where: { portfolioId: p.id } })
    await prisma.portfolio.delete({ where: { id: p.id } })
    console.log(`Deleted duplicate portfolio ${p.id} (${p.positions.length} positions)`)
  }

  const remaining = await prisma.portfolio.findMany({ include: { positions: true } })
  console.log(`\nRemaining: ${remaining.length} portfolio(s)`)
  for (const p of remaining) {
    console.log(`  ${p.name}: ${p.positions.length} positions, value=${p.totalValue}`)
  }
}

main().finally(() => prisma.$disconnect())
