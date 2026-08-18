'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function RefreshNewsButton() {
  const router = useRouter()
  const [running, setRunning] = useState(false)

  const refresh = async () => {
    if (running) return
    setRunning(true)
    try {
      const res = await fetch('/api/news/refresh', { method: 'POST' })
      if (!res.ok) throw new Error('Gagal memulai')
      // Fetch ~5 menit (rate limit LLM). Refresh server data tiap 30 detik, stop setelah 8 menit.
      const started = Date.now()
      const poll = setInterval(() => {
        router.refresh()
        if (Date.now() - started > 8 * 60_000) { clearInterval(poll); setRunning(false) }
      }, 30_000)
    } catch {
      setRunning(false)
    }
  }

  return (
    <button
      onClick={refresh}
      disabled={running}
      title="Ambil berita terbaru dari Google News + klasifikasi sentimen AI (±5 menit)"
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
      {running ? 'Mengambil berita...' : 'Refresh Berita'}
    </button>
  )
}
