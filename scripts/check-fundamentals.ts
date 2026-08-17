import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const counts = await prisma.financialStatement.groupBy({ by: ['type'], _count: true })
  console.log('Statement counts by type:', JSON.stringify(counts))
  const bs = await prisma.financialStatement.findFirst({ where: { type: 'BALANCE_SHEET' } })
  console.log('Sample BS:', bs ? bs.data.slice(0, 300) : 'NONE')
  const metricCount = await prisma.financialMetric.count()
  console.log('Total metrics:', metricCount)
}

main().finally(() => prisma.$disconnect())
