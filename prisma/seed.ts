import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Investor',
      passwordHash: 'hashed_password_placeholder',
      preferences: {
        create: {
          horizon: 'long-term',
          riskTolerance: 'moderate',
          benchmark: 'IHSG',
          analysisStyle: 'balanced',
        }
      }
    },
  })
  console.log('✅ User created:', user.email)

  const portfolio = await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: 'Portofolio Utama',
      broker: 'Demo Broker',
      benchmark: 'IHSG',
    }
  })
  console.log('✅ Portfolio created:', portfolio.name)

  const stocks = [
    { ticker: 'POWR', name: 'Powertek Indonesia', sector: 'Industrials', qty: 101, avg: 749, last: 810 },
    { ticker: 'AUTO', name: 'Astra Otoparts', sector: 'Consumer Non-Cyclicals', qty: 12, avg: 2801, last: 2900 },
    { ticker: 'DMAS', name: 'Dharma Satya Nusantara', sector: 'Basic Materials', qty: 271, avg: 146, last: 149 },
    { ticker: 'RALS', name: 'Prima Alloy Steel', sector: 'Industrials', qty: 132, avg: 379, last: 382 },
    { ticker: 'MPMX', name: 'Mitra Pengayom Indonesia', sector: 'Industrials', qty: 49, avg: 1006, last: 1005 },
    { ticker: 'BMRI', name: 'Bank Mandiri', sector: 'Financials', qty: 31, avg: 4177, last: 4170 },
    { ticker: 'TAPG', name: 'Tap Agro', sector: 'Consumer Non-Cyclicals', qty: 9, avg: 1816, last: 1790 },
    { ticker: 'PGAS', name: 'Perusahaan Gas Negara', sector: 'Energy', qty: 25, avg: 1505, last: 1495 },
    { ticker: 'BJTM', name: 'Bank Jatim', sector: 'Financials', qty: 80, avg: 519, last: 515 },
  ]

  let totalValue = 0
  let totalCost = 0

  for (const stock of stocks) {
    const security = await prisma.security.create({
      data: {
        ticker: stock.ticker,
        name: stock.name,
        sector: stock.sector,
        lastPrice: stock.last,
        lastUpdate: new Date(),
      }
    })

    const lotSize = 100
    const marketValue = stock.last * stock.qty * lotSize
    const cost = stock.avg * stock.qty * lotSize
    const unrealizedPL = marketValue - cost
    const unrealizedPLPercent = cost > 0 ? (unrealizedPL / cost) * 100 : 0

    totalValue += marketValue
    totalCost += cost

    const position = await prisma.position.create({
      data: {
        portfolioId: portfolio.id,
        securityId: security.id,
        quantity: stock.qty,
        averageCost: stock.avg,
        totalCost: cost,
        currentPrice: stock.last,
        currentValue: marketValue,
        unrealizedPL: unrealizedPL,
        unrealizedPLPercent: unrealizedPLPercent,
      }
    })

    await prisma.thesis.create({
      data: {
        positionId: position.id,
        securityId: security.id,
        title: `Tesis Investasi ${stock.ticker}`,
        summary: `Tesis untuk ${stock.name} - menunggu input pengguna`,
        reason: 'Menunggu input',
        horizon: 'long-term',
        status: 'UTUH',
        confidence: 'SEDANG',
      }
    })

    console.log(`✅ ${stock.ticker}: ${stock.qty} lot @ ${stock.avg} → ${stock.last} (${unrealizedPLPercent.toFixed(2)}%)`)
  }

  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: {
      totalValue: totalValue,
      totalCost: totalCost,
      unrealizedPL: totalValue - totalCost,
    }
  })

  console.log(`\n📊 Portfolio Summary:`)
  console.log(`   Total Value: Rp ${totalValue.toLocaleString('id-ID')}`)
  console.log(`   Total Cost: Rp ${totalCost.toLocaleString('id-ID')}`)
  console.log(`   Unrealized P/L: Rp ${(totalValue - totalCost).toLocaleString('id-ID')}`)
  console.log(`   Return: ${(((totalValue - totalCost) / totalCost) * 100).toFixed(2)}%`)
  console.log('\n✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
