// Test cepat RSS parsing 1 ticker: npx tsx scripts/check-rss.ts
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
}

function parseRss(xml: string) {
  const items: { title: string; link: string; pubDate: Date; source: string }[] = []
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

async function main() {
  const q = encodeURIComponent('BMRI Bank Mandiri saham')
  const url = `https://news.google.com/rss/search?q=${q}&hl=id&gl=ID&ceid=ID:id`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  console.log('HTTP', res.status)
  if (!res.ok) process.exit(1)
  const xml = await res.text()
  const items = parseRss(xml)
  console.log(`${items.length} items`)
  for (const i of items.slice(0, 5)) {
    console.log(`- [${i.pubDate.toISOString().slice(0, 10)}] (${i.source}) ${i.title.slice(0, 80)}`)
  }
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) })
