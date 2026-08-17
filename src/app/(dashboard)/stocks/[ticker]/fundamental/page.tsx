'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Database, RefreshCw } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'

interface StatementPeriod {
  periodEnd: string
  periodType: string
  source: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}

interface MetricEntry {
  value: number
  formula?: string
  periodEnd: string
}

interface FundamentalData {
  security: {
    ticker: string
    name: string
    sector: string
    lastPrice: number | null
    lastUpdate: string | null
  }
  incomeStatements: StatementPeriod[]
  balanceSheets: StatementPeriod[]
  metrics: Record<string, MetricEntry>
  dataSource: string
  fetchedAt: string
}

const fmtIDR = (v: number | null | undefined): string => {
  if (v == null) return '-'
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}Rp ${(abs / 1e12).toFixed(2)} T`
  if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toFixed(2)} M`
  if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toFixed(1)} M`
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`
}

const fmtPct = (v: number | null | undefined): string => {
  if (v == null) return '-'
  return `${(v * 100).toFixed(2)}%`
}

const fmtNum = (v: number | null | undefined, digits = 2): string => {
  if (v == null) return '-'
  return v.toFixed(digits)
}

const yearLabel = (iso: string) => new Date(iso).getFullYear().toString()

export default function FundamentalPage() {
  const params = useParams<{ ticker: string }>()
  const ticker = (params.ticker || '').toUpperCase()

  const [data, setData] = useState<FundamentalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ticker) return
    fetch(`/api/fundamentals/${ticker}`)
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal memuat data')
        setData(json)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [ticker])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500 dark:text-gray-400">Memuat data fundamental...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href={`/stocks/${ticker}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
          <ArrowLeft className="h-4 w-4" /> Kembali ke {ticker}
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 dark:text-red-400">{error || 'Data tidak tersedia'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const m = data.metrics
  const inc = [...data.incomeStatements].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd))
  const bs = [...data.balanceSheets].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd))

  // Chart data: revenue & net income per year
  const chartData = inc.map(s => ({
    year: yearLabel(s.periodEnd),
    Revenue: (s.data.totalRevenue ?? 0) / 1e9,
    'Net Income': (s.data.netIncome ?? 0) / 1e9,
  }))

  // Margin trend
  const marginData = inc.map(s => {
    const rev = s.data.totalRevenue
    return {
      year: yearLabel(s.periodEnd),
      'Net Margin': rev ? +(((s.data.netIncome ?? 0) / rev) * 100).toFixed(2) : 0,
      'Operating Margin': rev ? +(((s.data.operatingIncome ?? 0) / rev) * 100).toFixed(2) : 0,
    }
  })

  const keyRatios = [
    { label: 'PER (TTM)', value: fmtNum(m.PER?.value), formula: m.PER?.formula },
    { label: 'PBV', value: fmtNum(m.PBV?.value), formula: m.PBV?.formula },
    { label: 'ROE', value: fmtPct(m.ROE?.value), formula: m.ROE?.formula },
    { label: 'ROA', value: fmtPct(m.ROA?.value), formula: m.ROA?.formula },
    { label: 'Net Margin', value: fmtPct(m.NET_MARGIN?.value), formula: m.NET_MARGIN?.formula },
    { label: 'Debt/Equity', value: fmtNum(m.DEBT_TO_EQUITY?.value), formula: m.DEBT_TO_EQUITY?.formula },
    { label: 'Dividend Yield', value: fmtPct(m.DIVIDEND_YIELD?.value), formula: m.DIVIDEND_YIELD?.formula },
    { label: 'Beta', value: fmtNum(m.BETA?.value), formula: m.BETA?.formula },
  ]

  const incomeRows: Array<{ label: string; key: string; fmt: (v: number | null) => string; bold?: boolean }> = [
    { label: 'Total Pendapatan', key: 'totalRevenue', fmt: fmtIDR, bold: true },
    { label: 'Beban Pokok Pendapatan', key: 'costOfRevenue', fmt: fmtIDR },
    { label: 'Laba Kotor', key: 'grossProfit', fmt: fmtIDR },
    { label: 'Beban Operasional', key: 'operatingExpense', fmt: fmtIDR },
    { label: 'Laba Operasional', key: 'operatingIncome', fmt: fmtIDR, bold: true },
    { label: 'EBITDA', key: 'ebitda', fmt: fmtIDR },
    { label: 'Laba Bersih', key: 'netIncome', fmt: fmtIDR, bold: true },
  ]

  const bsRows: Array<{ label: string; key: string; fmt: (v: number | null) => string; bold?: boolean }> = [
    { label: 'Total Aset', key: 'totalAssets', fmt: fmtIDR, bold: true },
    { label: 'Total Liabilitas', key: 'totalLiab', fmt: fmtIDR },
    { label: 'Total Ekuitas', key: 'totalStockholderEquity', fmt: fmtIDR, bold: true },
    { label: 'Kas & Setara Kas', key: 'cash', fmt: fmtIDR },
    { label: 'Total Utang Jangka Panjang', key: 'longTermDebt', fmt: fmtIDR },
    { label: 'Modal Kerja Bersih', key: 'netWorkingCapital', fmt: fmtIDR },
  ]

  const hasBalanceSheet = bs.some(s => Object.keys(s.data).length > 0)

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <Link href={`/stocks/${ticker}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        <ArrowLeft className="h-4 w-4" /> Kembali ke {ticker}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{ticker}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-400">
              <BarChart3 className="h-4 w-4" /> Fundamental
            </span>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{data.security.name}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{data.security.sector}</p>
        </div>
        {data.security.lastPrice != null && (
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Rp {data.security.lastPrice.toLocaleString('id-ID')}
          </p>
        )}
      </div>

      {/* Data source & freshness label (DASH-06) */}
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        <Database className="h-3.5 w-3.5" />
        <span>
          Sumber: <strong>{data.dataSource}</strong> · Data diambil: {new Date(data.fetchedAt).toLocaleString('id-ID')}
          {data.security.lastUpdate && <> · Harga terakhir diperbarui: {new Date(data.security.lastUpdate).toLocaleString('id-ID')}</>}
        </span>
      </div>

      {/* Key Ratios */}
      <Card>
        <CardHeader title="Rasio Utama" description="Valuasi dan profitabilitas terkini" />
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {keyRatios.map(r => (
              <div key={r.label} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4" title={r.formula}>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{r.label}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{r.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue & Net Income Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader title="Pendapatan & Laba Bersih" description="Tren tahunan (dalam miliar Rupiah)" />
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis tickFormatter={(v: number) => `${v.toLocaleString('id-ID')}`} className="text-xs" />
                  <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 })} M`} />
                  <Legend />
                  <Bar dataKey="Revenue" name="Pendapatan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Net Income" name="Laba Bersih" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Margin Trend */}
      {marginData.length > 0 && (
        <Card>
          <CardHeader title="Tren Margin" description="Margin operasional & bersih (%)" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marginData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="Operating Margin" name="Margin Operasional" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Net Margin" name="Margin Bersih" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Statement Table */}
      {inc.length > 0 && (
        <Card>
          <CardHeader title="Laporan Laba Rugi" description={`${inc.length} periode tahunan`} />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">POS</th>
                    {inc.map(s => (
                      <th key={s.periodEnd} className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">
                        {yearLabel(s.periodEnd)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incomeRows.map(row => (
                    <tr key={row.key} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                      <td className={`py-2.5 ${row.bold ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                        {row.label}
                      </td>
                      {inc.map(s => (
                        <td key={s.periodEnd} className={`py-2.5 text-right ${row.bold ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          {row.fmt(s.data[row.key] ?? null)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Sheet Table */}
      {hasBalanceSheet && bs.length > 0 && (
        <Card>
          <CardHeader title="Neraca" description={`${bs.length} periode tahunan`} />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">POS</th>
                    {bs.map(s => (
                      <th key={s.periodEnd} className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">
                        {yearLabel(s.periodEnd)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bsRows.map(row => (
                    <tr key={row.key} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                      <td className={`py-2.5 ${row.bold ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                        {row.label}
                      </td>
                      {bs.map(s => (
                        <td key={s.periodEnd} className={`py-2.5 text-right ${row.bold ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          {row.fmt(s.data[row.key] ?? null)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth & additional metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Pertumbuhan" description="Year-over-year" />
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pertumbuhan Pendapatan</span>
              <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                (m.REVENUE_GROWTH?.value ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {(m.REVENUE_GROWTH?.value ?? 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {fmtPct(m.REVENUE_GROWTH?.value)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pertumbuhan Laba</span>
              <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                (m.EARNINGS_GROWTH?.value ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {(m.EARNINGS_GROWTH?.value ?? 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {fmtPct(m.EARNINGS_GROWTH?.value)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pendapatan TTM</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtIDR(m.TOTAL_REVENUE_TTM?.value)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Struktur Keuangan" description="Kesehatan neraca" />
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Utang</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtIDR(m.TOTAL_DEBT?.value)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Kas</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtIDR(m.TOTAL_CASH?.value)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Ratio</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtNum(m.CURRENT_RATIO?.value)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtIDR(m.MARKET_CAP?.value)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
