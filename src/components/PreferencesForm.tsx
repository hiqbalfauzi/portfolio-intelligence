'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'

interface Prefs {
  horizon: string
  riskTolerance: string
  benchmark: string
  analysisStyle: string
  currency: string
  emailNotifications: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
}

const OPTIONS = {
  horizon: [
    { value: 'short-term', label: 'Jangka Pendek (< 1 tahun)' },
    { value: 'medium-term', label: 'Jangka Menengah (1-3 tahun)' },
    { value: 'long-term', label: 'Jangka Panjang (> 3 tahun)' },
  ],
  riskTolerance: [
    { value: 'conservative', label: 'Konservatif' },
    { value: 'moderate', label: 'Moderat' },
    { value: 'aggressive', label: 'Agresif' },
  ],
  analysisStyle: [
    { value: 'fundamental', label: 'Fundamental' },
    { value: 'technical', label: 'Teknikal' },
    { value: 'balanced', label: 'Seimbang' },
  ],
  benchmark: [
    { value: 'IHSG', label: 'IHSG' },
    { value: 'LQ45', label: 'LQ45' },
    { value: 'IDX30', label: 'IDX30' },
  ],
  currency: [
    { value: 'IDR', label: 'IDR' },
    { value: 'USD', label: 'USD' },
  ],
}

export function PreferencesForm({ initial }: { initial: Prefs | null }) {
  const router = useRouter()
  const [form, setForm] = useState<Prefs>({
    horizon: initial?.horizon ?? 'long-term',
    riskTolerance: initial?.riskTolerance ?? 'moderate',
    benchmark: initial?.benchmark ?? 'IHSG',
    analysisStyle: initial?.analysisStyle ?? 'balanced',
    currency: initial?.currency ?? 'IDR',
    emailNotifications: initial?.emailNotifications ?? true,
    quietHoursStart: initial?.quietHoursStart ?? null,
    quietHoursEnd: initial?.quietHoursEnd ?? null,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const set = (key: keyof Prefs, value: string | boolean | null) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Gagal menyimpan')
        return
      }
      setMessage('Tersimpan')
      router.refresh()
    } catch {
      setMessage('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const selectCls = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horizon Investasi</label>
          <select value={form.horizon} onChange={e => set('horizon', e.target.value)} className={selectCls}>
            {OPTIONS.horizon.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toleransi Risiko</label>
          <select value={form.riskTolerance} onChange={e => set('riskTolerance', e.target.value)} className={selectCls}>
            {OPTIONS.riskTolerance.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gaya Analisis</label>
          <select value={form.analysisStyle} onChange={e => set('analysisStyle', e.target.value)} className={selectCls}>
            {OPTIONS.analysisStyle.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benchmark</label>
          <select value={form.benchmark} onChange={e => set('benchmark', e.target.value)} className={selectCls}>
            {OPTIONS.benchmark.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Uang Dasar</label>
          <select value={form.currency} onChange={e => set('currency', e.target.value)} className={selectCls}>
            {OPTIONS.currency.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.emailNotifications}
              onChange={e => set('emailNotifications', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Notifikasi email
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan Preferensi'}
        </button>
        {message && (
          <span className={`text-sm ${message === 'Tersimpan' ? 'text-green-600' : 'text-red-600'}`}>{message}</span>
        )}
      </div>
    </div>
  )
}
