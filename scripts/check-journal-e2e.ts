// E2E test journal API: create → list → delete
import * as jose from 'jose'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const secret = new TextEncoder().encode('portfolio-intelligence-secret-key-change-in-production')
const BASE = 'http://localhost:3000'

async function main() {
  const user = await prisma.user.findFirst()
  if (!user) { console.error('Tidak ada user'); process.exit(1) }
  const token = await new jose.SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret)
  const H = { Cookie: `pi_token=${token}`, 'Content-Type': 'application/json' }

  const page = await fetch(`${BASE}/journal`, { headers: H, redirect: 'manual' })
  console.log(`/journal: ${page.status}`)
  if (page.status !== 200) process.exit(1)

  const create = await fetch(`${BASE}/api/journal`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      title: 'TEST entry', type: 'DECISION', action: 'HOLD', ticker: 'BMRI',
      content: 'Isi test', reasoning: 'Alasan test', emotion: 'tenang',
      expectations: 'Harga stabil', reviewDate: '2026-09-01',
    }),
  })
  const entry = await create.json()
  console.log(`POST: ${create.status} id=${entry.id}`)
  if (create.status !== 201) { console.error(entry); process.exit(1) }

  const bad = await fetch(`${BASE}/api/journal`, {
    method: 'POST', headers: H, body: JSON.stringify({ title: '', content: '' }),
  })
  console.log(`POST kosong: ${bad.status} (harap 400)`)
  if (bad.status !== 400) process.exit(1)

  const list = await fetch(`${BASE}/api/journal`, { headers: H }).then(r => r.json())
  const found = list.entries.find((e: { id: string }) => e.id === entry.id)
  console.log(`GET: ${list.entries.length} entries, test entry ticker=${found?.ticker}`)
  if (!found || found.ticker !== 'BMRI') process.exit(1)

  const del = await fetch(`${BASE}/api/journal?id=${entry.id}`, { method: 'DELETE', headers: H })
  console.log(`DELETE: ${del.status}`)
  if (del.status !== 200) process.exit(1)

  console.log('\n🎉 E2E journal lulus')
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
