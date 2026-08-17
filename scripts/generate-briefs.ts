// Daily stock briefs: refresh OHLCV, then AI-generate a short brief per portfolio stock.
// Usage: npx tsx scripts/generate-briefs.ts
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const fmtNum = (n: number | null | undefined, d = 2) => (n == null || !isFinite(n) ? 'n/a' : n.toFixed(d))
const fmtIDR = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`

async function getCookie(): Promise<string> {
  const res = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': UA } })
  return (res.headers.getSetCookie?.() || []).map(c => c.split(';')[0]).join('; ')
}

async function refreshPrices(securities: { id: string; ticker: string }[], cookie: string) {
  for (const sec of securities) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sec.ticker}.JK?range=1y&interval=1d&includeAdjustedClose=true`
      const res = await fetch(url, { headers: { 'User-Agent': UA, Cookie: cookie } })
      const json = await res.json()
      const result = json.chart?.result?.[0]
      if (!result) { console.log(`  ⚠ ${sec.ticker}: no chart data`); continue }
      const ts: number[] = result.timestamp || []
      const q = result.indicators?.quote?.[0] || {}
      const adj = result.indicators?.adjclose?.[0]?.adjclose || []
      let n = 0
      for (let i = 0; i < ts.length; i++) {
        const close = q.close?.[i]
        if (close == null) continue
        const date = new Date(ts[i] * 1000)
        await prisma.priceBar.upsert({
          where: { securityId_date_timeframe: { securityId: sec.id, date, timeframe: '1D' } },
          update: { open: q.open?.[i] ?? close, high: q.high?.[i] ?? close, low: q.low?.[i] ?? close, close, volume: q.volume?.[i] ?? 0, adjustedClose: adj[i] ?? null },
          create: { securityId: sec.id, date, timeframe: '1D', open: q.open?.[i] ?? close, high: q.high?.[i] ?? close, low: q.low?.[i] ?? close, close, volume: q.volume?.[i] ?? 0, adjustedClose: adj[i] ?? null },
        })
        n++
      }
      console.log(`  ✅ ${sec.ticker}: ${n} bars`)
      await sleep(400)
    } catch (e: unknown) {
      console.log(`  ❌ ${sec.ticker}: ${(e as Error).message}`)
    }
  }
}

async function buildStockContext(securityId: string): Promise<string> {
  const sec = await prisma.security.findUnique({ where: { id: securityId }, include: { positions: { where: { isActive: true } } } })
  if (!sec) return ''
  const pos = sec.positions[0]
  const parts: string[] = []

  if (pos) {
    parts.push(`POSISI: ${pos.quantity} lot @ avg ${fmtIDR(pos.averageCost)}, harga kini ${fmtIDR(pos.currentPrice ?? 0)}, unrealized ${fmtNum(pos.unrealizedPLPercent)}%, nilai ${fmtIDR(pos.currentValue)}.`)
  }

  const thesis = await prisma.thesis.findFirst({ where: { securityId }, orderBy: { updatedAt: 'desc' } })
  if (thesis && !thesis.reason.startsWith('Menunggu')) {
    parts.push(`TESIS [${thesis.status}]: ${thesis.summary} | Alasan: ${thesis.reason}${thesis.invalidation ? ` | Invalidasi: ${thesis.invalidation}` : ''}`)
  }

  const metrics = await prisma.financialMetric.findMany({ where: { securityId, periodType: 'ANNUAL' }, orderBy: { periodEnd: 'desc' }, take: 20 })
  const latest = new Map<string, number>()
  for (const m of metrics) if (!latest.has(m.metricName)) latest.set(m.metricName, m.metricValue)
  if (latest.size > 0) {
    const keys = ['PER', 'PBV', 'ROE', 'DER', 'Net Margin', 'Dividend Yield']
    parts.push(`FUNDAMENTAL (tahunan terakhir): ` + keys.filter(k => latest.has(k)).map(k => `${k}=${fmtNum(latest.get(k))}`).join(', '))
  }

  const bars = await prisma.priceBar.findMany({ where: { securityId, timeframe: '1D' }, orderBy: { date: 'desc' }, take: 260 })
  if (bars.length >= 20) {
    const last = bars[0]
    const prev = bars[1]
    const ma = (n: number) => bars.slice(0, n).reduce((s, b) => s + b.close, 0) / Math.min(n, bars.length)
    const chg = (n: number) => bars[n] ? ((last.close - bars[n].close) / bars[n].close) * 100 : null
    const dayChg = prev ? ((last.close - prev.close) / prev.close) * 100 : null
    const hi = Math.max(...bars.map(b => b.high)), lo = Math.min(...bars.map(b => b.low))
    parts.push(
      `TEKNIKAL per ${last.date.toISOString().slice(0, 10)}: close ${last.close} (${fmtNum(dayChg)}% harian), MA20 ${fmtNum(ma(20), 0)}, MA50 ${fmtNum(ma(50), 0)}, MA200 ${fmtNum(ma(200), 0)}, ` +
      `1 bln ${fmtNum(chg(21))}%, 3 bln ${fmtNum(chg(63))}%, 6 bln ${fmtNum(chg(126))}%, 52wk ${lo}–${hi}, vol terakhir ${fmtNum(last.volume / 1e6, 1)}jt.`
    )
  }
  return parts.join('\n')
}

const BRIEF_PROMPT = `Anda analis saham Indonesia. Berdasarkan DATA di bawah, tulis brief harian pra-market untuk investor yang memegang saham ini.

FORMAT WAJIB — tepat 5 baris bullet, urutan tetap, tanpa teks lain di luar bullet:
- **Fokus**: satu hal terpenting hari ini (maks 15 kata).
- **Teknikal**: support & resistance konkret dari MA/data, arah tren (maks 20 kata).
- **Fundamental**: valuasi & profitabilitas dalam 1 kalimat (maks 15 kata).
- **Tesis**: apakah data mendukung atau melemahkan tesis (maks 15 kata). Jika tidak ada tesis, tulis "Tesis belum diisi".
- **Pantau**: satu hal konkret yang perlu dipantau (maks 15 kata).

Akhiri dengan satu baris: Confidence: TINGGI/SEDANG/RENDAH

Aturan ketat:
1. HANYA pakai angka dari DATA. Jangan mengarang angka atau level.
2. Jangan beri kepastian arah harga; gunakan bahasa probabilistik.
3. Jangan tambah judul, pembuka, atau penutup.
4. Bahasa Indonesia ringkas.

DATA:
`

async function generateBrief(context: string): Promise<{ content: string; confidence: string }> {
  const baseUrl = process.env.AI_BASE_URL
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || 'deepseek/deepseek-v4-flash-0731'
  if (!baseUrl || !apiKey) throw new Error('AI_BASE_URL / AI_API_KEY belum diset di .env')

  // Rate limit: 2 req/menit → retry dengan backoff 65 detik saat 429
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: BRIEF_PROMPT + context },
          { role: 'user', content: 'Tulis brief hari ini.' },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    })
    if (res.status === 429) {
      console.log(`    ⏳ rate limited, tunggu 65 detik...`)
      await sleep(65_000)
      continue
    }
    if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 150)}`)
    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content || ''
    if (!content.trim()) throw new Error('Jawaban model kosong')
    const conf = /Confidence:\s*(TINGGI|SEDANG|RENDAH)/i.exec(content)?.[1]?.toUpperCase() || 'SEDANG'
    return { content: content.trim(), confidence: conf }
  }
  throw new Error('Rate limit: 4x percobaan gagal')
}

async function main() {
  console.log('📡 Daily brief generation...\n')
  const portfolio = await prisma.portfolio.findFirst({ include: { positions: { where: { isActive: true }, include: { security: true } } } })
  if (!portfolio) { console.log('Tidak ada portofolio.'); return }
  const securities = portfolio.positions.map(p => p.security)
  console.log(`1) Refresh OHLCV ${securities.length} saham`)
  await refreshPrices(securities, await getCookie())

  // refresh position prices from latest bar
  for (const pos of portfolio.positions) {
    const last = await prisma.priceBar.findFirst({ where: { securityId: pos.securityId, timeframe: '1D' }, orderBy: { date: 'desc' } })
    if (last) {
      const currentValue = last.close * pos.quantity * 100
      await prisma.position.update({
        where: { id: pos.id },
        data: {
          currentPrice: last.close, currentValue,
          unrealizedPL: currentValue - pos.totalCost,
          unrealizedPLPercent: pos.totalCost > 0 ? ((currentValue - pos.totalCost) / pos.totalCost) * 100 : 0,
        },
      })
      await prisma.security.update({ where: { id: pos.securityId }, data: { lastPrice: last.close, lastUpdate: last.date } })
    }
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  console.log(`\n2) Generate brief AI per saham (tanggal ${today.toISOString().slice(0, 10)})`)
  let ok = 0
  for (const sec of securities) {
    try {
      const ctx = await buildStockContext(sec.id)
      const { content, confidence } = await generateBrief(ctx)
      await prisma.stockBrief.upsert({
        where: { securityId_date: { securityId: sec.id, date: today } },
        update: { content, confidence, model: process.env.AI_MODEL || null },
        create: { securityId: sec.id, date: today, content, confidence, model: process.env.AI_MODEL || null },
      })
      console.log(`  ✅ ${sec.ticker} (${confidence})`)
      ok++
    } catch (e: unknown) {
      console.log(`  ❌ ${sec.ticker}: ${(e as Error).message}`)
    }
    await sleep(35_000) // rate limit 2 req/menit
  }
  console.log(`\n🎉 Done: ${ok}/${securities.length} briefs`)
}

main().finally(() => prisma.$disconnect())
