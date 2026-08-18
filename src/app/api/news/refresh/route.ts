import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { openSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

// POST /api/news/refresh — jalankan fetch-news.ts di background, output ke news-fetch.log
export async function POST() {
  const script = path.join(process.cwd(), 'scripts', 'fetch-news.ts')
  const log = openSync(path.join(process.cwd(), 'news-fetch.log'), 'a')
  const child = spawn('npx', ['tsx', script], {
    cwd: process.cwd(),
    detached: true,
    stdio: ['ignore', log, log],
    shell: process.platform === 'win32',
  })
  child.unref()
  return NextResponse.json({ started: true, pid: child.pid })
}
