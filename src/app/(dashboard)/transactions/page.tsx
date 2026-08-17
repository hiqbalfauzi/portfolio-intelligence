'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { Plus, Upload, Download, X, RefreshCw } from 'lucide-react'

interface Transaction {
  id: string
  type: string
  date: string
  quantity: number
  price: number
  fee: number
  amount: number
  notes?: string
  security: { ticker: string; name: string }
}

interface Portfolio {
  id: string
  name: string
  broker?: string
}

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    portfolioId: '',
    type: 'BUY' as 'BUY' | 'SELL',
    ticker: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    price: 0,
    fee: 0,
    notes: ''
  })

  const fetchData = useCallback(async () => {
    try {
      const [txRes, pfRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/portfolios'),
      ])
      const txData = await txRes.json()
      const pfData = await pfRes.json()
      setTransactions(txData.transactions || [])
      setPortfolios(pfData.portfolios || [])
      if (pfData.portfolios?.length > 0 && !formData.portfolioId) {
        setFormData(f => ({ ...f, portfolioId: pfData.portfolios[0].id }))
      }
    } catch {
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [formData.portfolioId])

  useEffect(() => { fetchData() }, [fetchData])

  const submitTransaction = async (tx: { type: string; ticker: string; date: string; quantity: number; price: number; fee: number; notes: string }) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tx, portfolioId: formData.portfolioId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan transaksi')
    return data.transaction
  }

  const handleAddTransaction = async () => {
    setError('')
    if (!formData.ticker || formData.quantity <= 0 || formData.price <= 0) {
      setError('Mohon lengkapi ticker, jumlah lot, dan harga')
      return
    }
    setSaving(true)
    try {
      await submitTransaction({ ...formData, ticker: formData.ticker.toUpperCase() })
      setFormData({
        portfolioId: formData.portfolioId,
        type: 'BUY',
        ticker: '',
        date: new Date().toISOString().split('T')[0],
        quantity: 0,
        price: 0,
        fee: 0,
        notes: ''
      })
      setShowForm(false)
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan transaksi')
    } finally {
      setSaving(false)
    }
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const dataLines = lines.slice(1) // skip header

      let success = 0
      const errors: string[] = []

      for (let i = 0; i < dataLines.length; i++) {
        const cols = dataLines[i].split(',').map(col => col.trim())
        if (cols.length < 5) continue

        const type = cols[0].toUpperCase()
        const ticker = cols[1].toUpperCase()
        const date = cols[2]
        const quantity = parseInt(cols[3])
        const price = parseFloat(cols[4])
        const fee = cols[5] ? parseFloat(cols[5]) : 0
        const notes = cols[6] || ''

        if (!['BUY', 'SELL'].includes(type)) {
          errors.push(`Baris ${i + 2}: tipe "${type}" belum didukung (hanya BUY/SELL)`)
          continue
        }
        if (!ticker || !date || !(quantity > 0) || !(price > 0)) {
          errors.push(`Baris ${i + 2}: data tidak valid`)
          continue
        }

        try {
          await submitTransaction({ type, ticker, date, quantity, price, fee, notes })
          success++
        } catch (err) {
          errors.push(`Baris ${i + 2} (${ticker}): ${err instanceof Error ? err.message : 'gagal'}`)
        }
      }

      setShowImport(false)
      await fetchData()
      if (errors.length > 0) {
        setError(`${success} transaksi berhasil, ${errors.length} gagal:\n${errors.join('\n')}`)
      } else {
        setError('')
        alert(`Berhasil mengimpor ${success} transaksi`)
      }
    }
    reader.readAsText(file)
    event.target.value = '' // reset input
  }

  const downloadTemplate = () => {
    const template = `Type,Ticker,Date,Quantity,Price,Fee,Notes
BUY,BBCA,2024-01-15,10,9500,10000,
SELL,BMRI,2024-01-20,5,8700,8000,Take profit`
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_transaksi.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transaksi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola riwayat transaksi beli dan jual — posisi & average cost ter-update otomatis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Upload className="h-4 w-4" />
            Impor CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 whitespace-pre-line">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Add Transaction Form */}
      {showForm && (
        <Card>
          <CardHeader 
            title="Tambah Transaksi Baru" 
            description="Input manual transaksi beli atau jual"
            action={
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            }
          />
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Portfolio
                  </label>
                  <select
                    value={formData.portfolioId}
                    onChange={(e) => setFormData({ ...formData, portfolioId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {portfolios.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipe Transaksi
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'BUY' | 'SELL' })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="BUY">Beli</option>
                    <option value="SELL">Jual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ticker Saham
                  </label>
                  <input
                    type="text"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                    placeholder="Contoh: BBCA"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Lot
                  </label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Harga per Lembar
                  </label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fee Transaksi
                  </label>
                  <input
                    type="number"
                    value={formData.fee || ''}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Tambahkan catatan untuk transaksi ini..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {formData.quantity > 0 && formData.price > 0 && (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Nilai: <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(formData.quantity * formData.price * 100)}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    ({formData.quantity} lot × {formData.price} × 100 lembar)
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddTransaction}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import CSV Modal */}
      {showImport && (
        <Card>
          <CardHeader 
            title="Impor Transaksi dari CSV" 
            description="Upload file CSV dengan format yang sesuai"
            action={
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            }
          />
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Klik untuk upload atau drag & drop file CSV
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  Pilih File CSV
                </label>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Format CSV yang didukung:
                </p>
                <code className="text-xs text-blue-800 dark:text-blue-400 block mb-2">
                  Type,Ticker,Date,Quantity,Price,Fee,Notes
                </code>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Type: BUY atau SELL<br/>
                  Date: Format YYYY-MM-DD<br/>
                  Quantity: Jumlah lot<br/>
                  Price: Harga per lembar<br/>
                  Fee: Fee transaksi (opsional)<br/>
                  Notes: Catatan (opsional)
                </p>
              </div>

              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Download className="h-4 w-4" />
                Download template CSV
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <Card>
        <CardHeader 
          title="Riwayat Transaksi" 
          description={`${transactions.length} transaksi tercatat`}
          action={
            <button onClick={fetchData} className="text-gray-400 hover:text-gray-600" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
          }
        />
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Memuat...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TIPE</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TICKER</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TANGGAL</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">LOT</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">HARGA</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TOTAL</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">CATATAN</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          tx.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {tx.type === 'BUY' ? 'Beli' : 'Jual'}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{tx.security.ticker}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {new Date(tx.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{tx.quantity}</td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">
                        {formatCurrency(tx.price)}
                      </td>
                      <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{tx.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Belum ada transaksi</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Tambahkan transaksi pertama Anda atau impor dari CSV
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
