'use client'

import { Card, CardHeader, CardContent } from '@/components/Card'
import { MetricCard } from '@/components/MetricCard'
import { Briefcase, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface PortfolioData {
  totalValue: number
  totalCost: number
  unrealizedPL: number
  realizedPL: number
  totalReturn: number
  dailyChange: number
  dailyChangePercent: number
}

interface Position {
  id: string
  ticker: string
  name: string
  quantity: number
  averageCost: number
  currentPrice: number
  currentValue: number
  unrealizedPL: number
  unrealizedPLPercent: number
  allocation: number
  thesisStatus: string
}

interface Alert {
  id: string
  type: string
  priority: 'INFO' | 'REVIEW' | 'CRITICAL'
  title: string
  message: string
  createdAt: Date
  isRead: boolean
}

interface OverviewClientProps {
  portfolio: PortfolioData
  positions: Position[]
  sectorData: Array<{ name: string; value: number; percentage: number }>
  alerts: Alert[]
  freshness: {
    portfolioUpdatedAt: string | null
    priceUpdatedAt: string | null
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function OverviewClient({ portfolio, positions, sectorData, alerts, freshness }: OverviewClientProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(1)}K`
    return `Rp ${value.toFixed(0)}`
  }

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null

  const getThesisBadgeColor = (status: string) => {
    switch (status) {
      case 'UTUH': return 'bg-green-100 text-green-800'
      case 'DIPANTAU': return 'bg-yellow-100 text-yellow-800'
      case 'MELEMAH': return 'bg-orange-100 text-orange-800'
      case 'PATAH': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overview Portofolio</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan performa dan status portofolio Anda</p>
        {/* DASH-06: freshness label */}
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Data portofolio diperbarui: {fmtDate(freshness.portfolioUpdatedAt) ?? '-'}
          {' · '}Harga terakhir: {fmtDate(freshness.priceUpdatedAt) ?? 'belum diambil'}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Nilai Portofolio"
          value={formatCurrency(portfolio.totalValue)}
          change={portfolio.totalReturn}
          changeLabel="total return"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <MetricCard
          title="Unrealized P/L"
          value={formatCurrency(portfolio.unrealizedPL)}
          change={portfolio.totalCost > 0 ? (portfolio.unrealizedPL / portfolio.totalCost) * 100 : 0}
          changeLabel="dari modal"
          icon={portfolio.unrealizedPL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
        <MetricCard
          title="Realized P/L"
          value={formatCurrency(portfolio.realizedPL)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Posisi Aktif"
          value={positions.length}
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      {/* Charts and Positions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sector Allocation */}
        <Card className="lg:col-span-1">
          <CardHeader title="Alokasi Sektor" description="Distribusi investasi per sektor" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {sectorData.map((sector, index) => (
                <div key={sector.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{sector.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{sector.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Positions */}
        <Card className="lg:col-span-2">
          <CardHeader title="Posisi Saham" description="Alokasi dan performa per saham" />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">TICKER</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">NAMA</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">ALOKASI</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">UNREALIZED P/L</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">STATUS TESIS</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">{pos.ticker}</td>
                      <td className="py-3 text-gray-900 dark:text-gray-100">{pos.name}</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{pos.allocation.toFixed(1)}%</td>
                      <td className={`py-3 font-medium ${pos.unrealizedPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(pos.unrealizedPL)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getThesisBadgeColor(pos.thesisStatus)}`}>
                          {pos.thesisStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader title="Alert Terbaru" description="Notifikasi penting untuk portofolio Anda" />
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className={`mt-0.5 rounded-full p-1 ${
                    alert.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                    alert.priority === 'REVIEW' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                    'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  }`}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{alert.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        alert.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                        alert.priority === 'REVIEW' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
