'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Trash2 } from 'lucide-react'

// ACC-04: ekspor data & hapus akun
export function AccountDangerZone() {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExport = () => {
    window.location.href = '/api/account/export'
  }

  const handleDelete = async () => {
    if (!password) {
      setError('Password wajib diisi')
      return
    }
    if (!confirm('YAKIN hapus akun dan SELURUH data? Tindakan ini tidak dapat dibatalkan.')) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menghapus akun')
        setLoading(false)
        return
      }
      router.push('/register')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Ekspor Data</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Unduh seluruh data Anda (portofolio, transaksi, tesis, jurnal, watchlist) dalam format JSON
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="h-4 w-4" /> Ekspor
        </button>
      </div>

      <div className="rounded-lg border border-red-200 dark:border-red-900/50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Hapus Akun</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menghapus akun dan seluruh data secara permanen. Tidak dapat dibatalkan.
            </p>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-800 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" /> Hapus
          </button>
        </div>

        {showDelete && (
          <div className="mt-3 space-y-2 border-t border-red-200 dark:border-red-900/50 pt-3">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              Konfirmasi dengan password Anda:
            </p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Menghapus...' : 'Hapus Permanen'}
              </button>
              <button
                onClick={() => { setShowDelete(false); setPassword(''); setError('') }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
