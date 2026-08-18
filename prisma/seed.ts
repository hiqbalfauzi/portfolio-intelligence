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
    update: {
      passwordHash: '$2b$12$L1oGuJzjCPBoqt7vFmWtr.1LYF3fMfJUAVqHA/wZbsD.c1qQWNzbG',
    },
    create: {
      email: 'user@example.com',
      name: 'Investor',
      passwordHash: '$2b$12$L1oGuJzjCPBoqt7vFmWtr.1LYF3fMfJUAVqHA/wZbsD.c1qQWNzbG',
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
    { ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', sector: 'Financials', qty: 31, avg: 4000, last: 4150 },
    { ticker: 'POWR', name: 'Powertek Indonesia Tbk', sector: 'Industrials', qty: 77, avg: 820, last: 840 },
    { ticker: 'BNGA', name: 'Bank NTT Tbk', sector: 'Financials', qty: 51, avg: 1650, last: 1690 },
    { ticker: 'BJTM', name: 'Bank Jatim Tbk', sector: 'Financials', qty: 114, avg: 500, last: 515 },
    { ticker: 'PGAS', name: 'Perusahaan Gas Negara Tbk', sector: 'Energy', qty: 27, avg: 1480, last: 1515 },
    { ticker: 'DMAS', name: 'Dharma Satya Nusantara Tbk', sector: 'Basic Materials', qty: 271, avg: 158, last: 161 },
    { ticker: 'TAPG', name: 'Tapera Agra Persada Tbk', sector: 'Consumer Non-Cyclicals', qty: 25, avg: 1800, last: 1830 },
    { ticker: 'MPMX', name: 'Mitra Pengayom Indonesia Tbk', sector: 'Industrials', qty: 6, avg: 980, last: 1000 },
    { ticker: 'RALS', name: 'Prima Alloy Steel Tbk', sector: 'Industrials', qty: 11, avg: 370, last: 380 },
    { ticker: 'AUTO', name: 'Astra Otoparts Tbk', sector: 'Consumer Non-Cyclicals', qty: 12, avg: 2850, last: 2930 },
  ]

  let totalValue = 0
  let totalCost = 0

  for (const stock of stocks) {
    const security = await prisma.security.upsert({
      where: { ticker: stock.ticker },
      update: {
        lastPrice: stock.last,
        lastUpdate: new Date(),
      },
      create: {
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
