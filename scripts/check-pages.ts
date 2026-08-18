// Smoke-test semua halaman utama: npx tsx scripts/check-pages.ts
import * as jose from 'jose'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const secret = new TextEncoder().encode('portfolio-intelligence-secret-key-change-in-production')

async function main() {
  const user = await prisma.user.findFirst()
  if (!user) { console.error('Tidak ada user'); process.exit(1) }
  const token = await new jose.SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret)

  const pages = [
    '/', '/portfolio', '/stocks', '/ai-analyst', '/news', '/risk', '/alerts', '/journal', '/settings', '/transactions',
    '/stocks/BMRI', '/stocks/BMRI/fundamental', '/stocks/BMRI/technical', '/stocks/BMRI/thesis', '/stocks/BMRI/valuation',
  ]
  let fail = 0
  for (const p of pages) {
    const res = await fetch(`http://localhost:3000${p}`, {
      headers: { Cookie: `pi_token=${token}` },
      redirect: 'manual',
    })
    const ok = res.status === 200
    if (!ok) fail++
    console.log(`${ok ? '✅' : '❌'} ${p}: ${res.status}`)
  }
  console.log(fail === 0 ? '\n🎉 Semua halaman OK' : `\n❌ ${fail} halaman gagal`)
  if (fail > 0) process.exit(1)
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
