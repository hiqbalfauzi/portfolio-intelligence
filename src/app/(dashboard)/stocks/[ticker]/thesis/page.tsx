'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { ArrowLeft, Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Thesis {
  id: string
  title: string
  summary: string
  reason: string
  horizon: string
  catalyst?: string | null
  risks?: string | null
  invalidation?: string | null
  status: string
  confidence: string
  version: number
  security: { ticker: string; name: string }
  evidence: Array<{
    id: string
    type: string
    title: string
    description: string
    impact: string
    confidence: string
  }>
}

export default function ThesisPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params
  const [thesis, setThesis] = useState<Thesis | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    reason: '',
    horizon: 'long-term',
    catalyst: '',
    risks: '',
    invalidation: '',
  })

  useEffect(() => {
    fetch(`/api/thesis?ticker=${ticker}`)
      .then(res => res.json())
      .then(data => {
        if (data.thesis) {
          setThesis(data.thesis)
          setFormData({
            title: data.thesis.title,
            summary: data.thesis.summary,
            reason: data.thesis.reason,
            horizon: data.thesis.horizon,
            catalyst: data.thesis.catalyst || '',
            risks: data.thesis.risks || '',
            invalidation: data.thesis.invalidation || '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [ticker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = thesis ? 'PUT' : 'POST'
    const payload = thesis
      ? { id: thesis.id, ...formData }
      : { ticker, ...formData }

    const res = await fetch('/api/thesis', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      setThesis(data.thesis)
      setShowForm(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!thesis) return
    const res = await fetch('/api/thesis', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: thesis.id,
        title: thesis.title,
        summary: thesis.summary,
        reason: thesis.reason,
        horizon: thesis.horizon,
        catalyst: thesis.catalyst || '',
        risks: thesis.risks || '',
        invalidation: thesis.invalidation || '',
        status: newStatus,
        confidence: thesis.confidence,
        changeNotes: `Status diubah dari ${thesis.status} ke ${newStatus}`,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setThesis(data.thesis)
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'UTUH': return 'bg-green-100 text-green-800 border-green-200'
      case 'DIPANTAU': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'MELEMAH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'PATAH': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stocks/${ticker}`} className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Thesis — {ticker}</h1>
          <p className="text-sm text-gray-500">Kelola tesis investasi dan pantau perubahan</p>
        </div>
      </div>

      {!thesis && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada tesis</h3>
            <p className="mt-2 text-sm text-gray-500">
              Buat tesis investasi untuk mendokumentasikan alasan Anda memegang saham ini
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Buat Tesis
            </button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader title={thesis ? 'Edit Tesis' : 'Buat Tesis Baru'} />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Judul Tesis</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: Bank dengan fundamental kuat dan dividen konsisten"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ringkasan</label>
                <textarea
                  required
                  rows={3}
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ringkasan singkat tesis investasi Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alasan Membeli/Memegang</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Mengapa Anda memilih saham ini?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horizon Investasi</label>
                  <select
                    value={formData.horizon}
                    onChange={e => setFormData({ ...formData, horizon: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="short-term">Jangka Pendek (&lt; 3 bulan)</option>
                    <option value="medium-term">Jangka Menengah (3-12 bulan)</option>
                    <option value="long-term">Jangka Panjang (&gt; 1 tahun)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Katalis yang Diharapkan</label>
                <textarea
                  rows={2}
                  value={formData.catalyst}
                  onChange={e => setFormData({ ...formData, catalyst: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Apa yang bisa memicu kenaikan harga?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Risiko Utama</label>
                <textarea
                  rows={2}
                  value={formData.risks}
                  onChange={e => setFormData({ ...formData, risks: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Risiko apa yang bisa menggagalkan tesis?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kondisi Invalidasi</label>
                <textarea
                  rows={2}
                  value={formData.invalidation}
                  onChange={e => setFormData({ ...formData, invalidation: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Kapan tesis ini dianggap patah?"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {thesis ? 'Perbarui Tesis' : 'Buat Tesis'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {thesis && !showForm && (
        <>
          <Card>
            <CardHeader
              title={thesis.title}
              action={
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusColor(thesis.status)}`}>
                    {thesis.status}
                  </span>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                </div>
              }
            />
            <CardContent>
              <p className="text-sm text-gray-700">{thesis.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">Alasan</p>
                  <p className="text-gray-700">{thesis.reason}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Horizon</p>
                  <p className="text-gray-700">{thesis.horizon}</p>
                </div>
                {thesis.catalyst && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Katalis</p>
                    <p className="text-gray-700">{thesis.catalyst}</p>
                  </div>
                )}
                {thesis.risks && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Risiko</p>
                    <p className="text-gray-700">{thesis.risks}</p>
                  </div>
                )}
                {thesis.invalidation && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-500">Kondisi Invalidasi</p>
                    <p className="text-gray-700">{thesis.invalidation}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t pt-4">
                <p className="text-xs font-medium text-gray-500 mb-3">Ubah Status Tesis</p>
                <div className="flex flex-wrap gap-2">
                  {['UTUH', 'DIPANTAU', 'MELEMAH', 'PATAH'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={thesis.status === status}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        thesis.status === status
                          ? statusColor(status) + ' cursor-default'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Bukti & Evidence"
              action={
                <button className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                  <Plus className="h-3 w-3" /> Tambah Bukti
                </button>
              }
            />
            <CardContent>
              {thesis.evidence.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada bukti yang ditambahkan</p>
              ) : (
                <div className="space-y-3">
                  {thesis.evidence.map(ev => (
                    <div key={ev.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className={`mt-1 h-3 w-3 rounded-full ${
                        ev.type === 'SUPPORTING' ? 'bg-green-500' :
                        ev.type === 'CONTRADICTING' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{ev.title}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            ev.type === 'SUPPORTING' ? 'bg-green-100 text-green-700' :
                            ev.type === 'CONTRADICTING' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {ev.type === 'SUPPORTING' ? 'Mendukung' :
                             ev.type === 'CONTRADICTING' ? 'Menentang' : 'Netral'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{ev.description}</p>
                        <div className="mt-2 flex gap-4 text-xs text-gray-500">
                          <span>Dampak: {ev.impact}</span>
                          <span>Confidence: {ev.confidence}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
