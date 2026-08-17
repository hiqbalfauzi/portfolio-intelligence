import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const runtime = 'nodejs'

// Trigger manual brief regeneration (runs script in background, returns immediately)
export async function POST() {
  const script = path.join(process.cwd(), 'scripts', 'generate-briefs.ts')
  const child = spawn('npx', ['tsx', script], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  })
  child.unref()
  return NextResponse.json({ started: true, pid: child.pid })
}
