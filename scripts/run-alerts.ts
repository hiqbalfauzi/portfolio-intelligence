// Alert engine runner CLI: npx tsx scripts/run-alerts.ts
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { runAlerts } from '../src/lib/alert-runner'

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') }) })

async function main() {
  console.log('🔔 Evaluasi alert rules...')
  const res = await runAlerts(prisma as never)
  for (const d of res.details) console.log(`  ${d}`)
  console.log(`\n🎉 Done: ${res.triggered}/${res.evaluated} rule trigger`)
}
main().catch(e => { console.error('ERR', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
