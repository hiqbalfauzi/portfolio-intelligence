// Fetch news per portfolio stock via Google News RSS + AI sentiment classification.
// Usage: npx tsx scripts/fetch-news.ts
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const MAX_AGE_DAYS = 30 // NEWS-08: berita lama tidak boleh tampil sebagai baru

interface RssItem { title: string; link: string; pubDate: Date; source: string }

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(block)
      return r ? decodeEntities(r[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : ''
    }
    const title = get('title')
    const link = get('link')
    const pubDate = new Date(get('pubDate'))
    const sourceMatch = /<source[^>]*>([\s\S]*?)<\/source>/.exec(block)
    const source = sourceMatch ? decodeEntities(sourceMatch[1].trim()) : 'Google News'
    if (title && link && !isNaN(pubDate.getTime())) items.push({ title, link, pubDate, source })
  }
  return items
}

async function fetchTickerNews(ticker: string, companyName: string): Promise<RssItem[]> {
  const q = encodeURIComponent(`${ticker} ${companyName} saham`)
  const url = `https://news.google.com/rss/search?q=${q}&hl=id&gl=ID&ceid=ID:id`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`RSS ${res.status}`)
  const xml = await res.text()
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400_000
  return parseRss(xml).filter(i => i.pubDate.getTime() >= cutoff)
}

// Klasifikasi sentimen batch: satu LLM call per ticker (hemat rate limit)
async function classifySentiment(ticker: string, titles: string[], sources: string[]): Promise<Map<string, { sentiment: string; materiality: string; reason: string; sourceType?: string }>> {
  const baseUrl = process.env.AI_BASE_URL
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || 'deepseek/deepseek-v4-flash-0731'
  const out = new Map<string, { sentiment: string; materiality: string; reason: string; sourceType?: string }>()
  if (!baseUrl || !apiKey || titles.length === 0) return out

  const list = titles.map((t, i) => `${i + 1}. [${sources[i]}] ${t}`).join('\n')
  const prompt = `Anda analis berita saham Indonesia. Untuk saham ${ticker}, klasifikasikan setiap judul dan sumber berita berikut.
  
Balas HANYA JSON array tanpa teks lain, format:
[{"i": 1, "sentiment": "POSITIVE|NEGATIVE|NEUTRAL", "materiality": "HIGH|MEDIUM|LOW", "reason": "alasan singkat maks 15 kata", "sourceType": "OFFICIAL_DISCLOSURE|NEWS|OPINION|RUMOR"}]

Aturan:
- sentiment: dampak judul terhadap harga/prospek ${ticker}.
- materiality: HIGH jika menyangkut laba, dividen, aksi korporasi, regulasi besar; LOW jika berita umum/opini.
- reason: jelaskan MENGAPA klasifikasi tersebut diberikan (NEWS-06), dalam Bahasa Indonesia, maksimal 15 kata.
- sourceType: BEDAKAN sumber berita (NEWS-05):
  * OFFICIAL_DISCLOSURE: jika URL/domain berasal dari IDX/ke keterbukaan informasi resmi emiten (contoh: idx.co.id, company website official disclosure section)
  * NEWS: media berita tepercaya (Kompas, Bloomberg, Reuters, dll)
  * OPINION: artikel opinion column, analyst commentary, atau blog pendapat
  * RUMOR: forum, thread tidak jelas, sumber tidak terverifikasi, headline provokatif tanpa sumber
- Jika ragu tentang sourceType, pilih NEWS sebagai default.
- Jika ragu soal sentiment/materiality, pilih NEUTRAL dan LOW.

JUDUL + SUMBER:
${list}`

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000, // reasoning model butuh headroom
        temperature: 0.1,
      }),
    })
    if (res.status === 429) { console.log(`    ⏳ rate limited, tunggu 65 detik...`); await sleep(65_000); continue }
    if (!res.ok) throw new Error(`LLM ${res.status}`)
    const data = await res.json()
    const content: string = data.choices?.[0]?.message?.content || ''
    const jsonMatch = /\[[\s\S]*\]/.exec(content)
    if (!jsonMatch) throw new Error('Jawaban bukan JSON array')
    const arr = JSON.parse(jsonMatch[0]) as Array<{ i: number; sentiment: string; materiality: string; reason?: string }>
    for (const a of arr) {
      if (a.i >= 1 && a.i <= titles.length) {
        out.set(titles[a.i - 1], {
          sentiment: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'].includes(a.sentiment) ? a.sentiment : 'NEUTRAL',
          materiality: ['HIGH', 'MEDIUM', 'LOW'].includes(a.materiality) ? a.materiality : 'LOW',
          reason: typeof a.reason === 'string' ? a.reason.slice(0, 200) : '',
        })
      }
    }
    return out
  }
  throw new Error('Rate limit klasifikasi')
}

async function main() {
  const portfolio = await prisma.portfolio.findFirst({ include: { positions: { where: { isActive: true }, include: { security: true } } } })
  if (!portfolio) { console.log('Tidak ada portofolio'); return }
  const securities = portfolio.positions.map(p => p.security)
  console.log(`📰 Fetch news ${securities.length} saham (maks ${MAX_AGE_DAYS} hari terakhir)\n`)

  let totalNew = 0
  for (const sec of securities) {
    try {
      const items = await fetchTickerNews(sec.ticker, sec.name)
      console.log(`${sec.ticker}: ${items.length} artikel dari RSS`)
      if (items.length === 0) { await sleep(1000); continue }

      // Dedup: skip yang sudah ada (sourceUrl unique)
      const fresh: RssItem[] = []
      for (const it of items) {
        const exists = await prisma.newsArticle.findUnique({ where: { sourceUrl: it.link } })
        if (!exists) fresh.push(it)
      }
      if (fresh.length === 0) { console.log(`  semua sudah ada`); await sleep(1000); continue }

      // Klasifikasi sentimen batch (maks 12 judul per call) + source type classification
      const titles = fresh.slice(0, 12).map(i => i.title)
      const sources = fresh.slice(0, 12).map(i => i.source)
      let cls = new Map<string, { sentiment: string; materiality: string; reason: string; sourceType?: string }>()
      try {
        cls = await classifySentiment(sec.ticker, titles, sources)
      } catch (e) {
        console.log(`  ⚠ klasifikasi gagal: ${(e as Error).message} — simpan tanpa sentimen`)
      }

      for (const it of fresh) {
        const c = cls.get(it.title)
        const article = await prisma.newsArticle.create({
          data: {
            title: it.title,
            source: it.source,
            sourceUrl: it.link,
            publishedAt: it.pubDate,
            sourceType: c?.sourceType ?? null, // NEWS-05: source type classification
            sentiment: c?.sentiment ?? null,
            materiality: c?.materiality ?? null,
            sentimentReason: c?.reason || null,
          },
        })
        await prisma.newsArticleSecurity.create({
          data: { newsArticleId: article.id, securityId: sec.id, relevance: 1.0 },
        })
        totalNew++
      }
      console.log(`  ✅ ${fresh.length} artikel baru disimpan`)
      await sleep(35_000) // rate limit LLM 2 req/menit
    } catch (e) {
      console.log(`  ❌ ${sec.ticker}: ${(e as Error).message}`)
    }
  }
  console.log(`\n🎉 Done: ${totalNew} artikel baru`)
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
