'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { ArrowLeft, Save, Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ThesisData {
  id: string
  title: string
  summary: string
  reason: string
  horizon: string
  catalyst?: string
  risks?: string
  invalidation?: string
  status: string
  confidence: string
  version: number
  evidence: Array<{
    id: string
    type: 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL'
    source: string
    title: string
    description: string
    impact: string
    confidence: string
  }>
}

interface ThesisPageProps {
  params: Promise<{ ticker: string }>
}

export default function ThesisPage({ params }: ThesisPageProps) {
  const { ticker: tickerRaw } = use(params)
  const router = useRouter()
  const ticker = tickerRaw.toUpperCase()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [thesis, setThesis] = useState<ThesisData | null>(null)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [newEvidence, setNewEvidence] = useState({
    type: 'SUPPORTING' as 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL',
    source: '',
    title: '',
    description: '',
    impact: 'MEDIUM',
    confidence: 'SEDANG',
  })

  useEffect(() => {
    fetchThesis()
  }, [ticker])

  const fetchThesis = async () => {
    try {
      const res = await fetch(`/api/thesis?ticker=${ticker}`)
      if (res.ok) {
        const data = await res.json()
        setThesis(data)
      }
    } catch (error) {
      console.error('Failed to fetch thesis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!thesis) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/thesis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: thesis.id,
          title: thesis.title,
          summary: thesis.summary,
          reason: thesis.reason,
          horizon: thesis.horizon,
          catalyst: thesis.catalyst,
          risks: thesis.risks,
          invalidation: thesis.invalidation,
          status: thesis.status,
          confidence: thesis.confidence,
        }),
      })

      if (res.ok) {
        router.refresh()
        alert('Tesis berhasil diperbarui')
      } else {
        alert('Gagal memperbarui tesis')
      }
    } catch (error) {
      console.error('Failed to save thesis:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleAddEvidence = async () => {
    if (!thesis || !newEvidence.title || !newEvidence.description) return

    try {
      const res = await fetch('/api/thesis/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thesisId: thesis.id,
          ...newEvidence,
        }),
      })

      if (res.ok) {
        await fetchThesis()
        setShowEvidenceForm(false)
        setNewEvidence({
          type: 'SUPPORTING',
          source: '',
          title: '',
          description: '',
          impact: 'MEDIUM',
          confidence: 'SEDANG',
        })
      }
    } catch (error) {
      console.error('Failed to add evidence:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Memuat...</div>
      </div>
    )
  }

  if (!thesis) {
    return (
      <div className="space-y-6">
        <Link href={`/stocks/${ticker}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Tesis belum dibuat untuk {ticker}</p>
          <button
            onClick={() => {
              // Create new thesis via API
              fetch('/api/thesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker }),
              }).then(() => {
                fetchThesis()
              })
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Buat Tesis Baru
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href={`/stocks/${ticker}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke {ticker}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Investment Thesis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{ticker} - Version {thesis.version}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {/* Thesis Form */}
      <Card>
        <CardHeader title="Detail Tesis" description="Alasan investasi dan kondisi invalidasi" />
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Judul Tesis
              </label>
              <input
                type="text"
                value={thesis.title}
                onChange={(e) => setThesis({ ...thesis, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ringkasan
              </label>
              <textarea
                value={thesis.summary}
                onChange={(e) => setThesis({ ...thesis, summary: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status Tesis
                </label>
                <select
                  value={thesis.status}
                  onChange={(e) => setThesis({ ...thesis, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="UTUH">Utuh</option>
                  <option value="DIPANTAU">Perlu Dipantau</option>
                  <option value="MELEMAH">Melemah</option>
                  <option value="PATAH">Patah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confidence
                </label>
                <select
                  value={thesis.confidence}
                  onChange={(e) => setThesis({ ...thesis, confidence: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="TINGGI">Tinggi</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="RENDAH">Rendah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alasan Investasi
              </label>
              <textarea
                value={thesis.reason}
                onChange={(e) => setThesis({ ...thesis, reason: e.target.value })}
                rows={3}
                placeholder="Mengapa Anda membeli/memegang saham ini?"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horizon Investasi
              </label>
              <input
                type="text"
                value={thesis.horizon}
                onChange={(e) => setThesis({ ...thesis, horizon: e.target.value })}
                placeholder="Contoh: 1-2 tahun, long-term, dll"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Katalis (Opsional)
              </label>
              <textarea
                value={thesis.catalyst || ''}
                onChange={(e) => setThesis({ ...thesis, catalyst: e.target.value })}
                rows={2}
                placeholder="Apa yang bisa mendorong harga naik?"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Risiko Utama (Opsional)
              </label>
              <textarea
                value={thesis.risks || ''}
                onChange={(e) => setThesis({ ...thesis, risks: e.target.value })}
                rows={2}
                placeholder="Apa risiko terbesar dari investasi ini?"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kondisi Invalidasi (Opsional)
              </label>
              <textarea
                value={thesis.invalidation || ''}
                onChange={(e) => setThesis({ ...thesis, invalidation: e.target.value })}
                rows={2}
                placeholder="Kondisi apa yang membuat tesis ini tidak lagi valid?"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Section */}
      <Card>
        <CardHeader
          title="Bukti & Evidence"
          description="Data yang mendukung atau menentang tesis"
          action={
            <button
              onClick={() => setShowEvidenceForm(!showEvidenceForm)}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="h-4 w-4" />
              Tambah Bukti
            </button>
          }
        />
        <CardContent>
          {/* Add Evidence Form */}
          {showEvidenceForm && (
            <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipe
                  </label>
                  <select
                    value={newEvidence.type}
                    onChange={(e) => setNewEvidence({ ...newEvidence, type: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="SUPPORTING">Mendukung</option>
                    <option value="CONTRADICTING">Menentang</option>
                    <option value="NEUTRAL">Netral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sumber
                  </label>
                  <input
                    type="text"
                    value={newEvidence.source}
                    onChange={(e) => setNewEvidence({ ...newEvidence, source: e.target.value })}
                    placeholder="Contoh: Laporan Keuangan Q3 2024"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Impact
                  </label>
                  <select
                    value={newEvidence.impact}
                    onChange={(e) => setNewEvidence({ ...newEvidence, impact: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="HIGH">Tinggi</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="LOW">Rendah</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddEvidence}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Tambah Bukti
                </button>
                <button
                  onClick={() => setShowEvidenceForm(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Evidence List */}
          <div className="space-y-6">
            {/* Supporting Evidence */}
            <div>
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Bukti Pendukung ({thesis.evidence.filter(e => e.type === 'SUPPORTING').length})
              </h4>
              {thesis.evidence.filter(e => e.type === 'SUPPORTING').length > 0 ? (
                <div className="space-y-2">
                  {thesis.evidence.filter(e => e.type === 'SUPPORTING').map((ev) => (
                    <div key={ev.id} className="rounded-lg border border-green-200 dark:border-green-800 p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ev.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ev.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{ev.source}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ev.impact === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          ev.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {ev.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada bukti pendukung</p>
              )}
            </div>

            {/* Contradicting Evidence */}
            <div>
              <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Bukti Penentang ({thesis.evidence.filter(e => e.type === 'CONTRADICTING').length})
              </h4>
              {thesis.evidence.filter(e => e.type === 'CONTRADICTING').length > 0 ? (
                <div className="space-y-2">
                  {thesis.evidence.filter(e => e.type === 'CONTRADICTING').map((ev) => (
                    <div key={ev.id} className="rounded-lg border border-red-200 dark:border-red-800 p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ev.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ev.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{ev.source}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ev.impact === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          ev.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {ev.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada bukti penentang</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
