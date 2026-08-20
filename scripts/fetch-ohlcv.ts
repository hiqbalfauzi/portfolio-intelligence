// Fetch daily OHLCV history from Yahoo Finance chart API into PriceBar
// Usage: npx tsx scripts/fetch-ohlcv.ts [range]   (default range: 2y)
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const RANGE = process.argv[2] || '2y'
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function getCookie(): Promise<string> {
  const res = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': UA } })
  const setCookies = res.headers.getSetCookie?.() || []
  return setCookies.map(c => c.split(';')[0]).join('; ')
}

interface ChartBar {
  date: Date
  open: number; high: number; low: number; close: number
  volume: number; adjustedClose: number | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseChart(result: any): ChartBar[] {
  const ts: number[] = result.timestamp || []
  const q = result.indicators?.quote?.[0] || {}
  const adj = result.indicators?.adjclose?.[0]?.adjclose || []
  const bars: ChartBar[] = []
  for (let i = 0; i < ts.length; i++) {
    const close = q.close?.[i]
    if (close == null) continue
    bars.push({
      date: new Date(ts[i] * 1000),
      open: q.open?.[i] ?? close,
      high: q.high?.[i] ?? close,
      low: q.low?.[i] ?? close,
      close,
      volume: q.volume?.[i] ?? 0,
      adjustedClose: adj[i] ?? null,
    })
  }
  return bars
}

async function main() {
  console.log(`📡 Fetching OHLCV (range=${RANGE}) from Yahoo Finance...\n`)
  const cookie = await getCookie()

  // TECH-03: ensure benchmark IHSG (^JKSE) exists as a security for relative strength
  const ihsg = await prisma.security.findUnique({ where: { ticker: 'IHSG' } })
  if (!ihsg) {
    await prisma.security.create({
      data: { ticker: 'IHSG', name: 'Indeks Harga Saham Gabungan', sector: 'Index', description: 'Benchmark index — bukan saham' },
    })
  }

  const securities = await prisma.security.findMany({ where: { isActive: true } })
  console.log(`Found ${securities.length} securities\n`)

  let ok = 0
  for (const sec of securities) {
    const yahooSymbol = sec.ticker === 'IHSG' ? '^JKSE' : `${sec.ticker}.JK`
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${RANGE}&interval=1d&includeAdjustedClose=true`
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Cookie: cookie } })
      const json = await res.json()
      const result = json.chart?.result?.[0]
      if (!result) {
        console.log(`  ⚠ ${sec.ticker}: ${json.chart?.error?.description || 'no result'}`)
        continue
      }
      const bars = parseChart(result)
      let upserted = 0
      for (const b of bars) {
        await prisma.priceBar.upsert({
          where: {
            securityId_date_timeframe: { securityId: sec.id, date: b.date, timeframe: '1D' },
          },
          update: { open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume, adjustedClose: b.adjustedClose },
          create: {
            securityId: sec.id, timeframe: '1D',
            date: b.date, open: b.open, high: b.high, low: b.low, close: b.close,
            volume: b.volume, adjustedClose: b.adjustedClose,
          },
        })
        upserted++
      }
      // refresh last price from newest bar
      if (bars.length > 0) {
        const last = bars[bars.length - 1]
        await prisma.security.update({ where: { id: sec.id }, data: { lastPrice: last.close, lastUpdate: last.date } })
      }
      console.log(`  ✅ ${sec.ticker}: ${upserted} bars`)
      ok++
    } catch (e: unknown) {
      console.log(`  ❌ ${sec.ticker}: ${(e as Error).message}`)
    }
    await sleep(500)
  }
  const total = await prisma.priceBar.count()
  console.log(`\n🎉 Done: ${ok}/${securities.length} securities — PriceBar total: ${total}`)
}

main().finally(() => prisma.$disconnect())
