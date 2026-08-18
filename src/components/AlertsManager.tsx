'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Plus, Trash2, Power, Check, X } from 'lucide-react'

interface Rule {
  id: string
  name: string
  type: string
  condition: string
  priority: string
  isActive: boolean
  securityId: string | null
  ticker?: string
}

interface AlertEvent {
  id: string
  title: string
  message: string
  previousValue: string | null
  currentValue: string | null
  impact: string | null
  isRead: boolean
  isRelevant: boolean | null
  createdAt: string
  rule: { name: string; priority: string }
}

const priorityColor = (p: string) =>
  p === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
  p === 'REVIEW' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'

export function AlertsManager({ rules: initialRules, events: initialEvents, tickers }: {
  rules: Rule[]
  events: AlertEvent[]
  tickers: string[]
}) {
  const router = useRouter()
  const [rules, setRules] = useState(initialRules)
  const [events, setEvents] = useState(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState('')

  const runNow = async () => {
    setRunning(true)
    setRunResult('')
    try {
      const res = await fetch('/api/alerts/run', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menjalankan evaluasi')
      setRunResult(`Evaluasi ${json.evaluated} rule → ${json.triggered} alert baru`)
      router.refresh()
      const [r, e] = await Promise.all([
        fetch('/api/alerts/rules').then(x => x.json()),
        fetch('/api/alerts/events').then(x => x.json()),
      ])
      setRules(r.rules || [])
      setEvents(e.events || [])
    } catch (err) {
      setRunResult((err as Error).message)
    } finally {
      setRunning(false)
    }
  }

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState('PRICE')
  const [priority, setPriority] = useState('INFO')
  const [ticker, setTicker] = useState(tickers[0] || '')
  const [priceOp, setPriceOp] = useState('below')
  const [priceValue, setPriceValue] = useState('')
  const [volMultiplier, setVolMultiplier] = useState('2')
  const [techIndicator, setTechIndicator] = useState('BREAKDOWN_20D')
  const [thesisStatuses, setThesisStatuses] = useState<string[]>(['MELEMAH', 'PATAH'])

  const buildCondition = () => {
    if (type === 'PRICE') return { operator: priceOp, value: Number(priceValue) }
    if (type === 'VOLUME') return { multiplier: Number(volMultiplier) }
    if (type === 'TECHNICAL') return { indicator: techIndicator }
    return { statuses: thesisStatuses }
  }

  const createRule = async () => {
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, priority, ticker, condition: buildCondition() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal membuat alert')
      setShowForm(false)
      setName('')
      setPriceValue('')
      router.refresh()
      const r = await fetch('/api/alerts/rules').then(x => x.json())
      setRules(r.rules || [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggleRule = async (id: string) => {
    await fetch('/api/alerts/rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setRules(rs => rs.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  const deleteRule = async (id: string) => {
    await fetch(`/api/alerts/rules?id=${id}`, { method: 'DELETE' })
    setRules(rs => rs.filter(r => r.id !== id))
  }

  const updateEvent = async (id: string, patch: { isRead?: boolean; isRelevant?: boolean }) => {
    await fetch('/api/alerts/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })
    setEvents(ev => ev.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  const conditionLabel = (r: Rule) => {
    try {
      const c = JSON.parse(r.condition)
      if (r.type === 'PRICE') return `Harga ${c.operator === 'above' ? '≥' : '≤'} ${c.value}`
      if (r.type === 'VOLUME') return `Volume > ${c.multiplier}x rata-rata`
      if (r.type === 'TECHNICAL') return ({
        RSI_OVERBOUGHT: 'RSI ≥ 70', RSI_OVERSOLD: 'RSI ≤ 30',
        BREAKOUT_20D: 'Breakout 20 hari', BREAKDOWN_20D: 'Breakdown 20 hari',
      } as Record<string, string>)[c.indicator] || c.indicator
      if (r.type === 'THESIS') return `Tesis: ${c.statuses.join(', ')}`
    } catch { /* ignore */ }
    return r.condition
  }

  const fmtDate = (iso: string) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const inputCls = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100'

  return (
    <div className="space-y-6">
      {/* Rules */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Alert Rules</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Jalankan evaluasi: tombol &quot;Cek Alert&quot; di bawah, atau script run-alerts.ts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runNow}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Bell className="h-4 w-4" /> {running ? 'Mengecek...' : 'Cek Alert'}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Buat Alert
            </button>
          </div>
        </div>
        {runResult && <p className="px-5 pt-3 text-sm text-gray-600 dark:text-gray-400">{runResult}</p>}

        {showForm && (
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-5 py-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input className={inputCls} placeholder="Nama alert (contoh: BMRI turun di bawah 4000)" value={name} onChange={e => setName(e.target.value)} />
              <select className={inputCls} value={ticker} onChange={e => setTicker(e.target.value)}>
                {tickers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className={inputCls} value={type} onChange={e => setType(e.target.value)}>
                <option value="PRICE">Harga</option>
                <option value="VOLUME">Volume</option>
                <option value="TECHNICAL">Teknikal</option>
                <option value="THESIS">Status Tesis</option>
              </select>
              <select className={inputCls} value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="INFO">Info</option>
                <option value="REVIEW">Perlu Ditinjau</option>
                <option value="CRITICAL">Kritis</option>
              </select>
            </div>

            {type === 'PRICE' && (
              <div className="grid gap-3 md:grid-cols-2">
                <select className={inputCls} value={priceOp} onChange={e => setPriceOp(e.target.value)}>
                  <option value="below">Turun di bawah</option>
                  <option value="above">Naik di atas</option>
                </select>
                <input className={inputCls} type="number" placeholder="Harga (contoh: 4000)" value={priceValue} onChange={e => setPriceValue(e.target.value)} />
              </div>
            )}
            {type === 'VOLUME' && (
              <input className={inputCls} type="number" step="0.5" placeholder="Multiplier vs rata-rata 20 hari (contoh: 2)" value={volMultiplier} onChange={e => setVolMultiplier(e.target.value)} />
            )}
            {type === 'TECHNICAL' && (
              <select className={inputCls} value={techIndicator} onChange={e => setTechIndicator(e.target.value)}>
                <option value="BREAKDOWN_20D">Breakdown 20 hari</option>
                <option value="BREAKOUT_20D">Breakout 20 hari</option>
                <option value="RSI_OVERBOUGHT">RSI overbought (≥70)</option>
                <option value="RSI_OVERSOLD">RSI oversold (≤30)</option>
              </select>
            )}
            {type === 'THESIS' && (
              <div className="flex flex-wrap gap-2">
                {['UTUH', 'DIPANTAU', 'MELEMAH', 'PATAH'].map(s => (
                  <label key={s} className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={thesisStatuses.includes(s)}
                      onChange={e => setThesisStatuses(cur => e.target.checked ? [...cur, s] : cur.filter(x => x !== s))}
                    />
                    {s}
                  </label>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              onClick={createRule}
              disabled={saving || !name.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Alert'}
            </button>
          </div>
        )}

        <div className="px-5 py-4">
          {rules.length > 0 ? (
            <div className="space-y-2">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`rounded-full p-1.5 shrink-0 ${priorityColor(rule.priority)}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{rule.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{rule.ticker ? `${rule.ticker} · ` : ''}{conditionLabel(rule)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded ${priorityColor(rule.priority)}`}>{rule.priority}</span>
                    <button onClick={() => toggleRule(rule.id)} title={rule.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      className={`rounded p-1.5 ${rule.isActive ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteRule(rule.id)} title="Hapus"
                      className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Belum ada alert rule. Klik &quot;Buat Alert&quot;.</p>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
        <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Riwayat Alert</h3>
        </div>
        <div className="px-5 py-4">
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className={`rounded-lg border p-4 ${ev.isRead ? 'border-gray-200 dark:border-gray-700' : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{ev.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${priorityColor(ev.rule.priority)}`}>{ev.rule.priority}</span>
                        {!ev.isRead && <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Baru</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ev.message}</p>
                      {ev.impact && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Dampak: {ev.impact}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{fmtDate(ev.createdAt)}</span>
                        <span>Rule: {ev.rule.name}</span>
                        {ev.previousValue && ev.currentValue && <span>{ev.previousValue} → {ev.currentValue}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!ev.isRead && (
                        <button onClick={() => updateEvent(ev.id, { isRead: true })} title="Tandai dibaca"
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {ev.isRelevant == null && (
                        <>
                          <button onClick={() => updateEvent(ev.id, { isRelevant: true, isRead: true })} title="Relevan"
                            className="rounded p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => updateEvent(ev.id, { isRelevant: false, isRead: true })} title="Tidak relevan"
                            className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {ev.isRelevant != null && (
                        <span className={`text-xs px-2 py-0.5 rounded ${ev.isRelevant ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                          {ev.isRelevant ? 'Relevan' : 'Tidak relevan'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Belum ada alert. Buat rule lalu jalankan evaluasi.</p>
          )}
        </div>
      </div>
    </div>
  )
}
