'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/Card'
import { Plus, Trash2, X } from 'lucide-react'

interface WatchlistItem {
  id: string
  ticker: string
  name: string
  sector: string
  lastPrice: number | null
  lastUpdate: string | null
  addedAt: string
  notes: string | null
  targetPrice: number | null
  stopLoss: number | null
  thesisDraft: string | null
}

export function WatchlistClient({ items: initialItems }: { items: WatchlistItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [showForm, setShowForm] = useState(false)
  const [ticker, setTicker] = useState('')
  const [notes, setNotes] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [thesisDraft, setThesisDraft] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fmtPrice = (v: number | null) =>
    v != null ? v.toLocaleString('id-ID') : '-'

  const handleAdd = async () => {
    if (!ticker.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          notes: notes || undefined,
          targetPrice: targetPrice ? Number(targetPrice) : undefined,
          stopLoss: stopLoss ? Number(stopLoss) : undefined,
          thesisDraft: thesisDraft || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menambahkan')
        return
      }
      setItems(prev => [data.item, ...prev])
      setTicker(''); setNotes(''); setTargetPrice(''); setStopLoss(''); setThesisDraft('')
      setShowForm(false)
      router.refresh()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (t: string) => {
    if (!confirm(`Hapus ${t} dari watchlist?`)) return
    const res = await fetch(`/api/watchlist?ticker=${t}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.ticker !== t))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Watchlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Saham yang dipantau tanpa masuk portofolio
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
            Watchlist kosong. Tambahkan saham yang ingin dipantau.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TICKER</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">NAMA</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">HARGA TERAKHIR</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TARGET</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">STOP LOSS</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">CATATAN</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">{item.ticker}</td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{item.name}</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{fmtPrice(item.lastPrice)}</td>
                      <td className="py-3 text-green-600 dark:text-green-400">{fmtPrice(item.targetPrice)}</td>
                      <td className="py-3 text-red-600 dark:text-red-400">{fmtPrice(item.stopLoss)}</td>
                      <td className="py-3 max-w-xs truncate text-gray-500 dark:text-gray-400" title={item.notes ?? undefined}>
                        {item.notes || '-'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRemove(item.ticker)}
                          className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Hapus dari watchlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tambah ke Watchlist</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticker *</label>
                <input
                  value={ticker}
                  onChange={e => setTicker(e.target.value.toUpperCase())}
                  placeholder="BBCA"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Price</label>
                  <input
                    value={targetPrice}
                    onChange={e => setTargetPrice(e.target.value)}
                    type="number"
                    placeholder="10000"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stop Loss</label>
                  <input
                    value={stopLoss}
                    onChange={e => setStopLoss(e.target.value)}
                    type="number"
                    placeholder="8000"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan</label>
                <input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Tunggu breakout MA200"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Draft Tesis (opsional)</label>
                <textarea
                  value={thesisDraft}
                  onChange={e => setThesisDraft(e.target.value)}
                  rows={3}
                  placeholder="Mengapa tertarik dengan saham ini?"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleAdd}
                disabled={loading || !ticker.trim()}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
