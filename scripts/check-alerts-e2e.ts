// E2E test alerts API: create rule → run → verify event → cleanup
import * as jose from 'jose'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })
const secret = new TextEncoder().encode('portfolio-intelligence-secret-key-change-in-production')
const BASE = 'http://localhost:3000'

async function main() {
  // Pakai userId asli dari DB (FK constraint)
  const user = await prisma.user.findFirst()
  if (!user) { console.error('Tidak ada user di DB'); process.exit(1) }
  const token = await new jose.SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)
  const H = { Cookie: `pi_token=${token}`, 'Content-Type': 'application/json' }

  // 1. Page loads
  const page = await fetch(`${BASE}/alerts`, { headers: H, redirect: 'manual' })
  console.log(`/alerts: ${page.status}`)
  if (page.status !== 200) process.exit(1)

  // 2. Create rule: BMRI price below 999999 (pasti trigger)
  const create = await fetch(`${BASE}/api/alerts/rules`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: 'TEST BMRI below', type: 'PRICE', priority: 'INFO', ticker: 'BMRI', condition: { operator: 'below', value: 999999 } }),
  })
  const rule = await create.json()
  console.log(`POST rule: ${create.status} id=${rule.id}`)
  if (create.status !== 201) { console.error(rule); process.exit(1) }

  // 3. Validation check: bad rule harus 400
  const bad = await fetch(`${BASE}/api/alerts/rules`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: '', type: 'PRICE', condition: { operator: 'sideways' } }),
  })
  console.log(`POST bad rule: ${bad.status} (harap 400)`)
  if (bad.status !== 400) process.exit(1)

  // 4. Run engine
  const run = await fetch(`${BASE}/api/alerts/run`, { method: 'POST', headers: H })
  const runJson = await run.json()
  console.log(`POST run: ${run.status} →`, JSON.stringify(runJson))
  if (runJson.triggered < 1) { console.error('Rule test tidak trigger!'); process.exit(1) }

  // 5. Events list harus berisi event baru
  const ev = await fetch(`${BASE}/api/alerts/events`, { headers: H }).then(r => r.json())
  const found = ev.events.find((e: { ruleId?: string; title: string }) => e.title.includes('di atas') || e.title.includes('di bawah'))
  console.log(`GET events: ${ev.events.length} total, test event: ${found ? found.title : 'TIDAK ADA'}`)
  if (!found) process.exit(1)

  // 6. Mark read + relevant
  const patch = await fetch(`${BASE}/api/alerts/events`, {
    method: 'PATCH', headers: H,
    body: JSON.stringify({ id: found.id, isRead: true, isRelevant: true }),
  })
  console.log(`PATCH event: ${patch.status}`)

  // 7. Run lagi → dedup (tidak ada event baru untuk rule yang sama hari ini)
  const run2 = await fetch(`${BASE}/api/alerts/run`, { method: 'POST', headers: H }).then(r => r.json())
  console.log(`POST run #2: triggered=${run2.triggered} (harap 0, dedup)`)

  // 8. Cleanup: delete test rule (events cascade)
  const del = await fetch(`${BASE}/api/alerts/rules?id=${rule.id}`, { method: 'DELETE', headers: H })
  console.log(`DELETE rule: ${del.status}`)

  console.log('\n🎉 E2E alerts lulus')
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
