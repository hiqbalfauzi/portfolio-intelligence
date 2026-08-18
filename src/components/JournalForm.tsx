'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

const inputCls = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100'

export function JournalEntryForm({ tickers }: { tickers: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [type, setType] = useState('DECISION')
  const [ticker, setTicker] = useState('')
  const [action, setAction] = useState('HOLD')
  const [content, setContent] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [emotion, setEmotion] = useState('')
  const [expectations, setExpectations] = useState('')
  const [reviewDate, setReviewDate] = useState('')

  const submit = async () => {
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, type, ticker: ticker || undefined, action,
          content, reasoning, emotion, expectations,
          reviewDate: reviewDate || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
      setOpen(false)
      setTitle(''); setContent(''); setReasoning(''); setEmotion(''); setExpectations(''); setReviewDate('')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Catatan Baru
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Catatan Baru</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className={inputCls} placeholder="Judul (contoh: Tambah posisi BMRI)" value={title} onChange={e => setTitle(e.target.value)} />
            <select className={inputCls} value={type} onChange={e => setType(e.target.value)}>
              <option value="DECISION">Keputusan</option>
              <option value="REVIEW">Tinjauan</option>
              <option value="REFLECTION">Refleksi</option>
              <option value="NOTE">Catatan</option>
            </select>
            <select className={inputCls} value={ticker} onChange={e => setTicker(e.target.value)}>
              <option value="">— Tanpa saham —</option>
              {tickers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {type === 'DECISION' && (
              <select className={inputCls} value={action} onChange={e => setAction(e.target.value)}>
                <option value="BUY">BUY</option>
                <option value="ADD">ADD</option>
                <option value="HOLD">HOLD</option>
                <option value="REDUCE">REDUCE</option>
                <option value="SELL">SELL</option>
              </select>
            )}
          </div>
          <textarea className={inputCls} rows={3} placeholder="Isi catatan — apa yang terjadi / apa yang diputuskan" value={content} onChange={e => setContent(e.target.value)} />
          <textarea className={inputCls} rows={2} placeholder="Alasan di balik keputusan" value={reasoning} onChange={e => setReasoning(e.target.value)} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className={inputCls} placeholder="Emosi saat memutuskan (tenang / FOMO / takut...)" value={emotion} onChange={e => setEmotion(e.target.value)} />
            <input className={inputCls} type="date" title="Tanggal review ulang" value={reviewDate} onChange={e => setReviewDate(e.target.value)} />
          </div>
          <textarea className={inputCls} rows={2} placeholder="Ekspektasi — apa yang diharapkan terjadi" value={expectations} onChange={e => setExpectations(e.target.value)} />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving || !title.trim() || !content.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <button
      onClick={async () => { await fetch(`/api/journal?id=${id}`, { method: 'DELETE' }); router.refresh() }}
      title="Hapus catatan"
      className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
