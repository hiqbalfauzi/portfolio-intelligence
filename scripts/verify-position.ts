import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pos = await prisma.position.findFirst({ where: { security: { ticker: 'BBCA' } } })
  if (!pos) { console.log('BBCA position not found'); return }
  console.log('=== Posisi BBCA ===')
  console.log('quantity:', pos.quantity, 'lot (expect 5)')
  console.log('averageCost:', pos.averageCost, '(expect 9500)')
  console.log('realizedPL:', pos.realizedPL, '(expect 245000)')
  const pf = await prisma.portfolio.findFirst({ where: { id: pos.portfolioId } })
  console.log('=== Portfolio ===')
  console.log('totalValue:', pf!.totalValue)
  console.log('realizedPL:', pf!.realizedPL)
  const txCount = await prisma.transaction.count()
  console.log('total transactions:', txCount)
}

main().finally(() => prisma.$disconnect())
